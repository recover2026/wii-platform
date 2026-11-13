/* ============================================================
   引擎二 · 方案测算保险费率（输入保险方案 → 输出保险费率）
   ------------------------------------------------------------
   调用 Open-Meteo Archive API（真实再分析气象，无需密钥、CORS 友好）
   回测多年期望赔付率 → Bootstrap 费率区间；输出 ULR 与校准建议。
   升级：支持「多责任合计」(同县同作物多灾种逐年叠加封顶100%得合计ULR，
   校准至 70%-75%)；数据源标注；样本量置信度提示。
   数据真实可溯源，非模拟；最终以精算报备与监管批复为准。
   ============================================================ */
(function () {
  'use strict';
  var KB = window.AGRI_KB;
  var EXPENSE = 0.15;   // 费用率 15%
  var RISKLOAD = 0.10;  // 风险附加 10%
  var TARGET_ULR = [0.70, 0.75]; // 终极赔付率目标带（合计）
  // 高温指数口径：'max'=日最高温（默认）｜'avg'=日均温（棉花，库内明写日均温>35℃）
  var HEAT_METRIC = 'max';

  // 模块级：分段赔付比例表（[阈值, 赔付%]）
  var curRatio = [];
  var curRatio2 = [];
  // 模块级：线性赔付参数（起赔点 a / 全赔点 f；frost/drought 为 low 方向 a>f）
  var curLinear = { a: null, f: null, peril: null };
  var curLinear2 = { a: null, f: null, peril: null };

  // 各灾种线性默认参数 [起赔点, 全赔点]；与阶梯 DEFS 起赔档对齐，全赔点≈最强一档
  var LINEAR_DEFS = {
    rainy: [3, 7],      // 连续降水日数（high）
    storm: [50, 150],   // 单日降水 mm（high）
    frost: [0, -5],     // 最低气温 ℃（low）
    heat: [35, 45],     // 最高气温 ℃（high）
    drought: [40, 5],   // 累计降水 mm（low）
    wind: [13.8, 24]    // 最大风速 m/s（high）
  };
  var LINEAR_UNIT = { rainy: '日', storm: 'mm', frost: '℃', heat: '℃', drought: 'mm', wind: 'm/s' };

  // 线性赔付：V 相对起赔 a → 全赔 f 连续折算，封顶 100%
  function linearPayout(V, a, f, dir) {
    if (a === f) return 0;
    var t = dir === 'low' ? (a - V) / (a - f) : (V - a) / (f - a);
    return Math.max(0, Math.min(1, t));
  }
  // 统一取赔付：linear 走连续折算，step 走分档查表
  function payLookup(S, V, dir) {
    if (S.paytype === 'linear') return (S.linA == null || S.linF == null) ? 0 : linearPayout(V, S.linA, S.linF, dir);
    return lookup(S.ratio, V, dir);
  }

  function pct(x, d) { return (x * 100).toFixed(d === undefined ? 2 : d) + '%'; }

  /* ---------- 初始化表单 ---------- */
  function initForm() {
    var sel = document.getElementById('rt-city');
    KB.cities.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.lat + ',' + c.lon + ',' + c.z;
      o.textContent = c.n + '（' + c.p + '）';
      sel.appendChild(o);
    });
    var cs = document.getElementById('rt-crop');
    if (window.WIICrops) WIICrops.fillCropSelect(cs);
    else Object.keys(KB.crops).forEach(function (k) {
      var o = document.createElement('option'); o.value = k; o.textContent = KB.crops[k].name; cs.appendChild(o);
    });
    var pl = document.getElementById('rt-peril');
    PERILS.forEach(function (p) {
      var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; pl.appendChild(o);
    });
    var pl2 = document.getElementById('rt-peril2');
    if (pl2) { pl2.innerHTML = '<option value="">— 不添加 —</option>'; PERILS.forEach(function (p) { var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; pl2.appendChild(o); }); }
    document.getElementById('rt-sum').value = 400;
    document.getElementById('rt-years').value = '20';
    document.getElementById('rt-m1').value = 7; document.getElementById('rt-d1').value = 1;
    document.getElementById('rt-m2').value = 10; document.getElementById('rt-d2').value = 15;
    // 当前默认灾害（此前此处直接引用未声明变量 peril，init 一进函数即抛 ReferenceError，
    // 导致「运行回测」未绑定、app.js 后续地图/方案设计器/场景工作台初始化被整体跳过）
    var peril = pl.value || 'rainy';
    buildRatioEditor(curRatio, pickDefs(peril), 'rt-ratio');
    // 切换"指数口径"时：换默认表 + 重画表头，否则用户会拿绝对阈值的表当距平表用
    var _it = document.getElementById('rt-idxtype');
    if (_it && !_it._bound) {
      _it._bound = true;
      _it.addEventListener('change', function () {
        var pv = document.getElementById('rt-peril').value || 'rainy';
        if (curIndexType() === 'anomaly' && !ANOMALY_OK[pv]) {
          alert('「' + pv + '」不支持距平口径（只有低温/高温适用），已保持绝对阈值型');
          _it.value = 'absolute';
          return;
        }
        buildRatioEditor(curRatio, pickDefs(pv), 'rt-ratio');
        var p2 = document.getElementById('rt-peril2');
        if (p2 && p2.value) buildRatioEditor(curRatio2, pickDefs(p2.value), 'rt-ratio2');
      });
    }
    // 方案类型切换（阶梯↔线性）
    var pt = document.getElementById('rt-paytype');
    if (pt) pt.addEventListener('change', applyPayType);
    // 保险费率 = 纯风险损失率 ÷ 成本比例（自动联动）
    var costI = document.getElementById('rt-cost'), preI = document.getElementById('rt-prerate');
    function syncPrerate() {
      var t = parseFloat(document.getElementById('rt-trial').value) || 0;
      var c = parseFloat((costI && costI.value) || 0) || 0;
      if (preI) preI.value = (t > 0 && c > 0) ? (t / c * 100).toFixed(2) : '';
    }
    var trialI = document.getElementById('rt-trial');
    if (trialI) trialI.addEventListener('input', syncPrerate);
    if (costI) costI.addEventListener('input', syncPrerate);
    ensureLinear(curLinear, peril, 'rt-linear');
    syncPrerate();
    applyPayType();
    bindPeril();
    pl.addEventListener('change', bindPeril);
    if (pl2) { pl2.addEventListener('change', bindPeril2); }
    var multi = document.getElementById('rt-multi');
    if (multi) multi.addEventListener('change', toggleMulti);
    document.getElementById('rt-run').addEventListener('click', runBacktest);
    document.getElementById('rt-reset').addEventListener('click', resetForm);
    bindPresets();
  }

  var PERILS = [['drought', '干旱/降水亏缺'], ['frost', '低温霜冻'], ['heat', '高温热害'], ['rainy', '连阴雨渍涝'], ['storm', '暴雨洪涝'], ['wind', '大风倒伏']];

  // 不同灾害的动态参数提示
  function bindPeril() {
    var peril = document.getElementById('rt-peril').value;
    var box = document.getElementById('rt-peril-params');
    var extra = peril === 'rainy'
      ? '<label class="rt-l">起赔连续日数 <input id="rt-minrun" type="number" value="3" min="1" step="1" class="rt-i"></label>'
      : '';
    box.innerHTML = extra + '<div class="rt-hint">' + HINTS[peril] + '</div>';
    buildRatioEditor(curRatio, pickDefs(peril), 'rt-ratio');
    ensureLinear(curLinear, peril, 'rt-linear');
  }
  function bindPeril2() {
    var p2 = document.getElementById('rt-peril2');
    if (!p2 || !p2.value) { curRatio2 = []; renderRatioEditor(curRatio2, 'rt-ratio2'); return; }
    buildRatioEditor(curRatio2, DEFS[p2.value], 'rt-ratio2');
    ensureLinear(curLinear2, p2.value, 'rt-linear2');
  }
  function toggleMulti() {
    var on = document.getElementById('rt-multi').checked;
    var box = document.getElementById('rt-multi-box');
    if (box) box.style.display = on ? 'block' : 'none';
    if (on) bindPeril2();
  }

  var HINTS = {
    rainy: '连阴雨：窗口内<b>最长连续降水(≥1mm)日数</b>达「起赔日数」即触发；按连续日数查分段赔付；可多次事故累积封顶。',
    storm: '暴雨：窗口内<b>单日最大降水(mm)</b>越阈值触发；按强度查分段赔付。',
    frost: '低温：窗口内<b>最低气温(℃)</b>越低越赔（阈值取负值，如 0 / -2 / -4）。',
    heat: '高温：窗口内<b>最高气温(℃)</b>越阈值触发；按强度查分段赔付。',
    drought: '干旱：窗口内<b>累计降水(mm)</b>越低越赔（阈值如 40 / 20 / 5）。',
    wind: '大风：窗口内<b>最大风速(m/s)</b>越阈值触发（13.8≈7级）。'
  };
  var DEFS = {
    rainy: [['3', 10], ['5', 20], ['7', 30]],
    storm: [['50', 10], ['100', 20]],
    frost: [['-1', 10], ['-3', 20], ['-5', 30]],
    heat: [['35', 10], ['37', 20], ['39', 30]],
    drought: [['40', 10], ['20', 20], ['5', 30]],
    wind: [['13.8', 10], ['17', 20], ['20.8', 30]],
    // 距平型默认表：变量是『较常年同期偏低/偏高多少℃』。
    // 业务给的低温分档 8–10→1%、10–12→2%、12–15→4%、15–18→8%、18–21→13%，
    // 因区间连续且递增，等价于『达到 8 赔 1%、达到 10 赔 2%…』的阶梯表。
    frostAnomaly: [['8', 1], ['10', 2], ['12', 4], ['15', 8], ['18', 13]],
    heatAnomaly: [['4', 1], ['6', 2], ['8', 4], ['10', 8], ['12', 13]]
  };

  // 哪些灾种支持距平口径
  var ANOMALY_OK = { frost: 1, heat: 1 };
  function curIndexType() {
    var el = document.getElementById('rt-idxtype');
    return el ? el.value : 'absolute';
  }
  function pickDefs(peril) {
    if (curIndexType() === 'anomaly' && ANOMALY_OK[peril]) return DEFS[peril + 'Anomaly'] || DEFS[peril];
    return DEFS[peril];
  }

  function buildRatioEditor(arr, pairs, boxId) {
    // 复制默认到目标数组
    arr.length = 0;
    pairs.forEach(function (p) { arr.push([String(p[0]), Number(p[1])]); });
    renderRatioEditor(arr, boxId);
  }
  function renderRatioEditor(arr, boxId) {
    var box = document.getElementById(boxId);
    if (!box) return;
    var _anom = (typeof curIndexType === 'function' && curIndexType() === 'anomaly');
    var html = '<div class="rt-re-head">' + (_anom
      ? '分段赔付比例表（较常年同期降幅 → 赔付占保额比例%）'
      : '分段赔付比例表（触发阈值 → 赔付占保额比例%）') + '</div>';
    arr.forEach(function (row, i) {
      html += '<div class="rt-re-row"><input class="rt-i rt-k" data-i="' + i + '" value="' + row[0] + '">' +
        '<span class="rt-arrow">→</span><input class="rt-i rt-v" data-i="' + i + '" value="' + row[1] + '"><span>%</span>' +
        '<button class="rt-del" data-i="' + i + '">×</button></div>';
    });
    html += '<button class="rt-add" data-add="' + boxId + '">+ 添加一行</button>';
    box.innerHTML = html;
    box.querySelectorAll('.rt-k,.rt-v').forEach(function (el) {
      el.addEventListener('input', function () {
        var i = +el.dataset.i;
        arr[i][el.classList.contains('rt-k') ? 0 : 1] = el.classList.contains('rt-k') ? el.value : (+el.value || 0);
      });
    });
    box.querySelectorAll('.rt-del').forEach(function (el) {
      el.addEventListener('click', function () { arr.splice(+el.dataset.i, 1); renderRatioEditor(arr, boxId); });
    });
    box.querySelectorAll('.rt-add').forEach(function (el) {
      el.addEventListener('click', function () { arr.push(['0', 10]); renderRatioEditor(arr, boxId); });
    });
  }

  /* ---------- 方案类型：阶梯型（分档查表）/ 线性理赔阈值（起赔→全赔连续折算） ---------- */
  function getPayType() {
    var pt = document.getElementById('rt-paytype');
    return (pt && pt.value) === 'linear' ? 'linear' : 'step';
  }
  function applyPayType() {
    var linear = getPayType() === 'linear';
    [['rt-ratio-box', 'rt-linear-box'], ['rt-ratio2-box', 'rt-linear2-box']].forEach(function (pair) {
      var b = document.getElementById(pair[0]), l = document.getElementById(pair[1]);
      if (b) b.style.display = linear ? 'none' : '';
      if (l) l.style.display = linear ? '' : 'none';
    });
  }
  function ensureLinear(L, peril, boxId) {
    if (L.peril !== peril || L.a == null || L.f == null) {
      var d = LINEAR_DEFS[peril] || [0, 1];
      L.a = d[0]; L.f = d[1]; L.peril = peril;
    }
    renderLinearEditor(L, peril, boxId);
  }
  function renderLinearEditor(L, peril, boxId) {
    var box = document.getElementById(boxId);
    if (!box) return;
    var dir = (peril === 'frost' || peril === 'drought') ? 'low' : 'high';
    var unit = LINEAR_UNIT[peril] || '';
    var op = dir === 'low' ? '≤' : '≥';
    var rows = ''; // 起赔→全赔均匀 5 档采样展示
    for (var i = 0; i < 5; i++) {
      var v = L.a + (L.f - L.a) * i / 4;
      var p = linearPayout(v, L.a, L.f, dir) * 100;
      rows += '<tr><td>' + op + ' ' + (Math.round(v * 10) / 10) + ' ' + unit + '</td><td>' + (Math.round(p * 10) / 10) + '%</td></tr>';
    }
    box.innerHTML =
      '<div class="rt-re-row"><span>起赔点</span><input class="rt-i rt-la" value="' + L.a + '">' +
      '<span class="rt-arrow">→</span><span>全赔点</span><input class="rt-i rt-lf" value="' + L.f + '"><span>' + unit + '</span></div>' +
      '<div class="rt-hint">赔付比例 = |' + (dir === 'low' ? '起赔点−实际值' : '实际值−起赔点') + '| ÷ |起赔点−全赔点| × 100%，' +
      (dir === 'low' ? '越低越赔' : '越高越赔') + '；连续线性折算、封顶 100%</div>' +
      '<table class="claimtb" style="margin-top:6px"><thead><tr><th>指数值（' + unit + '）</th><th>赔付比例（线性采样）</th></tr></thead><tbody>' + rows + '</tbody></table>';
    var la = box.querySelector('.rt-la'), lf = box.querySelector('.rt-lf');
    function upd() {
      var a = parseFloat(la.value), f = parseFloat(lf.value);
      if (isNaN(a) || isNaN(f) || a === f) return;
      L.a = a; L.f = f;
      renderLinearEditor(L, peril, boxId);
    }
    if (la) la.addEventListener('change', upd);
    if (lf) lf.addEventListener('change', upd);
  }

  /* ---------- 由引擎一方案载入 ---------- */
  function loadFromScheme(scheme) {
    var S = scheme.combo ? scheme.combo : scheme.primary ? { primary: scheme.primary } : scheme;
    var p1 = scheme.combo ? scheme.combo.primary : scheme.primary;
    var p2 = scheme.combo ? scheme.combo.secondary : null;
    document.getElementById('rt-crop').value = scheme.crop;
    document.getElementById('rt-peril').value = p1.peril;
    // 窗口可能为空：该作物在本区无物候数据时 subScheme 返回 null。
    // 原来直接取 window[0] 会抛 TypeError，导致整段带入中断、页签也不切。
    var _w = p1.window;
    if (!_w || _w.length < 4 || _w.some(function (x) { return x == null || isNaN(x); })) {
      _w = [1, 1, 12, 31];
      var _o = document.getElementById('rate-out');
      if (_o) {
        _o.style.display = 'block';
        _o.innerHTML = '<div class="prog-err">该方案在「' + (p1.perilName || p1.peril) +
          '」上没有可用物候窗口（该作物在本农业区未收录对应阶段），保险期间已置为占位值 1/1–12/31。' +
          '<br>请先按物候推荐或手工设置保险期间，再运行回测。</div>';
      }
    }
    document.getElementById('rt-m1').value = _w[0]; document.getElementById('rt-d1').value = _w[1];
    document.getElementById('rt-m2').value = _w[2]; document.getElementById('rt-d2').value = _w[3];
    document.getElementById('rt-sum').value = scheme.sumInsured || 400;
    var city = KB.cities.filter(function (c) { return c.z === scheme.zone; })[0] || KB.cities[0];
    document.getElementById('rt-city').value = city.lat + ',' + city.lon + ',' + city.z;
    // 同时写入经纬度输入框：readScheme 虽会回退用城市下拉，但只要输入框有值就优先用它。
    // 只设下拉不设输入框，曾导致"方案带入后回测报坐标无效"——用户看到的就是"没法测算"。
    var _g = scheme.geo || {};
    document.getElementById('rt-lat').value = (_g.lat != null ? _g.lat : city.lat);
    document.getElementById('rt-lon').value = (_g.lon != null ? _g.lon : city.lon);
    bindPeril();
    buildRatioEditor(curRatio, Object.keys(p1.ratio).map(function (k) { return [k, Math.round(p1.ratio[k] * 100)]; }), 'rt-ratio');
    var pt = document.getElementById('rt-paytype');
    if (pt) pt.value = scheme.paytype === 'linear' ? 'linear' : 'step';
    ensureLinear(curLinear, p1.peril, 'rt-linear');
    applyPayType();
    var multi = document.getElementById('rt-multi');
    if (p2 && multi) {
      multi.checked = true; toggleMulti();
      document.getElementById('rt-peril2').value = p2.peril;
      buildRatioEditor(curRatio2, Object.keys(p2.ratio).map(function (k) { return [k, Math.round(p2.ratio[k] * 100)]; }), 'rt-ratio2');
      ensureLinear(curLinear2, p2.peril, 'rt-linear2');
    } else if (multi) { multi.checked = false; toggleMulti(); }
  }

  /* ---------- 读数 ---------- */
  function readScheme() {
    var cv = (document.getElementById('rt-city').value || '').split(',');
    var lat = parseFloat(document.getElementById('rt-lat').value) || +cv[0];
    var lon = parseFloat(document.getElementById('rt-lon').value) || +cv[1];
    var peril = document.getElementById('rt-peril').value;
    var ratio = {}; curRatio.forEach(function (r) { ratio[r[0]] = (+r[1] || 0) / 100; });
    var multi = document.getElementById('rt-multi') && document.getElementById('rt-multi').checked;
    var peril2 = multi ? (document.getElementById('rt-peril2').value || '') : '';
    var ratio2 = {}; if (peril2) { curRatio2.forEach(function (r) { ratio2[r[0]] = (+r[1] || 0) / 100; }); }
    return {
      lat: lat, lon: lon, crop: document.getElementById('rt-crop').value,
      peril: peril, peril2: peril2, multi: multi,
      paytype: getPayType(),
      linA: curLinear.a, linF: curLinear.f,
      linA2: curLinear2.a, linF2: curLinear2.f,
      trial: parseFloat(document.getElementById('rt-trial').value) || 0,
      cost: parseFloat((document.getElementById('rt-cost') || {}).value) || 75,
      m1: +document.getElementById('rt-m1').value, d1: +document.getElementById('rt-d1').value,
      m2: +document.getElementById('rt-m2').value, d2: +document.getElementById('rt-d2').value,
      sum: +document.getElementById('rt-sum').value || 400,
      years: +document.getElementById('rt-years').value || 20,
      minRun: +(document.getElementById('rt-minrun') ? document.getElementById('rt-minrun').value : 3),
      ratio: ratio, ratio2: ratio2,
      dir: (peril === 'frost' || peril === 'drought') ? 'low' : 'high',
      dir2: (peril2 === 'frost' || peril2 === 'drought') ? 'low' : 'high',
      source: (document.getElementById('rt-source') && document.getElementById('rt-source').value) || 'openmeteo',
      indexType: curIndexType(),   // 'absolute' | 'anomaly'（距平降幅型）
      proxy: !!(document.getElementById('rt-proxy') && document.getElementById('rt-proxy').checked),
      qm: !!(document.getElementById('rt-qm') && document.getElementById('rt-qm').checked),
      precipFactor: parseFloat((document.getElementById('rt-pfac') || {}).value) || 1.0,
      yieldArr: readYieldArr()
    };
  }

  // 历史单产读取：优先用导入的带年份数据（按回测区间对齐，缺年置 null 保持配对正确），
  // 否则退回"与回测年序同序"的文本解析
  function readYieldArr() {
    var yrs = +(document.getElementById('rt-years') || {}).value || 20;
    var y0 = 2026 - yrs, y1 = 2025;
    var rows = window.__yieldRows;
    if (rows && rows.length && window.WIIQC) {
      var al = window.WIIQC.alignYield(rows, y0, y1);
      if (al) {
        S_LAST_YIELD_HIT = { hit: al.hit, total: al.total, complete: al.complete, y0: y0, y1: y1 };
        return al.values;
      }
    }
    S_LAST_YIELD_HIT = null;
    return parseYield((document.getElementById('rt-yield') || {}).value || '');
  }
  var S_LAST_YIELD_HIT = null;

  // 解析历史单产序列（逗号/空格/换行分隔，逐年，与回测年序同序）
  function parseYield(t) {
    if (!t) return [];
    return t.split(/[\s,，]+/).map(function (x) { return parseFloat(x); })
      .filter(function (x) { return !isNaN(x); });
  }

  /* ---------- 本地网格气象（预下载，离线可用） ----------
     格式：assets/weather/g<lat>_<lon>.json = {y0, lat, lon, n, v:[[tmax,tmin,prcp,wind]...]}
     数值 ×10 存整数（省体积）；日期由 y0 + 行索引推算（文件里不存日期数组）。
     取数顺序：本地网格 → ERA5 → NASA POWER → 直连兜底。 */
  var _localGrid = {};
  var _gridIndex = null;          // 有哪些格子真的在包内（避免对 2345 个文件逐个 404）
  var _LS_PREFIX = 'wii_w_';
  var _LS_MAX = 20;               // 本地只留最近 20 个格子（约 2.4MB，避开 5MB 上限）

  function gridKeyOf(lat, lon) {
    var glat = Math.round(lat * 4) / 4, glon = Math.round(lon * 4) / 4;
    return 'g' + glat + '_' + glon;
  }

  // 网格清单：一次性告诉前端"哪些格子有本地数据"。
  // 没有它的话，每个县都要先发一个 404 请求，白白多一次往返。
  function loadGridIndex() {
    if (_gridIndex) return Promise.resolve(_gridIndex);
    return fetch('assets/weather/_index.json', { referrerPolicy: 'no-referrer' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (arr) { _gridIndex = {}; (arr || []).forEach(function (k) { _gridIndex[k] = 1; }); return _gridIndex; })
      .catch(function () { _gridIndex = {}; return _gridIndex; });
  }

  // 浏览器端缓存：算过的县第二次直接读本地，不再走网络、也不再占站点流量
  function lsGet(k) {
    try {
      var v = localStorage.getItem(_LS_PREFIX + k);
      if (!v) return null;
      return JSON.parse(v);
    } catch (e) { return null; }
  }
  function lsPut(k, j) {
    try {
      if (localStorage.getItem(_LS_PREFIX + k)) return;
      // 简单 LRU：超限就清掉最早的一半
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var kk = localStorage.key(i);
        if (kk && kk.indexOf(_LS_PREFIX) === 0) keys.push(kk);
      }
      if (keys.length >= _LS_MAX) {
        keys.slice(0, Math.ceil(_LS_MAX / 2)).forEach(function (x) { localStorage.removeItem(x); });
      }
      localStorage.setItem(_LS_PREFIX + k, JSON.stringify(j));
    } catch (e) { /* 配额满就放弃缓存，不影响功能 */ }
  }

  function loadLocalGrid(lat, lon) {
    var k = gridKeyOf(lat, lon);
    if (_localGrid[k] !== undefined) return Promise.resolve(_localGrid[k]);
    return loadGridIndex().then(function (idx) {
      // 有清单且未命中 → 直接判定"没有本地数据"，一个请求都不发
      if (idx && Object.keys(idx).length && !idx[k]) { _localGrid[k] = null; return null; }
      var cached = lsGet(k);
      if (cached) { _localGrid[k] = cached; return cached; }
      return fetch('assets/weather/' + k + '.json', { referrerPolicy: 'no-referrer' })
        .then(function (r) { if (!r.ok) throw new Error('no-local'); return r.json(); })
        .then(function (j) { _localGrid[k] = j; lsPut(k, j); return j; })
        .catch(function () { _localGrid[k] = null; return null; });
    });
  }
  // 某年第一天在 y0 起的日序（纯日期运算，避开时区）
  function dayOffset(y0, y) {
    return Math.round((Date.UTC(y, 0, 1) - Date.UTC(y0, 0, 1)) / 86400000);
  }
  function localYear(lat, lon, y) {
    return loadLocalGrid(lat, lon).then(function (g) {
      if (!g || !g.v || !g.v.length) return null;
      if (y < g.y0) return null;
      var off = dayOffset(g.y0, y);
      if (off < 0 || off >= g.v.length) return null;
      var isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
      var nd = isLeap ? 366 : 365;
      var rows = g.v.slice(off, off + nd);
      if (rows.length < nd * 0.9) return null;   // 数据不全就不用
      var time = [], tmax = [], tmin = [], prcp = [], wind = [];
      for (var i = 0; i < rows.length; i++) {
        var dt = new Date(Date.UTC(y, 0, 1 + i));
        time.push(dt.getUTCFullYear() + '-' +
          ('0' + (dt.getUTCMonth() + 1)).slice(-2) + '-' +
          ('0' + dt.getUTCDate()).slice(-2));
        var r0 = rows[i] || [];
        tmax.push(r0[0] == null ? null : r0[0] / 10);
        tmin.push(r0[1] == null ? null : r0[1] / 10);
        prcp.push(r0[2] == null ? null : r0[2] / 10);
        wind.push(r0[3] == null ? null : r0[3] / 10);
      }
      return {
        time: time, temperature_2m_max: tmax, temperature_2m_min: tmin,
        precipitation_sum: prcp, wind_speed_10m_max: wind, __source: 'local-grid'
      };
    });
  }

  /* ---------- 气象取数（多源 + 逐级降级） ----------
     旧实现直连 Open-Meteo，一旦该域被网络策略拦截就整条回测失败（"Failed to fetch"）。
     现在改为：ERA5 → NASA POWER → 直连兜底，任一可用即可出结果。
     返回仍保持 Open-Meteo 的 daily 形态，下游无需改动。 */
  async function fetchYear(lat, lon, y) {
    var lastErr = null;

    // 0) 本地预下载网格优先：20 年数据已在包内，不走网络，秒出且离线可用
    try {
      var lg = await localYear(lat, lon, y);
      if (lg && lg.time && lg.time.length) return lg;
    } catch (e) { /* 本地缺失则继续在线 */ }

    // 1) 走多源适配层（providers.js）：主源 ERA5，失败自动换 NASA POWER
    if (window.WIIProviders && window.WIIProviders.fetchYear) {
      var order = ['era5', 'power'];
      for (var i = 0; i < order.length; i++) {
        try {
          var c = await window.WIIProviders.fetchYear(order[i], lat, lon, y);
          if (c && c.time && c.time.length) {
            return {
              time: c.time,
              temperature_2m_max: c.tmax,
              temperature_2m_min: c.tmin,
              precipitation_sum: c.prcp,
              wind_speed_10m_max: c.wind,
              __source: order[i]
            };
          }
        } catch (e) { lastErr = e; }
      }
    }

    // 2) 直连兜底（网络允许时的最快路径）
    try {
      var url = 'https://archive-api.open-meteo.com/v1/archive?latitude=' + lat + '&longitude=' + lon +
        '&start_date=' + y + '-01-01&end_date=' + y + '-12-31' +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Asia%2FShanghai';
      var r = await fetch(url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var j = await r.json();
      if (j && j.daily) return j.daily;
    } catch (e) { lastErr = e; }

    throw new Error('所有气象源均不可达（ERA5 / NASA POWER / 直连）。' +
      '请确认当前网络可访问 archive-api.open-meteo.com 或 power.larc.nasa.gov；' +
      (lastErr ? '最后一次错误：' + lastErr.message : ''));
  }

  /* 逐日「常年同期基准」：把回测期内同一月日的多年值取平均。
     用途：距平型指数算"较常年偏低/偏高多少"，而不是看绝对温度。
     为什么必须用常年值：同一个 −5℃，在华南是毁灭性寒害、在东北是平常冬天，
     绝对阈值无法跨区通用，必须换成"比当地常年冷多少"。 */
  function buildClim(dailyYears, varName) {
    var sum = {}, cnt = {};
    dailyYears.forEach(function (dy) {
      var arr = (dy.daily && dy.daily[varName]) || [];
      var time = (dy.daily && dy.daily.time) || [];
      for (var i = 0; i < time.length; i++) {
        var v = arr[i];
        if (v == null || isNaN(v)) continue;
        var md = time[i].slice(5);   // MM-DD
        sum[md] = (sum[md] || 0) + v;
        cnt[md] = (cnt[md] || 0) + 1;
      }
    });
    var out = {};
    Object.keys(sum).forEach(function (k) { out[k] = sum[k] / cnt[k]; });
    return out;
  }

  function windowIdx(time, m1, d1, m2, d2) {
    var out = [];
    for (var i = 0; i < time.length; i++) {
      var md = time[i].slice(5);
      var mm = +md.slice(0, 2), dd = +md.slice(3, 5);
      if (m2 >= m1) {
        if ((mm > m1 || (mm === m1 && dd >= d1)) && (mm < m2 || (mm === m2 && dd <= d2))) out.push(i);
      } else {
        if ((mm > m1 || (mm === m1 && dd >= d1)) || (mm < m2 || (mm === m2 && dd <= d2))) out.push(i);
      }
    }
    return out;
  }

  function triggerRatio(peril, daily, idx, S) {
    if (!idx.length) return 0;
    // 统一走 canonical schema，兼容 Open-Meteo 原名 / providers 输出 / 站点导入
    var D = Calibrate.ensureCanon(daily);
    if (peril === 'rainy') {
      var precip = idx.map(function (i) { return D.prcp[i] == null ? 0 : D.prcp[i]; });
      var ratio = 0, run = 0;
      for (var i = 0; i <= precip.length; i++) {
        if (i < precip.length && precip[i] >= 1) { run++; }
        else { if (run >= S.minRun) ratio += payLookup(S, run, 'high'); run = 0; }
      }
      return Math.min(1, ratio);
    }
    if (peril === 'storm') {
      var p2 = idx.map(function (i) { return D.prcp[i] == null ? 0 : D.prcp[i]; });
      return payLookup(S, Math.max.apply(null, p2), 'high');
    }
    if (peril === 'frost') {
      var tmin = idx.map(function (i) { return D.tmin[i]; }).filter(function (v) { return v != null; });
      if (!tmin.length) return 0;
      // 距平型（推荐用于低温）：看"较常年同期偏低多少"，取窗口内最大降幅。
      // 与绝对阈值型的区别：−5℃ 在华南是毁灭性寒害、在东北是平常冬天，
      // 绝对线无法跨区通用；降幅能自动适配当地气候。
      if (S.indexType === 'anomaly' && S._clim) {
        var TIME = D.time || daily.time || [];
        var devs = idx.map(function (i) {
          var v = D.tmin[i]; if (v == null) return null;
          var md = TIME[i] ? TIME[i].slice(5) : null;
          if (!md) return null;
          var b = S._clim[md];
          return b == null ? null : (b - v);   // 正值 = 比常年更冷
        }).filter(function (v) { return v != null; });
        if (!devs.length) return 0;
        return payLookup(S, Math.max.apply(null, devs), 'high');
      }
      return payLookup(S, Math.min.apply(null, tmin), 'low');
    }
    if (peril === 'heat') {
      var hv = idx.map(function (i) {
        if (HEAT_METRIC === 'avg') {
          if (D.tmax[i] == null || D.tmin[i] == null) return null;
          return (D.tmax[i] + D.tmin[i]) / 2;
        }
        return D.tmax[i];
      }).filter(function (v) { return v != null; });
      if (!hv.length) return 0;
      // 距平型高温：看"较常年同期偏高多少"
      if (S.indexType === 'anomaly' && S._clim) {
        var T2 = D.time || daily.time || [];
        var hd = idx.map(function (i) {
          var v = hv.length && D.tmax[i] != null ? D.tmax[i] : null;
          if (v == null) return null;
          var md = T2[i] ? T2[i].slice(5) : null;
          if (!md) return null;
          var b = S._clim[md];
          return b == null ? null : (v - b);   // 正值 = 比常年更热
        }).filter(function (v) { return v != null; });
        if (hd.length) return payLookup(S, Math.max.apply(null, hd), 'high');
      }
      return payLookup(S, Math.max.apply(null, hv), 'high');
    }
    if (peril === 'drought') {
      var cum = idx.reduce(function (a, i) { return a + (D.prcp[i] == null ? 0 : D.prcp[i]); }, 0);
      return payLookup(S, cum, 'low');
    }
    if (peril === 'wind') {
      var wind = idx.map(function (i) { return (D.wind[i] == null ? 0 : D.wind[i]) / 3.6; });
      if (!wind.length) return 0;
      return payLookup(S, Math.max.apply(null, wind), 'high');
    }
    return 0;
  }

  function lookup(ratio, V, dir) {
    // 区间型分档表：[{lo,hi,p}] —— 用于"距平/降幅"指数
    //（如"较常年偏低 8–10℃ 赔 1%、10–12℃ 赔 2%"）。
    // 与阈值型的差别是语义：阈值型问"有没有到这条线"，区间型问"落在了哪一档"。
    if (Array.isArray(ratio)) {
      for (var i = 0; i < ratio.length; i++) {
        var b = ratio[i];
        if (V >= b.lo && V < b.hi) return b.p || 0;
      }
      var last = ratio[ratio.length - 1];
      return (last && V >= last.hi) ? (last.p || 0) : 0;
    }
    var keys = Object.keys(ratio).map(Number);
    var valid = dir === 'high' ? keys.filter(function (k) { return V >= k; }) : keys.filter(function (k) { return V <= k; });
    if (!valid.length) return 0;
    var k = dir === 'high' ? Math.max.apply(null, valid) : Math.min.apply(null, valid);
    return ratio[k] || 0;
  }

  /* ---------- 本地气象缓存（试点县预下载，断网/秒开优先） ---------- */
  var _manifest = null, _countyCache = {};
  async function getManifest() {
    if (_manifest) return _manifest;
    try { var r = await fetch('assets/data/counties.json'); _manifest = await r.json(); }
    catch (e) { _manifest = { counties: [] }; }
    return _manifest;
  }
  function nearestCached(lat, lon) {
    if (!_manifest || !_manifest.counties.length) return null;
    var best = null, bd = 1e9;
    _manifest.counties.forEach(function (c) {
      if (!c.file) return; // 仅匹配已打包本地逐日气象的县；未打包(file 为空)走在线回测
      var d = Math.hypot(c.lat - lat, c.lon - lon);
      if (d < bd) { bd = d; best = c; }
    });
    return bd <= 0.6 ? best : null; // 0.6°≈60km 内匹配最近缓存县
  }
  async function loadCounty(c) {
    if (_countyCache[c.adcode]) return _countyCache[c.adcode];
    var j = await (await fetch('assets/data/' + c.file)).json();
    _countyCache[c.adcode] = j;
    return j;
  }
  async function fetchYearCached(lat, lon, y, onSrc, srcId) {
    // 0) 本地预置网格优先：这是回测的实际入口。
    // 之前把本地检查挂在 fetchYear 上，那条路径没被调用，导致"数据已下载却仍走在线"。
    var _lg = null;
    try { _lg = await localYear(lat, lon, y); } catch (e) { _lg = null; }
    if (_lg && _lg.time && _lg.time.length) {
      if (onSrc) onSrc("本地预置网格（离线可用）");
      return _lg;
    }
    var id = srcId || 'era5';
    if (id === 'openmeteo') id = 'era5';
    // 本地缓存仅由 ERA5 预下载；其他源一律走在线适配器（缓存口径不同，混用会污染结论）
    if (id === 'era5') {
      var m = await getManifest();
      var c = nearestCached(lat, lon);
      if (c && c.file && y >= c.from && y <= c.to) {
        try {
          var j = await loadCounty(c);
          var time = [], tmax = [], tmin = [], prcp = [], wind = [];
          for (var i = 0; i < j.time.length; i++) {
            if (+j.time[i].slice(0, 4) === y) {
              time.push(j.time[i]); tmax.push(j.tmax[i]); tmin.push(j.tmin[i]); prcp.push(j.prcp[i]); wind.push(j.wind[i]);
            }
          }
          if (time.length && onSrc) onSrc(c.name + '（本地缓存 ' + c.from + '–' + c.to + '）');
          return {
            time: time, tmax: tmax, tmin: tmin, prcp: prcp, wind: wind, __canon: true,
            meta: { source: 'era5-cache', res: '0.25°≈25km', note: '本地预下载缓存' }
          };
        } catch (e) {
          // 本地缓存缺失/损坏 → 退回在线回测，不阻断主流程
        }
      }
    }
    if (!window.WIIProviders) throw new Error('气象数据适配层未加载（assets/js/providers.js），请检查 index.html 的 script 引入顺序');
    return window.WIIProviders.fetchYear(id, lat, lon, y);
  }

  /* ---------- 取数：多源 + 多格点均值 + 分位数映射 ---------- */
  var PROXY_OFFSETS = [[0, 0], [0.25, 0], [-0.25, 0], [0, 0.25], [0, -0.25]];
  async function getDaily(lat, lon, y, S, onSrc) {
    // 本地预置网格优先：本地存的就是 0.25° 网格值，本身就是单格点，
    // 不必再做 5 点均值平滑——否则 5 个偏移点里 4 个没本地数据，
    // 每次回测白跑 4 次在线请求（实测"在线被拦 5 次"里有 4 次来自这里）。
    try {
      var _lg0 = await localYear(lat, lon, y);
      if (_lg0 && _lg0.time && _lg0.time.length) {
        var _m0 = Calibrate.ensureCanon(_lg0);
        if (onSrc) onSrc("本地预置网格（离线可用）");
        if (S.precipFactor && S.precipFactor !== 1) _m0 = Calibrate.correctDaily(_m0, S.precipFactor);
        if (S._qm) _m0 = window.WIIQC.applyMonthly(_m0, S._qm);
        return _m0;
      }
    } catch (e) { }
    var srcId = S.source || 'era5';
    var main;
    if (S.proxy && srcId !== 'station') {
      var arrs = [];
      for (var k = 0; k < PROXY_OFFSETS.length; k++) {
        var d = await fetchYearCached(lat + PROXY_OFFSETS[k][0], lon + PROXY_OFFSETS[k][1], y, null, srcId);
        arrs.push(Calibrate.ensureCanon(d));
      }
      main = Calibrate.countyMean(arrs);
      if (onSrc) onSrc('县域多格点均值（' + window.WIIProviders.meta(srcId).name + ' 5 点）');
    } else {
      var d0 = await fetchYearCached(lat, lon, y, onSrc, srcId);
      main = Calibrate.ensureCanon(d0);
    }
    // 标量降水修正（保留向后兼容；对尾部无效，仅作粗调）
    if (S.precipFactor && S.precipFactor !== 1) main = Calibrate.correctDaily(main, S.precipFactor);
    // 逐月分位数映射（真正校正尾部的手段）
    if (S._qm) main = window.WIIQC.applyMonthly(main, S._qm);
    return main;
  }

  /* ---------- 分位数映射标定：以 NASA POWER（GPCP 校正降水）为参考分布 ---------- */
  async function buildQMCalib(S, onStep) {
    if (!S.qm) return null;
    var srcId = S.source || 'era5';
    if (srcId === 'station' || srcId === 'power') {
      return {
        skipped: true,
        reason: srcId === 'power' ? '当前源即参考源，无需再做映射' : '站点实测优先级最高，不做映射拉伸'
      };
    }
    var y1 = 2024, y0 = y1 - 4;   // 5 年标定窗，参数拟合后外推至全回测期
    var acc = { s: { time: [], prcp: [], tmax: [] }, r: { time: [], prcp: [], tmax: [] } };
    var got = 0, err = null;
    for (var y = y0; y <= y1; y++) {
      try {
        if (onStep) onStep('分位数映射标定：拟合 ' + y + ' 年（' + srcId + ' vs power）');
        var a = Calibrate.ensureCanon(await window.WIIProviders.fetchYear(srcId, S.lat, S.lon, y));
        var b = Calibrate.ensureCanon(await window.WIIProviders.fetchYear('power', S.lat, S.lon, y));
        acc.s.time = acc.s.time.concat(a.time); acc.s.prcp = acc.s.prcp.concat(a.prcp); acc.s.tmax = acc.s.tmax.concat(a.tmax);
        acc.r.time = acc.r.time.concat(b.time); acc.r.prcp = acc.r.prcp.concat(b.prcp); acc.r.tmax = acc.r.tmax.concat(b.tmax);
        got++;
      } catch (e) { err = e.message; }
    }
    if (!got) return { failed: true, reason: err || '校正窗口取数失败' };
    var fit = window.WIIQC.fitMonthly(acc.s, acc.r);
    var cp = window.WIIQC.consistency(acc.s, acc.r, 'prcp', 'sum');
    var ct = window.WIIQC.consistency(acc.s, acc.r, 'tmax', 'mean');
    return {
      fit: fit, years: got, window: [y0, y1],
      cons: { rP: cp && cp.r, rT: ct && ct.r, biasP: cp && cp.bias, nP: cp && cp.n },
      error: err
    };
  }

  /* ---------- 回测主流程 ---------- */
  async function runBacktest() {
    var S = readScheme();
    if (isNaN(S.lat) || isNaN(S.lon)) {
      var prog0 = document.getElementById('rt-prog');
      if (prog0) { prog0.style.display = 'block'; prog0.innerHTML = '<div class="prog-err">经纬度无效，请先在「县区/市」下拉或地图选县填入坐标，再运行回测。</div>'; }
      return;
    }
    var out = document.getElementById('rate-out');
    var prog = document.getElementById('rt-prog');
    var y0 = 2026 - S.years, y1 = 2025;
    out.style.display = 'none';
    prog.style.display = 'block';
    prog.innerHTML = '<div class="prog-t">正在拉取真实历史气象（' + (S.source === 'openmeteo' ? 'Open-Meteo Archive/ERA5' : '气象源') + '，' + S.years + '年）…</div><div class="prog-bar"><i id="rt-bar"></i></div><div class="prog-s" id="rt-prog-s"></div>';
    var barEl = document.getElementById('rt-bar');
    var stEl = document.getElementById('rt-prog-s');

    var R;
    try {
      R = await compute(S, function (done, total, label) {
        stEl.textContent = label || ('回测中… ' + done + ' / ' + total + ' 年');
        barEl.style.width = Math.round(done / total * 100) + '%';
      });
    } catch (e) {
      prog.innerHTML = '<div class="prog-err">气象数据拉取失败：' + e.message + '<br>请确认网络可访问 archive-api.open-meteo.com（需 https 环境）；试点县可优先用本地缓存。可稍后重试。</div>';
      return;
    }
    barEl.style.width = '100%'; stEl.textContent = '回测完成';
    renderResult(R, S);
  }

  /* ---------- 回测计算核心（引擎二 UI 与方案设计器共用） ---------- */
  async function compute(S, onProg) {
    var y0 = 2026 - S.years, y1 = 2025;
    HEAT_METRIC = (S.crop === 'cotton') ? 'avg' : 'max';
    // 分位数映射：先拟合一次（5 年标定窗），再逐年应用到全回测期
    S._qm = null; S._qmInfo = null;
    if (S.qm) {
      var qinfo = await buildQMCalib(S, onProg ? function (label) { onProg(0, S.years, label); } : null);
      S._qmInfo = qinfo;
      if (qinfo && qinfo.fit) S._qm = qinfo.fit;
    }
    var dailyYears = [], usedSrc = '', annualIndex = [];
    for (var y = y0; y <= y1; y++) {
      var srcLabel = '';
      var daily = await getDaily(S.lat, S.lon, y, S, function (s) { srcLabel = s; });
      dailyYears.push({ y: y, daily: daily });
      if (srcLabel && !usedSrc) usedSrc = srcLabel;
      if (!srcLabel) await sleep(220); // 本地缓存无需限速
      if (onProg) onProg(y - y0 + 1, S.years, srcLabel ? ('本地缓存：' + srcLabel) : ('回测中… ' + (y - y0 + 1) + ' / ' + S.years + ' 年'));
      var W = windowIdx(daily.time, S.m1, S.d1, S.m2, S.d2);
      annualIndex.push(Calibrate.rawIndex(S.peril, daily, W, S.minRun, HEAT_METRIC));
    }
    // 距平型指数：先用全部年份算出逐日常年基准，再逐年算降幅/升幅
    if (S.indexType === 'anomaly') {
      var climVar = (S.peril === 'frost') ? 'tmin' : 'tmax';
      S._clim = buildClim(dailyYears, climVar);
    }

    var annual1 = dailyYears.map(function (dy) {
      var W = windowIdx(dy.daily.time, S.m1, S.d1, S.m2, S.d2);
      return triggerRatio(S.peril, dy.daily, W,
        { ratio: S.ratio, minRun: S.minRun, paytype: S.paytype, linA: S.linA, linF: S.linF });
    });
    var opt = { peril2: null, annual2: null, mean2: null };
    if (S.multi && S.peril2) {
      opt.peril2 = S.peril2;
      opt.annual2 = dailyYears.map(function (dy) {
        return triggerRatio(S.peril2, dy.daily, windowIdx(dy.daily.time, S.m1, S.d1, S.m2, S.d2),
          { ratio: S.ratio2, minRun: S.minRun, paytype: S.paytype, linA: S.linA2, linF: S.linF2 });
      });
      opt.mean2 = opt.annual2.reduce(function (a, b) { return a + b; }, 0) / opt.annual2.length;
    }
    var combined = opt.annual2 ? annual1.map(function (a, i) { return Math.min(1, a + opt.annual2[i]); }) : annual1;
    var mean1 = annual1.reduce(function (a, b) { return a + b; }, 0) / annual1.length;
    S._usedSrc = usedSrc;
    var res = analyze(combined, S, { mean1: mean1, mean2: opt.mean2, multi: !!opt.annual2 });
    res.annual1 = annual1; res.annual2 = opt.annual2; res.combined = combined; res.mean1 = mean1; res.usedSrc = usedSrc;
    // 无站点近似标定：分位阈值 + （若有单产）指数-产量 R² 与最优阈值
    if (annualIndex.length) {
      var sug = Calibrate.suggestStrike(annualIndex, S.dir);
      if (S.yieldArr && S.yieldArr.length >= 3) {
        var fit = Calibrate.fitIndexYield(annualIndex, S.yieldArr);
        var opt2 = Calibrate.optimizeStrike(annualIndex, S.yieldArr, S.dir);
        res.calib = { used: true, fit: fit, opt: opt2, sug: sug };
      } else {
        res.calib = { used: false, fit: null, opt: null, sug: sug };
      }
    }
    res.evidence = buildEvidence(S, res, S._qmInfo);
    return res;
  }

  /* ---------- 证据分级装配（给团队用的"能用到什么程度"） ---------- */
  function buildEvidence(S, res, qmInfo) {
    var P = window.WIIProviders, Q = window.WIIQC;
    var srcId = S.source || 'era5';
    var reg = P.meta(srcId);
    var station = P.stationInfo();
    var qmApplied = !!(S._qm);
    var cons = (qmInfo && qmInfo.cons) ? qmInfo.cons : {};
    var g = Q.grade({
      qmApplied: qmApplied,
      cons: cons,
      qmMonths: qmInfo && qmInfo.fit ? qmInfo.fit.months : 0,
      station: station,
      nYears: res.n
    });
    return {
      level: g.level, label: g.label, color: g.color,
      usage: g.usage, cantdo: g.cantdo, reasons: g.reasons,
      source: reg, station: station, qm: qmInfo, qmApplied: qmApplied, cons: cons,
      precipFactor: S.precipFactor
    };
  }

  function analyze(annual, S, extra) {
    var n = annual.length;
    var mean = annual.reduce(function (a, b) { return a + b; }, 0) / n;
    var B = 2000, samples = [];
    for (var b = 0; b < B; b++) {
      var s = 0;
      for (var k = 0; k < n; k++) s += annual[Math.floor(Math.random() * n)];
      samples.push(s / n);
    }
    samples.sort(function (a, c) { return a - c; });
    var lo = samples[Math.floor(B * 0.025)], hi = samples[Math.floor(B * 0.975)];
    var triggerYears = annual.filter(function (x) { return x > 0; }).length;
    var maxR = Math.max.apply(null, annual);
    var load = EXPENSE + RISKLOAD;
    var pureLo = lo, pureHi = hi, pureMean = mean;
    var rateLo = pureLo * (1 + load), rateHi = pureHi * (1 + load), rateMean = pureMean * (1 + load);
    // 定价口径：保险费率(小数) = 纯风险损失率 ÷ 成本比例；ULR = 回测均值 ÷ 定价保险费率
    var prerate = (S.trial > 0 && S.cost > 0) ? S.trial / S.cost : null;
    var ulr = prerate != null ? (pureMean / prerate) : null;
    // 合计 ULR 目标带 70-75%；单责也参考但宽松
    var verdict = ulr == null ? 'na'
      : (ulr >= TARGET_ULR[0] && ulr <= TARGET_ULR[1]) ? 'pass'
        : ulr < TARGET_ULR[0] ? 'rich' : 'refix';
    return {
      n: n, mean: pureMean, lo: pureLo, hi: pureHi,
      rateLo: rateLo, rateHi: rateHi, rateMean: rateMean, load: load,
      triggerYears: triggerYears, maxR: maxR, years: annual,
      ulr: ulr, prerate: prerate, trial: S.trial, cost: S.cost, verdict: verdict, sum: S.sum, extra: extra || {}
    };
  }

  function renderResult(R, S) {
    var out = document.getElementById('rate-out');
    var perilCN = { drought: '干旱', frost: '低温霜冻', heat: '高温热害', rainy: '连阴雨', storm: '暴雨', wind: '大风' };
    var perilCN1 = perilCN[S.peril];
    var multiTag = (R.extra.multi) ? '（多责任合计 · ' + perilCN1 + '+' + perilCN[S.peril2] + '）' : '';
    var verdictMap = {
      pass: ['通过 · 维持', '当前试算费率与阈值基本成立，合计 ULR 落 70%-75% 可持续区间。'],
      rich: ['费率偏高 · 可让利', '合计 ULR 低于 70%，初版费率偏厚，可适度下调或放宽阈值以提升农户获得感。'],
      refix: ['严重偏低 · 须重定价', '合计 ULR 远超 75%，初版费率严重低估真实风险，须收紧阈值+提费率，或改累计赔付结构。'],
      na: ['—', '未填纯风险损失率目标，下方仅给回测费率区间。']
    };
    var v = verdictMap[R.verdict];
    var calibBlock = renderCalib(R, S);
    var evBlock = renderEvidence(R, S);

    var payStruct = '<div class="rb-sub">赔付结构：' + (S.paytype === 'linear'
      ? '线性理赔阈值——起赔 ' + S.linA + ' → 全赔 ' + S.linF + ' ' + (LINEAR_UNIT[S.peril] || '') + '，区间内连续线性折算、封顶 100%'
      : '阶梯型理赔阈值——分档查表（' + Object.keys(S.ratio).length + ' 档）') + '</div>';

    var perPeril = R.extra.multi
      ? '<div class="rb-sub">分责期望年赔付率：主害 ' + pct(R.extra.mean1) + ' ｜ 次害 ' + pct(R.extra.mean2) + ' ｜ 合计(封顶100%) ' + pct(R.mean) + '</div>'
      : '';

    var html =
      '<div class="res-head">费率回测结果 · ' + KB.crops[S.crop].name + ' · ' + perilCN1 + multiTag + '</div>' +
      payStruct +
      '<div class="kpi-row">' +
        kpi('期望年赔付率（纯风险损失率）', pct(R.mean), '多年历史均值，占保额比例') +
        kpi('纯费率 Bootstrap 区间', pct(R.lo) + '~' + pct(R.hi), '95% 置信区间（2000 次重抽样）') +
        kpi('建议综合费率', pct(R.rateMean), '含费用率15%+风险附加10%') +
        kpi('建议综合费率区间', pct(R.rateLo) + '~' + pct(R.rateHi), '抗大灾尾部') +
      '</div>' +
      '<div class="kpi-row">' +
        kpi('触发年数 / 总年', R.triggerYears + ' / ' + R.n, '历史期出险频率') +
        kpi('最重赔付年强度', pct(R.maxR), '封顶前最大年赔付率') +
        (R.prerate != null ? kpi('定价保险费率', pct(R.prerate), '纯风险损失率 ' + S.trial + '% ÷ 成本比例 ' + S.cost + '%') : kpi('定价保险费率', '—', '填纯风险损失率后计算')) +
        (R.ulr != null ? kpi('ULR（对定价保险费率）', pct(R.ulr, 0), '合计目标带 ' + pct(TARGET_ULR[0], 0) + '~' + pct(TARGET_ULR[1], 0)) : kpi('ULR', '—', '填纯风险损失率后计算')) +
        kpi('结论', v[0], v[1]) +
      '</div>' +
      perPeril +
      evBlock +
      calibBlock +
      '<div class="res-block"><div class="rb-h">逐年赔付率（历史回测，占保额比例）</div>' +
        '<div class="rb-b"><canvas id="rt-chart" width="760" height="240"></canvas>' +
        '<div class="note-sm">横轴为年份（' + (2026 - S.years) + '–2025），纵轴为当年触发赔付率；红色虚线为期望年赔付率。</div></div></div>' +
      '<div class="res-block"><div class="rb-h">校准建议</div><div class="rb-b">' + calibrate(R, S) + '</div></div>' +
      '<div class="note-sm">数据取值：' + (S._usedSrc || '在线再分析（非模拟）') + '。证据等级与可用边界见上方「数据凭证与证据等级」卡；最终费率与阈值以试点县站点观测标定、精算报备与监管批复为准。主体区分：阳光财险≠阳光农互。</div>';
    out.innerHTML = html;
    out.style.display = 'block';
    progHide();
    drawChart(R, S);
  }

  function progHide() { var p = document.getElementById('rt-prog'); if (p) p.style.display = 'none'; }

  function kpi(t, v, s) {
    return '<div class="kpi"><div class="kpi-t">' + t + '</div><div class="kpi-v">' + v + '</div><div class="kpi-s">' + s + '</div></div>';
  }

  /* ---------- 数据凭证与证据等级卡（团队使用安全阀） ---------- */
  function renderEvidence(R, S) {
    var ev = R.evidence;
    if (!ev) return '';
    var cons = ev.cons || {};
    var rows = [];
    rows.push(['数据源', ev.source.name + ' ｜ 分辨率 ' + ev.source.res]);
    var corr;
    if (ev.qmApplied) {
      corr = '逐月分位数映射（参考分布：NASA POWER / GPCP 校正降水；标定窗 ' +
        (ev.qm && ev.qm.window ? ev.qm.window[0] + '–' + ev.qm.window[1] : '—') + '）';
    } else if (ev.qm && ev.qm.skipped) {
      corr = '未映射 — ' + ev.qm.reason;
    } else if (ev.qm && ev.qm.failed) {
      corr = '映射失败（' + ev.qm.reason + '）— 按未校正计';
    } else {
      corr = '未做分位数映射' + (ev.precipFactor && ev.precipFactor !== 1 ? '；仅标量系数 ×' + ev.precipFactor : '');
    }
    rows.push(['降水校正', corr]);
    if (cons.rP != null || cons.rT != null) {
      var t = [];
      if (cons.rP != null) t.push('月降水 r=' + cons.rP.toFixed(2));
      if (cons.rT != null) t.push('月温度 r=' + cons.rT.toFixed(2));
      if (cons.biasP != null) t.push('降水相对偏差 ' + (cons.biasP * 100).toFixed(1) + '%');
      rows.push(['源间一致性', t.join(' ｜ ')]);
    }
    if (ev.station && ev.station.loaded) {
      rows.push(['站点实测', ev.station.from + '–' + ev.station.to + '（' + ev.station.years + ' 年，缺测率 ' + (ev.station.missing.rate * 100).toFixed(1) + '%）']);
    } else {
      rows.push(['站点实测', '未导入 — 这是当前无法升到 E3 的原因']);
    }
    var tbl = rows.map(function (r) {
      return '<tr><td class="evk">' + r[0] + '</td><td>' + r[1] + '</td></tr>';
    }).join('');
    var reasons = (ev.reasons || []).map(function (x) { return '<li>' + x + '</li>'; }).join('');
    return '<div class="res-block ev-card" style="border-left:4px solid ' + ev.color + '">' +
      '<div class="rb-h">数据凭证与证据等级' +
        '<span class="ev-badge" style="background:' + ev.color + '">' + ev.level + ' · ' + ev.label + '</span></div>' +
      '<div class="rb-b">' +
        '<table class="evtb">' + tbl + '</table>' +
        '<div class="ev-use"><b>可用于：</b>' + ev.usage + '<br><b>不得用于：</b>' + ev.cantdo + '</div>' +
        '<div class="ev-why"><b>判定依据</b><ul>' + (reasons || '<li>—</li>') + '</ul></div>' +
        '<div class="note-sm">' + ev.source.note + '</div>' +
      '</div></div>';
  }

  function renderCalib(R, S) {
    if (!R.calib) return '';
    var c = R.calib, dir = S.dir, unit = (LINEAR_UNIT[S.peril] || '');
    var proxyTxt = S.proxy
      ? '已启用（县域多格点均值 ERA5 5 点 + 降水偏差校正因子 ' + S.precipFactor + '）'
      : '未启用（单点 ERA5 约 25km）';
    var h = '<div class="res-block"><div class="rb-h">无站点近似标定 · 基差风险校验</div><div class="rb-b">';
    h += '<div class="rb-sub">数据近似：' + proxyTxt + '。未接国家气象站（CIMISS）/省气候中心，本结果为<b>近似标定</b>，最终以站点观测 + 降尺度为准。</div>';
    if (c.sug) {
      h += '<div class="rb-sub">分位阈值建议（可复现锚，' + (dir === 'low' ? '越低越赔' : '越高越赔') + '）：'
        + ' P5=' + c.sug.p5.toFixed(1) + unit + ' ｜ P10=' + c.sug.p10.toFixed(1) + unit
        + ' ｜ P25=' + c.sug.p25.toFixed(1) + unit + ' ｜ 中位=' + c.sug.median.toFixed(1) + unit + '</div>';
    }
    if (c.used && c.fit) {
      var r2 = c.fit.r2, ok = r2 >= 0.35;
      h += '<div class="rb-sub">指数-产量相关性：R² = <b>' + r2.toFixed(3) + '</b>（n=' + c.fit.n + '）'
        + (ok ? '，<span style="color:#2e9b8b">≥0.35 商业可接受（Nature 2025 基准）</span>'
              : '，<span style="color:#c0392b">未达 0.35，基差偏大，须站点标定/换指数</span>') + '</div>';
      if (c.opt) h += '<div class="rb-sub">最大 R² 最优阈值（扫描 strike）：<b>' + c.opt.strike.toFixed(1) + unit
        + '</b>（R²=' + c.opt.r2.toFixed(3) + '）。可将该值作触发阈值初值，替代通用默认档。</div>';
    } else {
      h += '<div class="rb-sub">未提供历史单产序列，无法实测指数-产量 R²。填入逐年单产（CSV）即可启用基差校验与最优阈值标定。</div>';
    }
    h += '</div></div>';
    return h;
  }

  function calibrate(R, S) {
    var arr = [];
    if (R.verdict === 'refix') {
      arr.push('① <b>收紧触发阈值</b>：连阴雨起赔 3→5 日、暴雨 50→80mm、低温 -2→-4℃、累计降水档上移，直接压低期望赔付率；');
      arr.push('② <b>优化物候窗口</b>：确认窗口已卡在作物最怕灾时点，剔除边缘低风险时段；');
      arr.push('③ <b>改累计赔付结构</b>：多事故改为"累计封顶"而非简单取大，平滑尾部；');
    } else if (R.verdict === 'rich') {
      arr.push('① <b>费率可适度下调/放宽阈值</b>：合计 ULR<70% 说明初版偏厚，可让利提升农户获得感，或扩展保障责任；');
    } else if (R.verdict === 'pass') {
      arr.push('① 当前阈值与费率基本成立，可进入小步试点；');
    }
    if (R.extra.multi) {
      arr.push('④ <b>多责合计口径</b>：已按"逐年两责叠加封顶 100%"回测，合计 ULR 须落在 <b>70%-75%</b>；若偏离，整体平移阈值/费率，勿对单责机械平分风险；');
    } else {
      arr.push('④ <b>多责合计提醒</b>：若同县同作物多责任同时承保，应在本引擎勾选「多责任合计」逐年叠加(封顶100%)校准，使合计 ULR 落 70%-75%；');
    }
    arr.push('⑤ 费率建议取 Bootstrap 区间上限附近以覆盖大灾尾部；样本量 ' + R.n + ' 年，置信度随年数上升。');
    return arr.join('<br>');
  }

  function drawChart(R, S) {
    var cv = document.getElementById('rt-chart'); if (!cv) return;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height, padL = 42, padB = 28, padT = 12, padR = 12;
    ctx.clearRect(0, 0, W, H);
    var data = R.years, n = data.length;
    var maxV = Math.max(R.mean, Math.max.apply(null, data), 0.05) * 1.15;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.strokeStyle = '#cdd6e0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, H - padB); ctx.lineTo(W - padR, H - padB); ctx.stroke();
    ctx.fillStyle = '#5b6b7b'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
    for (var g = 0; g <= 4; g++) {
      var yy = padT + plotH * g / 4;
      ctx.fillText((maxV * (4 - g) / 4 * 100).toFixed(0) + '%', padL - 6, yy + 4);
      ctx.strokeStyle = '#eef2f7'; ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();
    }
    var bw = plotW / n;
    for (var i = 0; i < n; i++) {
      var v = data[i];
      var bh = v / maxV * plotH;
      var x = padL + i * bw + bw * 0.18, y = H - padB - bh, w = bw * 0.64;
      ctx.fillStyle = v > 0 ? '#e0792e' : '#bcd0c4';
      ctx.fillRect(x, y, w, bh);
    }
    var ey = H - padB - R.mean / maxV * plotH;
    ctx.strokeStyle = '#c0392b'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padL, ey); ctx.lineTo(W - padR, ey); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#5b6b7b'; ctx.textAlign = 'center';
    var y0 = 2026 - n;
    [0, Math.floor(n / 2), n - 1].forEach(function (i) {
      ctx.fillText((y0 + i), padL + i * bw + bw / 2, H - padB + 16);
    });
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function resetForm() {
    document.getElementById('rt-lat').value = '';
    document.getElementById('rt-lon').value = '';
    document.getElementById('rt-trial').value = '';
    document.getElementById('rate-out').style.display = 'none';
    document.getElementById('rt-prog').style.display = 'none';
  }

  function bindPresets() {
    function fill(lat, lon, z, crop, peril, m1, d1, m2, d2, sum, trial, ratioPairs) {
      document.getElementById('rt-city').value = lat + ',' + lon + ',' + z;
      document.getElementById('rt-crop').value = crop;
      document.getElementById('rt-peril').value = peril;
      document.getElementById('rt-m1').value = m1; document.getElementById('rt-d1').value = d1;
      document.getElementById('rt-m2').value = m2; document.getElementById('rt-d2').value = d2;
      document.getElementById('rt-sum').value = sum;
      document.getElementById('rt-trial').value = trial;
      bindPeril(); buildRatioEditor(curRatio, ratioPairs, 'rt-ratio');
      var multi = document.getElementById('rt-multi'); if (multi) { multi.checked = false; toggleMulti(); }
    }
    document.getElementById('preset-jiande').addEventListener('click', function () {
      fill(29.47, 119.28, 'yangtze', 'rice', 'rainy', 9, 21, 11, 15, 400, 5, [['3', 10], ['5', 20], ['7', 30]]); switchTab('rate');
    });
    document.getElementById('preset-gaotang').addEventListener('click', function () {
      fill(36.86, 116.23, 'huanghuai', 'corn', 'heat', 6, 15, 8, 20, 400, 5, [['35', 10], ['37', 20], ['39', 30]]); switchTab('rate');
    });
    document.getElementById('preset-zhoukou').addEventListener('click', function () {
      fill(33.63, 114.65, 'huanghuai', 'wheat', 'frost', 3, 15, 5, 5, 400, 5, [['0', 10], ['-2', 20], ['-4', 30]]); switchTab('rate');
    });
  }

  /* ---------- 阈值灵敏度分析（一次性取数，逐变体重算；对标 ParameterPro trigger validation） ---------- */
  async function sensitivity(S, variants) {
    var y0 = 2026 - S.years, y1 = 2025;
    var dailyYears = [];
    for (var y = y0; y <= y1; y++) dailyYears.push({ y: y, daily: await fetchYearCached(S.lat, S.lon, y) });
    var load = EXPENSE + RISKLOAD;
    return variants.map(function (v) {
      var annual = dailyYears.map(function (dy) {
        return triggerRatio(S.peril, dy.daily, windowIdx(dy.daily.time, S.m1, S.d1, S.m2, S.d2),
          { ratio: v.ratio, minRun: v.minRun,
            paytype: v.linear ? 'linear' : S.paytype,
            linA: v.linear ? v.linear.a : S.linA, linF: v.linear ? v.linear.f : S.linF });
      });
      var n = annual.length;
      var mean = annual.reduce(function (a, b) { return a + b; }, 0) / n;
      var ty = annual.filter(function (x) { return x > 0; }).length;
      var maxR = Math.max.apply(null, annual);
      var rate = mean * (1 + load);
      var cost = S.cost || 75;
      var ulr = (S.trial > 0 && cost > 0) ? mean / (S.trial / cost) : null;
      return { label: v.label, mean: mean, rate: rate, ulr: ulr, triggerYears: ty, n: n, maxR: maxR };
    });
  }

  window.RateEngine = {
    buildClim: buildClim, lookup: lookup,
    init: initForm, loadFromScheme: loadFromScheme,
    fetchYear: fetchYear, fetchYearCached: fetchYearCached, localYear: localYear,
    compute: compute, sensitivity: sensitivity,
    windowIdx: windowIdx, triggerRatio: triggerRatio,
    linearPayout: linearPayout, payLookup: payLookup, LINEAR_DEFS: LINEAR_DEFS,
    hasLocal: function (lat, lon) { return nearestCached(lat, lon); },
    // 渲染入口对外暴露：供方案设计器复用同一套证据卡，也便于自动化校验
    renderResult: renderResult, renderEvidence: renderEvidence,
    buildQMCalib: buildQMCalib,
    EXPENSE: EXPENSE, RISKLOAD: RISKLOAD, TARGET_ULR: TARGET_ULR
  };
})();
