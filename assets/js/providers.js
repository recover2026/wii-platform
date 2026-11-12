/* ============================================================
   WII 多源气象数据适配层（Providers）
   ------------------------------------------------------------
   平台不再绑定单一数据源。所有源统一输出 canonical schema：
     { time:[YYYY-MM-DD], tmax:[], tmin:[], prcp:[], wind:[] }
   源能力差异（2026-11-03 实测确认，非推测）：
     · ERA5（0.25°）：四要素齐全；中国区日降水系统性高估约 +40%~+50%
     · ERA5-Land（0.1°）：温度最优（县尺度 r≈0.98、年均偏差 −0.25℃）；
       日降水聚合恒返回 null，须走 hourly 自行日聚合；风速不提供 → 回退 ERA5
     · NASA POWER（0.5°）：PRECTOTCORR 经 GPCP 偏差校正，作降水分位锚
     · 站点导入（站点）：气象局/省气候中心观测，权威性最高、报备口径
   纪律：任何源均标注来源与分辨率；未做校正的结果一律为 E1，不得称"精算口径"。
   ============================================================ */
(function () {
  'use strict';

  var OPEN_METEO = 'https://archive-api.open-meteo.com/v1/archive';
  var POWER = 'https://power.larc.nasa.gov/api/temporal/daily/point';

  // 源能力登记表（元数据驱动 UI 与证据分级）
  var REGISTRY = {
    era5: {
      id: 'era5', name: 'ERA5 再分析（ECMWF）', res: '0.25°≈25km', base: 'E1',
      vars: '温度·降水·风速',
      note: '要素齐全的全球再分析，覆盖最稳。中国区日降水系统性高估约 +40%~+50%，强降水落点存在 40km 内偏移，直接用于指数定价会系统性抬高触发频率。'
    },
    era5land: {
      id: 'era5land', name: 'ERA5-Land', res: '0.1°≈11km', base: 'E1',
      vars: '温度（降水经小时聚合；风速回退 ERA5）',
      note: '温度为中国区表现最优的再分析（县尺度 r≈0.98、年均偏差约 −0.25℃），适合霜冻/高温类指数。降水与风速需借道 ERA5。'
    },
    power: {
      id: 'power', name: 'NASA POWER（MERRA-2 · GPCP 校正降水）', res: '0.5°≈55km', base: 'E2',
      vars: '温度·降水',
      note: '降水经 GPCP 观测偏差校正，系统偏差显著小于原始再分析，适合作为降水分位参考锚；空间分辨率较粗，不宜单独用于县域极端日值。'
    },
    station: {
      id: 'station', name: '站点实测（自行导入）', res: '站点', base: 'E3',
      vars: '温度·降水·风速',
      note: '气象局/省气候中心出具的逐日观测，权威性最高。须 ≥20 年连续序列方可支撑报备口径；导入后在本地运行，不上传外网。'
    }
  };

  function meta(source) {
    return REGISTRY[source] || REGISTRY.era5;
  }

  /* ---------- 通用请求 ---------- */
  async function getJSON(url, timeoutMs) {
    var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = null;
    if (ctl) timer = setTimeout(function () { ctl.abort(); }, timeoutMs || 25000);
    try {
      var r = await fetch(url, ctl ? { signal: ctl.signal } : undefined);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /* ---------- ERA5（0.25°，四要素） ---------- */
  async function fetchERA5(lat, lon, y) {
    var url = OPEN_METEO + '?latitude=' + lat + '&longitude=' + lon +
      '&start_date=' + y + '-01-01&end_date=' + y + '-12-31' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max' +
      '&models=era5&timezone=Asia%2FShanghai';
    var j = await getJSON(url);
    if (!j || !j.daily || !j.daily.time) throw new Error('ERA5 返回空数据');
    return {
      time: j.daily.time,
      tmax: j.daily.temperature_2m_max,
      tmin: j.daily.temperature_2m_min,
      prcp: j.daily.precipitation_sum,
      wind: j.daily.wind_speed_10m_max,
      meta: { source: 'era5', res: REGISTRY.era5.res, grid: [j.latitude, j.longitude], elevation: j.elevation }
    };
  }

  /* ---------- 小时级降水 → 日累计 ---------- */
  function aggregateHourly(hourly) {
    if (!hourly || !hourly.time) return null;
    var sum = {}, order = [];
    for (var i = 0; i < hourly.time.length; i++) {
      var d = hourly.time[i].slice(0, 10);
      if (!(d in sum)) { sum[d] = 0; order.push(d); }
      var v = hourly.precipitation ? hourly.precipitation[i] : null;
      if (v != null) sum[d] += v;
    }
    return order.map(function (d) { return sum[d]; });
  }

  /* ---------- ERA5-Land（0.1°，温度最优；降水走小时聚合；风速回退 ERA5） ---------- */
  async function fetchERA5Land(lat, lon, y) {
    var url = OPEN_METEO + '?latitude=' + lat + '&longitude=' + lon +
      '&start_date=' + y + '-01-01&end_date=' + y + '-12-31' +
      '&daily=temperature_2m_max,temperature_2m_min' +
      '&hourly=precipitation&models=era5_land&timezone=Asia%2FShanghai';
    var j = await getJSON(url);
    if (!j || !j.daily || !j.daily.time) throw new Error('ERA5-Land 返回空数据');
    var prcp = aggregateHourly(j.hourly);
    var wind = null, fallback = [];
    try {
      var e = await fetchERA5(lat, lon, y);
      wind = e.wind;
      fallback.push('风速取自 ERA5（0.25°）');
    } catch (err) {
      fallback.push('风速回退失败：' + err.message);
    }
    return {
      time: j.daily.time,
      tmax: j.daily.temperature_2m_max,
      tmin: j.daily.temperature_2m_min,
      prcp: prcp,
      wind: wind,
      meta: {
        source: 'era5land', res: REGISTRY.era5land.res, grid: [j.latitude, j.longitude],
        elevation: j.elevation, fallback: fallback,
        prcpNote: '降水由小时值日聚合（该接口日聚合字段为空）'
      }
    };
  }

  /* ---------- NASA POWER（0.5°，GPCP 校正降水） ---------- */
  async function fetchPOWER(lat, lon, y) {
    var url = POWER + '?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN,WS2M_MAX&community=AG' +
      '&longitude=' + lon + '&latitude=' + lat +
      '&start=' + y + '0101&end=' + y + '1231&format=JSON';
    var j = await getJSON(url, 40000);
    var P = j && j.properties && j.properties.parameter;
    if (!P) throw new Error('POWER 返回空数据');
    var anchor = P.PRECTOTCORR || P.T2M_MAX || {};
    var dates = Object.keys(anchor).sort();
    if (!dates.length) throw new Error('POWER 该年份无数据');
    function col(name) {
      var o = P[name] || {};
      return dates.map(function (d) {
        var v = o[d];
        return (v == null || v <= -900) ? null : v;   // POWER 缺测填充值 −999
      });
    }
    return {
      time: dates.map(function (d) { return d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6, 8); }),
      tmax: col('T2M_MAX'), tmin: col('T2M_MIN'), prcp: col('PRECTOTCORR'), wind: col('WS2M_MAX'),
      meta: { source: 'power', res: REGISTRY.power.res, nativeRes: '0.5°×0.625°', note: '降水经 GPCP 偏差校正' }
    };
  }

  /* ---------- 站点实测导入（本地内存，不上传） ---------- */
  var _station = null;   // { time:[], tmax:[], tmin:[], prcp:[], wind:[] }

  function setStation(canon) {
    _station = canon && canon.time && canon.time.length ? canon : null;
    return stationInfo();
  }
  function stationInfo() {
    if (!_station) return { loaded: false, years: 0, from: null, to: null, missing: {} };
    var ys = {};
    _station.time.forEach(function (d) { ys[d.slice(0, 4)] = 1; });
    var list = Object.keys(ys).sort();
    var total = _station.time.length, miss = 0;
    for (var i = 0; i < total; i++) if (_station.prcp[i] == null && _station.tmax[i] == null) miss++;
    return {
      loaded: true, years: list.length, from: list[0], to: list[list.length - 1],
      missing: { count: miss, rate: total ? miss / total : 0 }
    };
  }
  function sliceStation(y) {
    if (!_station) throw new Error('未导入站点数据');
    var time = [], tmax = [], tmin = [], prcp = [], wind = [];
    for (var i = 0; i < _station.time.length; i++) {
      if (+_station.time[i].slice(0, 4) === y) {
        time.push(_station.time[i]);
        tmax.push(_station.tmax[i] != null ? _station.tmax[i] : null);
        tmin.push(_station.tmin[i] != null ? _station.tmin[i] : null);
        prcp.push(_station.prcp[i] != null ? _station.prcp[i] : null);
        wind.push(_station.wind[i] != null ? _station.wind[i] : null);
      }
    }
    if (!time.length) throw new Error('站点数据缺 ' + y + ' 年');
    return {
      time: time, tmax: tmax, tmin: tmin, prcp: prcp, wind: wind,
      meta: { source: 'station', res: '站点实测', note: '用户导入，未上传外网' }
    };
  }

  /* ---------- 统一取数入口 ---------- */
  async function fetchYear(source, lat, lon, y) {
    var id = source || 'era5';
    if (id === 'openmeteo') id = 'era5';        // 兼容旧配置值
    if (id === 'station') return sliceStation(y);
    if (id === 'era5land') return fetchERA5Land(lat, lon, y);
    if (id === 'power') return fetchPOWER(lat, lon, y);
    return fetchERA5(lat, lon, y);
  }

  window.WIIProviders = {
    REGISTRY: REGISTRY, meta: meta, fetchYear: fetchYear,
    setStation: setStation, stationInfo: stationInfo,
    aggregateHourly: aggregateHourly,
    // 供测试与降级路径单独调用
    fetchERA5: fetchERA5, fetchERA5Land: fetchERA5Land, fetchPOWER: fetchPOWER
  };
})();
