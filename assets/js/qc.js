/* ============================================================
   WII 质控 · 分位数映射校正 · 证据分级（QC / QM / Evidence）
   ------------------------------------------------------------
   设计依据（公开文献，2026-11-03 核对）：
   ① ERA5/ERA5-Land 日降水在中国区系统性高估。甘肃县级研究：ERA5-Land
      原始降水较站点参考高 50.9%；逐县逐月分位数映射后年均偏差由 +41.8%
      收敛至 −10.4%，年总量相关由 0.887 升至 0.936（Sustainability 2026, 18(18):9664）。
   ② 黄河流域 268 站评估：ERA5-Land 年降水 BIAS 达 1265.7mm/a、CC<0.2，
      属不可直接使用量级（Water 2024, 16(22):3183）。
   ③ 温度相反：ERA5-Land 县尺度日均温 r≈0.984、年均偏差 −0.25℃，可不校正直接使用。
   ④ 因此本模块只对"降水"做分位数映射，温度不做拉伸（避免把真实信号当偏差抹平）。
   ------------------------------------------------------------
   为什么不用单一系数：天气指数保险的赔款由尾部（起赔线以上）决定，
   标量校正对分位尾部几乎无效；只有分位数映射能同时校正均值与尾部形状。
   ============================================================ */
