/* ============================================================
   作物扩展层：把作物覆盖从 10 个扩到 04 库全部 33 个种植类作物
   ------------------------------------------------------------
   设计原则（重要）：
     1. 本文件**只放作物身份与适用性判断，不放物候数据**。
        物候（阶段/农事/阈值）一律由 pheno-data.js 提供，
        未接入的作物标 phenoPending，平台明确提示"待接入"，
        **绝不用月份区间兜底冒充物候** —— 那会生成一个整体错季的方案。
     2. 品类分组与 04 库一致：粮食 / 经济 / 蔬菜 / 水果。
     3. 畜禽、水产、苗木林木、林下经济、海洋牧场**不纳入**，
        它们的天气指数是另一套逻辑（热应激 / 水温溶氧 / 长周期），
        平台单独说明，不是遗漏。
   ============================================================ */
(function () {
  'use strict';

  // 品类分组（与 04 库目录一致）
  var GROUPS = [
    { key: 'grain', name: '粮食作物（8）', keys: ['rice', 'wheat', 'corn', 'soybean', 'potato', 'sorghum', 'millet', 'sweetpotato'] },
    { key: 'cash', name: '经济作物（10 条 · 麻类拆分）· 天气指数主战场', keys: ['cotton', 'rape', 'peanut', 'sugarcane', 'sugarbeet', 'tobacco', 'tea', 'silkworm', 'ramie', 'flax'] },
    { key: 'veg', name: '蔬菜（8）', keys: ['tomato', 'cucumber', 'chili', 'eggplant', 'cabbage', 'radish', 'spinach', 'garlic'] },
    { key: 'fruit', name: '水果（8）', keys: ['apple', 'citrus', 'pear', 'peach', 'grape', 'banana', 'kiwifruit', 'lychee'] }
  ];

  // 新增 23 个作物的身份（物候数据待接入）
  // fit: strong 强适用 / mid 中适用 / weak 弱适用
  var EXTRA = {
    // —— 粮食 ——
    potato: { name: '马铃薯', cat: '粮食', fit: 'strong', why: '露地、块茎膨大期对高温与土壤湿度敏感，指标清晰', perils: ['frost', 'drought', 'rainy'] },
    sorghum: { name: '高粱', cat: '粮食', fit: 'strong', why: '耐旱作物但灌浆期高温与后期倒伏仍是主害', perils: ['drought', 'heat', 'wind'] },
    millet: { name: '谷子', cat: '粮食', fit: 'strong', why: '旱作、播期与抽穗期霜冻窗口明确', perils: ['drought', 'frost'] },
    sweetpotato: { name: '甘薯', cat: '粮食', fit: 'mid', why: '地下块根，气象与产量关系经土壤缓冲，解释力弱于禾谷类', perils: ['drought', 'rainy'] },

    // —— 经济作物（重点）——
    peanut: { name: '花生', cat: '经济', fit: 'strong', why: '花针期与结荚期需水临界、饱果期怕渍涝，窗口与指标都清晰', perils: ['drought', 'rainy', 'storm'] },
    sugarbeet: { name: '甜菜', cat: '经济', fit: 'strong', why: '块根膨大期需水、收获期冻害，含糖率对气象敏感', perils: ['drought', 'frost', 'rainy'] },
    tobacco: { name: '烟草', cat: '经济', fit: 'strong', why: '移栽/团棵/打顶/采收期分明，霜冻与冰雹是毁灭性主害，单亩产值高', perils: ['frost', 'storm', 'rainy', 'drought'] },
    silkworm: { name: '桑蚕', cat: '经济', fit: 'mid', why: '蚕期（催青/小蚕/大蚕/上蔟）是养殖过程，气象通过桑叶质量与蚕室温湿间接作用，指数解释力弱于作物', perils: ['heat', 'rainy'] },
    ramie: { name: '苎麻', cat: '经济', fit: 'mid', why: '多年生、一年多茬收割，单季窗口需按麻季拆分才有意义', perils: ['drought', 'rainy', 'wind'] },
    flax: { name: '亚麻', cat: '经济', fit: 'strong', why: '一年生、生育期短，播期与快速生长期的霜冻/干旱窗口明确', perils: ['frost', 'drought'] },

    // —— 蔬菜 ——
    tomato: { name: '番茄', cat: '蔬菜', fit: 'strong', why: '露地花期高温落花、果实日灼；设施模式适用性降为中（温度可控）', perils: ['heat', 'frost', 'rainy'] },
    cucumber: { name: '黄瓜', cat: '蔬菜', fit: 'strong', why: '露地结瓜期怕低温阴雨与高温；设施模式适用性降为中', perils: ['frost', 'rainy', 'heat'] },
    chili: { name: '辣椒', cat: '蔬菜', fit: 'strong', why: '开花坐果期对高温与渍涝敏感，露地为主', perils: ['heat', 'rainy', 'drought'] },
    eggplant: { name: '茄子', cat: '蔬菜', fit: 'strong', why: '露地花果期怕低温与涝害，生育期较长', perils: ['frost', 'rainy'] },
    cabbage: { name: '大白菜', cat: '蔬菜', fit: 'strong', why: '秋季包心期怕连阴雨与霜冻，北方冬储菜，单季集中', perils: ['rainy', 'frost'] },
    radish: { name: '萝卜', cat: '蔬菜', fit: 'strong', why: '根膨大期怕旱与冻，秋播为主', perils: ['drought', 'frost'] },
    spinach: { name: '菠菜', cat: '蔬菜', fit: 'mid', why: '生育期短（30–60 天）、多茬次，窗口过短使指数触发概率估计不稳', perils: ['frost', 'rainy'] },
    garlic: { name: '大蒜', cat: '蔬菜', fit: 'strong', why: '越冬蒜苗怕冻、抽薹与鳞茎膨大期怕旱，跨年物候清晰', perils: ['frost', 'drought'] },

    // —— 水果 ——
    pear: { name: '梨', cat: '水果', fit: 'strong', why: '花期霜冻是毁灭性主害，与苹果同属高价值果园险', perils: ['frost', 'storm', 'drought'] },
    peach: { name: '桃', cat: '水果', fit: 'strong', why: '花期早、霜冻风险高于苹果；成熟期怕连阴雨裂果', perils: ['frost', 'rainy', 'storm'] },
    grape: { name: '葡萄', cat: '水果', fit: 'strong', why: '花期与转色期怕连阴雨，成熟期裂果，设施与露地差异大', perils: ['rainy', 'frost', 'heat'] },
    banana: { name: '香蕉', cat: '水果', fit: 'strong', why: '热带作物，低温寒害（<10℃）与台风是主害，华南特色', perils: ['frost', 'wind', 'drought'] },
    kiwifruit: { name: '猕猴桃', cat: '水果', fit: 'strong', why: '萌芽期倒春寒与果实日灼是主害，陕南/川西集中产区', perils: ['frost', 'heat', 'drought'] },
    lychee: { name: '荔枝', cat: '水果', fit: 'strong', why: '花期低温阴雨与果期高温落果，大小年明显，华南高价值', perils: ['frost', 'rainy', 'heat'] }
  };

  // 已有 10 作物的适用性（与新增保持同一张表，便于统一展示）
  var EXISTING_FIT = {
    rice: { fit: 'strong', why: '抽穗扬花期高温/寒露风阈值明确，是天气指数最成熟的应用', perils: ['heat', 'frost', 'storm', 'rainy'] },
    wheat: { fit: 'strong', why: '拔节霜冻与灌浆期干热风/烂场雨，跨年物候清晰', perils: ['frost', 'heat', 'rainy'] },
    corn: { fit: 'strong', why: '抽雄吐丝期"卡脖旱"与高温，窗口短而敏感', perils: ['drought', 'heat', 'wind'] },
    soybean: { fit: 'mid', why: '开花结荚期怕旱怕涝，但库内阈值多为定性、无数值', perils: ['drought', 'rainy'] },
    cotton: { fit: 'strong', why: '花铃期需水需肥高峰，高温与渍涝阈值清晰（注意日均温口径）', perils: ['drought', 'heat', 'rainy'] },
    rape: { fit: 'strong', why: '唯一阶段表全覆盖的作物，花期菌核病与越冬冻害明确', perils: ['rainy', 'frost'] },
    sugarcane: { fit: 'mid', why: '宿根连年、生育期跨 400+ 天，只能做单阶段专项', perils: ['drought', 'frost', 'wind'] },
    tea: { fit: 'mid', why: '仅高温热害一条可数值化，其余灾种全为定性', perils: ['heat', 'frost'] },
    apple: { fit: 'strong', why: '花期霜冻窗口极窄且损失不可逆，果园险典型标的', perils: ['frost', 'storm', 'drought'] },
    citrus: { fit: 'strong', why: '越冬冻害阈值有明确品种差异（甜橙 −3 / 宽皮橘 −5）', perils: ['frost', 'drought', 'heat'] }
  };

  var EXTRA_COLOR = {
    potato: '#b98a4a', sorghum: '#a4552f', millet: '#c9a227', sweetpotato: '#b5713c',
    peanut: '#c8a165', sugarbeet: '#8e5b7a', tobacco: '#7a6a3a', silkworm: '#9fb3a1',
    ramie: '#8fa86b', flax: '#9aa7c7',
    tomato: '#d9483b', cucumber: '#4f9b5a', chili: '#c0392b', eggplant: '#6b4a86',
    cabbage: '#6fa86b', radish: '#cf7f8a', spinach: '#3f7f4a', garlic: '#c9c3a8',
    pear: '#b7c95a', peach: '#e08a7a', grape: '#7b5b9a', banana: '#e0c341',
    kiwifruit: '#8a9a4a', lychee: '#c8452f'
  };

  // 合并进 KB.crops（KB.crops 是对象引用，此处就地扩展）
  function merge() {
    var KB = window.AGRI_KB;
    if (!KB || !KB.crops) return false;
    Object.keys(EXTRA).forEach(function (k) {
      var e = EXTRA[k];
      KB.crops[k] = {
        name: e.name, cat: e.cat, color: EXTRA_COLOR[k] || '#7a8b99',
        zone: '依 04 库各区分布', phenology: [],
        phenoPending: true      // 物候数据未接入：平台据此提示，不用月份兜底
      };
    });
    KB.cropGroups = GROUPS;
    KB.cropFit = {};
    Object.keys(EXISTING_FIT).forEach(function (k) { KB.cropFit[k] = EXISTING_FIT[k]; });
    Object.keys(EXTRA).forEach(function (k) {
      KB.cropFit[k] = { fit: EXTRA[k].fit, why: EXTRA[k].why, perils: EXTRA[k].perils };
    });
    return true;
  }

  var FIT_LABEL = { strong: '强', mid: '中', weak: '弱' };

  // 「物候是否已接入」必须运行时判断：
  // 初始化时数据还没加载完（crops-extra 早于 pheno-data），写死标记会一直显示"待接入"，
  // 即使批次数据已经接进来。这类"状态与实际不符"比没有提示更误导。
  function phenoReady(key) {
    var P = window.WIIPheno;
    return !!(P && P.getCrops && P.getCrops()[key]);
  }

  /* 作物实证画像：库内条目 / 可作起赔档 / 可定价。
     为什么必须显示：烟草库内 29 条条目里 10 条是冰雹（无强度量纲、不能定价），
     真正的可定价条目只有 1 条。只报"29 条"会让分支以为它是成熟产品。
     —— 覆盖广度与可定价能力是两个维度，界面必须同时给出。 */
  function cropStats(key) {
    var P = window.WIIPheno;
    if (!P || !P.getCrops()[key]) return null;
    var c = P.getCrops()[key];
    var total = 0, payable = 0, pricing = 0, numericOnly = 0;
    Object.keys(c.regions).forEach(function (rk) {
      P.stagesOf(key, rk).forEach(function (st) {
        Object.keys(st.perils).forEach(function (pk) {
          var p = st.perils[pk] || {};
          total++;
          if (p.useAs === 'serviceTrigger') return;   // 灌水线：不可作起赔档
          payable++;
          if (p.numeric) pricing++;
        });
      });
    });
    return {
      entries: total, payable: payable, pricing: pricing,
      rate: total ? pricing / total : 0,
      notMapped: c.notMappedPerils || 0,
      pending: !phenoReady(key)
    };
  }

  // 统一填充作物下拉：按品类分组 + 适用性后缀
  function fillCropSelect(sel) {
    var KB = window.AGRI_KB;
    if (!sel || !KB) return;
    var byKey = {};
    GROUPS.forEach(function (g) { g.keys.forEach(function (k) { byKey[k] = g; }); });
    GROUPS.forEach(function (g) {
      var og = document.createElement('optgroup');
      og.label = g.name;
      g.keys.forEach(function (k) {
        var c = KB.crops[k];
        if (!c) return;
        var o = document.createElement('option');
        o.value = k;
        var fit = (KB.cropFit[k] || {}).fit || 'mid';
        o.textContent = c.name + '　[' + (FIT_LABEL[fit] || '?') + ']' + (phenoReady(k) ? '' : '·待接入');
        o.setAttribute('data-fit', fit);
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
  }

  // 适用性说明（选中作物后在提示区显示）
  function cropFitNote(key) {
    var KB = window.AGRI_KB;
    if (!KB) return '';
    var f = (KB.cropFit || {})[key];
    if (!f) return '';
    var c = KB.crops[key] || {};
    var tag = FIT_LABEL[f.fit] || '?';
    var cls = f.fit === 'strong' ? 'ok' : f.fit === 'mid' ? 'warn' : 'bad';
    var st = cropStats(key);
    var stat = '';
    if (st && st.entries) {
      var pct = Math.round(st.rate * 100);
      var level = st.rate >= 0.5 ? 'ok' : st.rate >= 0.2 ? 'warn' : 'bad';
      var warn = st.rate < 0.2
        ? '　<span style="color:#c0392b">可定价率过低：条目数看着多，真正能出产品的很少</span>'
        : '';
      if (st.notMapped) warn += '<br><span style="color:#7f8c8d">另有 ' + st.notMapped +
        ' 条库内条目因平台无对应灾种键未接入（如冰雹），不计入上表</span>';
      stat = '<br><b>已接入条目 ' + st.entries + ' 条</b>｜可作起赔档 ' + st.payable + ' 条｜' +
        '<b style="color:' + (level === 'ok' ? '#1e8449' : level === 'warn' ? '#b9770e' : '#c0392b') + '">可定价 ' +
        st.pricing + ' 条（' + pct + '%）</b>' + warn;
    }
    var pend = phenoReady(key) ? '' : '<br>⚠ 该作物的区域物候数据尚未接入（扩展批次交付中），暂不能按物候自动定窗。';
    return { html: '<b>天气指数适用性：' + tag + '</b>　' + f.why + stat + pend, cls: cls };
  }

  /* 单页作物地图：34 个作物 × 可定价率，按比率排序。
     为什么要有这一页：34 个作物并排放进下拉框，会天然让人以为"能力提升了 3 倍"。
     真实情况是——蔬菜 100% 可定价、高粱谷子 13%、烟草 5%。
     把比率放在同一张表里排序，是唯一能让"覆盖广"不变成错觉的做法。 */
  function renderCropMap(el) {
    var KB = window.AGRI_KB;
    if (!el || !KB || !KB.cropGroups) return;
    var rows = [];
    KB.cropGroups.forEach(function (g) {
      g.keys.forEach(function (k) {
        var c = KB.crops[k]; if (!c) return;
        var st = cropStats(k);
        var fit = (KB.cropFit[k] || {}).fit || 'mid';
        rows.push({
          key: k, name: c.name, group: g.name.split('（')[0], fit: fit,
          entries: st ? st.entries : 0, pricing: st ? st.pricing : 0,
          rate: st ? st.rate : 0, ready: phenoReady(k)
        });
      });
    });
    rows.sort(function (a, b) {
      if (a.ready !== b.ready) return a.ready ? -1 : 1;
      return b.rate - a.rate;
    });
    var totE = 0, totP = 0;
    rows.forEach(function (r) { totE += r.entries; totP += r.pricing; });

    var html = '<div class="cropmap">' +
      '<div class="cm-head">作物能力总览 · ' + rows.length + ' 个种植类作物　' +
      '<span class="cm-sum">合计 ' + totE + ' 条｜可定价 ' + totP + ' 条（' +
      (totE ? Math.round(totP / totE * 100) : 0) + '%）</span></div>' +
      '<div class="cm-note">"可定价率"＝库内有数值阈值、能直接支撑起赔点的条目占比。' +
      '<b>条目多不等于能做</b>：烟草 19 条里只有 1 条能定价。</div>' +
      '<table class="cm-table"><thead><tr>' +
      '<th>作物</th><th>品类</th><th>适用性</th><th>应接入</th><th>可定价</th><th>比率</th><th>可用性</th>' +
      '</tr></thead><tbody>';
    rows.forEach(function (r) {
      var pct = Math.round(r.rate * 100);
      var cls = !r.ready ? 'cm-off' : r.rate >= 0.5 ? 'cm-ok' : r.rate >= 0.2 ? 'cm-mid' : 'cm-bad';
      html += '<tr class="' + cls + '"><td><b>' + r.name + '</b></td><td>' + r.group + '</td>' +
        '<td>' + (FIT_LABEL[r.fit] || '?') + '</td>' +
        '<td>' + (r.ready ? r.entries : '—') + '</td>' +
        '<td>' + (r.ready ? r.pricing : '—') + '</td>' +
        '<td>' + (r.ready ? pct + '%' : '—') + '</td>' +
        '<td>' + (r.ready ? (r.rate >= 0.5 ? '可直接做' : r.rate >= 0.2 ? '需部分标定' : '不建议主推') : '待接入') + '</td></tr>';
    });
    html += '</tbody></table></div>';
    el.innerHTML = html;
  }

  window.WIICrops = {
    GROUPS: GROUPS, FIT_LABEL: FIT_LABEL,
    merge: merge, phenoReady: phenoReady, renderCropMap: renderCropMap, fillCropSelect: fillCropSelect, cropFitNote: cropFitNote, cropStats: cropStats,
    nonCropNote: '畜禽 8 / 水产 6 / 苗木林木 3 / 林下经济 3 / 海洋牧场 2 不纳入作物覆盖：它们的天气指数是另一套逻辑（热应激、水温溶氧、长周期），不是遗漏。'
  };

  merge();
})();
