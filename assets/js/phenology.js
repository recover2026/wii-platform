/* ============================================================
   物候引擎（Phenology Engine）
   ------------------------------------------------------------
   解决的问题：指数窗口与作物真实怕灾时点脱钩 → 基差风险。
   做法：作物 × 农业区 × 熟期 → 物候阶段（月/旬粒度）→
        按主害定位"最怕灾的时点" → 推荐保险期间 → 给窗口—物候匹配度打分。
   ------------------------------------------------------------
   数据口径（刚性）：
     · 阶段起止、关键农事、耐受阈值均取自 04-全品类农业产业技术风险库
       （阳光产险农险专家包内置知识库，生成基准 2026-07-12）
     · 该库明示为「通用物候参数 / 农艺参考值」，非试验精算数据；
       依当年气候、品种熟期与海拔浮动。
     · 库内未给数值阈值者，一律标「待试点县标定」，严禁前端补造数字。
     · 匹配度评分是**设计期校验**，不是赔付条件（纯气象指数边界）。
   ============================================================ */
(function () {
  'use strict';

  var META = {
    source: '04-全品类农业产业技术风险库（农险专家包）',
    base: '2026-07-12',
    caveat: '通用物候参数·农艺参考值，非试验精算值；依当年气候、品种熟期与海拔浮动，最终以试点县物候观测与历史气象标定为准。'
  };

  // 七大农业区（与 04 库统一口径）
  var REGIONS = {
    northeast:  { name: '东北区', short: '东北' },
    huanghuai:  { name: '华北区（含黄淮海）', short: '华北/黄淮海' },
    northwest:  { name: '西北区', short: '西北' },
    tibet:      { name: '青藏区', short: '青藏' },
    yangtze:    { name: '长江中下游区', short: '长江中下游' },
    southwest:  { name: '西南区', short: '西南' },
    south:      { name: '华南区', short: '华南' }
  };

  // 平台气候带键 ↔ 04 库农业区键（沿用平台既有 zone 命名）
  var ZONE2REGION = {
    northeast: 'northeast', huanghuai: 'huanghuai', northwest: 'northwest',
    tibet: 'tibet', yangtze: 'yangtze', southwest: 'southwest', south: 'south'
  };

  /* ---------- 旬 ↔ 日期 ---------- */
  var XUN_RE = /^(\d{1,2})([上中下])$/;
  var MONTH_RE = /^(\d{1,2})月?$/;

  function daysInMonth(m) {
    return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] || 31;
  }

  // 解析 '7中' / '7' / '10下' / '0701'（MMDD，来自定稿 JSON）
  var MMDD_RE = /^(\d{2})(\d{2})$/;
  function parseNode(s) {
    if (s == null) return null;
    s = String(s).trim();
    var md = s.match(MMDD_RE);
    if (md) return { m: +md[1], d: +md[2], exact: true, raw: s, monthOnly: false };
    var mm = s.match(XUN_RE);
    if (mm) return { m: +mm[1], part: mm[2], raw: s, monthOnly: false };
    var m2 = s.match(MONTH_RE);
    if (m2) return { m: +m2[1], part: null, raw: s, monthOnly: true };
    return null;
  }

  // 节点 → 该节点覆盖的日区间 {m, s, e}（s/e 为月内日）
  function nodeSpan(node, isEnd) {
    if (!node) return null;
    var m = node.m;
    if (node.exact) return { m: m, s: node.d, e: node.d };
    var last = daysInMonth(m);
    if (node.part === '上') return { m: m, s: 1, e: 10 };
    if (node.part === '中') return { m: m, s: 11, e: 20 };
    if (node.part === '下') return { m: m, s: 21, e: last };
    return { m: m, s: 1, e: last };  // 仅到月
  }

  // 阶段起止（月旬） → 具体日区间 {m1,d1,m2,d2,crossYear}
  function stageSpan(fromRaw, toRaw) {
    var a = parseNode(fromRaw), b = parseNode(toRaw);
    if (!a || !b) return null;
    var sa = nodeSpan(a, false), sb = nodeSpan(b, true);
    var full = { m1: sa.m, d1: sa.s, m2: sb.m, d2: sb.e };
    full.crossYear = (full.m2 < full.m1) || (full.m2 === full.m1 && full.d2 < full.d1);
    return full;
  }

  /* ---------- 日序（跨年按 366 处理，2/29 兼容） ---------- */
  var CUM = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
  function doy(m, d) { return CUM[m - 1] + d; }

  function spanLen(sp) {
    if (!sp) return 0;
    if (sp.crossYear) return (366 - doy(sp.m1, sp.d1)) + doy(sp.m2, sp.d2) + 1;
    return doy(sp.m2, sp.d2) - doy(sp.m1, sp.d1) + 1;
  }

  // 转成 0..365 的连续数轴，便于求交集
  function toAxis(sp) {
    var a = doy(sp.m1, sp.d1), b = doy(sp.m2, sp.d2);
    return { a: a, b: sp.crossYear ? b + 366 : b, len: spanLen(sp) };
  }

  function overlapLen(spA, spB) {
    var A = toAxis(spA), B = toAxis(spB);
    // 跨年窗口可能与平年窗口错位，做两次平移取最大
    var cands = [B, { a: B.a + 366, b: B.b + 366 }, { a: B.a - 366, b: B.b - 366 }];
    var best = 0;
    cands.forEach(function (Bx) {
      var lo = Math.max(A.a, Bx.a), hi = Math.min(A.b, Bx.b);
      if (hi >= lo) best = Math.max(best, hi - lo + 1);
    });
    return Math.min(best, Math.min(A.len, B.len));
  }

  function spanContains(outer, inner) {
    return overlapLen(outer, inner) >= spanLen(inner) - 1;  // 容 1 天舍入
  }

  function fmtMD(sp, which) {
    if (!sp) return '—';
    var m = which === 'start' ? sp.m1 : sp.m2;
    var d = which === 'start' ? sp.d1 : sp.d2;
    return m + '月' + d + '日';
  }

  function shiftDays(sp, delta) {
    // 以年内日序为基准平移，返回新的 {m,d}
    function fromDoy(v) {
      v = ((v - 1) % 366 + 366) % 366 + 1;
      var m = 12;
      for (var i = 1; i <= 12; i++) { if (v <= CUM[i - 1] + daysInMonth(i)) { m = i; break; } }
      return { m: m, d: v - CUM[m - 1] };
    }
    var a = fromDoy(doy(sp.m1, sp.d1) + delta);
    var b = fromDoy(doy(sp.m2, sp.d2) + delta);
    var out = { m1: a.m, d1: a.d, m2: b.m, d2: b.d, crossYear: false };
    out.crossYear = (out.m2 < out.m1) || (out.m2 === out.m1 && out.d2 < out.d1);
    return out;
  }

  /* ---------- 指数形态分类 → 缓冲期策略 ----------
     按平台实际指数定义归类（非按灾种名）：
       干旱 = 窗口累计降水 → cumulative-drought
       连阴雨 = 连续降水日数 → continuous
       霜冻/高温/暴雨/大风 = 单日极值 → extreme
     缓冲天数取自产品规则 v1.0（工程默认值，非行业标准，可配置）。 */
  var INDEX_FORM = {
    drought: 'cumulative-drought',
    rainy: 'continuous',
    frost: 'extreme', heat: 'extreme', storm: 'extreme', wind: 'extreme'
  };

  var BUFFER = {
    'extreme': { pre: 7, post: 7 },
    'continuous': { pre: 8, post: 8 },
    'cumulative-drought': { pre: 15, post: 5 },
    'cumulative-gtd': { pre: 0, post: 0 }   // 高温积温型（平台暂未用，预留）
  };

  // 累积型指数还有"最小有效累积期"：窗口短于此值，累积量无意义
  var MIN_ACCUM = {
    'cumulative-drought': 30,
    'cumulative-gtd': 20,
    'continuous': 10,     // 连续型的最小连续期 MCL
    'extreme': 0
  };

  function indexForm(peril) { return INDEX_FORM[peril] || 'extreme'; }
  function bufferFor(peril) { return BUFFER[indexForm(peril)] || BUFFER.extreme; }

  /* ---------- 数据装载 ---------- */
  var CROPS = {};
  var LOADED_META = null;
  var LOADED_COVERAGE = null;
  var SCHEMA_VERSION = 'wii-pheno/1.0';

  // 严格装载：缺字段直接抛错，绝不静默回落。
  // 起因：外部数据曾把 harvestWindow 的 yearOffset 改名为 yOff，读取方取不到即回落 0，
  // 结果小麦跨年被算出 384 天跨度并按超跨度拒绝，而运行时不报任何异常。
  // 原则：字段缺失是**契约违约**，不是"取默认值"。
  function validateCrops(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('物候数据为空或格式错误');
    var crops = Object.keys(obj), errs = [];
    // 覆盖率自证：统计"应校验/实际校验"条数。校验器的盲区它自己报不出来，
    // 只有把计数打出来，漏检才会表现为数字不等，而不是安静的 "0 error"。
    var cov = { crops: crops.length, regions: 0, skippedRegions: 0, stages: 0, perilEntries: 0, relativeStages: 0, monthOnlyStages: 0 };
    crops.forEach(function (ck) {
      var c = obj[ck];
      if (!c || !c.regions) { errs.push(ck + '：缺 regions'); return; }
      Object.keys(c.regions).forEach(function (rk) {
        var reg = c.regions[rk];
        cov.regions++;
        // 契约：plantable=false 的区（库内标注"极少种植/不适宜"）按设计不含阶段，不是数据缺失
        if (reg.plantable === false) { cov.skippedRegions++; return; }
        var seas = Array.isArray(reg.seasons) ? reg.seasons : [];
        if (!seas.length) { errs.push(ck + '/' + rk + '：缺 seasons（且未标 plantable:false）'); return; }
        seas.forEach(function (sea, si) {
          (sea.stages || []).forEach(function (st, ti) {
            var at = ck + '/' + rk + '/' + (sea.name || si) + '/' + (st.name || ti);
            ['name', 'from', 'to'].forEach(function (f) {
              if (st[f] == null || st[f] === '') errs.push(at + '：缺 ' + f);
            });
            if (!st.perils || typeof st.perils !== 'object') { errs.push(at + '：缺 perils'); return; }
            cov.stages++;
            if (st.precision === 'relative') cov.relativeStages++;
            if (st.precision === 'month') cov.monthOnlyStages++;
            cov.perilEntries += Object.keys(st.perils).length;
          });
        });
      });
    });
    if (errs.length) {
      throw new Error('物候数据契约校验失败（' + errs.length + ' 处）：' + errs.slice(0, 5).join('；') + '——请勿静默回落，修正数据或升 schemaVersion');
    }
    return cov;
  }

  function setCrops(obj, meta) {
    var cov = validateCrops(obj);
    if (meta && meta.schemaVersion && meta.schemaVersion !== SCHEMA_VERSION) {
      // 版本不匹配时仍然装载，但留下明确痕迹，便于排查"看起来正常其实口径不同"
      try { console.warn('[WIIPheno] schemaVersion 不一致：数据 ' + meta.schemaVersion + ' vs 代码 ' + SCHEMA_VERSION); } catch (e) { }
    }
    LOADED_META = meta || null;
    LOADED_COVERAGE = cov;
    // 期望条数由数据自带（meta.expectPerilEntries）；与实测不符即视为漏检，直接抛错
    if (meta && meta.expectPerilEntries != null && meta.expectPerilEntries !== cov.perilEntries) {
      throw new Error('覆盖率自证失败：期望 ' + meta.expectPerilEntries + ' 条灾种条目，实际校验 ' + cov.perilEntries +
        ' 条（差 ' + (meta.expectPerilEntries - cov.perilEntries) + '）——校验过程可能漏掉了某类阶段');
    }
    CROPS = obj || {};
  }

  function cropData(cropKey, regionKey) {
    var c = CROPS[cropKey];
    if (!c) return null;
    var rk = regionKey || null;
    if (!rk) return null;
    var r = c.regions && c.regions[rk];
    return r ? { crop: c, region: r, regionKey: rk } : null;
  }

  function regionsOf(cropKey) {
    var c = CROPS[cropKey];
    if (!c || !c.regions) return [];
    return Object.keys(c.regions).map(function (k) {
      return { key: k, name: (REGIONS[k] || {}).name || k, note: c.regions[k].note || '' };
    });
  }

  // 展开某作物某区的全部阶段（多熟期合并，带 season 标记）
  function stagesOf(cropKey, regionKey) {
    var d = cropData(cropKey, regionKey);
    if (!d) return [];
    var out = [];
    (d.region.seasons || []).forEach(function (sea) {
      (sea.stages || []).forEach(function (st) {
        var sp = stageSpan(st.from, st.to);
        out.push({
          season: sea.name, id: st.id, name: st.name, from: st.from, to: st.to,
          span: sp, spanOk: !!sp, days: st.days || '', ops: st.ops || '',
          precision: st.precision || 'tenday',
          track: st.track || '作物',
          perils: st.perils || {}, note: st.note || ''
        });
      });
    });
    return out;
  }

  // 某灾种命中的阶段：审度 Top3 危险窗口排名优先，推断严重度次之（0=未推断，不参与排序）
  function perilStages(cropKey, regionKey, peril) {
    return stagesOf(cropKey, regionKey)
      .filter(function (s) { return s.perils[peril]; })
      .sort(function (a, b) {
        var pa = a.perils[peril], pb = b.perils[peril];
        // 可赔阶段优先于"仅服务触发"阶段：灌水线阶段若排在前面，
        // 会让窗口因为"没覆盖灌水线"而被扣分，等于用服务线评价赔付设计。
        var sa = pa.useAs === 'serviceTrigger' ? 1 : 0;
        var sb = pb.useAs === 'serviceTrigger' ? 1 : 0;
        if (sa !== sb) return sa - sb;
        var ra = pa.rank == null ? 99 : pa.rank;
        var rb = pb.rank == null ? 99 : pb.rank;
        if (ra !== rb) return ra - rb;
        return (pb.severity || 0) - (pa.severity || 0);
      });
  }

  /* ---------- 农业年度坐标系 ----------
     以「播种日 − 30 天」为年度枢轴，把跨年窗口摊平成一条连续轴，
     解决小麦越冬、晚稻寒露风这类跨年物候的窗口长度与相位计算。 */
  function mod(a, n) { return ((a % n) + n) % n; }

  function sowingSpan(cropKey, regionKey) {
    var st = stagesOf(cropKey, regionKey).filter(function (s) { return s.spanOk; });
    for (var i = 0; i < st.length; i++) {
      if (/播种|定植|种植|移栽/.test(st[i].name)) return st[i].span;
    }
    return st.length ? st[0].span : null;
  }

  function agPivot(cropKey, regionKey) {
    var sp = sowingSpan(cropKey, regionKey);
    return sp ? mod(doy(sp.m1, sp.d1) - 30, 366) : 1;
  }

  function axisOf(sp, pivot) {
    var a = mod(doy(sp.m1, sp.d1) - pivot, 366);
    var b = mod(doy(sp.m2, sp.d2) - pivot, 366);
    if (b < a) b += 366;
    return { a: a, b: b, len: b - a + 1 };
  }

  function axisOverlap(A, B) {
    var lo = Math.max(A.a, B.a), hi = Math.min(A.b, B.b);
    return hi >= lo ? hi - lo + 1 : 0;
  }

  // 【已废弃】早期的"全生育期跨度"实现：直接把首尾阶段相连，不区分熟期与生产轨，
  // 会把甘蔗的春植/秋植、桑蚕的桑园/养蚕连成一条假链（实测 184 天被算成 121 天）。
  // 现由 chainSpan()（取最大链）与 seasonSpanSum()（多熟季叠加）分别承担两种语义。
  // 保留仅为兼容外部调用；内部代码不得再使用。
  function seasonLength(cropKey, regionKey) {
    var st = stagesOf(cropKey, regionKey).filter(function (s) { return s.spanOk; });
    if (!st.length) return 0;
    if (st.length === 1) return axisOf(st[0].span, agPivot(cropKey, regionKey)).len;
    var pivot = agPivot(cropKey, regionKey);
    var first = axisOf(st[0].span, pivot);
    var last = axisOf(st[st.length - 1].span, pivot);
    while (last.b < first.a) { last = { a: last.a + 366, b: last.b + 366, len: last.len }; }
    return last.b - first.a + 1;
  }

  // 累积间隔和：识别多熟季叠加导致的年度跨度 >365。
  // 两点必须注意，否则会把正常作物误判为超跨度：
  //   ① 多熟季（早稻/单季稻/晚稻）是**并列关系**，不是先后关系 → 必须按 season 分组各自累加，取最大；
  //   ② 只累加「起点→起点」的间隔，最后再加末阶段长度；若每次再加整段长度会重复计算。
  function seasonSpanSum(cropKey, regionKey) {
    var all = stagesOf(cropKey, regionKey).filter(function (s) { return s.spanOk; });
    if (!all.length) return 0;
    var groups = {}, order = [];
    // 分组键必须与 chainSpan / hasParallelStages 一致（熟期 + 生产轨）。
    // 只按熟期分组会把桑蚕的"桑园"与"养蚕"累加到一条链上，得出虚高的跨度。
    all.forEach(function (s) {
      var k = s.season + '||' + (s.track || '作物');
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(s);
    });
    var best = 0;
    order.forEach(function (k) {
      var st = groups[k];
      if (st.length === 1) { best = Math.max(best, spanLen(st[0].span)); return; }
      var total = 0;
      for (var i = 1; i < st.length; i++) {
        total += mod(doy(st[i].span.m1, st[i].span.d1) - doy(st[i - 1].span.m1, st[i - 1].span.d1), 366);
      }
      total += spanLen(st[st.length - 1].span);
      best = Math.max(best, total);
    });
    return best;
  }

  // 并行发育检测：同一熟期内若两阶段时间重叠超过较短者的一半，说明这不是一条顺序发育链
  // （多年生果树多批次梢/花芽并存、多茬采收），自动定窗不可靠 → 交人工并注明熟期。
  function hasParallelStages(cropKey, regionKey) {
    var all = stagesOf(cropKey, regionKey).filter(function (s) { return s.spanOk; });
    var groups = {};
    // 必须按「季别 + 生产轨」双键分组：桑蚕的桑园（桑树）与养蚕（蚕期）并行是正常的，
    // 只按季别分组会把种养并行误判成"阶段链断裂"，从而拒绝一个本来可做的作物。
    all.forEach(function (s) {
      var k = s.season + '||' + (s.track || '作物');
      (groups[k] = groups[k] || []).push(s);
    });
    return Object.keys(groups).some(function (k) {
      var st = groups[k];
      for (var i = 0; i < st.length; i++) {
        for (var j = i + 1; j < st.length; j++) {
          var ov = overlapLen(st[i].span, st[j].span);
          var shorter = Math.min(spanLen(st[i].span), spanLen(st[j].span));
          if (shorter > 0 && ov / shorter > 0.5) return true;
        }
      }
      return false;
    });
  }

  /* ---------- 窗口推荐 ---------- */
  // mode: 'core' 只覆盖最敏感阶段（窗口短、精准，默认）
  //       'span' 覆盖该灾种全部命中阶段（覆盖全但触发概率上升）
  function suggest(cropKey, regionKey, peril, opt) {
    opt = opt || {};
    var allHits = perilStages(cropKey, regionKey, peril);
    if (!allHits.length) {
      // 措辞铁律：「我库里没有」≠「库内说没有」。前者是数据缺口，后者是农艺结论，
      // 两者对用户的行动指引完全相反（一个是去查原文，一个是放弃该险种）。
      return {
        ok: false, code: 'NOT_COVERED',
        reason: '本平台物候库**未收录**「' + perilName(peril) + '」在此作物/农业区的阶段条目。' +
          '这不等于库内认定该灾种不是主要威胁——可能库内只给了定性表述、也可能该区阶段表收录不全。' +
          '请核对 04 库原文，或换区/换主害。'
      };
    }

    // 全生育期跨年 >365 天（多熟季叠加，如柑橘华南 469 天、甘蔗华南 409 天）
    // 年度坐标会取模撞车，此时不做自动定窗，交人工
    var seasonSpan = seasonSpanSum(cropKey, regionKey);
    if (seasonSpan > 365 || hasParallelStages(cropKey, regionKey)) {
      return {
        ok: false, level: 'M15',
        reason: (seasonSpan > 365
          ? '该作物在该区的全生育期累积跨度达 ' + seasonSpan + ' 天（多熟季叠加，>365 天）'
          : '该作物在该区存在并行发育阶段（多年生果树多批次梢/花芽并存、一年多茬采收，或种养并行）') +
          '，阶段不是一条顺序发育链，自动定窗会在年度坐标上撞车，请手工设定保险期间并注明所属熟期与品种'
      };
    }

    var hits = allHits.filter(function (s) { return s.spanOk; });
    if (!hits.length) {
      return { ok: false, reason: '「' + perilName(peril) + '」的命中阶段在库内只有相对日期（如"播种后 N 天""孕穗后 N 天"），无法折算成日历日，请手工设定保险期间' };
    }

    var mode = opt.mode === 'span' ? 'span' : 'core';
    var anchor = hits[0];
    var cover = mode === 'span' ? hits : [anchor];

    var startSp = cover[0].span;
    var endSp = cover[cover.length - 1].span;

    var form = indexForm(peril);
    var buf = BUFFER[form];
    var pre = opt.pre == null ? buf.pre : opt.pre;
    var post = opt.post == null ? buf.post : opt.post;

    var s0 = shiftDays({ m1: startSp.m1, d1: startSp.d1, m2: startSp.m1, d2: startSp.d1, crossYear: false }, -pre);
    var e0 = shiftDays({ m1: endSp.m2, d1: endSp.d2, m2: endSp.m2, d2: endSp.d2, crossYear: false }, post);

    var finalWin = { m1: s0.m1, d1: s0.d1, m2: e0.m1, d2: e0.d1 };
    finalWin.crossYear = (finalWin.m2 < finalWin.m1) || (finalWin.m2 === finalWin.m1 && finalWin.d2 < finalWin.d1);

    // 若该灾种的敏感期本身就占了几乎整条生产链，做单一指数必然稀释——
    // 这不是"窗口选得不好"，而是"该灾种不适合作单一指数"，必须在给出方案前拦住，
    // 否则会出现"suggest 给窗口 → score 判稀释 → 自己拦自己"的自相矛盾。
    var _chain = chainSpan(cropKey, regionKey);
    if (_chain.max > 0) {
      var _wl = spanLen({ m1: +finalWin.m1, d1: +finalWin.d1, m2: +finalWin.m2, d2: +finalWin.d2, crossYear: (+finalWin.m2 < +finalWin.m1) });
      if (_wl >= _chain.max * 0.8) {
        return {
          ok: false, code: 'TOO_BROAD',
          reason: '该灾种在本区的最长敏感期为 ' + _chain.max + ' 天，而保险期间需覆盖 ' + _wl +
            ' 天（占 ' + Math.round(_wl / _chain.max * 100) + '%）。做单一指数等于"什么都保"，' +
            '风险相关性被稀释、费率会失真。建议：①拆成关键子期分别出单 ②改选更集中的灾种 ③手工设窗并写明依据。'
        };
      }
    }

    var lowConf = anchor.precision === 'month';

    return {
      ok: true, mode: mode,
      window: finalWin,
      indexForm: form,
      anchor: {
        stage: anchor.name, from: anchor.from, to: anchor.to, season: anchor.season,
        note: anchor.note, precision: anchor.precision,
        thr: (anchor.perils[peril] || {}).thr || '',
        mech: (anchor.perils[peril] || {}).mech || ''
      },
      covered: cover.map(function (s) { return s.season + '·' + s.name + '（' + s.from + '–' + s.to + '）'; }),
      buffers: { pre: pre, post: post, kind: form },
      lowConfidence: lowConf,
      rationale: [
        '锚定阶段：' + anchor.season + '·' + anchor.name + '（' + anchor.from + '–' + anchor.to + '）' +
          (lowConf ? '　⚠ 库内该阶段仅到月份，窗口按月初/月末折日，精度偏低' : ''),
        (form === 'cumulative-drought'
          ? '累积型指数（窗口累计降水）：起赔线依赖一段时间的水量累积，故前置缓冲 ' + pre + ' 天把累积量攒够'
          : form === 'continuous'
            ? '连续型指数（连续降水日数）：前置缓冲 ' + pre + ' 天，避免把连阴过程从中间切断'
            : '单日极值型指数（单日雨量/最低温/最大风速）：只看单日峰值，前置缓冲 ' + pre + ' 天覆盖前期天气过程即可'),
        '后置缓冲 ' + post + ' 天覆盖收获作业与尾期风险'
      ]
    };
  }

  /* ---------- 窗口—物候匹配度评分（产品规则 v1.0） ----------
     五维：相关性25 / 覆盖度25 / 精准度20 / 相位20 / 适配10
     七道封顶闸门：先封顶、再求和（"封顶只降不升"）
     累积型指数的窗口是"参数"不是"容器"：窗口过长不是更安全，而是改变了指数含义。 */
  var WEIGHTS = { relevance: 25, extent: 25, precision: 20, phase: 20, fit: 10 };

  // k_type：超额惩罚斜率（工程默认值，非行业标准）
  var TUNING = { exExtreme: 1.5, exContinuous: 1.2, exCumulative: 1.0, base: 2.5 };

  function score(cropKey, regionKey, peril, m1, d1, m2, d2, opt) {
    opt = opt || {};
    var hits = perilStages(cropKey, regionKey, peril);
    if (!hits.length) return { ok: false, reason: '该作物在该区无此灾种物候命中，无法评分', total: null };

    var anchor = null;
    for (var i = 0; i < hits.length; i++) { if (hits[i].spanOk) { anchor = hits[i]; break; } }
    if (!anchor) return { ok: false, reason: '命中阶段仅有相对日期，无法评分', total: null };

    var user = { m1: +m1, d1: +d1, m2: +m2, d2: +d2 };
    if (!user.m1 || !user.d1 || !user.m2 || !user.d2) return { ok: false, reason: '保险期间不完整', total: null };

    var form = indexForm(peril);
    var buf = BUFFER[form];
    var pivot = agPivot(cropKey, regionKey);
    var peak = axisOf(anchor.span, pivot);
    var win = axisOf(user, pivot);

    // ① 相关性：是否盖住锚定（最敏感）阶段
    var ov = axisOverlap(win, peak);
    var covRatio = ov / peak.len;
    var D1 = covRatio >= 0.99 ? 25 : covRatio >= 0.80 ? 20 : covRatio >= 0.60 ? 14 : 8;
    var gateD1 = covRatio < 0.60 ? 12 : 100;

    // ② 覆盖度：只惩罚"超出必要缓冲"的冗余
    var r = win.len / peak.len;
    var e = (buf.pre + buf.post) / peak.len;
    var k;
    if (form === 'cumulative-drought' || form === 'cumulative-gtd') {
      k = r > 3.0 ? TUNING.exCumulative + 0.5 : (r > 2.0 ? TUNING.exCumulative + 0.2 : TUNING.exCumulative);
    } else if (form === 'continuous') {
      k = r > TUNING.base ? TUNING.exContinuous + 0.3 : TUNING.exContinuous;
    } else {
      k = r > TUNING.base ? TUNING.exExtreme + 0.3 : TUNING.exExtreme;
    }
    var excess = r - (1 + e);
    var D2 = excess <= 0 ? 25 : Math.max(0, 25 - k * (excess / e) * 25);
    if (win.len < peak.len * 0.9) D2 = Math.min(D2, 10);

    // ③ 精准度：窗口与锚定阶段的中点偏差
    var dev = Math.abs((win.a + win.b) / 2 - (peak.a + peak.b) / 2) / peak.len;
    var D3 = dev <= 0.20 ? 20 : dev <= 0.40 ? 15 : dev <= 0.60 ? 9 : 4;

    // ④ 相位：扣掉必要缓冲后再比两端
    var dStart = (win.a + buf.pre) - peak.a;
    var dEnd = (win.b - buf.post) - peak.b;
    var pen = Math.abs(dStart) + Math.abs(dEnd);
    var D4 = pen <= 5 ? 20 : pen <= 10 ? 15 : pen <= 20 ? 9 : 4;

    // ⑤ 适配：指数形态—灾种机制一致性 + 物候精度 + 熟期
    var D5 = 10;
    if (anchor.precision === 'month') D5 -= 3;
    if (anchor.precision === 'relative') D5 -= 3;
    var h = +((opt.heritage) || 0);
    if (h) D5 -= Math.min(5, Math.abs(h));
    D5 = Math.max(0, D5);

    var raw = D1 + D2 + D3 + D4 + D5;

    // 全生育期跨度（用于 G7）
    // ⚠️ G7 的前提是"全生育期"这个分母可信。该区阶段表若只有 1–2 个节点，
    // 分母会被严重低估，反而把正确的窗口判成"覆盖超 100%、灾种稀释"——
    // 用残缺数据下否定结论，比不下结论更糟。故仅当阶段数 ≥3 时才启用 G7。
    var chain = chainSpan(cropKey, regionKey);
    var seasonLen = chain.max;
    // 至少要有一条链上有 3 个节点，这个"链长"才可信；否则分母被打残，会误判稀释
    var seasonTrusted = chain.max > 0 && chain.nodes >= 3 && (chain.nodes / chain.groups) >= 2;

    // 七道封顶闸门
    var gates = [];
    var lateAdvice = [];   // G7 判定完成时 advice 还没声明，先暂存、稍后合并
    function gate(id, cap, why) { gates.push({ id: id, cap: cap, why: why }); }
    if (win.a > peak.a) gate('COV1', 49, '【覆盖类·整改=改窗口】窗口起点晚于最敏感阶段起点，已错过伤害窗口开端');
    // G2 对累积型同样生效：干旱累计需覆盖到需水期末，否则算不出真实亏缺（早期豁免是错的）
    if (win.b < peak.b) gate('COV2', 49, '【覆盖类·整改=改窗口】窗口终点早于最敏感阶段终点，尾部风险未覆盖');
    if (ov === 0) gate('COV3', 29, '【覆盖类·整改=改窗口】窗口与敏感期完全无交集，属"错配"，不得放行');
    if ((form === 'cumulative-drought' || form === 'cumulative-gtd') && win.len < (MIN_ACCUM[form] || 0))
      gate('G4', 59, '累积型指数窗口短于最小有效累积期（' + MIN_ACCUM[form] + ' 天），累积量无意义');
    if (form === 'continuous' && win.len < (MIN_ACCUM['continuous'] || 0))
      gate('G5', 59, '连续型指数窗口短于最小连续期（' + MIN_ACCUM['continuous'] + ' 天）');
    if (seasonTrusted && seasonLen && win.len >= seasonLen * 0.8)
      gate('G7', 59, '窗口≥全生育期 80%，灾种已被稀释为"什么都保"，风险相关性实质丧失');
    else if (!seasonTrusted && chain.nodes)
      lateAdvice.push('该区物候阶段表仅 ' + chain.nodes + ' 个节点、' + chain.groups +
        ' 条生产链，无法可靠判断"窗口是否过宽"，稀释风险请人工确认');

    var capAll = gates.reduce(function (m, g) { return Math.min(m, g.cap); }, 100);

    // 闸门稳定性（产品规则 v1.1）：若"最长敏感期"与"最早危险窗口"的加权长度差 <15%，
    // 峰值选取本身不稳定，硬闸门降级为固定 -8 罚分，避免换一个阶段评分就大跳。
    var lens = hits.filter(function (s) { return s.spanOk; })
      .map(function (s) { return spanLen(s.span); })
      .sort(function (a, b) { return b - a; });
    var unstable = lens.length > 1 && lens[0] > 0 && (lens[0] - lens[1]) / lens[0] < 0.15;

    var penalty = 0, effCap = capAll;
    if (unstable && gates.length) { penalty = 8; effCap = 100; }

    var total = Math.round(Math.min(raw, effCap, gateD1) - penalty);
    total = Math.max(0, total);

    var grade = total >= 85 ? 'good' : total >= 70 ? 'warn' : 'bad';
    var advice = [];
    if (lateAdvice.length) advice = advice.concat(lateAdvice);
    gates.forEach(function (g) { advice.push('【' + g.id + '】' + g.why); });
    if (r > 2.0 && !gates.length) advice.push('窗口长度是锚定阶段的 ' + r.toFixed(1) + ' 倍，大量非敏感日被计入，会抬高触发概率、虚增费率');
    if (win.len < peak.len * 0.9) advice.push('窗口短于锚定阶段，赔付责任与实际风险不匹配');
    if (!advice.length) advice.push('窗口与物候匹配良好，可用于后续阈值标定');

    return {
      ok: true, total: total, raw: raw, grade: grade,
      indexForm: form,
      anchor: { stage: anchor.name, season: anchor.season, from: anchor.from, to: anchor.to, precision: anchor.precision },
      dims: [
        { key: 'relevance', name: '相关性', score: D1, weight: WEIGHTS.relevance, note: '覆盖锚定阶段 ' + Math.round(covRatio * 100) + '%' },
        { key: 'extent', name: '覆盖度', score: Math.round(D2), weight: WEIGHTS.extent, note: '窗口/阶段比 ' + r.toFixed(2) + '（必要缓冲 ' + buf.pre + '+' + buf.post + ' 天）' },
        { key: 'precision', name: '精准度', score: D3, weight: WEIGHTS.precision, note: '中点偏差 ' + Math.round(dev * 100) + '% 阶段长' },
        { key: 'phase', name: '相位', score: D4, weight: WEIGHTS.phase, note: '扣缓冲后起点偏移 ' + Math.round(dStart) + ' 天、终点偏移 ' + Math.round(dEnd) + ' 天' },
        { key: 'fit', name: '适配', score: D5, weight: WEIGHTS.fit, note: '形态—机制一致' + (anchor.precision !== 'tenday' ? '；物候精度偏低' : '') }
      ],
      gates: gates,
      gateStability: unstable ? 'unstable' : 'stable',
      advice: advice,
      facts: { winLen: win.len, peakLen: peak.len, ratio: r, pre: buf.pre, post: buf.post, form: form }
    };
  }

  // 单条生产链的跨度：按「熟期 + 生产轨」分组，取组内首尾跨度，再取最大。
  // 为什么必须分组：甘蔗的春植/秋植/通用是三个并列熟期，桑蚕的桑园与养蚕是两条并行轨，
  // 把它们首尾相连算出的是假跨度（实测把 184 天的伸长期算成 121 天）。
  function chainSpan(cropKey, regionKey) {
    var all = stagesOf(cropKey, regionKey).filter(function (s) { return s.spanOk; });
    if (!all.length) return { max: 0, groups: 0, nodes: 0 };
    var g = {}, order = [];
    all.forEach(function (s) {
      var k = s.season + '||' + (s.track || '作物');
      if (!g[k]) { g[k] = []; order.push(k); }
      g[k].push(s);
    });
    var max = 0;
    order.forEach(function (k) {
      var arr = g[k];
      var a = axisOf(arr[0].span, agPivot(cropKey, regionKey));
      var b = axisOf(arr[arr.length - 1].span, agPivot(cropKey, regionKey));
      while (b.b < a.a) { b = { a: b.a + 366, b: b.b + 366, len: b.len }; }
      max = Math.max(max, b.b - a.a + 1);
    });
    return { max: max, groups: order.length, nodes: all.length };
  }

  /* ---------- 方案准出闸门（纯函数，可单测） ----------
     按**窗口实际覆盖的阶段**判定，不按 作物×灾种 一刀切。
     原因：同一作物同一灾种，不同阶段的阈值语义可能不同（棉花蕾期只给灌水线、
     花铃期给的是减产表述）。按作物一刀切会把可保的那部分一起砍掉，
     而花铃期恰恰是棉花受旱最敏感的时期。 */
  function gate(cropKey, regionKey, peril, m1, d1, m2, d2) {
    var all = perilStages(cropKey, regionKey, peril);
    if (!all.length) {
      // 四态之 D/B 的边界：**「我表里没有」≠「库内说不是威胁」**。
      // 直接下"该区无此灾种"是否定结论（假阴性），比缺数据更危险——
      // 用户会据此主动放弃一个库内其实认定存在的风险。故此处只陈述"未收录"，不下判断。
      return {
        block: true, code: 'NOT_COVERED',
        msg: '本平台物候库中未收录「' + perilName(peril) + '」在此作物/农业区的阶段条目。' +
          '注意：这**不等于**库内认定该灾种不是主要威胁——可能是"库内点名了但没有可定价阈值"，' +
          '也可能是"该区阶段表收录不全"。请核对 04 库原文后再决定，不得据此判定"无此风险"。'
      };
    }
    var pivot = agPivot(cropKey, regionKey);
    var win = axisOf({ m1: +m1, d1: +d1, m2: +m2, d2: +d2, crossYear: (+m2 < +m1) }, pivot);

    // 只取与窗口有交集的阶段
    var covered = all.filter(function (h) {
      if (!h.spanOk) return false;
      return axisOverlap(win, axisOf(h.span, pivot)) > 0;
    });
    if (!covered.length) {
      return {
        block: true, code: 'WINDOW_MISS',
        msg: '窗口与已收录的「' + perilName(peril) + '」敏感阶段没有交集，无法评估。请先按物候对齐窗口；' +
          '若确认该窗口才是真实风险期，则说明库内阶段收录不全，应标"待补"而非直接判定无风险。'
      };
    }

    var payable = covered.filter(function (h) { return (h.perils[peril] || {}).useAs !== 'serviceTrigger'; });
    if (!payable.length) {
      return {
        block: true, code: 'DEFENSE_TRIGGER',
        msg: '窗口覆盖的阶段，库内只给了管理动作线（如"即需灌溉/灌水"），没有给减产表述。' +
          '这不是缺数据，而是库内语义不支持赔付——灌溉区浇了水、没减产，指数却会赔。' +
          '请把窗口移到有减产表述的阶段，或把该阈值用于风险减量服务包。'
      };
    }

    // 有减产表述但拿不到数值阈值 → 可放行，但必须标定
    var numeric = payable.filter(function (h) { return (h.perils[peril] || {}).numeric; });
    if (!numeric.length) {
      var sc0 = score(cropKey, regionKey, peril, m1, d1, m2, d2);
      if (sc0.ok && sc0.total < 70) {
        return { block: true, code: 'LOW_MATCH', score: sc0.total, msg: '窗口与物候匹配度仅 ' + sc0.total + ' 分（< 70），须重设窗口。' + sc0.advice[0] };
      }
      return {
        block: false, code: 'NEED_CALIBRATION', score: sc0.ok ? sc0.total : null,
        // 中性表述：这类情形会占干旱方案的大多数（41 条），若用警告色会让人以为数据有问题。
        // 它描述的是一条常规工序，不是一个缺陷。
        notice: '该阶段库内为定性减产表述（如"缺水减产最重"），无固定阈值——指数阈值将按历史气象分位数标定，' +
          '并在材料中标明"设计假设"。这是纯指数产品的常规做法，不是数据缺陷。'
      };
    }

    var sc = score(cropKey, regionKey, peril, m1, d1, m2, d2);
    if (!sc.ok) return { block: true, code: 'NO_SCORE', msg: sc.reason };
    if (sc.total < 70) {
      return {
        block: true, code: 'LOW_MATCH', score: sc.total,
        msg: '窗口与物候匹配度仅 ' + sc.total + ' 分（< 70 分档，须重设窗口）。' + sc.advice[0] +
          '　即使回测费率看着合理，保的也不是作物最怕的那段天气。'
      };
    }
    if (sc.total < 85) {
      return { block: false, code: 'ADJUST', score: sc.total, warn: '窗口—物候匹配度 ' + sc.total + ' 分（建议微调）。' + sc.advice[0] };
    }
    return { block: false, code: 'PASS', score: sc.total };
  }

  /* ---------- 日历（供 UI 画阶段条） ---------- */
  function calendar(cropKey, regionKey, peril) {
    var st = stagesOf(cropKey, regionKey);
    return st.map(function (s) {
      return {
        season: s.season, name: s.name, from: s.from, to: s.to,
        start: fmtMD(s.span, 'start'), end: fmtMD(s.span, 'end'),
        span: s.span, days: s.days, ops: s.ops,
        perils: Object.keys(s.perils),
        sensitive: !!(peril && s.perils[peril]),
        hasPeril: !!(peril && s.perils[peril]),
        thr: peril && s.perils[peril] ? (s.perils[peril].thr || '') : '',
        // 阈值的三态信息：有数值 / 跨量纲 / 纯定性。界面必须分开说，
        // 否则"我们没提取到"会被读成"库里没有"，两者的处理方式完全不同。
        thrValue: peril && s.perils[peril] ? s.perils[peril].value : null,
        thrUnit: peril && s.perils[peril] ? (s.perils[peril].unit || '') : '',
        thrType: peril && s.perils[peril] ? (s.perils[peril].thrType || '') : '',
        thrSource: peril && s.perils[peril] ? (s.perils[peril].valueSource || '') : '',
        thrComposite: peril && s.perils[peril] ? !!s.perils[peril].composite : false,
        thrCompositeNote: peril && s.perils[peril] ? (s.perils[peril].compositeNote || '') : '',
        mech: peril && s.perils[peril] ? (s.perils[peril].mech || '') : '',
        note: s.note || ''
      };
    });
  }

  var PERIL_NAMES = { drought: '干旱/降水亏缺', frost: '低温霜冻', heat: '高温热害', rainy: '连阴雨渍涝', storm: '暴雨洪涝', wind: '大风倒伏' };
  function perilName(p) { return PERIL_NAMES[p] || p; }

  /* ---------- 温度阈值回填 ----------
     背景：04 库原文里很多条目写了明确温度（"灌浆期 30℃ 以上"、"吐丝期 >35℃"、
     "拔节后遇 -1℃ 以下"），但入库时只保留在 thr 文本里，value 字段是空的，
     界面于是显示"库内未给数值"——把"我们没提取"说成了"库里没有"，这是错的。
     此处按原文解析出数值并回填，标注 valueSource 以区分「库内直给」与「由原文解析」。
     · 只处理 thrType=temp（温度类），不碰 soil/积水等跨量纲条目
     · 复合条件（如"30℃以上 + 低湿 + 风"）也回填，但保留 composite 标记 */
  function backfillTempValues() {
    var filled = 0, composite = 0, skipped = 0;
    var RE = /([-−]?\d+(?:\.\d+)?)\s*℃/;
    Object.keys(CROPS).forEach(function (ck) {
      var c = CROPS[ck];
      Object.keys(c.regions || {}).forEach(function (rk) {
        (c.regions[rk].seasons || []).forEach(function (sea) {
          (sea.stages || []).forEach(function (st) {
            Object.keys(st.perils || {}).forEach(function (pk) {
              var pe = st.perils[pk];
              if (!pe || pe.value != null) return;
              if (pe.thrType !== 'temp') return;
              var txt = String(pe.thr || '');
              var m = txt.match(RE);
              if (!m) { skipped++; return; }
              var v = parseFloat(m[1].replace('−', '-'));
              if (isNaN(v)) { skipped++; return; }
              pe.value = v;
              pe.valueSource = 'parsed-from-thr';
              // 复合条件：温度只是其中一个因子，单独用会高估或低估
              if (/\+/.test(txt) || /低湿|风|干旱/.test(txt.replace(/^[^+]*30℃[^+]*/, ''))) {
                if (/\+\s*(低湿|风|干旱)|低湿\s*\+|风\s*\+/.test(txt)) {
                  pe.composite = true;
                  pe.compositeNote = '原文为复合致害条件（温度仅其中之一），单独作起赔点会失真';
                  composite++;
                }
              }
              filled++;
            });
          });
        });
      });
    });
    return { filled: filled, composite: composite, skipped: skipped };
  }

  // 合并新增作物（分批交付的定稿 JSON 用这个接入，不覆盖已有作物）
  function mergeCrops(obj, meta) {
    var cov = validateCrops(obj);
    var added = [], merged = [];
    Object.keys(obj).forEach(function (k) {
      if (CROPS[k]) {
        Object.keys(obj[k].regions).forEach(function (rk) { CROPS[k].regions[rk] = obj[k].regions[rk]; });
        merged.push(k);
      } else { CROPS[k] = obj[k]; added.push(k); }
    });
    if (!LOADED_COVERAGE) LOADED_COVERAGE = { crops: 0, regions: 0, skippedRegions: 0, stages: 0, perilEntries: 0, relativeStages: 0, monthOnlyStages: 0 };
    Object.keys(cov).forEach(function (k) { if (typeof cov[k] === 'number') LOADED_COVERAGE[k] = (LOADED_COVERAGE[k] || 0) + cov[k]; });
    LOADED_META = { mergedBatches: (LOADED_META && LOADED_META.mergedBatches || 0) + 1, lastMerge: meta || null };
    ensureBackfill();
    return { added: added, merged: merged, coverage: cov };
  }

  // 数据接入完成后回填一次温度阈值（setCrops 与 mergeCrops 都走这里）
  var _backfillStat = null;
  function ensureBackfill() {
    if (!_backfillStat) _backfillStat = backfillTempValues();
    return _backfillStat;
  }

  window.WIIPheno = {
    META: META, REGIONS: REGIONS, ZONE2REGION: ZONE2REGION,
    setCrops: setCrops, mergeCrops: mergeCrops, getCrops: function () { return CROPS; },
    SCHEMA_VERSION: SCHEMA_VERSION, loadedMeta: function () { return LOADED_META; },
    coverage: function () { return LOADED_COVERAGE; },
    regionsOf: regionsOf, stagesOf: stagesOf, perilStages: perilStages,
    suggest: suggest, score: score, gate: gate, calendar: calendar, chainSpan: chainSpan, ensureBackfill: ensureBackfill, backfillStat: function () { return _backfillStat; }, seasonLength: seasonLength, seasonSpanSum: seasonSpanSum, hasParallelStages: hasParallelStages,
    indexForm: indexForm, bufferFor: bufferFor, WEIGHTS: WEIGHTS, BUFFER: BUFFER, MIN_ACCUM: MIN_ACCUM,
    // 工具（测试与 UI 复用）
    parseNode: parseNode, stageSpan: stageSpan, spanLen: spanLen, overlapLen: overlapLen,
    shiftDays: shiftDays, fmtMD: fmtMD, perilName: perilName
  };
})();