(function () {
  'use strict';

  var RANGE = {
    tmax: [-60, 55], tmin: [-60, 55],
    prcp: [0, 400], wind: [0, 130]
  };

  function isNum(v) { return v != null && !isNaN(v); }
  function nums(arr) { return arr.filter(isNum); }
  function asc(a, b) { return a - b; }

  /* ---------- 分位数（线性插值） ---------- */
  function quantile(sorted, q) {
    if (!sorted.length) return null;
    if (sorted.length === 1) return sorted[0];
    var pos = (sorted.length - 1) * q;
    var lo = Math.floor(pos), hi = Math.ceil(pos);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  /* ---------- 数据体检 ---------- */
  function profile(canon) {
    if (!canon || !canon.time) return null;
    var n = canon.time.length;
    var out = { n: n, vars: {}, dryRunMax: 0, span: { from: canon.time[0], to: canon.time[n - 1] } };
    ['tmax', 'tmin', 'prcp', 'wind'].forEach(function (k) {
      var arr = canon[k] || [];
      var miss = 0, lo = Infinity, hi = -Infinity, bad = 0, rg = RANGE[k];
      for (var i = 0; i < n; i++) {
        var v = arr[i];
        if (!isNum(v)) { miss++; continue; }
        if (v < lo) lo = v;
        if (v > hi) hi = v;
        if (rg && (v < rg[0] || v > rg[1])) bad++;
      }
      out.vars[k] = {
        missing: miss,
        missRate: n ? miss / n : 0,
        min: lo === Infinity ? null : lo,
        max: hi === -Infinity ? null : hi,
        outOfRange: bad
      };
    });
    // 最长连续无有效降水日（连阴雨/干旱类指数的隐含风险点）
    var run = 0;
    for (var i = 0; i < n; i++) {
      if (!isNum(canon.prcp[i]) || canon.prcp[i] < 1) { run++; if (run > out.dryRunMax) out.dryRunMax = run; }
      else run = 0;
    }
    return out;
  }

  /* ---------- 皮尔逊相关 ---------- */
  function pearson(x, y) {
    var n = Math.min(x.length, y.length), sx = 0, sy = 0, m = 0;
    var xs = [], ys = [];
    for (var i = 0; i < n; i++) {
      if (!isNum(x[i]) || !isNum(y[i])) continue;
      xs.push(x[i]); ys.push(y[i]);
    }
    m = xs.length;
    if (m < 3) return null;
    for (var j = 0; j < m; j++) { sx += xs[j]; sy += ys[j]; }
    var mx = sx / m, my = sy / m, sxx = 0, syy = 0, sxy = 0;
    for (var k = 0; k < m; k++) {
      var dx = xs[k] - mx, dy = ys[k] - my;
      sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
    }
    if (sxx === 0 || syy === 0) return null;
    return sxy / Math.sqrt(sxx * syy);
  }

  /* ---------- 月聚合（降水分级判据用月尺度，日尺度受格点位置差异干扰过大） ---------- */
  function monthlyAgg(canon, key, mode) {
    if (!canon || !canon.time) return null;
    var sum = {}, cnt = {}, order = [];
    for (var i = 0; i < canon.time.length; i++) {
      var mo = canon.time[i].slice(0, 7);
      if (!(mo in sum)) { sum[mo] = 0; cnt[mo] = 0; order.push(mo); }
      var v = canon[key] ? canon[key][i] : null;
      if (isNum(v)) { sum[mo] += v; cnt[mo]++; }
    }
    return {
      time: order,
      vals: order.map(function (m) { return cnt[m] ? (mode === 'mean' ? sum[m] / cnt[m] : sum[m]) : null; })
    };
  }

  /* ---------- 多源一致性 ----------
     mode: 'sum'（降水，用月累计）/ 'mean'（温度，用月均值）；不传则为日尺度配对 */
  function consistency(a, b, key, mode) {
    if (!a || !b) return null;
    var av = [], bv = [];
    if (mode) {
      var A = monthlyAgg(a, key, mode), B = monthlyAgg(b, key, mode);
      if (!A || !B) return null;
      var bidx = {};
      for (var t = 0; t < B.time.length; t++) bidx[B.time[t]] = t;
      for (var u = 0; u < A.time.length; u++) {
        var j = bidx[A.time[u]];
        if (j == null) continue;
        if (!isNum(A.vals[u]) || !isNum(B.vals[j])) continue;
        av.push(A.vals[u]); bv.push(B.vals[j]);
      }
    } else {
      var idx = {};
      for (var i = 0; i < b.time.length; i++) idx[b.time[i]] = i;
      for (var k = 0; k < a.time.length; k++) {
        var bi = idx[a.time[k]];
        if (bi == null) continue;
        var x = a[key] ? a[key][k] : null, y = b[key] ? b[key][bi] : null;
        if (!isNum(x) || !isNum(y)) continue;
        av.push(x); bv.push(y);
      }
    }
    var n = av.length;
    if (n < 3) return null;
    var r = pearson(av, bv);
    var sa = 0, sb = 0;
    for (var m = 0; m < n; m++) { sa += av[m]; sb += bv[m]; }
    var ma = sa / n, mb = sb / n;
    return {
      n: n, r: r, scale: mode || 'day',
      meanA: ma, meanB: mb,
      bias: mb !== 0 ? (ma - mb) / mb : null   // 相对参考源的相对偏差
    };
  }

  /* ---------- 经验分位数映射（transfer function） ---------- */
  // 把 src 的分布映射到 ref 的分布；对尾部同样生效，这是标量系数做不到的
  function transferFn(srcVals, refVals) {
    var s = nums(srcVals).sort(asc), r = nums(refVals).sort(asc);
    if (s.length < 30 || r.length < 30) return null;
    var N = 101, xs = [], ys = [];
    for (var i = 0; i < N; i++) {
      var q = i / (N - 1);
      xs.push(quantile(s, q));
      ys.push(quantile(r, q));
    }
    for (var k = 1; k < ys.length; k++) if (ys[k] < ys[k - 1]) ys[k] = ys[k - 1];  // 保单调
    return function (v) {
      if (!isNum(v)) return v;
      if (v <= xs[0]) return ys[0];
      if (v >= xs[xs.length - 1]) return ys[ys.length - 1];
      var lo = 0, hi = xs.length - 1;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (xs[mid] <= v) lo = mid; else hi = mid; }
      var span = xs[hi] - xs[lo];
      if (span <= 0) return ys[hi];
      var t = (v - xs[lo]) / span;
      return ys[lo] + (ys[hi] - ys[lo]) * t;
    };
  }

  /* ---------- 逐月拟合（降水专用） ---------- */
  function fitMonthly(src, ref) {
    if (!src || !ref) return null;
    var ridx = {};
    for (var i = 0; i < ref.time.length; i++) ridx[ref.time[i]] = i;
    var by = {};
    for (var j = 0; j < src.time.length; j++) {
      var d = src.time[j], ri = ridx[d];
      if (ri == null) continue;
      var m = d.slice(5, 7);
      if (!by[m]) by[m] = { s: [], r: [] };
      by[m].s.push(src.prcp[j]);
      by[m].r.push(ref.prcp[ri]);
    }
    var fns = {}, months = 0, sampleN = 0;
    for (var mm in by) {
      var f = transferFn(by[mm].s, by[mm].r);
      if (f) { fns[mm] = f; months++; sampleN += by[mm].s.length; }
    }
    if (!months) return null;
    return { monthly: fns, months: months, sampleN: sampleN };
  }

  /* ---------- 应用逐月映射（返回新对象，不改原序列） ---------- */
  function applyMonthly(canon, fit) {
    if (!canon || !fit) return canon;
    var out = {
      time: canon.time.slice(), tmax: canon.tmax.slice(), tmin: canon.tmin.slice(),
      wind: canon.wind.slice(), prcp: [], meta: canon.meta, __canon: true
    };
    var applied = 0, skipped = 0;
    for (var i = 0; i < canon.time.length; i++) {
      var m = canon.time[i].slice(5, 7);
      var f = fit.monthly[m];
      var v = canon.prcp[i];
      if (f) { out.prcp.push(f(v)); applied++; }
      else { out.prcp.push(v); skipped++; }
    }
    out.qm = { applied: applied, skipped: skipped, months: fit.months };
    return out;
  }

  /* ---------- 证据分级（团队使用的安全阀） ----------
     判据用「月尺度」相关：日尺度相关受格点位置与分辨率差异干扰过大，
     两套再分析产品的日降水相关常在 0.4~0.7，用日尺度卡会把 E2 永久卡死；
     文献对格点产品的可用性评价亦以年/季/月尺度为主。
     规则：E3 站点≥20年；E2 双源交叉(月降水 r≥0.80、月温度 r≥0.95)+QM+样本≥15年；其余 E1 */
  function grade(ev) {
    ev = ev || {};
    var st = ev.station || { loaded: false, years: 0 };
    var cons = ev.cons || {};
    var reasons = [], level, label, usage, cantdo;

    if (st.loaded && st.years >= 20) {
      level = 'E3';
      reasons.push('已导入站点实测序列 ' + st.years + ' 年（≥20 年门槛）');
    } else if (ev.qmApplied && cons.rP != null && cons.rP >= 0.80 &&
               (cons.rT == null || cons.rT >= 0.95) && (ev.nYears || 0) >= 15) {
      level = 'E2';
      reasons.push('双源交叉校验通过（月尺度）：月降水 r=' + cons.rP.toFixed(2) + '（≥0.80）'
        + (cons.rT != null ? '、月温度 r=' + cons.rT.toFixed(2) + '（≥0.95）' : ''));
      reasons.push('降水已做逐月分位数映射校正（' + (ev.qmMonths || 0) + ' 个月份生效）');
    } else {
      level = 'E1';
      if (!ev.qmApplied) reasons.push('未做分位数映射校正');
      if (cons.rP != null && cons.rP < 0.80) reasons.push('降水源间一致性不足（月 r=' + cons.rP.toFixed(2) + ' < 0.80）');
      if (cons.rT != null && cons.rT < 0.95) reasons.push('温度源间一致性不足（月 r=' + cons.rT.toFixed(2) + ' < 0.95）');
      if ((ev.nYears || 0) < 15) reasons.push('回测样本 ' + (ev.nYears || 0) + ' 年 < 15 年门槛');
      if (!st.loaded) reasons.push('未导入站点实测序列');
    }

    var MAP = {
      E1: {
        label: '试算级', color: '#C9822A',
        usage: '仅可用于内部研讨、方案比选与思路推演。',
        cantdo: '不得作为费率报备、遴选举证、对外披露或对客户承诺的依据。'
      },
      E2: {
        label: '参考级', color: '#2b6ca3',
        usage: '可用于立项测算、内部汇报与产品概念设计。',
        cantdo: '报备与遴选举证须以 E3 口径复核，不得直接引用为报备费率。'
      },
      E3: {
        label: '报送级', color: '#3DA35D',
        usage: '可作为报备与遴选举证的支撑口径。',
        cantdo: '仍须精算复核与监管批复；主体为阳光财险，勿与阳光农互混用。'
      }
    };
    var m = MAP[level];
    return {
      level: level, label: m.label, color: m.color, usage: m.usage, cantdo: m.cantdo,
      reasons: reasons
    };
  }

  /* ---------- 历史单产：模板与导入校验 ---------- */
  function yieldTemplate() {
    return [
      '年份,单产(公斤/亩),播种面积(亩),总产(吨),数据来源,备注',
      '2015,420,1200,504,县统计局,示例行（请替换为真实数据）',
      '2016,435,1180,513,县统计局,示例行（请替换为真实数据）',
      '2017,410,1210,496,县统计局,示例行（请替换为真实数据）'
    ].join('\n');
  }

  function parseYieldCSV(text) {
    var errors = [], warnings = [], rows = [];
    if (!text || !text.trim()) return { rows: [], errors: ['内容为空'], warnings: [] };
    var lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    var start = 0;
    if (/年份|year/i.test(lines[0])) start = 1;
    var seen = {};
    for (var i = start; i < lines.length; i++) {
      var cells = lines[i].split(/[,，\t]/).map(function (s) { return s.trim(); });
      if (!cells.length) continue;
      var y = parseInt(cells[0], 10);
      var v = parseFloat(cells[1]);
      var ln = i + 1;
      if (!(y >= 1980 && y <= 2100)) { errors.push('第 ' + ln + ' 行：年份「' + cells[0] + '」不合法'); continue; }
      if (isNaN(v) || v <= 0) { errors.push('第 ' + ln + ' 行：单产「' + cells[1] + '」不是有效正数'); continue; }
      if (v < 10 || v > 2000) warnings.push('第 ' + ln + ' 行：单产 ' + v + ' 公斤/亩 超出常见区间（10–2000），请核对单位');
      if (seen[y]) { errors.push('第 ' + ln + ' 行：年份 ' + y + ' 重复'); continue; }
      seen[y] = 1;
      rows.push({ year: y, yield: v, src: cells[4] || '', note: cells[5] || '' });
    }
    rows.sort(function (a, b) { return a.year - b.year; });
    if (rows.length && rows.length < 5) warnings.push('有效年份仅 ' + rows.length + ' 个，少于 5 年时 R² 不具统计意义');
    if (rows.length >= 2) {
      var gaps = [];
      for (var k = 1; k < rows.length; k++) {
        var d = rows[k].year - rows[k - 1].year;
        if (d > 1) for (var g = 1; g < d; g++) gaps.push(rows[k - 1].year + g);
      }
      if (gaps.length) warnings.push('年份不连续，缺 ' + gaps.length + ' 年：' + gaps.slice(0, 8).join('、') + (gaps.length > 8 ? '…' : ''));
    }
    return { rows: rows, errors: errors, warnings: warnings };
  }

  // 按回测年区间对齐（对齐不上返回 null，交由调用方提示）
  function alignYield(rows, y0, y1) {
    if (!rows || !rows.length) return null;
    var map = {};
    rows.forEach(function (r) { map[r.year] = r.yield; });
    var out = [], hit = 0;
    for (var y = y0; y <= y1; y++) {
      if (map[y] != null) { out.push(map[y]); hit++; }
      else out.push(null);
    }
    return { values: out, hit: hit, total: y1 - y0 + 1, complete: hit === (y1 - y0 + 1) };
  }

  window.WIIQC = {
    quantile: quantile, profile: profile, pearson: pearson,
    monthlyAgg: monthlyAgg, consistency: consistency,
    transferFn: transferFn, fitMonthly: fitMonthly, applyMonthly: applyMonthly,
    grade: grade, yieldTemplate: yieldTemplate, parseYieldCSV: parseYieldCSV, alignYield: alignYield,
    RANGE: RANGE
  };
})();
