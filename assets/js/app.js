/* ============================================================
   向阳社 · 天气指数保险设计平台 · 主控
   ============================================================ */
(function () {
  'use strict';
  var KB = window.AGRI_KB;

  /* ---------- Tab 切换 ---------- */
  window.switchTab = function (name) {
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('on', t.getAttribute('data-tab') === name);
    });
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('on', v.id === 'v-' + name);
    });
    // 切换后重排地图（隐藏 tab 内 canvas 宽度为 0 时不渲染，切到该视图需重绘）
    if (window.mapHome) window.mapHome.relayout();
    if (window.mapPicker) window.mapPicker.relayout();
    if (window.mapScheme) window.mapScheme.relayout();
    if (window.mapRate) window.mapRate.relayout();
  };
  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () { switchTab(t.getAttribute('data-tab')); });
  });

  /* ---------- 退出登录：清门禁会话并回到密码页 ---------- */
  (function bindExit() {
    var btn = document.getElementById('btn-exit');
    if (!btn) return;
    btn.addEventListener('click', function () {
      try { sessionStorage.removeItem('sunflower_wii_gate_v1'); } catch (e) { }
      location.reload();
    });
  })();

  /* ---------- 时钟 ---------- */
  function tick() {
    var d = new Date();
    var wd = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    document.getElementById('clock-date').textContent =
      d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' 周' + wd;
    document.getElementById('clock-time').textContent =
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  tick(); setInterval(tick, 1000);

  /* ---------- 反推表单：填充作物/区域 ---------- */
  (function fillReverse() {
    var cs = document.getElementById('rv-crop');
    if (window.WIICrops) WIICrops.fillCropSelect(cs);
    else Object.keys(KB.crops).forEach(function (k) {
      var o = document.createElement('option'); o.value = k; o.textContent = KB.crops[k].name; cs.appendChild(o);
    });
    var zs = document.getElementById('rv-zone');
    Object.keys(KB.zones).forEach(function (k) {
      var o = document.createElement('option'); o.value = k; o.textContent = KB.zones[k].name; zs.appendChild(o);
    });
    document.getElementById('rv-go').addEventListener('click', function () {
      document.getElementById('reverse-empty').style.display = 'none';
      window.ReverseEngine.render(window.__scn);
    });
  })();

  /* ---------- 行业方案库卡片（带筛选） ---------- */
  (function fillMarket() {
    var grid = document.getElementById('market-grid');
    var tagCls = { '国内': 'dom', '国际': 'intl', '方法论': 'met' };
    function cardHTML(m) {
      var k = m.tag.split('·')[0];
      var cls = tagCls[k] || 'met';
      var card = document.createElement('div');
      card.className = 'mcard';
      var detail = '';
      if (m.liability || m.claimTable || m.claim) {
        var claimHTML = '';
        if (m.claimTable) {
          claimHTML = '<div class="md-row"><b>理赔阈值（表格化）</b>' +
            '<table class="claimtb"><thead><tr><th>灾害/指数</th><th>触发条件</th><th>赔付标准</th></tr></thead><tbody>' +
            m.claimTable.map(function (r) {
              return '<tr><td>' + r.d + '</td><td>' + r.t + '</td><td>' + r.p + '</td></tr>';
            }).join('') +
            '</tbody></table>' +
            (m.claimNote ? '<div class="claim-note">注：' + m.claimNote + '</div>' : '') +
            '</div>';
        } else if (m.claim) {
          claimHTML = '<div class="md-row"><b>理赔阈值</b>' + m.claim + '</div>';
        }
        detail =
          '<button class="mdtoggle" type="button">▾ 细则：保险责任 · 理赔阈值</button>' +
          '<div class="mdetail" style="display:none">' +
          (m.liability ? '<div class="md-row"><b>保险责任</b>' + m.liability + '</div>' : '') +
          claimHTML +
          '</div>';
      }
      var ptag = m.payType ? '<span class="ptag ' + m.payType + '">' + (m.payType === 'linear' ? '线性' : '阶梯') + '</span>' : '';
      card.innerHTML =
        '<div class="mt"><span class="mtag ' + cls + '">' + m.tag + '</span>' + ptag + '<h4>' + m.name + '</h4></div>' +
        '<div class="mo">' + m.org + ' · ' + m.region + ' · ' + m.year + '</div>' +
        '<div class="mk"><b>作物/灾害：</b>' + m.crop + ' / ' + m.peril + '<br>' +
        '<b>指数：</b>' + m.index + '<br>' +
        '<b>触发：</b>' + m.trigger + '<br>' +
        '<b>赔付：</b>' + m.payout + '<br>' +
        '<b>赔付结构：</b>' + (m.payType === 'linear' ? '线性理赔阈值' : '阶梯型理赔阈值') + '</div>' +
        detail +
        '<div class="mn">' + m.note + '</div>';
      var tg = card.querySelector('.mdtoggle'), dt = card.querySelector('.mdetail');
      if (tg && dt) {
        tg.addEventListener('click', function () {
          var open = dt.style.display !== 'none';
          dt.style.display = open ? 'none' : 'block';
          tg.textContent = open ? '▾ 细则：保险责任 · 理赔阈值' : '▴ 收起细则';
        });
      }
      return card;
    }
    function render() {
      var scope = (document.getElementById('mf-scope') || {}).value || '';
      var kw = ((document.getElementById('mf-kw') || {}).value || '').trim().toLowerCase();
      grid.innerHTML = '';
      var list = KB.marketDesigns.filter(function (m) {
        var scopeOk = !scope || m.tag.indexOf(scope) === 0 || (scope === '国内' && m.tag.indexOf('国内') === 0);
        var ctTxt = (m.claimTable || []).map(function (r) { return r.d + r.t + r.p; }).join('');
        var kwOk = !kw || (m.crop + m.peril + m.name + m.index + (m.liability || '') + ctTxt + (m.claim || '')).toLowerCase().indexOf(kw) >= 0;
        return scopeOk && kwOk;
      });
      list.forEach(function (m) { grid.appendChild(cardHTML(m)); });
      var c = document.getElementById('mf-count'); if (c) c.textContent = '共 ' + list.length + ' 条';
    }
    render();
    var sf = document.getElementById('mf-scope'), kwf = document.getElementById('mf-kw');
    if (sf) sf.addEventListener('change', render);
    if (kwf) kwf.addEventListener('input', render);
  })();

  /* ---------- 方法论步骤 + 速查表 ---------- */
  (function fillMethod() {
    var box = document.getElementById('method-steps');
    KB.pipeline.forEach(function (s, i) {
      var div = document.createElement('div');
      div.className = 'step';
      div.innerHTML = '<div class="sn">' + (i + 1) + '</div><div class="st">' + s.replace(/^Step\d+\s*/, '') + '</div>';
      box.appendChild(div);
    });
    var qt = document.getElementById('method-quick');
    if (qt) {
      KB.designQuick.forEach(function (d) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + d.peril + '</td><td>' + d.index + '</td><td>' + d.base + '</td><td>' + d.dir + '</td><td>' + d.win + '</td>';
        qt.appendChild(tr);
      });
    }
  })();

  /* ---------- 历史单产：模板下载 + CSV 导入校验 ---------- */
  (function yieldTools() {
    var Q = window.WIIQC;
    var tplBtn = document.getElementById('rt-ytpl');
    var fileIn = document.getElementById('rt-yfile');
    var ta = document.getElementById('rt-yield');
    var note = document.getElementById('rt-ycheck');
    if (!Q || !ta) return;

    function say(html, cls) {
      if (!note) return;
      note.className = 'ynote' + (cls ? ' ' + cls : '');
      note.innerHTML = html;
    }

    if (tplBtn) {
      tplBtn.addEventListener('click', function () {
        var csv = '\uFEFF' + Q.yieldTemplate();
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '历史单产模板.csv';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        say('模板已下载。字段：年份、单产（公斤/亩）、播种面积（可选）、总产（可选）、数据来源、备注。');
      });
    }

    if (fileIn) {
      fileIn.addEventListener('change', function () {
        var f = fileIn.files && fileIn.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () {
          var res = Q.parseYieldCSV(String(rd.result || ''));
          if (res.errors.length) {
            say('<b>导入未通过</b>（' + res.errors.length + ' 处错误）：<br>' + res.errors.slice(0, 6).join('<br>')
              + '<br>请修正后重新导入，未做任何写入。', 'bad');
            window.__yieldRows = null;
            return;
          }
          window.__yieldRows = res.rows;
          ta.value = res.rows.map(function (r) { return r.yield; }).join(',');
          var msg = '已导入 <b>' + res.rows.length + '</b> 年（' + res.rows[0].year + '–' + res.rows[res.rows.length - 1].year + '），按年份升序对齐回测区间。';
          if (res.warnings.length) msg += '<br><span class="wn">提示：' + res.warnings.slice(0, 4).join('；') + '</span>';
          say(msg, res.warnings.length ? 'warn' : 'ok');
          fileIn.value = '';
        };
        rd.readAsText(f, 'utf-8');
      });
    }

    // 手工改动文本域 → 放弃已导入的年份结构，退回按顺序解析
    ta.addEventListener('input', function () {
      if (window.__yieldRows) {
        window.__yieldRows = null;
        say('已改为手工录入，将按「与回测年序同序」解析，不再做年份校验。', 'warn');
      }
    });
  })();

  /* ---------- 34 作物能力总览（可定价率排序） ---------- */
  (function cropMapBind() {
    var btn = document.getElementById('cm-toggle');
    var box = document.getElementById('crop-map');
    if (!btn || !box) return;
    var rendered = false;
    btn.addEventListener('click', function () {
      var open = box.style.display !== 'none';
      if (open) { box.style.display = 'none'; btn.textContent = '查看 34 个作物能力总览 ▾'; return; }
      if (!rendered && window.WIICrops) { WIICrops.renderCropMap(box); rendered = true; }
      box.style.display = '';
      btn.textContent = '收起作物总览 ▴';
    });
  })();

  /* ---------- 物候推荐窗口 + 实时匹配度（方案设计器 / 引擎二共用） ---------- */
  (function phenoBind() {
    var P = window.WIIPheno;
    if (!P) return;

    function zoneOf(latId, lonId) {
      var lat = parseFloat((document.getElementById(latId) || {}).value);
      var lon = parseFloat((document.getElementById(lonId) || {}).value);
      if (isNaN(lat) || isNaN(lon)) return null;
      if (window.SchemeDesigner && SchemeDesigner.zoneFromCoord) return SchemeDesigner.zoneFromCoord(lat, lon);
      return null;
    }
    function say(el, msg, cls) {
      if (!el) return;
      el.className = 'pheno-hint' + (cls ? ' ' + cls : '');
      el.innerHTML = msg;
    }
    function md(m, d) { return m + '月' + d + '日'; }

    function bind(cfg) {
      var btn = document.getElementById(cfg.btn);
      var hint = document.getElementById(cfg.hint);
      if (!btn) return;

      function ctx() {
        var cropKey = (document.getElementById(cfg.crop) || {}).value;
        var peril = (document.getElementById(cfg.peril) || {}).value;
        var zk = zoneOf(cfg.lat, cfg.lon);
        return { cropKey: cropKey, peril: peril, zone: zk, rk: zk ? (P.ZONE2REGION[zk] || zk) : null };
      }

      // 作物实证画像：选到作物就先告诉用户"这个作物有多少条能定价"，
      // 避免 34 个作物看起来都比 10 个更强（烟草 19 条接入、可定价仅 1 条）。
      function profileHTML() {
        var c = ctx();
        if (!window.WIICrops || !c.cropKey) return null;
        return WIICrops.cropFitNote(c.cropKey);
      }

      function liveScore() {
        var c = ctx();
        var prof = profileHTML();
        if (!c.rk) {
          say(hint, prof ? prof.html : '选县或填经纬度后，可一键按物候定窗口并实时校验匹配度', prof ? prof.cls : '');
          return;
        }
        var v = cfg.getWindow().map(function (id) {
          var el = document.getElementById(id);
          return el ? parseInt(el.value, 10) : NaN;
        });
        if (v.some(function (x) { return isNaN(x); })) {
          say(hint, (prof ? prof.html + '<br>' : '') + '保险期间未填完整，填完即显示匹配度', 'warn');
          return;
        }
        var sc = P.score(c.cropKey, c.rk, c.peril, v[0], v[1], v[2], v[3]);
        if (!sc.ok) { say(hint, sc.reason, 'warn'); return; }
        var cls = sc.grade === 'good' ? 'ok' : sc.grade === 'warn' ? 'warn' : 'bad';
        say(hint, '<b>匹配度 ' + sc.total + ' 分</b>（' + sc.dims.map(function (d) { return d.name + ' ' + d.score; }).join(' / ') +
          '）　' + sc.advice[0] + (prof ? '<br>' + prof.html : ''), cls);
      }

      btn.addEventListener('click', function () {
        var c = ctx();
        if (!c.rk) { say(hint, '请先「选县」或填经纬度，平台据此判定农业区', 'warn'); return; }
        var s = P.suggest(c.cropKey, c.rk, c.peril, { mode: 'core' });
        if (!s.ok) { say(hint, s.reason, 'bad'); return; }
        cfg.setWindow(s.window);
        var head = '已按 <b>' + (P.REGIONS[c.rk] || {}).name + '</b> 物候定窗：<b>' +
          md(s.window.m1, s.window.d1) + ' — ' + md(s.window.m2, s.window.d2) + '</b>' +
          '，锚定「' + s.anchor.season + '·' + s.anchor.stage + '」';
        // 不自评分数：窗口是平台自己生成的，再自己打分等于自我背书。
        // 改为披露定窗依据与阈值来源，评分只在用户手工改动后给。
        var a = s.anchor;
        var bits = [];
        if (a.thr) bits.push('库内阈值：' + a.thr);
        else bits.push('该阶段库内无阈值，须按历史气象分位数标定');
        if (s.lowConfidence) bits.push('⚠ 该阶段库内仅到月份，窗口精度偏低');
        say(hint, head + '<br>' + bits.join('；') + '　（改动窗口后会实时显示匹配度）', s.lowConfidence ? 'warn' : 'ok');
      });

      cfg.getWindow().forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', liveScore);
      });
      var ps = document.getElementById(cfg.peril);
      if (ps) ps.addEventListener('change', liveScore);
      // 首次进入即显示当前作物画像（不等用户点选）
      setTimeout(function () { try { liveScore(); } catch (e) { } }, 0);
      var cs = document.getElementById(cfg.crop);
      if (cs) cs.addEventListener('change', liveScore);
    }

    bind({
      btn: 'sd-pheno-btn', hint: 'sd-pheno-hint', crop: 'sd-crop', peril: 'sd-peril',
      lat: 'sd-lat', lon: 'sd-lon',
      getWindow: function () { return ['sd-m1', 'sd-d1', 'sd-m2', 'sd-d2']; },
      setWindow: function (w) {
        document.getElementById('sd-m1').value = w.m1; document.getElementById('sd-d1').value = w.d1;
        document.getElementById('sd-m2').value = w.m2; document.getElementById('sd-d2').value = w.d2;
      }
    });

    bind({
      btn: 'rt-pheno-btn', hint: 'rt-pheno-hint', crop: 'rt-crop', peril: 'rt-peril',
      lat: 'rt-lat', lon: 'rt-lon',
      getWindow: function () { return ['rt-m1', 'rt-d1', 'rt-m2', 'rt-d2']; },
      setWindow: function (w) {
        document.getElementById('rt-m1').value = w.m1; document.getElementById('rt-d1').value = w.d1;
        document.getElementById('rt-m2').value = w.m2; document.getElementById('rt-d2').value = w.d2;
      }
    });
  })();

  /* ---------- 初始化费率引擎 + 地图选点（首页 + 选点页两份） + 需求场景工作台 ---------- */
  window.RateEngine.init();
  if (window.MapPicker) { MapPicker.initHome(); MapPicker.initPicker(); MapPicker.initSchemeMap(); MapPicker.initRateMap(); }
  if (window.SchemeDesigner) SchemeDesigner.init();
  if (window.Scenarios) window.Scenarios.init();
})();
