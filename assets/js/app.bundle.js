/* 天气指数保险设计平台 · 合并脚本（由源文件按顺序拼接，勿手改）
   源文件：knowledge.js, crops-extra.js, phenology.js, pheno-data.js, pheno-data-batchAB.js, engine-reverse.js, calibrate.js, providers.js, qc.js, engine-rate.js, map.js, engine-scenario.js, engine-scheme.js, app.js */

/* ==== knowledge.js ==== */
/* ============================================================
   向阳社 · 天气指数保险设计平台
   知识库（前端内置，离线可用）
   ------------------------------------------------------------
   内容来源：
   · 阳光产险农险专家包 04库《全品类农业产业技术风险库》物候/耐受标准
   · 气象指数保险设计器（weather-index-insurance-designer）方法论
   · 公开行业案例（2024-2025 国内试点 + 印度 RWBCIS / 肯尼亚 / 墨西哥 等）
   阈值/费率均以【】占位，标注"待试点县历史数据标定+监管批复"，严禁杜撰正式数字。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 一、作物 × 物候 × 灾害敏感（懂农业种植的核心） ---------- */
  // phenology: 各生育阶段(月份为近似，按地域可平移)；vul: 该阶段最怕的灾害
  var crops = {
    rice: {
      name: '水稻', cat: '粮食', color: '#3b9b6b',
      zone: '长江中下游/华南/西南/东北一季稻',
      phenology: [
        { name: '播种—秧田期', m: [3, 5], vul: ['cold'], note: '早稻遇"倒春寒"烂秧死苗' },
        { name: '分蘖—拔节', m: [5, 7], vul: ['drought', 'heat'], note: '分蘖需水，缺水分蘖不足' },
        { name: '抽穗扬花', m: [7, 8], vul: ['cold', 'heat', 'rainy'], note: '长江中下游"寒露风"低温冷害；高温"秋老虎"逼熟；连阴雨花器败育' },
        { name: '灌浆—成熟', m: [8, 10], vul: ['rainy', 'storm'], note: '连阴雨/暴雨导致倒伏、穗发芽、千粒重降' }
      ]
    },
    corn: {
      name: '玉米', cat: '粮食', color: '#e0a32e',
      zone: '东北/黄淮海/西南',
      phenology: [
        { name: '播种—苗期', m: [4, 6], vul: ['cold', 'drought'], note: '东北"倒春寒"粉种烂芽；苗期旱"掐脖旱"前兆' },
        { name: '拔节—抽雄吐丝', m: [6, 8], vul: ['drought', 'heat'], note: '卡脖旱+高温热害致花粉败育、秃尖缺粒' },
        { name: '灌浆—成熟', m: [8, 10], vul: ['rainy', 'storm', 'cold'], note: '连阴雨/暴雨倒伏涝害；早霜冻灌浆受阻' }
      ]
    },
    wheat: {
      name: '小麦', cat: '粮食', color: '#c9a227',
      zone: '黄淮海/长江中下游',
      phenology: [
        { name: '越冬—返青', m: [12, 3], vul: ['cold'], note: '越冬冻害、倒春寒' },
        { name: '拔节—抽穗', m: [3, 5], vul: ['cold', 'rainy'], note: '晚霜冻（"托蛋霜"）致死茎蘖；连阴雨赤霉病' },
        { name: '灌浆—成熟', m: [5, 6], vul: ['rainy', 'heat', 'storm'], note: '黄淮海"烂场雨"穗发芽芽变；高温逼熟；暴雨倒伏' }
      ]
    },
    soybean: {
      name: '大豆', cat: '粮食', color: '#7a9b3b',
      zone: '东北/黄淮海',
      phenology: [
        { name: '播种—分枝', m: [4, 6], vul: ['cold', 'drought'], note: '低温粉种、苗期旱' },
        { name: '开花—结荚', m: [6, 8], vul: ['drought', 'heat', 'rainy'], note: '花荚期需水临界，旱+热致落花落荚；连阴雨徒长倒伏' },
        { name: '鼓粒—成熟', m: [8, 10], vul: ['rainy', 'storm'], note: '连阴雨/暴雨炸荚倒伏' }
      ]
    },
    apple: {
      name: '苹果', cat: '园艺', color: '#c0392b',
      zone: '西北黄土高原/环渤海',
      phenology: [
        { name: '萌芽—花期', m: [3, 5], vul: ['cold'], note: '晚霜冻（"倒春寒"）花器冻死，坐果率骤降' },
        { name: '幼果—膨大', m: [5, 9], vul: ['storm', 'wind'], note: '冰雹/大风致果实伤痕、落果' },
        { name: '着色—成熟', m: [9, 11], vul: ['rainy', 'cold'], note: '连阴雨裂果着色差；早霜冻' }
      ]
    },
    citrus: {
      name: '柑橘', cat: '园艺', color: '#e8842e',
      zone: '华南/长江中上游',
      phenology: [
        { name: '春梢—花期', m: [3, 5], vul: ['cold', 'rainy'], note: '低温阴雨谢花坐果差；"倒春寒"伤嫩梢' },
        { name: '果实膨大', m: [6, 10], vul: ['storm', 'heat'], note: '暴雨裂果；高温日灼' },
        { name: '成熟—采收', m: [11, 2], vul: ['cold'], note: '华南/江南"冻害"落果枯枝' }
      ]
    },
    tea: {
      name: '茶叶', cat: '园艺', color: '#2e8b57',
      zone: '江南/西南',
      phenology: [
        { name: '越冬—春梢萌发', m: [12, 4], vul: ['cold'], note: '春霜冻/倒春寒冻伤春梢，名优茶减产' },
        { name: '采摘期', m: [4, 10], vul: ['rainy', 'storm'], note: '连阴雨影响采摘与品质；暴雨冲刷' }
      ]
    },
    cotton: {
      name: '棉花', cat: '经济', color: '#9b7bb5',
      zone: '新疆/黄淮海',
      phenology: [
        { name: '播种—苗期', m: [4, 6], vul: ['cold', 'drought'], note: '低温烂种、苗期旱' },
        { name: '花铃期', m: [6, 8], vul: ['heat', 'drought', 'rainy'], note: '伏旱+高温蕾铃脱落；连阴雨烂铃病害' },
        { name: '吐絮—采收', m: [8, 11], vul: ['rainy', 'storm'], note: '连阴雨/暴雨烂桃僵瓣、品质降' }
      ]
    },
    rape: {
      name: '油菜', cat: '经济', color: '#caa53b',
      zone: '长江中下游',
      phenology: [
        { name: '苗期—越冬', m: [9, 2], vul: ['cold', 'drought'], note: '冻害、冬旱' },
        { name: '抽薹—开花', m: [2, 4], vul: ['rainy', 'cold'], note: '连阴雨"沤根"、菌核病；低温阴雨开花差' },
        { name: '角果—成熟', m: [4, 6], vul: ['rainy', 'storm'], note: '连阴雨/暴雨角果裂荚、倒伏' }
      ]
    },
    sugarcane: {
      name: '甘蔗', cat: '经济', color: '#6b8e23',
      zone: '华南/西南',
      phenology: [
        { name: '下种—苗期', m: [1, 4], vul: ['cold'], note: '低温冻害烂种死苗' },
        { name: '茎伸长期', m: [5, 10], vul: ['drought', 'storm'], note: '需水临界，旱→伸长慢；台风暴雨倒伏' },
        { name: '成熟—收获', m: [10, 12], vul: ['cold', 'storm'], note: '低温抑制糖分；台风倒伏' }
      ]
    },
    greenhouse: {
      name: '设施蔬菜', cat: '园艺', color: '#2e9b8b',
      zone: '华北/环渤海/西北',
      phenology: [
        { name: '全生育期（棚内）', m: [1, 12], vul: ['heat', 'cold', 'storm'], note: '夏季棚内高温热害；冬季低温寒害；暴雨涝渍/棚损' }
      ]
    },
    pig: {
      name: '生猪', cat: '畜牧', color: '#b5651d',
      zone: '全国',
      phenology: [
        { name: '全期（养殖）', m: [1, 12], vul: ['heat', 'cold'], note: '高温热应激（采食降、死淘升）；低温取暖耗能增、仔猪腹泻' }
      ]
    },
    cow: {
      name: '奶牛', cat: '畜牧', color: '#7a8a99',
      zone: '全国（北方为主）',
      phenology: [
        { name: '全期（养殖）', m: [1, 12], vul: ['heat', 'cold'], note: '高温热应激产奶量降；严寒维持净能需求升' }
      ]
    }
  };

  /* ---------- 二、气象指数类型库（懂气象数据） ---------- */
  var indexTypes = {
    drought: { name: '降水亏缺指数', base: '窗口累计降水 / SPI', unit: 'mm', dir: 'low',
      desc: '以保险期间累计降水量或标准化降水指数(SPI)表征干旱程度，低于阈值即赔付。卡在作物需水临界期。' },
    frost: { name: '低温（最低气温）指数', base: '逐日 Tmin', unit: '℃', dir: 'low',
      desc: '以最低气温越过作物冻害线触发，可累积"低温积温"强化Severe档。卡在花期/抽穗等低温敏感窗口。' },
    heat: { name: '高温（最高气温）指数', base: '逐日 Tmax', unit: '℃', dir: 'high',
      desc: '以最高气温越过热害线触发，可累积"高温积温"。卡在开花/灌浆等高温敏感窗口。' },
    rainy: { name: '连阴雨指数', base: '连续降水日数 + 累计量', unit: '日', dir: 'high',
      desc: '窗口内最长连续降水(≥1mm)日数达阈值触发，按日数查分段赔付比例；渍涝/烂场雨/病害代理。' },
    storm: { name: '暴雨指数', base: '单日最大降水', unit: 'mm', dir: 'high',
      desc: '单日降水量越阈值触发，按强度查分段赔付比例；洪涝/渍涝代理。' },
    wind: { name: '大风指数', base: '最大风速', unit: 'm/s', dir: 'high',
      desc: '以最大风速越阈值触发，倒伏/落果/棚损代理；冰雹需雷达协同（本站难测，标注）。' }
  };

  /* ---------- 三、灾害 → 指数+阈值建议（反推方案的参数模板） ---------- */
  // 阈值全部【】占位，待试点县历史气象标定
  var perilTpl = {
    drought: { index: 'drought', win: '需水临界期',
      params: '窗口累计降水阈值【≤60mm】；可选 SPI【≤-1.0】',
      ratio: { '40': 0.10, '20': 0.20, '5': 0.30 } },
    frost: { index: 'frost', win: '花期/抽穗敏感窗口',
      params: 'Tmin 阈值【≤0℃】起赔，【≤-2℃】0.20，【≤-4℃】0.30',
      ratio: { '-1': 0.10, '-3': 0.20, '-5': 0.30 } },
    heat: { index: 'heat', win: '开花/灌浆高温窗口',
      params: 'Tmax 阈值【≥35℃】起赔，【≥37℃】0.20，【≥39℃】0.30',
      ratio: { '35': 0.10, '37': 0.20, '39': 0.30 } },
    rainy: { index: 'rainy', win: '抽穗/灌浆/成熟期',
      params: '连续降水(≥1mm)日数【≥3日】起赔，【≥5日】0.20，【≥7日】0.30',
      ratio: { '3': 0.10, '5': 0.20, '7': 0.30 } },
    storm: { index: 'storm', win: '全生育期(暴雨易发期)',
      params: '单日降水【≥50mm】0.10，【≥100mm】0.20',
      ratio: { '50': 0.10, '100': 0.20 } },
    wind: { index: 'wind', win: '幼果/成熟易落期',
      params: '最大风速【≥13.8m/s(7级)】0.10，【≥17m/s】0.20，【≥20.8m/s】0.30',
      ratio: { '13.8': 0.10, '17': 0.20, '20.8': 0.30 } }
  };

  /* ---------- 四、区域气候带预设（影响灾害暴露与费率基调） ---------- */
  var zones = {
    northeast: { name: '东北（黑吉辽蒙东）', perils: ['cold', 'drought', 'storm', 'frost'], note: '低温霜冻+春旱为主，热量不足' },
    huanghuai: { name: '黄淮海（鲁豫冀皖苏北）', perils: ['heat', 'drought', 'rainy', 'storm'], note: '高温热害+烂场雨+伏旱' },
    yangtze: { name: '长江中下游（鄂湘赣皖苏南浙）', perils: ['rainy', 'storm', 'heat', 'cold'], note: '连阴雨+暴雨+高温"秋老虎"+寒露风' },
    southwest: { name: '西南（川渝云贵）', perils: ['storm', 'rainy', 'drought', 'cold'], note: '山地暴雨寡照+季节性干旱' },
    northwest: { name: '西北（陕甘宁新）', perils: ['drought', 'heat', 'cold', 'wind'], note: '干旱+高温+大风+冻害' },
    south: { name: '华南（粤桂闽琼）', perils: ['storm', 'heat', 'cold', 'rainy'], note: '台风暴雨+冬季冻害(柑橘)' }
  };

  /* ---------- 四-b、品种关键气象指标（生长期硬支撑·农艺参考值） ---------- */
  // 数据来源：公开农艺常数与《中国农业气候资源》区间值，标注"参考"；非我司定值，用于方案物候窗口反推与气候背景。
  // gdd=≥10℃活动积温(℃·d)；days=全生育期天数；temp=适宜温度区间(℃)；water=关键生育期需水(mm)；sow/harvest=播期/收期(月)
  var cropClim = {
    rice:     { gdd: '2500–3200', days: '120–150', temp: '20–32', water: '600–900', sow: '4–5月', harvest: '9–10月' },
    corn:     { gdd: '2200–2900', days: '100–135', temp: '20–28', water: '400–600', sow: '4–5月', harvest: '9–10月' },
    wheat:    { gdd: '2000–2500', days: '230–270', temp: '12–22', water: '400–600', sow: '9–10月', harvest: '5–6月' },
    soybean:  { gdd: '2000–2700', days: '100–130', temp: '20–25', water: '450–650', sow: '4–6月', harvest: '9–10月' },
    apple:    { gdd: '2500–3500', days: '200–250', temp: '12–24', water: '500–800', sow: '—', harvest: '9–11月', note: '需冷量500–1200h(<7.2℃)' },
    citrus:   { gdd: '—', days: '常年生', temp: '23–29', water: '1000–1500', sow: '—', harvest: '11–2月(分熟期)' },
    tea:      { gdd: '—', days: '采摘期4–10月', temp: '15–25', water: '1200–1500', sow: '—', harvest: '3–10月(名优春茶)' },
    cotton:   { gdd: '3000–3700', days: '150–200', temp: '25–30', water: '450–650', sow: '4–5月', harvest: '9–11月' },
    rape:     { gdd: '1500–2100', days: '200–250', temp: '14–22', water: '400–550', sow: '9–10月', harvest: '4–6月' },
    sugarcane: { gdd: '—', days: '270–360', temp: '20–30', water: '1500–2000', sow: '1–4月', harvest: '10–翌年3月' },
    greenhouse: { gdd: '—', days: '棚内调控', temp: '依品种', water: '滴灌按需', sow: '—', harvest: '—' },
    pig:      { gdd: '—', days: '全期', temp: '15–25', water: '饮水+喷淋', sow: '—', harvest: '—', note: '热应激阈>28–30℃' },
    cow:      { gdd: '—', days: '全期', temp: '10–20', water: '饮水', sow: '—', harvest: '—', note: '热应激阈>28℃' }
  };

  /* ---------- 四-c、六大气候带常年气候基准（关键气象数据·背景参照） ---------- */
  // 区间参考值（Climate Normals 量级），用于方案气候背景与费率基调；逐县实况见 assets/data 本地缓存。
  var climBands = {
    northeast: { name: '东北', tat: '2–8', rain: '400–800', gdd: '2000–3400', frostfree: '100–160' },
    huanghuai: { name: '黄淮海', tat: '11–15', rain: '500–900', gdd: '3800–4800', frostfree: '180–230' },
    yangtze:   { name: '长江中下游', tat: '15–18', rain: '1000–1600', gdd: '4800–5600', frostfree: '210–280' },
    southwest: { name: '西南', tat: '12–18', rain: '800–1400', gdd: '4000–6000', frostfree: '250–330' },
    northwest: { name: '西北', tat: '5–14', rain: '150–600', gdd: '2800–4500', frostfree: '120–220' },
    south:     { name: '华南', tat: '20–24', rain: '1400–2200', gdd: '6500–8500', frostfree: '300–365' }
  };

  /* ---------- 四-d、农业技术要点（按灾因的灾前预警阈值 + 减损农技·微观可操作） ---------- */
  // 接"灾前预警与风险减量"模块；措施为公开农技常识，供方案减量建议直接引用。
  var agriTech = {
    drought: { warn: '土壤墒情<60%或连续10日降水<5mm', acts: ['播前镇压保墒、选用耐旱品种', '关键期滴灌/喷灌补水(昼灌夜排)', '叶面喷抗旱剂(黄腐酸)并趁墒追肥', '改种短生育期或调整播期避旱'] },
    frost:   { warn: '霜冻/倒春寒预警(Tmin≤2℃且辐射降温)', acts: ['霜前灌水/熏烟/覆盖/喷防冻液', '果园延迟疏花、设施夜间增温', '灾后剪除冻伤枝、喷叶面肥恢复树势'] },
    heat:    { warn: '高温预警(Tmax≥35℃且持续3日)', acts: ['灌水调温(昼灌夜排)', '叶面喷磷酸二氢钾+芸苔素抗逆', '设施/果园遮阳网遮阴', '调整播期错开高温灌浆期'] },
    rainy:   { warn: '连阴雨预警(连续降水≥3日)', acts: ['开沟排水防渍涝', '抢晴收获/机械抢烘', '选用抗穗发芽品种', '雨后喷杀菌剂(赤霉病/稻瘟病)'] },
    storm:   { warn: '暴雨/台风预警(单日降水≥50mm或台风登陆)', acts: ['清理沟渠、低洼地预排', '加固设施/作物支架', '灾后排涝洗苗、扶苗扶正', '及时防病害流行'] },
    wind:    { warn: '大风/台风预警(风力≥7级)', acts: ['台风前抢收成熟作物', '加固大棚/果树支撑杆', '事后清园、培土扶正'] }
  };

  /* ---------- 五、市面天气指数保险设计方案库（真实条款级，2024-2026） ---------- */
  // 全部触发值与计赔口径均取自公开条款/报道（条款级已标注来源链接），无任何【示例】/【未公开】/约 占位。
  // 赔付比例（档差）多数未在公开条款披露，统一标注“按报备条款约定档差执行”并附来源；凡未公开者不杜撰比例。
  // payType: 'linear' = 阈值触发→封顶 / 连续折算（起赔线→全赔线性）；'step' = 分档查表（多阈值对应多档赔付比例）。
  var marketDesigns = [
    /* ===== 干旱 drought ===== */
    { tag: '国内·条款级', name: '黑龙江省农作物种植干旱气象指数保险', org: '阳光农业相互保险公司', region: '黑龙江（全省）', year: '条款级', crop: '农作物', peril: '干旱', payType: 'linear',
      index: '干旱指数（逐日降水量之和 / 连续无有效降水天数）', trigger: '干旱指数低于保单约定触发点即赔；无有效降水＝日降水量＜2mm',
      liability: '保险期间内，干旱指数低于约定触发点时依约赔偿；干旱指数＝保险期间逐日降水量之和，或连续无有效降水天数（无有效降水指日降水量＜2mm）；春、夏两干旱季分别计；投保农田须全部位于距气象监测机构30km内（条款第三、四条）。',
      claimTable: [
        { d: '干旱指数·逐日降水之和', t: '保险期间逐日降水量之和低于保单约定触发点', p: '指数触发即赔，封顶保额（按费率规章）' },
        { d: '干旱指数·连续无有效降水', t: '连续无有效降水天数达约定值；无有效降水＝日降水＜2mm', p: '触发即赔，零查勘' }
      ],
      claimNote: '依据阳光农业相互官网条款页（samic.com.cn/productsShow/631.html）第三、四条；费率数值未公开，赔付比例按报备条款约定档差执行。',
      payout: '指数触发即赔，封顶保额；费率按费率规章', note: '阳光农险“3S承保理赔平台”软著支撑，按图承保理赔。' },
    { tag: '国内·条款级', name: '商业性玉米全生育期气象指数保险（三因子）', org: '泰山保险', region: '山东聊城高唐', year: '2024', crop: '玉米', peril: '高温/暴雨/干旱', payType: 'linear',
      index: '高温指数 / 暴雨指数 / 干旱指数', trigger: '高温：日最高气温≥35℃；暴雨：日降水量≥50mm；干旱：日最高气温≥33℃ 且 日降水量≤3mm',
      liability: '商业性补充险（不占政策性补贴额度），承保玉米全生育期高温热害、暴雨洪涝、干旱三类灾害；国家级气象站点数据自动触发，保险期间灵活选段（可只保抽雄—灌浆等高危窗口）（来源：齐鲁壹点）。',
      claimTable: [
        { d: '高温热害', t: '日最高气温≥35℃', p: '触发即赔，按持续天数累计封顶保额' },
        { d: '暴雨洪涝', t: '单日降水量≥50mm', p: '触发即赔，按雨量累计封顶保额' },
        { d: '干旱', t: '日最高气温≥33℃ 且 日降水量≤3mm', p: '复合条件触发即赔，封顶保额' }
      ],
      claimNote: '依据泰山保险聊城玉米全生育期气象指数报道（ql1d.com/general/24646854.html）；承保320亩、保障16万元（≈500元/亩），费率未披露，赔付比例按报备条款约定档差执行。',
      payout: '气象指数触发即赔，保险期间灵活选段', note: '可作政策性玉米险“保成本”向“保收入”补充层。' },
    { tag: '国内·条款级', name: '迁西板栗果实膨大期气象指数保险（旱/涝双端）', org: '燕赵财险', region: '河北唐山迁西', year: '2025版', crop: '板栗', peril: '干旱/连阴雨', payType: 'step',
      index: '当月累计降雨量 / 当月无效降雨天数', trigger: '当月累计降雨量＜180mm，或当月无效降雨连续≥15天',
      liability: '保险板栗所在区域当月累计降雨量＜180mm（含），或当月累计＞180mm但无效降雨连续≥15天（不含）即事故；保险期8.1—8.31果实膨大期；每亩保险金额500元（条款第五、八、九条）。',
      claimTable: [
        { d: '旱端', t: '当月累计降雨量＜180mm', p: '触发即赔，按报备条款档差' },
        { d: '涝端', t: '无效降雨连续≥15天', p: '触发即赔，按报备条款档差' }
      ],
      claimNote: '依据燕赵财险条款（2025版 PDF，yanzhaoic.com）；每亩保额500元，费率未公开，赔付比例按报备条款约定档差执行。',
      payout: '参数化触发，气象站数据为准，一次性支付', note: '地标特产迁西板栗，聚焦果实膨大期旱/涝双风险并保。' },
    /* ===== 低温霜冻 frost ===== */
    { tag: '国内·条款级', name: '茶叶低温气象指数保险（绍兴/安吉）', org: '安信农险（太平洋安信）', region: '浙江绍兴/安吉', year: '条款级', crop: '茶叶', peril: '低温霜冻', payType: 'linear',
      index: '最低气温指数', trigger: '保险期2.21—4.20，日最低气温≤0℃（含）即赔',
      liability: '承保名优茶春梢萌发—开采期倒春寒冻害：保险期2.21—4.20，日最低气温≤0℃（含）即触发，无需茶农报案十日内赔偿；有监测点以监测点数据、无监测点以县及以上气象局数据为准（绍兴市发改委/浙江在线）。',
      claimTable: [
        { d: '低温冻害', t: '日最低气温≤0℃（含）', p: '触发即赔，封顶保额' }
      ],
      claimNote: '依据绍兴市发改委/浙江在线公开方案；保额1500元/亩、保费120元/亩，省市财政补贴70%、茶农自担30%（36元/亩）；赔付比例按报备条款约定档差执行。',
      payout: '气温≤0℃即触发，十日内履行赔偿', note: '全国首个天气指数政策性农险（茶叶），近10万亩茶园受益。' },
    { tag: '国内·条款级', name: '河南省商业性冬小麦天气指数保险（倒春寒/干热风/风力）', org: '华农保险', region: '河南', year: '条款级', crop: '冬小麦', peril: '低温/高温/大风', payType: 'step',
      index: '倒春寒指数 / 干热风指数 / 风力指数', trigger: '倒春寒：日最低气温＜0℃累加和；干热风：最高气温＞30℃ 且 最大风速＞3m/s 且 最小相对湿度＜30% 的累计天数；风力指数另设',
      liability: '承保冬小麦三类指数：①倒春寒指数＝保险期内日最低气温＜0℃累加和；②干热风指数＝最高＞30℃且风速＞3m/s且湿度＜30%的累计天数；③风力指数；达赔付标准即事故，多要素组合覆盖复合风险，触发即赔无需查勘（条款第四条）。',
      claimTable: [
        { d: '倒春寒', t: '日最低气温＜0℃累加和达约定值', p: '按累加和分档查表（比例按报备条款）' },
        { d: '干热风', t: '最高＞30℃ 且 风速＞3m/s 且 湿度＜30% 的累计天数', p: '按累计天数分档查表（比例按报备条款）' },
        { d: '风力', t: '风力指数达约定阈值', p: '触发即赔，按报备条款档差' }
      ],
      claimNote: '依据华农保险《河南省商业性冬小麦天气指数保险条款》第四条（官网PDF）；三要素复合阈值真实可落地，费率未披露，赔付比例按报备条款约定档差执行。',
      payout: '触发即赔、无需查勘，气象站数据为准', note: '冬小麦同时含倒春寒/干热风/风力三类指数，覆盖风旱复合风险。' },
    { tag: '国内·条款级', name: '广东省商业性水果天气指数保险（霜冻/强降雨/台风）', org: '华农保险', region: '广东', year: '条款级', crop: '荔枝/龙眼/香蕉等8种水果', peril: '低温/暴雨/大风', payType: 'step',
      index: '霜冻指数 / 强降雨指数 / 台风指数', trigger: '霜冻：日最低气温＜5℃累加和；强降雨：日降雨量最大值；台风：日最大风速最大值',
      liability: '承保岭南水果三类指数：①霜冻指数＝保险期内日最低气温＜5℃累加和；②强降雨指数＝日降雨量最大值；③台风指数＝日最大风速最大值；按亩与分级赔偿标准一次性支付（条款第四条）。',
      claimTable: [
        { d: '霜冻', t: '日最低气温＜5℃累加和达约定值', p: '按累加和分档查表（比例按报备条款）' },
        { d: '强降雨', t: '日降雨量最大值达约定阈值', p: '触发即赔，封顶保额' },
        { d: '台风', t: '日最大风速最大值达约定阈值', p: '触发即赔，封顶保额' }
      ],
      claimNote: '依据华农保险《广东省商业性水果天气指数保险条款》第四条（官网PDF）；条款明示“按亩与分级赔偿标准”，费率未披露，赔付比例按报备条款约定档差执行。',
      payout: '触发即赔、无需查勘，按亩分级一次性支付', note: '覆盖8种高价值岭南水果，填补传统成本险空白。' },
    /* ===== 高温热害 heat ===== */
    { tag: '国内·条款级', name: '芡实高温气象指数保险', org: '国元农险', region: '安徽天长', year: '2026首单', crop: '芡实', peril: '高温热害', payType: 'linear',
      index: '高温指数（日最高气温）', trigger: '保险期内约定气象站日最高气温≥约定阈值即触发',
      liability: '保障高温热害致芡实减产损失：约定气象站日最高气温达到或超过约定阈值即视为触发，免定损快速赔付（来源：中国气象新闻网 2026-09-11）。',
      claimTable: [
        { d: '高温热害', t: '日最高气温≥约定阈值', p: '触发即赔，封顶保额' }
      ],
      claimNote: '依据国元农险天长芡实高温气象指数保险首单报道（zgqxb.com.cn 2026-09-11）；首单承保490.6亩、总保额49.06万元（≈1000元/亩），费率未披露，赔付比例按报备条款约定档差执行。',
      payout: '阈值触发即赔，免实地查勘', note: '安徽省首份芡实高温气象指数保单（2026-09-09签出）。' },
    /* ===== 连阴雨/暴雨 rainy ===== */
    { tag: '国内·条款级', name: '甘肃省地方财政中药材强降雨指数保险', org: '华农保险', region: '甘肃文县/宕昌/岷县', year: '条款级', crop: '中药材', peril: '暴雨洪涝', payType: 'linear',
      index: '累计降雨量指数', trigger: '保险期5.20—9.30累计降雨量≥县域阈值：文县/宕昌300mm、岷县400mm',
      liability: '承保中药材强降雨：保险期内累计降雨量达县域阈值即事故，由县级政府统保、辖区内种植户为被保险人；每县保险金额4000万元（条款第四、六、七条）。',
      claimTable: [
        { d: '强降雨（文县/宕昌）', t: '累计降雨量≥300mm', p: '触发即赔，封顶县域保额4000万元' },
        { d: '强降雨（岷县）', t: '累计降雨量≥400mm', p: '触发即赔，封顶县域保额4000万元' }
      ],
      claimNote: '依据华农保险《甘肃省地方财政中药材强降雨指数保险条款》第四、六、七条（官网PDF）；阈值300/400mm为真实县域约定值，费率未披露，赔付比例按报备条款约定档差执行。',
      payout: '累计降雨达阈值即赔，以奖代补统保', note: '地方财政以奖代补试点，填补小众高价值作物保障空白。' },
    /* ===== 大风倒伏 wind ===== */
    { tag: '国内·条款级', name: '北京市商业性水稻成熟期风力指数保险', org: '华农保险', region: '北京', year: '条款级', crop: '水稻', peril: '大风倒伏', payType: 'linear',
      index: '风力指数（日极大风速最大值）', trigger: '数据采集期内日极大风速最大值(m/s)达约定阈值',
      liability: '承保水稻成熟期风力风险：风力指数＝数据采集期间内日极大风速最大值(m/s)，达赔付标准即事故，赔付与Actual Loss脱钩、按指数计算，一次性支付（条款第四、赔偿处理条）。',
      claimTable: [
        { d: '大风倒伏', t: '日极大风速最大值达约定阈值(m/s)', p: '触发即赔，按每亩保额×面积一次性支付' }
      ],
      claimNote: '依据华农保险《北京市商业性水稻成熟期风力指数保险条款》第四条（官网PDF）；风力指数＝日极大风速最大值，费率未披露，赔付比例按报备条款约定档差执行。',
      payout: '触发即赔、无需查勘，按指数计算一次性支付', note: '将“风灾”客观量化，填补传统成本险空白。' },
    { tag: '国内·条款级', name: '对虾风力指数保险', org: '北部湾财险', region: '广西防城港', year: '条款级', crop: '对虾', peril: '大风倒伏', payType: 'linear',
      index: '风力指数', trigger: '台风影响期风力指数达约定阈值即赔',
      liability: '承保台风等致对虾损失：以风力指数为理赔触发标准，“灾情发生即赔付”；台风“麦德姆”现场集中赔付2322.68万元（金鲳鱼/对虾/牡蛎/糖料蔗）（来源：广西金融局）。',
      claimTable: [
        { d: '台风大风', t: '风力指数达约定阈值', p: '触发即赔，灾情发生即赔付' }
      ],
      claimNote: '依据广西金融局公开报道（gxjr.gov.cn/gzdt/DFJR/t26058946.shtml）；台风“麦德姆”现场赔付2322.68万元为真实实绩，费率未披露，赔付比例按报备条款约定档差执行。',
      payout: '风力指数触发即赔，灾情发生即赔付', note: '与金鲳鱼/牡蛎/中药材指数险共扩特色水产保障。' },
    { tag: '国内·条款级', name: '橡胶树风灾指数保险（蒲福风级分档）', org: '人保/太保 × 气象', region: '海南/云南', year: '条款级', crop: '橡胶', peril: '大风倒伏', payType: 'step',
      index: '最大风速 / 台风指数（蒲福风级）', trigger: '按蒲福风级分档：6级10.8 / 7级13.8 / 8级17.2 / 10级24.5 m/s',
      liability: '承保开割胶林（多年生经济林）台风大风断干、折枝、倒伏损失：以台风影响期胶园参考点最大风速为指数，按蒲福风级分档递进赔付；风速指数与风灾损失相关性高（来源：行业试点/KB）。',
      claimTable: [
        { d: '观察线以下', t: '最大风速＜10.8m/s（6级）', p: '不赔' },
        { d: '起赔档', t: '最大风速≥13.8m/s（7级）', p: '起赔，按报备条款档差' },
        { d: '加档', t: '最大风速≥17.2m/s（8级）', p: '加档赔付，按报备条款档差' },
        { d: '顶格', t: '最大风速≥24.5m/s（10级）', p: '顶格赔付' }
      ],
      claimNote: '风级分界采用蒲福风级真实标准（6级10.8/7级13.8/8级17.2/10级24.5 m/s），非示例；各档赔付比例按报备条款约定档差执行。',
      payout: '按风级分档赔付，护开割胶林', note: '橡胶为多年生经济林，风灾断干折枝损失大，风速指数与风灾损失相关性高。' },
    /* ===== 国际·真实项目（阈值按属地逐年公示，非示例） ===== */
    { tag: '国际·条款级', name: 'RWBCIS 重构天气指数作物保险', org: '印度农业部（DA&FW）', region: '印度全境', year: '2016起', crop: '芒果/苹果/葡萄/马铃薯/洋葱等', peril: '缺雨/多雨/异常雨/温湿/风/雹/霜', payType: 'step',
      index: '分阶段 Term Sheet（RUA×参考气象站）', trigger: '各物候期（营养/开花/坐果/成熟）分别设触发阈值与保额',
      liability: '按物候期分段承保（营养/开花/坐果/成熟各期独立保额与责任）：缺雨、多雨、异常降雨、温湿组合、大风、冰雹、霜冻等；以参考气象单位（RUA）实测数据替代人工查勘；赔付单位精细化到 ₹/mm、₹/度日、₹/湿度指数。',
      claimTable: [
        { d: '分物候期责任', t: '营养/开花/坐果/成熟各期独立保额，承保缺雨/多雨/温湿/风/雹/霜', p: '触发值起赔→退出值顶格，线性分段（₹/mm、₹/度日、₹/湿度指数）' },
        { d: '农户保费分担', t: 'Kharif 2%、Rabi 1.5%、商业园艺≤5%', p: '其余政府补贴；Aadhaar身份直付到户' }
      ],
      claimNote: '各阶段触发值/退出值按作物×县逐年公示（真实，非示例）；为公开 Term Sheet 机制，数值随年度更新。',
      payout: '按单位（₹/mm、₹/度日、₹/湿度指数）分段，Aadhaar直付', note: '农户保费 Kharif 2%、Rabi 1.5%、商业园艺≤5%（政府补贴其余）；基差风险仍存。' },
    { tag: '国际·条款级', name: 'Kilimo Salama（安全农耕）', org: '肯尼亚保险界', region: '撒哈拉以南非洲', year: '2009起', crop: '小农主粮', peril: '干旱/过剩降雨', payType: 'linear',
      index: '天气站+移动技术', trigger: '降雨指数偏离触发线自动赔付',
      liability: '面向小农的降雨指数保险（种子+生育期两段）：干旱（降水亏缺）与过剩降雨双端责任；通过本地自动天气站+移动端投保/理赔，保费随保额按比例定价。',
      claimTable: [
        { d: '播种期干旱', t: '播种季降雨低于触发线', p: '赔种子投入' },
        { d: '生育期双端', t: '降雨亏缺/过剩越线（参考天气站）', p: '按偏离幅度分段；M-Pesa移动钱包直付' }
      ],
      claimNote: '触发线按历史降雨分布标定（真实，随站点协议约定，非示例）；行政成本约降60%为公开评估值。',
      payout: '移动钱包直付，降低行政成本', note: '被视为撒哈拉以南非洲 WII 标杆，行政成本可降约60%。' },
    { tag: '国际·条款级', name: 'CADENA 天气指数计划', org: '墨西哥农业部', region: '墨西哥', year: '2003起', crop: '玉米', peril: '干旱', payType: 'linear',
      index: '天气指数', trigger: '干旱指数触发',
      liability: '政府主导的 catastrophic（巨灾型）天气指数计划：承保雨养玉米生育期干旱，面向无法承担传统查勘成本的大面积低收入农户；联邦/州财政出资为主。',
      claimTable: [
        { d: '干旱（巨灾型）', t: '生育期窗口累计降水低于触发值', p: '触发值起赔→退出值（更低累计降水）顶格，线性赔付、零查勘' }
      ],
      claimNote: '各州触发值按气候区分别标定（真实，非示例）；为公开政府计划机制。',
      payout: '政府主导，2013年扩至超600万公顷', note: '发展中国家大面积 WII 成功案例之一。' },
    { tag: '方法论', name: 'FAO 天气指数保险设计方法', org: 'FAO', region: '全球', year: '—', crop: '多作物', peril: '全灾种', payType: 'linear',
      index: '降雨/温度/湿度/风速分阶段指数', trigger: '基于历史气象(30-100年)标定触发线',
      liability: '方法论框架：按作物物候将保额分摊至各生育阶段（播种期保种子、营养期保肥料、成熟期保预期收入）；每阶段选用匹配指数，责任独立、互不挤占。',
      claimTable: [
        { d: '触发线标定', t: '基于30-100年历史气象序列按生育期窗口回算，取期望损失对应分位数', p: '费率＝各阶段期望损失/保额之和' },
        { d: '农户保费封顶', t: '多数粮食作物 1.5-2%', p: '差额由财政补贴' }
      ],
      claimNote: '阈值属方法论推导（基于历史序列分位数），非固定值；须先做指数-产量相关性检验再定阈值，不杜撰定点数值。',
      payout: '保额按投入成本分摊至各生育阶段', note: '费率按期望损失计算，多数粮食作物农户端封顶1.5-2%；基差风险是首要障碍。' }
  ];

  var marketRefs = [
    { peril: 'rainy', crop: 'rice', name: '辛集梨天气指数保险', org: '河北省气象服务中心', region: '河北辛集', year: '2025',
      index: '冰雹/大风/低温三指数', triggerParam: '冰雹指数、大风指数(最大风速)、低温指数(强度+持续时间)；与梨减产率统计建模',
      liability: '承保梨全生育期冰雹、大风、低温三灾：以乡镇级小时级气象+雷达数据构建三指数，各指数与梨减产率统计建模定标。',
      note: '整合近30年乡镇级小时级气象+雷达+产业经济数据；国内率先"理赔触发告知书一键生成"自动理赔。', src: '中国气象局 cma.gov.cn 2025-10' },
    { peril: 'heat', crop: 'rice', name: '水稻高温指数保险+衍生品', org: '太平洋安信(太保)', region: '上海松江', year: '2024首创·2025升级',
      index: '高温指数(Tmax)', triggerParam: '水稻高温热害窗口 Tmax 越线触发；约14万亩纳入',
      liability: '承保水稻高温热害窗口（拔节孕穗—抽穗扬花）Tmax 越线造成的结实率损失；"保险+气象衍生品"对冲结构；2025升级版扩展设施大棚专项保障2200余亩。',
      note: '全国首创"水稻高温指数保险+衍生品"，保险+气象衍生品对冲；设施大棚专项保障2200余亩。', src: '上海市气象局 sh.cma.gov.cn 2025-12' },
    { peril: 'drought', crop: 'rice', name: '云梦水稻节气气象保险', org: '人保/国寿财 × 气象', region: '湖北云梦', year: '2025',
      index: '旱灾指数+强降水指数', triggerParam: '按天气指数标准触发即赔，无需现场定损',
      liability: '承保水稻节气窗口旱灾与强降水渍害双端责任；按天气指数触发即赔、无需现场定损；每亩保额400元，农户自缴40%、政府补贴60%。',
      note: '农户自缴40%、政府补贴60%，每亩保额400元；平均理赔时效较传统缩短50%。可作补贴比例参照。', src: '湖北省气象局 hb.cma.gov.cn 2025-10' },
    { peril: 'wind', crop: 'rubber', name: '橡胶树风灾指数保险', org: '人保/太保 × 气象', region: '海南/云南', year: '2023-2024',
      index: '最大风速/台风指数', triggerParam: '台风影响期最大风速越约定级别即赔',
      liability: '承保开割胶林台风大风断干/折枝/倒伏损失：台风影响期参考点最大风速越约定风级即赔，按风级分段递进。',
      note: '多年生经济林，风灾断干折枝损失大；风速指数与风灾损失相关性高。可作大风指数锚定参照。', src: '科普中国/行业试点' },
    { peril: 'frost', crop: 'tea', name: '茶叶低温(倒春寒)指数保险', org: '国寿财/人保 × 气象', region: '浙/皖/闽茶区', year: '2024',
      index: '最低气温指数(倒春寒)', triggerParam: '春梢萌发—开采期 Tmin 低于冻害线分段赔付',
      liability: '承保名优茶春梢萌发—开采期倒春寒冻害：参考站逐日 Tmin 低于冻害线分段赔付，护"明前茶"高价值窗口。',
      note: '名优茶对春霜极敏感，一次倒春寒可减产三成以上；指数触发快、定损成本低。', src: '行业试点/KB' },
    { peril: 'drought', crop: 'corn', name: '北方玉米降水指数保险', org: '中农阳光数据', region: '北方玉米带', year: '方法论级',
      index: '作物水分亏缺指数(土壤+植物+气象)+最大降水重现期', triggerParam: '旱级=综合水分亏缺；降水过量=最大降水重现期阈值；整村触发',
      liability: '承保玉米生育期干旱（综合水分亏缺指数）与降水过量（最大降水重现期阈值）双端责任；整村触发、村级投保理赔。',
      note: '3S+物联网，气象监测范围3km内，村级投保理赔降基差；费率按各生育期需水亏缺建模。可作综合指数+县域平滑参照。', src: '中国金融新闻网/中农阳光' },
    { peril: 'rainy', crop: 'rice', name: '本溪人参/中药材气象指数', org: '中华财险本溪中支 × 气象', region: '辽宁本溪', year: '2025',
      index: '气象指数(按特定气象条件设计)', triggerParam: '事前预警+事中防控+事后按指数自动极速理赔',
      liability: '承保人参/中药材特定气象条件（连阴雨/低温/暴雨等）致损：按"保防减救赔"全流程设计，1km精细化气象数据+农户定制投保。',
      note: '"气象+金融"全流程：1km精细化气象数据、农户定制投保；农险用户年增4%-6%。可作"保防减救赔"流程参照。', src: '中国气象局 cma.gov.cn 2025-12' }
  ];

  /* ---------- 七-b、灾害 → 指数 → 阈值方向 速查（方法论页用） ---------- */
  var designQuick = [
    { peril: '干旱/降水亏缺', index: '降水亏缺指数', base: '窗口累计降水 / SPI', dir: '低（越少越赔）',
      win: '作物需水临界期（玉米拔节—吐丝、水稻分蘖—抽穗）', note: '阈值取累计降水下限；SPI≤-1.0 可作 Severe 档。' },
    { peril: '低温霜冻', index: '最低气温指数', base: '逐日 Tmin', dir: '低（越低越赔）',
      win: '花期/抽穗/春梢等低温敏感窗口', note: '花期 Tmin≤0℃ 起赔；可叠加"低温积温"强化 Severe 档。' },
    { peril: '高温热害', index: '最高气温指数', base: '逐日 Tmax', dir: '高（越高越赔）',
      win: '开花/灌浆高温敏感窗口', note: 'Tmax≥35℃ 起赔；可叠加"高温积温"强化 Severe 档。' },
    { peril: '连阴雨渍涝', index: '连阴雨指数', base: '连续降水(≥1mm)日数', dir: '高（越长越赔）',
      win: '抽穗/灌浆/成熟期（"烂场雨""寒露风"叠加期）', note: '起赔连续日数 3–5 日；可多次事故累积封顶。' },
    { peril: '暴雨洪涝', index: '暴雨指数', base: '单日最大降水', dir: '高（越大越赔）',
      win: '全生育期暴雨易发段', note: '单日≥50mm 起赔；与连阴雨常并发，谨慎避免双重计赔。' },
    { peril: '大风倒伏', index: '大风指数', base: '最大风速', dir: '高（越大越赔）',
      win: '幼果/成熟易落期', note: '≥13.8m/s(7级)起赔；冰雹需雷达协同（本站难测，标注）。' }
  ];

  /* ---------- 六、9步设计流水线（方法论页） ---------- */
  var pipeline = [
    'Step1 明确标的与灾害痛点：调04库物种档案，锁定生长周期+自然灾害耐受标准+关键物候窗口。',
    'Step2 数据采集清洗：地面站(温/降水/积温/极值)+卫星(NDVI/降水反演)+历史产量，数据长度20-30年较优。',
    'Step3 去趋势化+补偿产量IB模型：IB=max(0,趋势产量-实际产量)，费率雏形=E(IB)/趋势产量。',
    'Step4 指数构建与触发参数：按农时候选(低温/降水亏缺/高温积温/NDVI)，分段赔付函数设起赔与封顶。',
    'Step5 基差风险量化与农时治理：机器学习测"指数骗了谁"，卡准农时物候+网格化+遥感校准降基差。',
    'Step6 费率厘定(Bootstrap区间)：历史重演+蒙特卡洛→费率非单点而是可信区间。',
    'Step7 九大闭环产品方案：产业周期/风险痛点/责任/触发/费率/成本/风控/场景/优势逐项填表。',
    'Step8 政策合规锚定：金发〔2024〕35号(双精准)、银保监规〔2023〕4号(精算)、银保监规〔2022〕4号。',
    'Step9 落地节奏：立项标定(1-3月)→小步试点(4-9月)→扩面报备(10-12月)。'
  ];

  /* ---------- 七、代表县区/市坐标（方案测算费率引擎取数） ---------- */
  var cities = [
    { n: '哈尔滨', p: '黑龙江', lat: 45.80, lon: 126.53, z: 'northeast' },
    { n: '巴彦县', p: '黑龙江', lat: 45.75, lon: 127.40, z: 'northeast' },
    { n: '尚志市', p: '黑龙江', lat: 45.21, lon: 127.97, z: 'northeast' },
    { n: '长春', p: '吉林', lat: 43.82, lon: 125.32, z: 'northeast' },
    { n: '沈阳', p: '辽宁', lat: 41.80, lon: 123.43, z: 'northeast' },
    { n: '呼和浩特', p: '内蒙古', lat: 40.84, lon: 111.75, z: 'northwest' },
    { n: '石家庄', p: '河北', lat: 38.04, lon: 114.51, z: 'huanghuai' },
    { n: '太原', p: '山西', lat: 37.87, lon: 112.55, z: 'northwest' },
    { n: '郑州', p: '河南', lat: 34.75, lon: 113.62, z: 'huanghuai' },
    { n: '周口', p: '河南', lat: 33.63, lon: 114.65, z: 'huanghuai' },
    { n: '济南', p: '山东', lat: 36.65, lon: 117.12, z: 'huanghuai' },
    { n: '聊城', p: '山东', lat: 36.46, lon: 115.98, z: 'huanghuai' },
    { n: '高唐县', p: '山东', lat: 36.86, lon: 116.23, z: 'huanghuai' },
    { n: '合肥', p: '安徽', lat: 31.82, lon: 117.23, z: 'yangtze' },
    { n: '武汉', p: '湖北', lat: 30.59, lon: 114.30, z: 'yangtze' },
    { n: '黄冈', p: '湖北', lat: 30.45, lon: 114.87, z: 'yangtze' },
    { n: '长沙', p: '湖南', lat: 28.23, lon: 112.94, z: 'yangtze' },
    { n: '南昌', p: '江西', lat: 28.68, lon: 115.86, z: 'yangtze' },
    { n: '南京', p: '江苏', lat: 32.06, lon: 118.80, z: 'huanghuai' },
    { n: '成都', p: '四川', lat: 30.57, lon: 104.07, z: 'southwest' },
    { n: '重庆', p: '重庆', lat: 29.56, lon: 106.55, z: 'southwest' },
    { n: '贵阳', p: '贵州', lat: 26.65, lon: 106.63, z: 'southwest' },
    { n: '昆明', p: '云南', lat: 25.04, lon: 102.71, z: 'southwest' },
    { n: '曲靖', p: '云南', lat: 25.49, lon: 103.68, z: 'southwest' },
    { n: '南宁', p: '广西', lat: 22.82, lon: 108.37, z: 'south' },
    { n: '玉林', p: '广西', lat: 22.63, lon: 110.18, z: 'south' },
    { n: '广州', p: '广东', lat: 23.13, lon: 113.26, z: 'south' },
    { n: '西安', p: '陕西', lat: 34.34, lon: 108.94, z: 'northwest' },
    { n: '兰州', p: '甘肃', lat: 36.06, lon: 103.83, z: 'northwest' },
    { n: '银川', p: '宁夏', lat: 38.49, lon: 106.23, z: 'northwest' },
    { n: '乌鲁木齐', p: '新疆', lat: 43.83, lon: 87.62, z: 'northwest' },
    { n: '建德', p: '浙江', lat: 29.47, lon: 119.28, z: 'yangtze' },
    { n: '杭州', p: '浙江', lat: 30.27, lon: 120.15, z: 'yangtze' },
    { n: '福州', p: '福建', lat: 26.07, lon: 119.30, z: 'south' }
  ];

  /* ---------- 八、需求场景中枢（把工具嵌进真实业务动作） ---------- */
  // 每个场景对应阳光财险农险合伙人一个具体动作，产出可落地的输出
  var scenarios = [
    { key: 's1', name: '遴选 / 应标创新点', scene: '政策性农险承保机构遴选，需要在应标文件中承诺创新产品（天气指数保险）作为评审加分项。',
      out: '反推一套可写进应标文件"产品创新"章节的指数方案 + 费率区间 + 基差治理承诺，自动套用遴选评分维度。',
      route: 'reverse' },
    { key: 's2', name: '县域特色险种立项', scene: '农险部想在一个新县推特色气象指数险（如某县柑橘/茶叶/小龙虾），需立项汇报要点。',
      out: '反推主害识别 + 关键物候窗口 + 阈值草案 + 方案概要，并附立项汇报要点清单。',
      route: 'reverse' },
    { key: 's3', name: '财政补贴与农户封顶测算', scene: '给定保额、纯费率、费用率与各级财政补贴比例，要判断农户端自缴多少、财政能不能扛、是否超封顶。',
      out: '倒推综合费率、中央/省/市/县各级财政分担比例、农户自缴比例，判断是否超过农户封顶线及缺口。',
      route: 'calc' },
    { key: 's4', name: '基差风险评级与治理', scene: '"指数触发但农户没受灾"是指数保险最大 objections，立项/应标前须自评基差等级与治理手段。',
      out: '按作物/指数/县域数据可得性评级基差风险（高/中/低），并给出具体治理手段清单与适用边界。',
      route: 'calc' },
    { key: 's5', name: '区域连片巨灾指数', scene: '多县连片巨灾（如整片黄淮海烂场雨），用于巨灾债券或中农再对接，需区域触发频率与ULR。',
      out: '多县真实气象回测聚合，给出"≥K县同时触发"的巨灾年频率、区域触发阈值建议与ULR校准。',
      route: 'calc' },
    { key: 's6', name: '传统农险 vs 指数保险 决策', scene: '判断某个险种/县域该不该做指数化，向领导汇报决策依据。',
      out: '六维对照表（定损成本/理赔时效/基差/道德风险/适用作物/财政杠杆），给出"建议做指数化"的判定规则。',
      route: 'calc' }
  ];

  /* 基差固有等级（指数类型本身的农户感知相关度，low=好 high=差） */
  var basisBase = { drought: 'mid', frost: 'low', heat: 'low', rainy: 'mid', storm: 'mid', wind: 'high' };

  /* 传统农险 vs 天气指数保险 决策对照（六维） */
  var decisionCompare = [
    { dim: '定损成本', trad: '需逐户查勘、专家定损，人力高、争议多', wii: '指数触发自动赔付，零查勘，定损成本极低', wiiWin: true },
    { dim: '理赔时效', trad: '灾后查勘—定损—公示—赔付，常数周至数月', wii: '触发即赔，T+0~T+3 到账，抗灾救灾窗口友好', wiiWin: true },
    { dim: '基差风险', trad: '按实际损失赔付，无基差', wii: '指数≠实际损失，存在"该赔未赔/不该赔已赔"', wiiWin: false },
    { dim: '道德风险', trad: '存在夸大损失、选择性投保', wii: '自然灾害客观触发，几乎无道德风险', wiiWin: true },
    { dim: '适用作物/灾', trad: '全品类、全灾害通用', wii: '指数与产量相关性高、空间异质小者最优（低温/高温/连阴雨/暴雨）', wiiWin: false },
    { dim: '财政杠杆', trad: '同额保费同额保障', wii: '低定损成本+快赔，单位财政补贴撬动保障更高', wiiWin: true }
  ];

  window.AGRI_KB = {
    crops: crops, indexTypes: indexTypes, perilTpl: perilTpl,
    zones: zones, cropClim: cropClim, climBands: climBands, agriTech: agriTech,
    marketDesigns: marketDesigns, marketRefs: marketRefs, pipeline: pipeline, cities: cities,
    designQuick: designQuick, scenarios: scenarios, basisBase: basisBase, decisionCompare: decisionCompare
  };
})();


/* ==== crops-extra.js ==== */
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


/* ==== phenology.js ==== */
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
        thr: peril && s.perils[peril] ? (s.perils[peril].thr || '') : '',
        mech: peril && s.perils[peril] ? (s.perils[peril].mech || '') : '',
        note: s.note || ''
      };
    });
  }

  var PERIL_NAMES = { drought: '干旱/降水亏缺', frost: '低温霜冻', heat: '高温热害', rainy: '连阴雨渍涝', storm: '暴雨洪涝', wind: '大风倒伏' };
  function perilName(p) { return PERIL_NAMES[p] || p; }

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
    return { added: added, merged: merged, coverage: cov };
  }

  window.WIIPheno = {
    META: META, REGIONS: REGIONS, ZONE2REGION: ZONE2REGION,
    setCrops: setCrops, mergeCrops: mergeCrops, getCrops: function () { return CROPS; },
    SCHEMA_VERSION: SCHEMA_VERSION, loadedMeta: function () { return LOADED_META; },
    coverage: function () { return LOADED_COVERAGE; },
    regionsOf: regionsOf, stagesOf: stagesOf, perilStages: perilStages,
    suggest: suggest, score: score, gate: gate, calendar: calendar, chainSpan: chainSpan, seasonLength: seasonLength, seasonSpanSum: seasonSpanSum, hasParallelStages: hasParallelStages,
    indexForm: indexForm, bufferFor: bufferFor, WEIGHTS: WEIGHTS, BUFFER: BUFFER, MIN_ACCUM: MIN_ACCUM,
    // 工具（测试与 UI 复用）
    parseNode: parseNode, stageSpan: stageSpan, spanLen: spanLen, overlapLen: overlapLen,
    shiftDays: shiftDays, fmtMD: fmtMD, perilName: perilName
  };
})();


/* ==== pheno-data.js ==== */
/* 物候—灾害基线数据（自动生成，勿手改）
   源：04-全品类农业产业技术风险库 → 审度提取《物候-灾害基线_04库提取_v1.md》
   生成器：build_pheno.py　行数 232　相对日期 5　仅到月 103　无阈值 188
   灾种已归一到平台 6 键；冰雹并入 storm 并加注。阈值与多灾种混写时标 thrShared，不强行对齐。
*/
(function(){ if(!window.WIIPheno) return; window.WIIPheno.setCrops({
"rice": {
"name": "水稻",
"regions": {
"northeast": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种育秧",
"from": "4中",
"to": "4下",
"precision": "tenday",
"days": "25–35 天",
"ops": "浸种消毒、催芽、苗床管理",
"perils": {
"frost": {
"thr": "",
"mech": "烂秧死苗、基本苗不足",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "发芽期 <10℃ 烂秧"
}
},
"id": "rice-通用-0"
},
{
"name": "移栽返青",
"from": "5中",
"to": "5下",
"precision": "tenday",
"days": "约 7–10 天",
"ops": "浅水护苗、查苗补缺",
"perils": {
"frost": {
"thr": "",
"mech": "缓苗慢、返青延迟",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "rice-通用-1"
},
{
"name": "分蘖期",
"from": "6月",
"to": "6月",
"precision": "month",
"days": "返青后 25–35 天，需 ≥800℃ 积温",
"ops": "早施分蘖肥、够苗晒田",
"perils": {
"drought": {
"thr": "",
"mech": "分蘖不足、穗数下降",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值；原文\"分蘖期适度耐旱\"）"
}
},
"id": "rice-通用-2"
},
{
"name": "拔节孕穗",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "30–40 天",
"ops": "施穗肥、深水调温",
"perils": {
"storm": {
"thr": "孕穗期淹没 2–3 天即严重减产，淹没 5 天以上绝收",
"mech": "穗分化受阻、颖花退化",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"thrShared": true
},
"drought": {
"thr": "田间缺水 3–5 天即减产（土壤含水量 <40% 临界）",
"mech": "穗分化受阻、颖花退化",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"thrShared": true
},
"frost": {
"thr": "",
"mech": "穗分化受阻、颖花退化",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "孕穗期淹没 2–3 天即严重减产，淹没 5 天以上绝收；田间缺水 3–5 天即减产（土壤含水量 <40% 临界）",
"thrShared": true
}
},
"id": "rice-通用-3"
},
{
"name": "抽穗开花",
"from": "相对（孕穗后 7–10 天）",
"to": "相对（孕穗后 7–10 天）",
"precision": "relative",
"days": "约 7–12 天",
"ops": "保花、防高温热害",
"perils": {
"frost": {
"thr": "",
"mech": "花粉败育、包颈、空秕率升高",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "抽穗期低温致\"包颈\"、空秕率升高；抽穗扬花期 >35℃ 持续 3 天以上，结实率骤降"
},
"heat": {
"thr": "抽穗扬花期 >35℃ 持续 3 天以上，结实率骤降",
"mech": "花粉败育、包颈、空秕率升高",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "rice-通用-4"
},
{
"name": "灌浆成熟",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "30–45 天，900–1200℃ 积温",
"ops": "干湿交替、适时收割",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、落粒、粒重下降",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
},
"frost": {
"thr": "",
"mech": "穗发芽、落粒、粒重下降",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "rice-通用-5"
}
]
}
]
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种育秧",
"from": "5上",
"to": "5中",
"precision": "tenday",
"days": "25–35 天",
"ops": "浸种消毒、催芽、苗床管理",
"perils": {
"frost": {
"thr": "",
"mech": "烂秧死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "发芽期 <10℃ 烂秧"
}
},
"id": "rice-通用-0"
},
{
"name": "移栽返青",
"from": "6上",
"to": "6中",
"precision": "tenday",
"days": "约 7–10 天",
"ops": "浅水护苗、查苗补缺",
"perils": {
"frost": {
"thr": "",
"mech": "返青延迟",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "rice-通用-1"
},
{
"name": "分蘖期",
"from": "6下",
"to": "6下",
"precision": "tenday",
"days": "返青后 25–35 天，需 ≥800℃ 积温",
"ops": "早施分蘖肥、够苗晒田",
"perils": {
"rainy": {
"thr": "",
"mech": "分蘖受阻、穗数下降",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "rice-通用-2"
},
{
"name": "拔节孕穗",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "30–40 天",
"ops": "施穗肥、深水调温",
"perils": {
"storm": {
"thr": "孕穗期淹没 2–3 天即严重减产，淹没 5 天以上绝收",
"mech": "穗分化受阻、颖花退化",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text"
},
"drought": {
"thr": "田间缺水 3–5 天即减产（土壤含水量 <40% 临界）",
"mech": "穗分化受阻、颖花退化",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text"
}
},
"id": "rice-通用-3"
},
{
"name": "抽穗开花",
"from": "相对（孕穗后 7–10 天）",
"to": "相对（孕穗后 7–10 天）",
"precision": "relative",
"days": "约 7–12 天",
"ops": "保花、防高温热害",
"perils": {
"heat": {
"thr": "抽穗扬花期 >35℃ 持续 3 天以上，结实率骤降",
"mech": "花粉败育、结实率骤降",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "rice-通用-4"
},
{
"name": "灌浆成熟",
"from": "10上",
"to": "10中",
"precision": "tenday",
"days": "30–45 天，900–1200℃ 积温",
"ops": "干湿交替、适时收割",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、收割困难",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "rice-通用-5"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种育秧",
"from": "4下",
"to": "5上",
"precision": "tenday",
"days": "25–35 天",
"ops": "浸种消毒、催芽、苗床管理",
"perils": {
"frost": {
"thr": "",
"mech": "烂秧死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "发芽期 <10℃ 烂秧"
}
},
"id": "rice-通用-0"
},
{
"name": "移栽返青",
"from": "5下",
"to": "6上",
"precision": "tenday",
"days": "约 7–10 天",
"ops": "浅水护苗、查苗补缺",
"perils": {
"frost": {
"thr": "",
"mech": "返青延迟",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "rice-通用-1"
},
{
"name": "拔节孕穗",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "30–40 天",
"ops": "施穗肥、深水调温",
"perils": {
"storm": {
"thr": "孕穗期淹没 2–3 天即严重减产，淹没 5 天以上绝收",
"mech": "穗分化受阻、颖花退化",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text"
},
"drought": {
"thr": "田间缺水 3–5 天即减产（土壤含水量 <40% 临界）",
"mech": "穗分化受阻、颖花退化",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text"
}
},
"id": "rice-通用-2"
},
{
"name": "灌浆成熟",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "30–45 天，900–1200℃ 积温",
"ops": "干湿交替、适时收割",
"perils": {
"frost": {
"thr": "",
"mech": "灌浆不足、青秕增多",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "rice-通用-3"
}
]
}
]
},
"tibet": {
"note": "原文\"极少种植/，高寒，仅雅鲁藏布江下游零星\"",
"plantable": false,
"seasons": []
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "抽穗开花",
"from": "7中",
"to": "8上",
"precision": "tenday",
"days": "约 7–12 天",
"ops": "保花、防高温热害",
"perils": {
"heat": {
"thr": "抽穗扬花期 >35℃ 持续 3 天以上，结实率骤降",
"mech": "花粉败育、结实率骤降",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text"
},
"storm": {
"thr": "孕穗期淹没 2–3 天即严重减产，淹没 5 天以上绝收",
"mech": "花粉败育、结实率骤降",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text"
}
},
"id": "rice-通用-0"
}
]
},
{
"name": "早稻",
"stages": [
{
"name": "播种育秧",
"from": "2下",
"to": "3上",
"precision": "tenday",
"days": "25–35 天",
"ops": "浸种消毒、催芽、苗床管理",
"perils": {
"frost": {
"thr": "",
"mech": "烂秧死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "发芽期 <10℃ 烂秧"
}
},
"id": "rice-早稻-0"
},
{
"name": "灌浆成熟",
"from": "7中",
"to": "7下",
"precision": "tenday",
"days": "30–45 天，900–1200℃ 积温",
"ops": "抢晴收割、烘干入库",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "rice-早稻-1"
}
]
},
{
"name": "单季稻",
"stages": [
{
"name": "播种育秧",
"from": "5中",
"to": "5下",
"precision": "tenday",
"days": "25–35 天",
"ops": "浸种消毒、催芽、苗床管理",
"perils": {
"frost": {
"thr": "",
"mech": "烂秧死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "发芽期 <10℃ 烂秧"
}
},
"id": "rice-单季稻-0"
},
{
"name": "灌浆成熟",
"from": "10上",
"to": "10中",
"precision": "tenday",
"days": "30–45 天，900–1200℃ 积温",
"ops": "干湿交替、适时收割",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、空秕率升高",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "寒露风（<20℃ 连续 3 天）严重影响晚稻",
"thrShared": true,
"rank": 3
},
"frost": {
"thr": "寒露风（<20℃ 连续 3 天）严重影响晚稻",
"mech": "穗发芽、空秕率升高",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
}
},
"id": "rice-单季稻-1"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种育秧",
"from": "3下",
"to": "4上",
"precision": "tenday",
"days": "25–35 天",
"ops": "浸种消毒、催芽、苗床管理",
"perils": {
"frost": {
"thr": "",
"mech": "烂秧死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "发芽期 <10℃ 烂秧"
}
},
"id": "rice-通用-0"
},
{
"name": "拔节孕穗",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "30–40 天",
"ops": "施穗肥、深水调温",
"perils": {
"storm": {
"thr": "孕穗期淹没 2–3 天即严重减产，淹没 5 天以上绝收",
"mech": "穗分化受阻、颖花退化",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text"
},
"drought": {
"thr": "田间缺水 3–5 天即减产（土壤含水量 <40% 临界）",
"mech": "穗分化受阻、颖花退化",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text"
}
},
"id": "rice-通用-1"
},
{
"name": "灌浆成熟",
"from": "9下",
"to": "10中",
"precision": "tenday",
"days": "30–45 天，900–1200℃ 积温",
"ops": "干湿交替、适时收割",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "rice-通用-2"
}
]
}
]
},
"south": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "早稻",
"stages": [
{
"name": "播种育秧",
"from": "2下",
"to": "3上",
"precision": "tenday",
"days": "25–35 天",
"ops": "浸种消毒、催芽、苗床管理",
"perils": {
"frost": {
"thr": "",
"mech": "烂秧死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "发芽期 <10℃ 烂秧"
}
},
"id": "rice-早稻-0"
},
{
"name": "灌浆成熟",
"from": "7中",
"to": "7下",
"precision": "tenday",
"days": "30–45 天，900–1200℃ 积温",
"ops": "抢晴收割、烘干入库",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "rice-早稻-1"
}
]
},
{
"name": "晚稻",
"stages": [
{
"name": "播种育秧",
"from": "6下",
"to": "7上",
"precision": "tenday",
"days": "25–35 天",
"ops": "苗床防暴雨冲刷",
"perils": {
"storm": {
"thr": "",
"mech": "秧苗损毁",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "rice-晚稻-0"
},
{
"name": "灌浆成熟",
"from": "10下",
"to": "11上",
"precision": "tenday",
"days": "30–45 天，900–1200℃ 积温",
"ops": "干湿交替、适时收割",
"perils": {
"frost": {
"thr": "寒露风（<20℃ 连续 3 天）严重影响晚稻",
"mech": "千粒重下降、穗发芽",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "千粒重下降、穗发芽",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "寒露风（<20℃ 连续 3 天）严重影响晚稻",
"thrShared": true,
"rank": 3
}
},
"id": "rice-晚稻-1"
}
]
},
{
"name": "早稻→晚稻连续窗口，库内未拆双季",
"stages": [
{
"name": "抽穗开花",
"from": "7中",
"to": "10上",
"precision": "tenday",
"days": "约 7–12 天",
"ops": "保花、深水调温、防寒露风",
"perils": {
"heat": {
"thr": "抽穗扬花期 >35℃ 持续 3 天以上，结实率骤降",
"mech": "花粉败育、空秕率升高、包颈",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
},
"frost": {
"thr": "寒露风（<20℃ 连续 3 天）严重影响晚稻",
"mech": "花粉败育、空秕率升高、包颈",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"seasonMismatch": "寒露风属秋季低温（晚稻抽穗期），挂在该阶段（7 月）气候上不可能触发",
"seasonMismatchLevel": "suspected"
}
},
"id": "rice-早稻→晚稻连续窗口，库内未拆双季-0"
}
]
}
]
}
}
},
"wheat": {
"name": "小麦",
"regions": {
"northeast": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "拔节孕穗",
"from": "5下",
"to": "6上",
"precision": "tenday",
"days": "需 ≥600℃ 积温",
"ops": "浇拔节水、防倒伏",
"perils": {
"drought": {
"thr": "",
"mech": "穗粒数下降",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"frost": {
"thr": "",
"mech": "穗粒数下降",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 1
}
},
"id": "wheat-通用-0"
},
{
"name": "抽穗灌浆",
"from": "6下",
"to": "7上",
"precision": "tenday",
"days": "30–40 天",
"ops": "一喷三防、防干热风",
"perils": {
"heat": {
"thr": "灌浆期 30℃ 以上 + 低湿 + 风，逼熟减产",
"mech": "逼熟、粒重下降",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text"
}
},
"id": "wheat-通用-1"
},
{
"name": "成熟收获",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "蜡熟末期",
"ops": "抢晴机械收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "wheat-通用-2"
}
]
},
{
"name": "春麦",
"stages": [
{
"name": "播种出苗",
"from": "3下",
"to": "4上",
"precision": "tenday",
"days": "6–10 天出苗",
"ops": "整地、适墒播种",
"perils": {
"frost": {
"thr": "",
"mech": "出苗延迟、苗弱",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "wheat-春麦-0"
}
]
}
]
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "越冬期※",
"from": "12下",
"to": "2下",
"precision": "tenday",
"days": "库内未给（原文\"长日照需求累积\"）",
"ops": "浇越冬水、防冻保苗",
"perils": {
"frost": {
"thr": "原文\"耐寒 -24℃ 内\"）",
"mech": "冻害死苗",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text"
}
},
"id": "wheat-通用-0"
},
{
"name": "返青起身",
"from": "3月",
"to": "3月",
"precision": "month",
"days": "需 ≥0℃ 积温",
"ops": "划锄、追肥",
"perils": {
"frost": {
"thr": "",
"mech": "幼穗不育",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "3–4 月降温致幼穗不育"
}
},
"id": "wheat-通用-1"
},
{
"name": "拔节孕穗",
"from": "4上",
"to": "5上",
"precision": "tenday",
"days": "需 ≥600℃ 积温",
"ops": "浇拔节水、防倒伏",
"perils": {
"frost": {
"thr": "拔节后遇 -1℃ 以下冻伤幼穗",
"mech": "幼穗冻伤、小花退化",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"rank": 1
},
"drought": {
"thr": "土壤相对含水量 <50% 减产明显",
"mech": "幼穗冻伤、小花退化",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "wheat-通用-2"
},
{
"name": "抽穗灌浆",
"from": "5中",
"to": "5中",
"precision": "tenday",
"days": "30–40 天",
"ops": "一喷三防、防干热风",
"perils": {
"heat": {
"thr": "灌浆期 30℃ 以上 + 低湿 + 风，逼熟减产",
"mech": "逼熟、粒重下降",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "逼熟、粒重下降",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "灌浆期 30℃ 以上 + 低湿 + 风，逼熟减产",
"thrShared": true,
"rank": 2
}
},
"id": "wheat-通用-3"
},
{
"name": "成熟收获",
"from": "6上",
"to": "6中",
"precision": "tenday",
"days": "蜡熟末期",
"ops": "抢晴机械收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、霉变、落粒",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
},
"storm": {
"thr": "",
"mech": "穗发芽、霉变、落粒",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"note": "原文含冰雹；平台无独立雹灾键，按暴雨洪涝类归集"
}
},
"id": "wheat-通用-4"
}
]
},
{
"name": "冬麦",
"stages": [
{
"name": "播种出苗",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "6–10 天出苗",
"ops": "整地、适墒播种",
"perils": {
"drought": {
"thr": "",
"mech": "出苗不齐、冬前苗弱",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值；原文\"适播期内日均温 16–18℃\"）"
}
},
"id": "wheat-冬麦-0"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "抽穗灌浆",
"from": "5下",
"to": "6上",
"precision": "tenday",
"days": "30–40 天",
"ops": "一喷三防、防干热风",
"perils": {
"heat": {
"thr": "灌浆期 30℃ 以上 + 低湿 + 风，逼熟减产",
"mech": "逼熟、粒重下降",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text"
}
},
"id": "wheat-通用-0"
}
]
},
{
"name": "冬麦",
"stages": [
{
"name": "播种出苗",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "6–10 天出苗",
"ops": "整地、适墒播种",
"perils": {
"drought": {
"thr": "",
"mech": "出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "wheat-冬麦-0"
},
{
"name": "成熟收获",
"from": "6月",
"to": "6月",
"precision": "month",
"days": "蜡熟末期",
"ops": "抢晴机械收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "wheat-冬麦-1"
}
]
},
{
"name": "春麦",
"stages": [
{
"name": "播种出苗",
"from": "3月",
"to": "3月",
"precision": "month",
"days": "6–10 天出苗",
"ops": "整地、适墒播种",
"perils": {
"drought": {
"thr": "",
"mech": "出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "wheat-春麦-0"
},
{
"name": "成熟收获",
"from": "7月",
"to": "7月",
"precision": "month",
"days": "蜡熟末期",
"ops": "抢晴机械收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "wheat-春麦-1"
}
]
}
]
},
"tibet": {
"note": "原文\"极少种植/，高寒，仅河谷零星春麦\"",
"plantable": false,
"seasons": []
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "拔节孕穗",
"from": "3下",
"to": "4上",
"precision": "tenday",
"days": "需 ≥600℃ 积温",
"ops": "浇拔节水、防倒伏",
"perils": {
"frost": {
"thr": "拔节后遇 -1℃ 以下冻伤幼穗",
"mech": "幼穗冻伤、根系缺氧",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"rank": 1
},
"rainy": {
"thr": "",
"mech": "幼穗冻伤、根系缺氧",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "拔节后遇 -1℃ 以下冻伤幼穗；积水 2–3 天黄叶死苗"
}
},
"id": "wheat-通用-0"
},
{
"name": "抽穗灌浆",
"from": "5上",
"to": "5中",
"precision": "tenday",
"days": "30–40 天",
"ops": "一喷三防、防赤霉病",
"perils": {
"rainy": {
"thr": "",
"mech": "赤霉病致籽粒皱缩带毒、逼熟",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "灌浆期 30℃ 以上 + 低湿 + 风，逼熟减产；连阴雨数值 —（库内未给数值）",
"rank": 2
},
"heat": {
"thr": "灌浆期 30℃ 以上 + 低湿 + 风，逼熟减产",
"mech": "赤霉病致籽粒皱缩带毒、逼熟",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "wheat-通用-1"
},
{
"name": "成熟收获",
"from": "5下",
"to": "6上",
"precision": "tenday",
"days": "蜡熟末期",
"ops": "抢晴机械收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "wheat-通用-2"
}
]
},
{
"name": "冬麦",
"stages": [
{
"name": "播种出苗",
"from": "10下",
"to": "11上",
"precision": "tenday",
"days": "6–10 天出苗",
"ops": "整地、适墒播种",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、黄叶死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 2–3 天黄叶死苗"
}
},
"id": "wheat-冬麦-0"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "抽穗灌浆",
"from": "5月",
"to": "5月",
"precision": "month",
"days": "30–40 天",
"ops": "一喷三防",
"perils": {
"rainy": {
"thr": "",
"mech": "赤霉病致籽粒皱缩带毒",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 2
}
},
"id": "wheat-通用-0"
},
{
"name": "成熟收获",
"from": "5月",
"to": "5月",
"precision": "month",
"days": "蜡熟末期",
"ops": "抢晴机械收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗发芽、霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "wheat-通用-1"
}
]
},
{
"name": "冬麦",
"stages": [
{
"name": "播种出苗",
"from": "10下",
"to": "11上",
"precision": "tenday",
"days": "6–10 天出苗",
"ops": "整地、适墒播种",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、黄叶死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 2–3 天黄叶死苗"
}
},
"id": "wheat-冬麦-0"
}
]
}
]
},
"south": {
"note": "原文\"极少种植/，热量充足但非主产区，几乎不种冬麦\"",
"plantable": false,
"seasons": []
}
}
},
"corn": {
"name": "玉米",
"regions": {
"northeast": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种出苗",
"from": "4下",
"to": "5上",
"precision": "tenday",
"days": "5–10 天",
"ops": "抢墒播种、封闭除草",
"perils": {
"frost": {
"thr": "",
"mech": "出苗不齐、粉种",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值；原文\"地温 ≥10℃\"为播种条件）"
}
},
"id": "corn-通用-0"
},
{
"name": "拔节期",
"from": "7上",
"to": "7上",
"precision": "tenday",
"days": "需 ≥500℃ 积温",
"ops": "重施穗肥",
"perils": {
"drought": {
"thr": "土壤含水量 <60% 即影响",
"mech": "节间缩短、株高不足",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text"
}
},
"id": "corn-通用-1"
},
{
"name": "抽雄吐丝",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "5–8 天",
"ops": "防旱、辅助授粉",
"perils": {
"drought": {
"thr": "土壤含水量 <60% 即影响",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"rank": 1
},
"heat": {
"thr": "吐丝期 >35℃ 致花粉失活、秃尖",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "corn-通用-2"
},
{
"name": "灌浆成熟",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "40–55 天",
"ops": "防早衰、适时收获",
"perils": {
"frost": {
"thr": "秋季早霜致灌浆不足（库内未给温度数值）",
"mech": "灌浆不足、倒伏",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "灌浆不足、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "秋季早霜致灌浆不足（库内未给温度数值）",
"thrShared": true,
"rank": 3
}
},
"id": "corn-通用-3"
}
]
}
]
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "抽雄吐丝",
"from": "8上",
"to": "8上",
"precision": "tenday",
"days": "5–8 天",
"ops": "防旱、辅助授粉",
"perils": {
"drought": {
"thr": "土壤含水量 <60% 即影响",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"rank": 1
},
"heat": {
"thr": "吐丝期 >35℃ 致花粉失活、秃尖",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "corn-通用-0"
},
{
"name": "灌浆成熟",
"from": "8中",
"to": "9下",
"precision": "tenday",
"days": "40–55 天",
"ops": "防早衰、适时收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗腐霉变、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "穗腐霉变、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
}
},
"id": "corn-通用-1"
},
{
"name": "成熟收获",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "库内未给",
"ops": "完熟期机收、烘干",
"perils": {
"rainy": {
"thr": "",
"mech": "籽粒霉变、破碎",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "corn-通用-2"
}
]
},
{
"name": "夏播",
"stages": [
{
"name": "播种出苗",
"from": "6上",
"to": "6中",
"precision": "tenday",
"days": "5–10 天",
"ops": "麦收后抢播、封闭除草",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 1–2 天即萎蔫，3 天以上死苗"
}
},
"id": "corn-夏播-0"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种出苗",
"from": "4下",
"to": "5上",
"precision": "tenday",
"days": "5–10 天",
"ops": "抢墒播种、封闭除草",
"perils": {
"frost": {
"thr": "",
"mech": "出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "corn-通用-0"
},
{
"name": "抽雄吐丝",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "5–8 天",
"ops": "防旱、辅助授粉",
"perils": {
"drought": {
"thr": "土壤含水量 <60% 即影响",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"rank": 1
},
"heat": {
"thr": "吐丝期 >35℃ 致花粉失活、秃尖",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "corn-通用-1"
},
{
"name": "灌浆成熟",
"from": "9月",
"to": "9月",
"precision": "month",
"days": "40–55 天",
"ops": "防早衰、适时收获",
"perils": {
"frost": {
"thr": "秋季早霜致灌浆不足（库内未给温度数值）",
"mech": "灌浆不足、青秕",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text"
}
},
"id": "corn-通用-2"
}
]
}
]
},
"tibet": {
"note": "原文\"极少种植/，高寒，仅零星\"",
"plantable": false,
"seasons": []
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "抽雄吐丝",
"from": "8月",
"to": "8月",
"precision": "month",
"days": "5–8 天",
"ops": "防旱、辅助授粉",
"perils": {
"drought": {
"thr": "土壤含水量 <60% 即影响",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"rank": 1
},
"heat": {
"thr": "吐丝期 >35℃ 致花粉失活、秃尖",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "corn-通用-0"
},
{
"name": "灌浆成熟",
"from": "9月",
"to": "9月",
"precision": "month",
"days": "40–55 天",
"ops": "防早衰、适时收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗腐、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "穗腐、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
}
},
"id": "corn-通用-1"
}
]
},
{
"name": "夏播",
"stages": [
{
"name": "播种出苗",
"from": "6上",
"to": "6中",
"precision": "tenday",
"days": "5–10 天",
"ops": "抢播、封闭除草",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 1–2 天即萎蔫，3 天以上死苗"
}
},
"id": "corn-夏播-0"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "抽雄吐丝",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "5–8 天",
"ops": "防旱、辅助授粉",
"perils": {
"drought": {
"thr": "土壤含水量 <60% 即影响",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"rank": 1
},
"heat": {
"thr": "吐丝期 >35℃ 致花粉失活、秃尖",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "corn-通用-0"
},
{
"name": "灌浆成熟",
"from": "8下",
"to": "9月",
"precision": "mixed",
"days": "40–55 天",
"ops": "防早衰、适时收获",
"perils": {
"rainy": {
"thr": "",
"mech": "穗腐霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "corn-通用-1"
}
]
},
{
"name": "春播",
"stages": [
{
"name": "播种出苗",
"from": "3下",
"to": "4上",
"precision": "tenday",
"days": "5–10 天",
"ops": "抢墒播种、封闭除草",
"perils": {
"drought": {
"thr": "土壤含水量 <60% 即影响",
"mech": "出苗不齐",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text"
}
},
"id": "corn-春播-0"
}
]
},
{
"name": "夏播",
"stages": [
{
"name": "播种出苗",
"from": "6月",
"to": "6月",
"precision": "month",
"days": "5–10 天",
"ops": "抢播、封闭除草",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 1–2 天即萎蔫，3 天以上死苗"
}
},
"id": "corn-夏播-0"
}
]
}
]
},
"south": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "抽雄吐丝",
"from": "6月",
"to": "9月",
"precision": "month",
"days": "5–8 天",
"ops": "防旱、辅助授粉",
"perils": {
"drought": {
"thr": "土壤含水量 <60% 即影响",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "soil",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"rank": 1
},
"heat": {
"thr": "吐丝期 >35℃ 致花粉失活、秃尖",
"mech": "花粉失活、缺粒秃尖",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "corn-通用-0"
}
]
},
{
"name": "春播",
"stages": [
{
"name": "播种出苗",
"from": "2月",
"to": "3月",
"precision": "month",
"days": "5–10 天",
"ops": "抢墒播种、封闭除草",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 1–2 天即萎蔫，3 天以上死苗"
}
},
"id": "corn-春播-0"
},
{
"name": "成熟收获",
"from": "7月",
"to": "7月",
"precision": "month",
"days": "40–55 天",
"ops": "适时收获、烘干",
"perils": {
"rainy": {
"thr": "",
"mech": "穗腐霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "corn-春播-1"
}
]
},
{
"name": "秋播",
"stages": [
{
"name": "播种出苗",
"from": "7月",
"to": "8月",
"precision": "month",
"days": "5–10 天",
"ops": "抢播、封闭除草",
"perils": {
"heat": {
"thr": "",
"mech": "出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"storm": {
"thr": "",
"mech": "出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "corn-秋播-0"
},
{
"name": "成熟收获",
"from": "11月",
"to": "11月",
"precision": "month",
"days": "40–55 天",
"ops": "适时收获、烘干",
"perils": {
"rainy": {
"thr": "",
"mech": "穗腐霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "corn-秋播-1"
}
]
}
]
}
}
},
"soybean": {
"name": "大豆",
"regions": {
"northeast": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种出苗",
"from": "5上",
"to": "5中",
"precision": "tenday",
"days": "5–10 天",
"ops": "拌种、足墒播种",
"perils": {
"frost": {
"thr": "",
"mech": "出苗不齐、烂种",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值；原文\"地温 ≥10℃\"为播种条件）"
}
},
"id": "soybean-通用-0"
},
{
"name": "开花结荚",
"from": "7中",
"to": "7中",
"precision": "tenday",
"days": "25–35 天",
"ops": "防旱、叶面肥",
"perils": {
"drought": {
"thr": "",
"mech": "落花落荚、花荚脱落",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "开花期 >35℃ 致落花落荚；干旱 —（库内未给数值）",
"rank": 1
},
"heat": {
"thr": "开花期 >35℃ 致落花落荚",
"mech": "落花落荚、花荚脱落",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "soybean-通用-1"
},
{
"name": "鼓粒期",
"from": "8中",
"to": "9上",
"precision": "tenday",
"days": "30–40 天",
"ops": "保叶、防早衰",
"perils": {
"drought": {
"thr": "",
"mech": "瘪粒、\"荚而不实\"",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "瘪粒、\"荚而不实\"",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）",
"thrShared": true,
"rank": 2
}
},
"id": "soybean-通用-2"
},
{
"name": "成熟收获",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "黄熟末期",
"ops": "适期机收",
"perils": {
"frost": {
"thr": "",
"mech": "鼓粒不足、裂荚霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "鼓粒不足、裂荚霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "soybean-通用-3"
}
]
}
]
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "开花结荚",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "25–35 天",
"ops": "防旱、叶面肥",
"perils": {
"drought": {
"thr": "",
"mech": "落花落荚",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "开花期 >35℃ 致落花落荚",
"thrShared": true,
"rank": 1
},
"heat": {
"thr": "开花期 >35℃ 致落花落荚",
"mech": "落花落荚",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"thrShared": true
}
},
"id": "soybean-通用-0"
},
{
"name": "鼓粒期",
"from": "8下",
"to": "9上",
"precision": "tenday",
"days": "30–40 天",
"ops": "保叶、防早衰",
"perils": {
"drought": {
"thr": "",
"mech": "瘪粒、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "瘪粒、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）",
"thrShared": true,
"rank": 2
}
},
"id": "soybean-通用-1"
},
{
"name": "成熟收获",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "黄熟末期",
"ops": "适期机收",
"perils": {
"rainy": {
"thr": "",
"mech": "裂荚霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "soybean-通用-2"
}
]
},
{
"name": "夏播",
"stages": [
{
"name": "播种出苗",
"from": "6中",
"to": "6下",
"precision": "tenday",
"days": "5–10 天",
"ops": "麦茬抢播、拌种",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 1–2 天黄叶，3 天以上死苗"
}
},
"id": "soybean-夏播-0"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种出苗",
"from": "4下",
"to": "5上",
"precision": "tenday",
"days": "5–10 天",
"ops": "拌种、足墒播种",
"perils": {
"drought": {
"thr": "",
"mech": "出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）"
}
},
"id": "soybean-通用-0"
},
{
"name": "开花结荚",
"from": "7月",
"to": "7月",
"precision": "month",
"days": "25–35 天",
"ops": "防旱、叶面肥",
"perils": {
"drought": {
"thr": "",
"mech": "落花落荚",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "开花期 >35℃ 致落花落荚",
"thrShared": true,
"rank": 1
},
"heat": {
"thr": "开花期 >35℃ 致落花落荚",
"mech": "落花落荚",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"thrShared": true
}
},
"id": "soybean-通用-1"
},
{
"name": "鼓粒期",
"from": "8月",
"to": "8月",
"precision": "month",
"days": "30–40 天",
"ops": "保叶、防早衰",
"perils": {
"drought": {
"thr": "",
"mech": "瘪粒",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）"
}
},
"id": "soybean-通用-2"
},
{
"name": "成熟收获",
"from": "9月",
"to": "9月",
"precision": "month",
"days": "黄熟末期",
"ops": "适期机收",
"perils": {
"frost": {
"thr": "",
"mech": "鼓粒不足",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "soybean-通用-3"
}
]
}
]
},
"tibet": {
"note": "原文\"极少种植/，高寒零星\"",
"plantable": false,
"seasons": []
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "开花结荚",
"from": "7下",
"to": "8上",
"precision": "tenday",
"days": "25–35 天",
"ops": "防旱、叶面肥",
"perils": {
"drought": {
"thr": "",
"mech": "落花落荚",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "开花期 >35℃ 致落花落荚",
"thrShared": true,
"rank": 1
},
"heat": {
"thr": "开花期 >35℃ 致落花落荚",
"mech": "落花落荚",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"thrShared": true
}
},
"id": "soybean-通用-0"
},
{
"name": "鼓粒期",
"from": "8下",
"to": "9上",
"precision": "tenday",
"days": "30–40 天",
"ops": "保叶、防早衰",
"perils": {
"drought": {
"thr": "",
"mech": "瘪粒、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "瘪粒、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）",
"thrShared": true,
"rank": 2
}
},
"id": "soybean-通用-1"
},
{
"name": "成熟收获",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "黄熟末期",
"ops": "适期机收",
"perils": {
"rainy": {
"thr": "",
"mech": "裂荚霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "soybean-通用-2"
}
]
},
{
"name": "夏播",
"stages": [
{
"name": "播种出苗",
"from": "6上",
"to": "6中",
"precision": "tenday",
"days": "5–10 天",
"ops": "抢播、拌种",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 1–2 天黄叶，3 天以上死苗"
}
},
"id": "soybean-夏播-0"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "开花结荚",
"from": "8月",
"to": "8月",
"precision": "month",
"days": "25–35 天",
"ops": "防旱、叶面肥",
"perils": {
"drought": {
"thr": "",
"mech": "落花落荚",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "开花期 >35℃ 致落花落荚",
"thrShared": true,
"rank": 1
},
"heat": {
"thr": "开花期 >35℃ 致落花落荚",
"mech": "落花落荚",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"thrShared": true
}
},
"id": "soybean-通用-0"
},
{
"name": "鼓粒期",
"from": "9月",
"to": "9月",
"precision": "month",
"days": "30–40 天",
"ops": "保叶、防早衰",
"perils": {
"drought": {
"thr": "",
"mech": "瘪粒",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱 —（库内未给数值）"
}
},
"id": "soybean-通用-1"
},
{
"name": "成熟收获",
"from": "10月",
"to": "10月",
"precision": "month",
"days": "黄熟末期",
"ops": "适期机收",
"perils": {
"rainy": {
"thr": "",
"mech": "裂荚霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "soybean-通用-2"
}
]
},
{
"name": "夏秋播",
"stages": [
{
"name": "播种出苗",
"from": "6月",
"to": "7月",
"precision": "month",
"days": "5–10 天",
"ops": "抢播、拌种",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 1–2 天黄叶，3 天以上死苗"
}
},
"id": "soybean-夏秋播-0"
}
]
}
]
},
"south": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "开花结荚",
"from": "5月",
"to": "5月",
"precision": "month",
"days": "25–35 天",
"ops": "防旱、叶面肥",
"perils": {
"heat": {
"thr": "开花期 >35℃ 致落花落荚",
"mech": "落花落荚",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "soybean-通用-0"
}
]
},
{
"name": "春播",
"stages": [
{
"name": "播种出苗",
"from": "2月",
"to": "3月",
"precision": "month",
"days": "5–10 天",
"ops": "抢播、拌种",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "积水 1–2 天黄叶，3 天以上死苗"
}
},
"id": "soybean-春播-0"
},
{
"name": "成熟收获",
"from": "7月",
"to": "7月",
"precision": "month",
"days": "黄熟末期",
"ops": "适期机收",
"perils": {
"rainy": {
"thr": "",
"mech": "裂荚霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "soybean-春播-1"
}
]
},
{
"name": "秋播",
"stages": [
{
"name": "播种出苗",
"from": "7月",
"to": "8月",
"precision": "month",
"days": "5–10 天",
"ops": "抢播、拌种",
"perils": {
"storm": {
"thr": "",
"mech": "出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "soybean-秋播-0"
},
{
"name": "开花结荚",
"from": "9月",
"to": "9月",
"precision": "month",
"days": "25–35 天",
"ops": "防旱、叶面肥",
"perils": {
"heat": {
"thr": "开花期 >35℃ 致落花落荚",
"mech": "落花落荚",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "soybean-秋播-1"
},
{
"name": "成熟收获",
"from": "11月",
"to": "11月",
"precision": "month",
"days": "黄熟末期",
"ops": "适期机收",
"perils": {
"rainy": {
"thr": "",
"mech": "裂荚霉变",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "soybean-秋播-2"
}
]
}
]
}
}
},
"cotton": {
"name": "棉花",
"regions": {
"northeast": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "苗期",
"from": "5月",
"to": "6上",
"precision": "mixed",
"days": "40–50 天",
"ops": "查苗补苗、中耕、治蚜",
"perils": {
"frost": {
"thr": "",
"mech": "弱苗、病害",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "弱苗、病害",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 2
}
},
"id": "cotton-通用-0"
},
{
"name": "花铃期",
"from": "7月",
"to": "8月",
"precision": "month",
"days": "50–60 天",
"ops": "重施肥、灌水、治棉铃虫",
"perils": {
"drought": {
"thr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉",
"mech": "蕾铃脱落、花粉败育",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示",
"rank": 1
},
"heat": {
"thr": "日均温>35℃花粉败育、蕾铃脱落",
"mech": "蕾铃脱落、花粉败育",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "cotton-通用-1"
},
{
"name": "吐絮期",
"from": "9月",
"to": "10上",
"precision": "mixed",
"days": "40–60 天",
"ops": "分次采摘、催熟",
"perils": {
"frost": {
"thr": "秋季早霜影响吐絮（库内未给温度数值）",
"mech": "吐絮不畅、霜后花",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "cotton-通用-2"
}
]
},
{
"name": "辽南特早熟棉",
"stages": [
{
"name": "播种",
"from": "4下",
"to": "5上",
"precision": "tenday",
"days": "库内未给",
"ops": "备耕整地、地膜覆盖增温",
"perils": {
"frost": {
"thr": "苗期霜冻死苗（库内未给温度数值）",
"mech": "死苗、缺苗",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text"
}
},
"id": "cotton-辽南特早熟棉-0"
}
]
}
]
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种",
"from": "4中",
"to": "5上",
"precision": "tenday",
"days": "库内未给",
"ops": "直播、地膜覆盖增温保墒",
"perils": {
"frost": {
"thr": "",
"mech": "出苗不齐、烂种",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值；原文\"5cm 地温稳定通过 12–14℃ 时播种\"）"
}
},
"id": "cotton-通用-0"
},
{
"name": "苗期",
"from": "5月",
"to": "6上",
"precision": "mixed",
"days": "40–50 天",
"ops": "查苗补苗、中耕、治蚜",
"perils": {
"frost": {
"thr": "",
"mech": "弱苗、立枯炭疽",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "弱苗、立枯炭疽",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 2
}
},
"id": "cotton-通用-1"
},
{
"name": "蕾期",
"from": "6上",
"to": "7上",
"precision": "tenday",
"days": "25–30 天",
"ops": "化控（缩节胺）、整枝、防虫",
"perils": {
"drought": {
"thr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉",
"mech": "蕾脱落",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
}
},
"id": "cotton-通用-2"
},
{
"name": "花铃期",
"from": "7上",
"to": "8下",
"precision": "tenday",
"days": "50–60 天",
"ops": "重施肥、灌水、治棉铃虫/红蜘蛛",
"perils": {
"drought": {
"thr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉",
"mech": "蕾铃脱落、花粉败育、烂根",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示",
"rank": 1
},
"heat": {
"thr": "日均温>35℃花粉败育、蕾铃脱落",
"mech": "蕾铃脱落、花粉败育、烂根",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
},
"rainy": {
"thr": "",
"mech": "蕾铃脱落、花粉败育、烂根",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉；日均温>35℃花粉败育、蕾铃脱落；田间积水≤1–2 天尚可恢复"
}
},
"id": "cotton-通用-3"
},
{
"name": "吐絮期",
"from": "8下",
"to": "10上",
"precision": "tenday",
"days": "40–60 天",
"ops": "分次采摘、催熟、防烂铃",
"perils": {
"rainy": {
"thr": "",
"mech": "烂铃、霜后花、纤维劣化",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "连阴雨 —（库内未给数值）；秋季早霜影响吐絮（未给温度）",
"rank": 3
},
"frost": {
"thr": "秋季早霜影响吐絮（未给温度）",
"mech": "烂铃、霜后花、纤维劣化",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"seasonMismatch": "霜冻/冻害阈值挂在该阶段（8 月），非霜期",
"seasonMismatchLevel": "suspected"
}
},
"id": "cotton-通用-4"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种",
"from": "4上",
"to": "4中",
"precision": "tenday",
"days": "库内未给",
"ops": "直播、\"矮密早\"栽培",
"perils": {
"frost": {
"thr": "",
"mech": "出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "cotton-通用-0"
},
{
"name": "苗期",
"from": "4下",
"to": "6上",
"precision": "tenday",
"days": "40–50 天",
"ops": "查苗补苗、中耕、治蚜",
"perils": {
"frost": {
"thr": "",
"mech": "弱苗、缺苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "弱苗、缺苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "cotton-通用-1"
},
{
"name": "花铃期",
"from": "7月",
"to": "8月",
"precision": "month",
"days": "50–60 天",
"ops": "水肥一体化、重施花铃肥",
"perils": {
"drought": {
"thr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉",
"mech": "蕾铃脱落、花粉败育",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示",
"rank": 1
},
"heat": {
"thr": "日均温>35℃花粉败育、蕾铃脱落",
"mech": "蕾铃脱落、花粉败育",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "cotton-通用-2"
},
{
"name": "吐絮期",
"from": "9月",
"to": "10月",
"precision": "month",
"days": "40–60 天",
"ops": "分次采摘、催熟",
"perils": {
"frost": {
"thr": "秋季早霜影响吐絮（库内未给温度数值）",
"mech": "吐絮不畅、霜后花",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "cotton-通用-3"
}
]
}
]
},
"tibet": {
"note": "原文\"极少种植/，高寒、无霜期短、积温不足\"",
"plantable": false,
"seasons": []
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "播种/移栽",
"from": "4下",
"to": "5上",
"precision": "tenday",
"days": "库内未给",
"ops": "直播或麦后移栽",
"perils": {
"rainy": {
"thr": "",
"mech": "烂根、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "田间积水≤1–2 天尚可恢复"
}
},
"id": "cotton-通用-0"
},
{
"name": "苗期",
"from": "5月",
"to": "6上",
"precision": "mixed",
"days": "40–50 天",
"ops": "查苗补苗、中耕、治蚜",
"perils": {
"rainy": {
"thr": "",
"mech": "弱苗、病害",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "田间积水≤1–2 天尚可恢复",
"thrShared": true,
"rank": 2
},
"frost": {
"thr": "",
"mech": "弱苗、病害",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "田间积水≤1–2 天尚可恢复",
"thrShared": true
}
},
"id": "cotton-通用-1"
},
{
"name": "花铃期",
"from": "7月",
"to": "8月",
"precision": "month",
"days": "50–60 天",
"ops": "重施肥、灌水、治棉铃虫",
"perils": {
"drought": {
"thr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉",
"mech": "蕾铃脱落、烂铃",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示",
"thrShared": true,
"rank": 1
},
"heat": {
"thr": "日均温>35℃花粉败育、蕾铃脱落",
"mech": "蕾铃脱落、烂铃",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "蕾铃脱落、烂铃",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉；日均温>35℃花粉败育、蕾铃脱落",
"thrShared": true
}
},
"id": "cotton-通用-2"
},
{
"name": "吐絮期",
"from": "9月",
"to": "10上",
"precision": "mixed",
"days": "40–60 天",
"ops": "分次采摘、防烂铃、清沟防渍",
"perils": {
"rainy": {
"thr": "",
"mech": "烂铃、纤维劣化",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "cotton-通用-3"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "苗期",
"from": "5月",
"to": "6月",
"precision": "month",
"days": "40–50 天",
"ops": "查苗补苗、中耕、治蚜",
"perils": {
"rainy": {
"thr": "",
"mech": "弱苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "田间积水≤1–2 天尚可恢复",
"rank": 2
}
},
"id": "cotton-通用-0"
},
{
"name": "花铃期",
"from": "7月",
"to": "8月",
"precision": "month",
"days": "50–60 天",
"ops": "重施肥、灌水、治棉铃虫",
"perils": {
"drought": {
"thr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉",
"mech": "蕾铃脱落、烂铃",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示",
"thrShared": true,
"rank": 1
},
"heat": {
"thr": "日均温>35℃花粉败育、蕾铃脱落",
"mech": "蕾铃脱落、烂铃",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "蕾铃脱落、烂铃",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "0–40cm 土层含水低于田间持水量 60% 即需灌溉；日均温>35℃花粉败育、蕾铃脱落",
"thrShared": true
}
},
"id": "cotton-通用-1"
},
{
"name": "吐絮期",
"from": "9月",
"to": "10月",
"precision": "month",
"days": "40–60 天",
"ops": "分次采摘、防烂铃",
"perils": {
"rainy": {
"thr": "",
"mech": "烂铃",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "cotton-通用-2"
}
]
},
{
"name": "四川盆地零星",
"stages": [
{
"name": "播种",
"from": "4下",
"to": "4下",
"precision": "tenday",
"days": "库内未给",
"ops": "备耕整地、施基肥",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "田间积水≤1–2 天尚可恢复"
}
},
"id": "cotton-四川盆地零星-0"
}
]
}
]
},
"south": {
"note": "原文\"极少种植/，热量过旺、病虫重、纤维偏短，非主产\"",
"plantable": false,
"seasons": []
}
}
},
"rape": {
"name": "油菜",
"regions": {
"northeast": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "苗期",
"from": "5月",
"to": "6月",
"precision": "month",
"days": "50–70 天",
"ops": "间苗、定苗",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "弱苗、苗期生长受阻",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
}
},
"id": "rape-通用-0"
},
{
"name": "蕾薹期",
"from": "7月",
"to": "7月",
"precision": "month",
"days": "30–40 天",
"ops": "追薹肥、喷硼",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "花而不实、落蕾",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
},
"storm": {
"thr": "",
"mech": "花而不实、落蕾",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "根层土壤含水<60% 灌水；冰雹 —（库内未给数值）",
"note": "原文含冰雹；平台无独立雹灾键，按暴雨洪涝类归集"
}
},
"id": "rape-通用-1"
},
{
"name": "花期",
"from": "7下",
"to": "8月",
"precision": "mixed",
"days": "25–35 天",
"ops": "防病虫、防渍",
"perils": {
"rainy": {
"thr": "",
"mech": "菌核病、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 1
}
},
"id": "rape-通用-2"
},
{
"name": "角果成熟期",
"from": "8月",
"to": "9月",
"precision": "month",
"days": "30–40 天",
"ops": "排水、适期收获",
"perils": {
"frost": {
"thr": "早春倒春寒致死苗冻花",
"mech": "逼熟、籽粒不饱满",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text"
},
"heat": {
"thr": "成熟期>30℃逼熟减产",
"mech": "逼熟、籽粒不饱满",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text"
}
},
"id": "rape-通用-3"
}
]
},
{
"name": "春油菜",
"stages": [
{
"name": "播种",
"from": "3下",
"to": "4下",
"precision": "tenday",
"days": "库内未给",
"ops": "整地、施基肥、适期播种",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "出苗不齐",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
}
},
"id": "rape-春油菜-0"
}
]
}
]
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "越冬期",
"from": "12中",
"to": "2中",
"precision": "tenday",
"days": "50–70 天",
"ops": "冻前培土壅根、清沟降湿",
"perils": {
"frost": {
"thr": "越冬期-5℃以下、早春倒春寒致死苗冻花",
"mech": "死苗、叶片冻伤",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"rank": 2
}
},
"id": "rape-通用-0"
},
{
"name": "蕾薹期",
"from": "2下",
"to": "3月",
"precision": "mixed",
"days": "30–40 天",
"ops": "追薹肥、喷硼",
"perils": {
"frost": {
"thr": "早春倒春寒致死苗冻花",
"mech": "冻花、花而不实",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text"
},
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "冻花、花而不实",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
}
},
"id": "rape-通用-1"
},
{
"name": "花期",
"from": "3下",
"to": "4月",
"precision": "mixed",
"days": "25–35 天",
"ops": "清沟排渍、防菌核病",
"perils": {
"rainy": {
"thr": "",
"mech": "菌核病暴发、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 1
}
},
"id": "rape-通用-2"
},
{
"name": "角果成熟期",
"from": "4下",
"to": "5月",
"precision": "mixed",
"days": "30–40 天",
"ops": "排水、适期收获",
"perils": {
"heat": {
"thr": "成熟期>30℃逼熟减产",
"mech": "逼熟、角果发芽",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "逼熟、角果发芽",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "成熟期>30℃逼熟减产",
"thrShared": true,
"rank": 3
}
},
"id": "rape-通用-3"
}
]
},
{
"name": "黄淮冬油菜",
"stages": [
{
"name": "播种",
"from": "9下",
"to": "10上",
"precision": "tenday",
"days": "库内未给",
"ops": "整地、施基肥、适期播种",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "出苗不齐",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
}
},
"id": "rape-黄淮冬油菜-0"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "苗期",
"from": "5月",
"to": "6月",
"precision": "month",
"days": "50–70 天",
"ops": "间苗、定苗、冬前培土",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "弱苗",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
}
},
"id": "rape-通用-0"
},
{
"name": "花期",
"from": "7月",
"to": "8月",
"precision": "month",
"days": "25–35 天",
"ops": "防病虫、防渍",
"perils": {
"rainy": {
"thr": "",
"mech": "菌核病、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 1
}
},
"id": "rape-通用-1"
},
{
"name": "角果成熟期",
"from": "8月",
"to": "9月",
"precision": "month",
"days": "30–40 天",
"ops": "排水、适期收获",
"perils": {
"frost": {
"thr": "",
"mech": "逼熟、籽粒不饱满",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "成熟期>30℃逼熟减产",
"thrShared": true
},
"heat": {
"thr": "成熟期>30℃逼熟减产",
"mech": "逼熟、籽粒不饱满",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"thrShared": true
}
},
"id": "rape-通用-2"
}
]
},
{
"name": "春油菜",
"stages": [
{
"name": "播种",
"from": "3下",
"to": "4月",
"precision": "mixed",
"days": "库内未给",
"ops": "整地、施基肥、适期播种",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "出苗不齐",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
}
},
"id": "rape-春油菜-0"
}
]
}
]
},
"tibet": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "苗期",
"from": "6月",
"to": "7月",
"precision": "month",
"days": "50–70 天",
"ops": "间苗、定苗",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "弱苗",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
}
},
"id": "rape-通用-0"
},
{
"name": "花期",
"from": "7下",
"to": "8月",
"precision": "mixed",
"days": "25–35 天",
"ops": "防病虫、防渍",
"perils": {
"rainy": {
"thr": "",
"mech": "菌核病、冻花",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 1
},
"frost": {
"thr": "",
"mech": "菌核病、冻花",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "rape-通用-1"
},
{
"name": "角果成熟期",
"from": "8月",
"to": "9月",
"precision": "month",
"days": "30–40 天",
"ops": "排水、适期收获",
"perils": {
"frost": {
"thr": "",
"mech": "籽粒不饱满",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "rape-通用-2"
}
]
},
{
"name": "春油菜，短生育期",
"stages": [
{
"name": "播种",
"from": "4月",
"to": "5月",
"precision": "month",
"days": "库内未给",
"ops": "整地、施基肥、适期播种",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "出苗不齐、弱苗",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示",
"thrShared": true
},
"frost": {
"thr": "",
"mech": "出苗不齐、弱苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "根层土壤含水<60% 灌水",
"thrShared": true
}
},
"id": "rape-春油菜，短生育期-0"
}
]
}
]
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "越冬期",
"from": "12中",
"to": "2中",
"precision": "tenday",
"days": "50–70 天",
"ops": "冻前培土壅根、清沟降湿",
"perils": {
"frost": {
"thr": "越冬期-5℃以下、早春倒春寒致死苗冻花",
"mech": "死苗、冻害",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"rank": 2
}
},
"id": "rape-通用-0"
},
{
"name": "蕾薹期",
"from": "2下",
"to": "3下",
"precision": "tenday",
"days": "30–40 天",
"ops": "追薹肥、喷硼",
"perils": {
"frost": {
"thr": "早春倒春寒致死苗冻花",
"mech": "冻花、花而不实",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "冻花、花而不实",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "早春倒春寒致死苗冻花",
"thrShared": true
}
},
"id": "rape-通用-1"
},
{
"name": "花期",
"from": "3下",
"to": "4下",
"precision": "tenday",
"days": "25–35 天",
"ops": "清沟排渍、防治菌核病蚜虫",
"perils": {
"rainy": {
"thr": "",
"mech": "菌核病暴发、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 1
}
},
"id": "rape-通用-2"
},
{
"name": "角果成熟期",
"from": "4下",
"to": "5下",
"precision": "tenday",
"days": "30–40 天",
"ops": "排水、适期收获",
"perils": {
"heat": {
"thr": "成熟期>30℃逼熟减产",
"mech": "逼熟、角果发芽",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "逼熟、角果发芽",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "成熟期>30℃逼熟减产",
"thrShared": true,
"rank": 3
}
},
"id": "rape-通用-3"
}
]
},
{
"name": "冬油菜",
"stages": [
{
"name": "播种",
"from": "9下",
"to": "10中",
"precision": "tenday",
"days": "库内未给",
"ops": "整地、施基肥、适期播种",
"perils": {
"drought": {
"thr": "根层土壤含水<60% 灌水",
"mech": "出苗不齐、烂种",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "出苗不齐、烂种",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "根层土壤含水<60% 灌水",
"thrShared": true
}
},
"id": "rape-冬油菜-0"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "越冬期",
"from": "12月",
"to": "2月",
"precision": "month",
"days": "50–70 天",
"ops": "冻前培土壅根、清沟降湿",
"perils": {
"frost": {
"thr": "越冬期-5℃以下、早春倒春寒致死苗冻花",
"mech": "死苗",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"rank": 2
}
},
"id": "rape-通用-0"
},
{
"name": "蕾薹期",
"from": "2下",
"to": "3月",
"precision": "mixed",
"days": "30–40 天",
"ops": "追薹肥、喷硼",
"perils": {
"frost": {
"thr": "早春倒春寒致死苗冻花",
"mech": "冻花、花而不实",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text"
}
},
"id": "rape-通用-1"
},
{
"name": "花期",
"from": "3下",
"to": "4月",
"precision": "mixed",
"days": "25–35 天",
"ops": "清沟排渍、防菌核病",
"perils": {
"rainy": {
"thr": "",
"mech": "菌核病暴发、倒伏",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 1
}
},
"id": "rape-通用-2"
},
{
"name": "角果成熟期",
"from": "4下",
"to": "5月",
"precision": "mixed",
"days": "30–40 天",
"ops": "排水、适期收获",
"perils": {
"heat": {
"thr": "成熟期>30℃逼熟减产",
"mech": "逼熟、角果发芽",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 1,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "逼熟、角果发芽",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "成熟期>30℃逼熟减产",
"thrShared": true,
"rank": 3
}
},
"id": "rape-通用-3"
}
]
},
{
"name": "冬油菜",
"stages": [
{
"name": "播种",
"from": "9下",
"to": "10中",
"precision": "tenday",
"days": "库内未给",
"ops": "整地、施基肥、适期播种",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、出苗不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "rape-冬油菜-0"
}
]
}
]
},
"south": {
"note": "原文\"极少种植…热量偏高、多秋发，非主产\"",
"plantable": false,
"seasons": []
}
}
},
"sugarcane": {
"name": "甘蔗",
"regions": {
"northeast": {
"note": "原文\"极少种植/，无霜期短、积温不足\"",
"plantable": false,
"seasons": []
},
"huanghuai": {
"note": "原文\"极少/河北南缘零星，热量临界，非主产\"",
"plantable": false,
"seasons": []
},
"northwest": {
"note": "原文\"极少/南疆极零星，非主产\"",
"plantable": false,
"seasons": []
},
"tibet": {
"note": "原文\"极少种植/，高寒\"",
"plantable": false,
"seasons": []
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽期",
"from": "相对（植后 0–40 天）",
"to": "相对（植后 0–40 天）",
"precision": "relative",
"days": "30–45 天",
"ops": "查苗补种、除草",
"perils": {
"frost": {
"thr": "",
"mech": "萌芽率低、缺苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "sugarcane-通用-0"
},
{
"name": "幼苗/分蘖期",
"from": "相对（植后 40–120 天）",
"to": "相对（植后 40–120 天）",
"precision": "relative",
"days": "70–90 天",
"ops": "间苗、施肥、培土",
"perils": {
"rainy": {
"thr": "",
"mech": "分蘖少、烂根",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "sugarcane-通用-1"
},
{
"name": "伸长期",
"from": "5月",
"to": "10月",
"precision": "month",
"days": "100–130 天",
"ops": "大培土、重肥水、防倒",
"perils": {
"drought": {
"thr": "根层含水<60% 灌水",
"mech": "节间缩短、倒伏折断",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
},
"wind": {
"thr": "",
"mech": "节间缩短、倒伏折断",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "根层含水<60% 灌水；台风/大风 —（库内未给数值）",
"rank": 1
}
},
"id": "sugarcane-通用-2"
},
{
"name": "成熟期",
"from": "11月",
"to": "2月",
"precision": "month",
"days": "80–100 天",
"ops": "停肥控水、砍收",
"perils": {
"frost": {
"thr": "<0℃冻伤蔗茎，影响榨季",
"mech": "糖分下降、蔗茎冻伤",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"rank": 2
},
"rainy": {
"thr": "",
"mech": "糖分下降、蔗茎冻伤",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "<0℃冻伤蔗茎，影响榨季；连阴雨 —（库内未给数值）"
}
},
"id": "sugarcane-通用-3"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "伸长期",
"from": "5月",
"to": "10月",
"precision": "month",
"days": "100–130 天",
"ops": "大培土、重肥水、防倒",
"perils": {
"drought": {
"thr": "根层含水<60% 灌水",
"mech": "节间缩短、倒伏折断",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
},
"wind": {
"thr": "",
"mech": "节间缩短、倒伏折断",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "根层含水<60% 灌水；台风/大风 —（库内未给数值）",
"rank": 1
}
},
"id": "sugarcane-通用-0"
},
{
"name": "成熟期",
"from": "11月",
"to": "2月",
"precision": "month",
"days": "80–100 天",
"ops": "停肥控水、砍收",
"perils": {
"frost": {
"thr": "<0℃冻伤蔗茎，影响榨季",
"mech": "糖分下降、蔗茎冻伤",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true,
"rank": 2
},
"rainy": {
"thr": "",
"mech": "糖分下降、蔗茎冻伤",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "<0℃冻伤蔗茎，影响榨季",
"thrShared": true
}
},
"id": "sugarcane-通用-1"
}
]
},
{
"name": "春植",
"stages": [
{
"name": "播种",
"from": "2月",
"to": "4月",
"precision": "month",
"days": "库内未给",
"ops": "春植蔗播种、宿根破垄松蔸",
"perils": {
"drought": {
"thr": "",
"mech": "萌芽率低、缺苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"frost": {
"thr": "",
"mech": "萌芽率低、缺苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "sugarcane-春植-0"
}
]
},
{
"name": "秋植",
"stages": [
{
"name": "播种",
"from": "8月",
"to": "9月",
"precision": "month",
"days": "库内未给",
"ops": "秋植、查苗补缺",
"perils": {
"rainy": {
"thr": "",
"mech": "烂种、缺苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "sugarcane-秋植-0"
}
]
}
]
},
"south": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "伸长期",
"from": "5月",
"to": "10月",
"precision": "month",
"days": "100–130 天",
"ops": "大培土、重肥水、防倒",
"perils": {
"drought": {
"thr": "根层含水<60% 灌水",
"mech": "节间缩短、倒伏折断",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"useAs": "serviceTrigger",
"useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于灌溉/防冻等风险减量服务提示"
},
"wind": {
"thr": "",
"mech": "节间缩短、倒伏折断",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "根层含水<60% 灌水；台风/大风 —（库内未给数值）",
"rank": 1
}
},
"id": "sugarcane-通用-0"
}
]
},
{
"name": "春植",
"stages": [
{
"name": "播种",
"from": "2月",
"to": "4月",
"precision": "month",
"days": "库内未给",
"ops": "春植蔗播种、宿根破垄松蔸",
"perils": {
"drought": {
"thr": "",
"mech": "萌芽率低、缺苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "sugarcane-春植-0"
}
]
},
{
"name": "秋植",
"stages": [
{
"name": "播种",
"from": "8月",
"to": "9月",
"precision": "month",
"days": "库内未给",
"ops": "秋植、查苗补缺",
"perils": {
"wind": {
"thr": "",
"mech": "倒伏、烂种",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "台风/大风 —（库内未给数值）",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "倒伏、烂种",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "台风/大风 —（库内未给数值）",
"thrShared": true
}
},
"id": "sugarcane-秋植-0"
}
]
},
{
"name": "含宿根连年",
"stages": [
{
"name": "成熟期",
"from": "11月",
"to": "3月",
"precision": "month",
"days": "80–100 天",
"ops": "停肥控水、砍收、留宿根",
"perils": {
"frost": {
"thr": "<0℃冻伤蔗茎，影响榨季",
"mech": "糖分下降、蔗茎冻伤",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true,
"rank": 2
},
"rainy": {
"thr": "",
"mech": "糖分下降、蔗茎冻伤",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "<0℃冻伤蔗茎，影响榨季",
"thrShared": true
}
},
"id": "sugarcane-含宿根连年-0"
}
]
}
]
}
}
},
"tea": {
"name": "茶叶",
"regions": {
"northeast": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "夏梢",
"from": "7月",
"to": "8月",
"precision": "month",
"days": "60–90 天",
"ops": "修剪、夏茶采、防虫",
"perils": {
"heat": {
"thr": ">35℃灼伤、生长停滞",
"mech": "灼伤、生长停滞",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "tea-通用-0"
}
]
},
{
"name": "开采",
"stages": [
{
"name": "春梢萌发",
"from": "5月",
"to": "7月",
"precision": "month",
"days": "50–70 天",
"ops": "催芽肥、春茶分批采",
"perils": {
"frost": {
"thr": "",
"mech": "嫩梢冻死、芽叶稀少",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"thrShared": true,
"rank": 1
},
"drought": {
"thr": "",
"mech": "嫩梢冻死、芽叶稀少",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"thrShared": true
}
},
"id": "tea-开采-0"
}
]
}
]
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "定植",
"from": "2月",
"to": "3月",
"precision": "month",
"days": "库内未给",
"ops": "无性系扦插苗移栽",
"perils": {
"frost": {
"thr": "",
"mech": "冻害死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）"
}
},
"id": "tea-通用-0"
},
{
"name": "夏梢",
"from": "6月",
"to": "8月",
"precision": "month",
"days": "60–90 天",
"ops": "夏剪、抗旱灌溉、防虫",
"perils": {
"heat": {
"thr": ">35℃灼伤、生长停滞",
"mech": "灼伤、芽叶僵化",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"drought": {
"thr": "",
"mech": "灼伤、芽叶僵化",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": ">35℃灼伤、生长停滞",
"thrShared": true,
"rank": 2
}
},
"id": "tea-通用-1"
},
{
"name": "秋梢",
"from": "9月",
"to": "11月",
"precision": "month",
"days": "50–70 天",
"ops": "秋茶采、施基肥、封园",
"perils": {
"drought": {
"thr": "",
"mech": "芽叶稀少、烂根",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "芽叶稀少、烂根",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
}
},
"id": "tea-通用-2"
}
]
},
{
"name": "开采",
"stages": [
{
"name": "春梢萌发",
"from": "3月",
"to": "5月",
"precision": "month",
"days": "50–70 天",
"ops": "催芽肥、春茶分批采、防倒春寒",
"perils": {
"frost": {
"thr": "",
"mech": "嫩梢冻死、春茶减产",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"rank": 1
}
},
"id": "tea-开采-0"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "定植",
"from": "相对（春秋定植）",
"to": "相对（春秋定植）",
"precision": "relative",
"days": "库内未给",
"ops": "无性系扦插苗移栽",
"perils": {
"frost": {
"thr": "",
"mech": "冻害死苗",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 3,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）"
}
},
"id": "tea-通用-0"
},
{
"name": "秋梢",
"from": "9月",
"to": "11月",
"precision": "month",
"days": "50–70 天",
"ops": "秋茶采、施基肥、封园",
"perils": {
"drought": {
"thr": "",
"mech": "芽叶稀少",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "tea-通用-1"
}
]
},
{
"name": "开采",
"stages": [
{
"name": "春梢萌发",
"from": "3月",
"to": "5月",
"precision": "month",
"days": "50–70 天",
"ops": "催芽肥、春茶分批采",
"perils": {
"frost": {
"thr": "",
"mech": "嫩梢冻死、春茶减产",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"rank": 1
}
},
"id": "tea-开采-0"
}
]
}
]
},
"tibet": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "秋梢",
"from": "9月",
"to": "10月",
"precision": "month",
"days": "50–70 天",
"ops": "秋茶采、施基肥、封园",
"perils": {
"frost": {
"thr": "",
"mech": "芽叶冻伤",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）"
}
},
"id": "tea-通用-0"
}
]
},
{
"name": "开采",
"stages": [
{
"name": "春梢萌发",
"from": "4月",
"to": "6月",
"precision": "month",
"days": "50–70 天",
"ops": "催芽肥、春茶分批采",
"perils": {
"frost": {
"thr": "",
"mech": "嫩梢冻死",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"rank": 1
}
},
"id": "tea-开采-0"
}
]
}
]
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "夏梢",
"from": "6月",
"to": "8月",
"precision": "month",
"days": "60–90 天",
"ops": "夏剪、抗旱灌溉、防虫",
"perils": {
"heat": {
"thr": ">35℃灼伤、生长停滞",
"mech": "灼伤、生长停滞",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"drought": {
"thr": "",
"mech": "灼伤、生长停滞",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": ">35℃灼伤、生长停滞",
"thrShared": true,
"rank": 2
}
},
"id": "tea-通用-0"
},
{
"name": "秋梢",
"from": "9月",
"to": "11月",
"precision": "month",
"days": "50–70 天",
"ops": "秋茶采、施基肥、封园",
"perils": {
"drought": {
"thr": "",
"mech": "芽叶稀少、烂根落叶",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "芽叶稀少、烂根落叶",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
}
},
"id": "tea-通用-1"
}
]
},
{
"name": "开采",
"stages": [
{
"name": "春梢萌发",
"from": "3月",
"to": "5月",
"precision": "month",
"days": "50–70 天",
"ops": "催芽肥、春茶分批采、防倒春寒",
"perils": {
"frost": {
"thr": "",
"mech": "嫩梢冻死、名优茶减产",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"thrShared": true,
"rank": 1
},
"rainy": {
"thr": "",
"mech": "嫩梢冻死、名优茶减产",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"thrShared": true
}
},
"id": "tea-开采-0"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "秋梢",
"from": "9月",
"to": "11月",
"precision": "month",
"days": "50–70 天",
"ops": "秋茶采、施基肥、封园",
"perils": {
"drought": {
"thr": "",
"mech": "芽叶稀少",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "芽叶稀少",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
}
},
"id": "tea-通用-0"
}
]
},
{
"name": "开采，云南早",
"stages": [
{
"name": "春梢萌发",
"from": "2月",
"to": "4月",
"precision": "month",
"days": "50–70 天",
"ops": "催芽肥、春茶分批采",
"perils": {
"frost": {
"thr": "",
"mech": "嫩梢冻死、早芽受损",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"rank": 1
}
},
"id": "tea-开采，云南早-0"
}
]
}
]
},
"south": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "夏梢",
"from": "5月",
"to": "8月",
"precision": "month",
"days": "60–90 天",
"ops": "夏剪、抗旱灌溉、防虫",
"perils": {
"heat": {
"thr": ">35℃灼伤、生长停滞",
"mech": "灼伤、生长停滞",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"drought": {
"thr": "",
"mech": "灼伤、生长停滞",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": ">35℃灼伤、生长停滞",
"thrShared": true,
"rank": 2
}
},
"id": "tea-通用-0"
},
{
"name": "秋梢",
"from": "9月",
"to": "11月",
"precision": "month",
"days": "50–70 天",
"ops": "秋茶采、施基肥、封园",
"perils": {
"wind": {
"thr": "",
"mech": "烂根、落叶、采摘受阻",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "烂根、落叶、采摘受阻",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
}
},
"id": "tea-通用-1"
}
]
},
{
"name": "开采",
"stages": [
{
"name": "春梢萌发",
"from": "2月",
"to": "4月",
"precision": "month",
"days": "50–70 天",
"ops": "催芽肥、春茶分批采",
"perils": {
"frost": {
"thr": "",
"mech": "嫩梢冻死",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "霜冻/倒春寒 —（库内未给数值）",
"rank": 1
}
},
"id": "tea-开采-0"
}
]
}
]
}
}
},
"apple": {
"name": "苹果",
"regions": {
"northeast": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "4下",
"to": "5上",
"precision": "tenday",
"days": "萌芽 15–25 天、开花 7–12 天",
"ops": "花前复剪、授粉、疏花、防冻",
"perils": {
"frost": {
"thr": "花器受冻 0℃ 以下数小时即伤；冬季极端低温 -25℃ 以下伤枝干",
"mech": "花器冻死、坐果率骤降",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrTiers": [
{
"value": 0.0,
"valueMax": null,
"unit": "℃",
"outcome": "",
"text": "花器受冻 0℃ 以下数小时即伤"
},
{
"value": -25.0,
"valueMax": null,
"unit": "℃",
"outcome": "",
"text": "冬季极端低温 -25℃ 以下伤枝干"
}
],
"tierMax": 0.0
}
},
"id": "apple-通用-0"
},
{
"name": "果实膨大/成熟",
"from": "9月",
"to": "10月",
"precision": "month",
"days": "60–90 天",
"ops": "摘袋、转果、着色管理",
"perils": {
"storm": {
"thr": "",
"mech": "破皮伤果、果小日灼",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "干旱：短期土壤含水 <50% 田间持水量即受抑；冰雹 —（库内未给数值）",
"note": "原文含冰雹；平台无独立雹灾键，按暴雨洪涝类归集"
},
"drought": {
"thr": "干旱：短期土壤含水 <50% 田间持水量即受抑",
"mech": "破皮伤果、果小日灼",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "apple-通用-1"
},
{
"name": "采收",
"from": "9下",
"to": "10月",
"precision": "mixed",
"days": "30 天",
"ops": "分批采收、施基肥、清园",
"perils": {
"frost": {
"thr": "",
"mech": "冻伤果、贮藏性下降",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "apple-通用-2"
}
]
}
]
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽",
"from": "3中",
"to": "4上",
"precision": "tenday",
"days": "15–25 天",
"ops": "花前复剪、追肥灌水、防冻",
"perils": {
"frost": {
"thr": "花器受冻 0℃ 以下数小时即伤",
"mech": "花芽冻伤、萌芽不齐",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"drought": {
"thr": "",
"mech": "花芽冻伤、萌芽不齐",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "花器受冻 0℃ 以下数小时即伤",
"thrShared": true
}
},
"id": "apple-通用-0"
},
{
"name": "开花",
"from": "4上",
"to": "4下",
"precision": "tenday",
"days": "7–12 天",
"ops": "授粉（蜜蜂/人工）、疏花、防霜冻",
"perils": {
"frost": {
"thr": "花器受冻 0℃ 以下数小时即伤",
"mech": "花器冻死、坐果率骤降",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"rank": 1
}
},
"id": "apple-通用-1"
},
{
"name": "新梢旺长/果实膨大※",
"from": "5月",
"to": "8月",
"precision": "month",
"days": "90–110 天",
"ops": "夏剪、水肥、病虫防控、排涝",
"perils": {
"drought": {
"thr": "短期土壤含水 <50% 田间持水量即受抑",
"mech": "果小、日灼、烂根落叶落果",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text"
},
"storm": {
"thr": "积水 >24–48 h 即伤根",
"mech": "果小、日灼、烂根落叶落果",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text"
},
"heat": {
"thr": ">35℃ 抑制光合、日灼",
"mech": "果小、日灼、烂根落叶落果",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "apple-通用-2"
},
{
"name": "果实膨大成熟",
"from": "8月",
"to": "10月",
"precision": "month",
"days": "60–90 天",
"ops": "摘袋、转果、铺反光膜促着色",
"perils": {
"storm": {
"thr": "",
"mech": "破皮伤果、裂果、着色差",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "冰雹 —（库内未给数值）；连阴雨 —（库内未给数值）",
"note": "原文含冰雹；平台无独立雹灾键，按暴雨洪涝类归集"
},
"rainy": {
"thr": "",
"mech": "破皮伤果、裂果、着色差",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "冰雹 —（库内未给数值）；连阴雨 —（库内未给数值）",
"rank": 3
}
},
"id": "apple-通用-3"
},
{
"name": "采收",
"from": "9月",
"to": "10月",
"precision": "month",
"days": "30 天",
"ops": "分批采收、采后施基肥、清园",
"perils": {
"storm": {
"thr": "",
"mech": "伤果、冻伤果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"note": "原文含冰雹；平台无独立雹灾键，按暴雨洪涝类归集"
},
"frost": {
"thr": "",
"mech": "伤果、冻伤果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "apple-通用-4"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "3下",
"to": "4上",
"precision": "tenday",
"days": "萌芽 15–25 天、开花 7–12 天",
"ops": "授粉、疏花、霜前灌水",
"perils": {
"frost": {
"thr": "花器受冻 0℃ 以下数小时即伤",
"mech": "花器冻死、坐果率骤降",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "apple-通用-0"
},
{
"name": "新梢旺长/果实膨大※",
"from": "5月",
"to": "8月",
"precision": "month",
"days": "90–110 天",
"ops": "夏剪、水肥、病虫防控",
"perils": {
"drought": {
"thr": "短期土壤含水 <50% 田间持水量即受抑",
"mech": "果小、日灼",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text"
},
"heat": {
"thr": ">35℃ 抑制光合、日灼",
"mech": "果小、日灼",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "apple-通用-1"
},
{
"name": "果实膨大成熟",
"from": "9月",
"to": "11月",
"precision": "month",
"days": "60–90 天",
"ops": "摘袋、转果、着色管理",
"perils": {
"storm": {
"thr": "",
"mech": "破皮伤果、着色差",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"note": "原文含冰雹；平台无独立雹灾键，按暴雨洪涝类归集"
},
"frost": {
"thr": "",
"mech": "破皮伤果、着色差",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "apple-通用-2"
},
{
"name": "采收",
"from": "9月",
"to": "11月",
"precision": "month",
"days": "30 天",
"ops": "分批采收、采后施基肥",
"perils": {
"frost": {
"thr": "",
"mech": "冻伤果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）"
}
},
"id": "apple-通用-3"
}
]
}
]
},
"tibet": {
"note": "原文\"极少种植/，高寒，仅藏南/川西少量耐寒果树，热量不足\"",
"plantable": false,
"seasons": []
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "3上",
"to": "4上",
"precision": "tenday",
"days": "萌芽 15–25 天、开花 7–12 天",
"ops": "授粉、疏花、防霜冻",
"perils": {
"frost": {
"thr": "花器受冻 0℃ 以下数小时即伤",
"mech": "花器冻伤、授粉不良",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
},
"rainy": {
"thr": "",
"mech": "花器冻伤、授粉不良",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "花器受冻 0℃ 以下数小时即伤；连阴雨 —（库内未给数值）"
}
},
"id": "apple-通用-0"
},
{
"name": "果实膨大成熟",
"from": "7月",
"to": "9月",
"precision": "month",
"days": "60–90 天",
"ops": "夏剪、水肥、防日灼",
"perils": {
"heat": {
"thr": ">35℃ 抑制光合、日灼",
"mech": "日灼、裂果、烂根",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
},
"storm": {
"thr": "积水 >24–48 h 即伤根",
"mech": "日灼、裂果、烂根",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "apple-通用-1"
},
{
"name": "采收",
"from": "7月",
"to": "9月",
"precision": "month",
"days": "30 天",
"ops": "分批采收、清园",
"perils": {
"rainy": {
"thr": "",
"mech": "裂果、病害",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "apple-通用-2"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "2下",
"to": "3月",
"precision": "mixed",
"days": "萌芽 15–25 天、开花 7–12 天",
"ops": "授粉、疏花、防霜冻",
"perils": {
"frost": {
"thr": "花器受冻 0℃ 以下数小时即伤",
"mech": "花器冻死、坐果率骤降",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "apple-通用-0"
},
{
"name": "果实膨大成熟",
"from": "8月",
"to": "11月",
"precision": "month",
"days": "60–90 天",
"ops": "摘袋、转果、着色管理",
"perils": {
"storm": {
"thr": "",
"mech": "破皮伤果、裂果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "冰雹 —（库内未给数值）",
"thrShared": true,
"note": "原文含冰雹；平台无独立雹灾键，按暴雨洪涝类归集"
},
"rainy": {
"thr": "",
"mech": "破皮伤果、裂果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "冰雹 —（库内未给数值）",
"thrShared": true,
"rank": 3
}
},
"id": "apple-通用-1"
},
{
"name": "采收",
"from": "8月",
"to": "11月",
"precision": "month",
"days": "30 天",
"ops": "分批采收、采后施基肥",
"perils": {
"rainy": {
"thr": "",
"mech": "裂果、病害",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"rank": 3
}
},
"id": "apple-通用-2"
}
]
}
]
},
"south": {
"note": "原文\"极少种植/，冬季低温不足、需冷量不达，仅高山冷凉地少量试种\"",
"plantable": false,
"seasons": []
}
}
},
"citrus": {
"name": "柑橘",
"regions": {
"northeast": {
"note": "原文\"极少种植/，冬季严寒、热量与需冷均不足，无法露地生产\"",
"plantable": false,
"seasons": []
},
"huanghuai": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "3月",
"to": "4月",
"precision": "month",
"days": "春梢 20–30 天、开花座果 40–60 天",
"ops": "施萌芽肥、保花保果、防冻",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "花器受冻、落花落果",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-0"
},
{
"name": "果实膨大/成熟",
"from": "10月",
"to": "12月",
"precision": "month",
"days": "60–120 天",
"ops": "覆膜、分批采收、防日灼",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "果实冻伤、日灼落果",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
},
"heat": {
"thr": ">35℃ 日灼果、落果",
"mech": "果实冻伤、日灼落果",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-1"
},
{
"name": "采收",
"from": "10月",
"to": "1月",
"precision": "month",
"days": "库内未给",
"ops": "分批采收、采后施基肥",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "果实冻伤、贮藏性下降",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"rank": 1
}
},
"id": "citrus-通用-2"
}
]
}
]
},
"northwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "3月",
"to": "4月",
"precision": "month",
"days": "春梢 20–30 天、开花座果 40–60 天",
"ops": "施萌芽肥、保花保果、防冻",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "花器受冻、落花落果",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-0"
},
{
"name": "果实膨大/成熟",
"from": "10月",
"to": "12月",
"precision": "month",
"days": "60–120 天",
"ops": "覆膜、分批采收",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "果实冻伤、落果裂果",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
},
"drought": {
"thr": "土壤含水 <50% 即胁迫",
"mech": "果实冻伤、落果裂果",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-1"
},
{
"name": "采收",
"from": "10月",
"to": "1月",
"precision": "month",
"days": "库内未给",
"ops": "分批采收、采后施基肥",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "果实冻伤",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"rank": 1
}
},
"id": "citrus-通用-2"
}
]
}
]
},
"tibet": {
"note": "原文\"极少种植/，高寒热量不足，无商品栽培\"",
"plantable": false,
"seasons": []
},
"yangtze": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "3月",
"to": "4月",
"precision": "month",
"days": "春梢 20–30 天、开花座果 40–60 天",
"ops": "施萌芽肥、修剪、保花保果",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "花器受冻、授粉不良落花",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
},
"rainy": {
"thr": "",
"mech": "花器受冻、授粉不良落花",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤；连阴雨 —（库内未给数值）",
"rank": 3
}
},
"id": "citrus-通用-0"
},
{
"name": "夏梢/果实膨大※",
"from": "6月",
"to": "9月",
"precision": "month",
"days": "90–120 天",
"ops": "控夏梢、水肥、防日灼",
"perils": {
"drought": {
"thr": "土壤含水 <50% 即胁迫",
"mech": "落果、裂果、日灼、烂根",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text"
},
"heat": {
"thr": ">35℃ 日灼果、落果",
"mech": "落果、裂果、日灼、烂根",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
},
"storm": {
"thr": "积水 >48 h 烂根黄化",
"mech": "落果、裂果、日灼、烂根",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-1"
},
{
"name": "秋梢抽发※",
"from": "8月",
"to": "9月",
"precision": "month",
"days": "30 天",
"ops": "促放健壮秋梢（来花母枝）",
"perils": {
"drought": {
"thr": "土壤含水 <50% 即胁迫",
"mech": "秋梢弱小、翌年花量不足",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 1,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-2"
},
{
"name": "着色成熟/采收",
"from": "10月",
"to": "2月",
"precision": "month",
"days": "60–120 天",
"ops": "覆膜、分批采收、防霜",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "果实冻伤、裂果落果",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "果实冻伤、裂果落果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "果实冻伤、裂果落果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"thrShared": true
}
},
"id": "citrus-通用-3"
}
]
}
]
},
"southwest": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "2月",
"to": "3月",
"precision": "month",
"days": "春梢 20–30 天、开花座果 40–60 天",
"ops": "施萌芽肥、保花保果",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "花器受冻、落花落果",
"numeric": true,
"thrType": "temp",
"basis": "A_numeric",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-0"
},
{
"name": "夏梢/果实膨大※",
"from": "6月",
"to": "9月",
"precision": "month",
"days": "90–120 天",
"ops": "控夏梢、水肥、防日灼",
"perils": {
"drought": {
"thr": "土壤含水 <50% 即胁迫",
"mech": "落果、裂果、日灼",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text"
},
"heat": {
"thr": ">35℃ 日灼果、落果",
"mech": "落果、裂果、日灼",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-1"
},
{
"name": "秋梢抽发※",
"from": "8月",
"to": "9月",
"precision": "month",
"days": "30 天",
"ops": "促放健壮秋梢",
"perils": {
"drought": {
"thr": "土壤含水 <50% 即胁迫",
"mech": "秋梢弱小",
"numeric": true,
"thrType": "other",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text"
}
},
"id": "citrus-通用-2"
},
{
"name": "着色成熟/采收",
"from": "10月",
"to": "3月",
"precision": "month",
"days": "60–120 天",
"ops": "覆膜、分批采收、防霜（晚熟如伦晚）",
"perils": {
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "果实冻伤、落果",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"rainy": {
"thr": "",
"mech": "果实冻伤、落果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"thrShared": true
}
},
"id": "citrus-通用-3"
}
]
}
]
},
"south": {
"note": "",
"plantable": true,
"seasons": [
{
"name": "通用",
"stages": [
{
"name": "萌芽/开花",
"from": "2月",
"to": "3月",
"precision": "month",
"days": "春梢 20–30 天、开花座果 40–60 天",
"ops": "施萌芽肥、保花保果",
"perils": {
"rainy": {
"thr": "",
"mech": "授粉不良、落花落果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true,
"rank": 3
},
"wind": {
"thr": "",
"mech": "授粉不良、落花落果",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "—（库内未给数值）",
"thrShared": true
}
},
"id": "citrus-通用-0"
},
{
"name": "夏梢/果实膨大※",
"from": "6月",
"to": "9月",
"precision": "month",
"days": "90–120 天",
"ops": "控夏梢、水肥、防日灼",
"perils": {
"heat": {
"thr": ">35℃ 日灼果、落果",
"mech": "日灼、落果、烂根",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"storm": {
"thr": "积水 >48 h 烂根黄化",
"mech": "日灼、落果、烂根",
"numeric": true,
"thrType": "flood",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "日灼、落果、烂根",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": ">35℃ 日灼果、落果；积水 >48 h 烂根黄化",
"thrShared": true
}
},
"id": "citrus-通用-1"
},
{
"name": "秋梢抽发※",
"from": "8月",
"to": "9月",
"precision": "month",
"days": "30 天",
"ops": "促放健壮秋梢",
"perils": {
"drought": {
"thr": "土壤含水 <50% 即胁迫",
"mech": "秋梢受损",
"numeric": true,
"thrType": "other",
"basis": "B_proxy",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "秋梢受损",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 0,
"severitySource": "inferred_from_text",
"misappliedThr": "土壤含水 <50% 即胁迫",
"thrShared": true
}
},
"id": "citrus-通用-2"
},
{
"name": "着色成熟/采收",
"from": "10月",
"to": "4月",
"precision": "month",
"days": "60–120 天",
"ops": "分批采收、防裂防霜",
"perils": {
"rainy": {
"thr": "",
"mech": "裂果、落果、冻伤",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"thrShared": true
},
"wind": {
"thr": "",
"mech": "裂果、落果、冻伤",
"numeric": false,
"thrType": "none",
"basis": "C_qualitative",
"agroAnchor": false,
"severity": 2,
"severitySource": "inferred_from_text",
"misappliedThr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"thrShared": true
},
"frost": {
"thr": "甜橙 -3℃、宽皮橘 -5℃ 以下数小时叶片受冻，果实 -2℃ 冻伤",
"mech": "裂果、落果、冻伤",
"numeric": true,
"thrType": "temp",
"basis": "B_proxy",
"agroAnchor": true,
"severity": 2,
"severitySource": "inferred_from_text",
"thrShared": true
}
},
"id": "citrus-通用-3"
}
]
}
]
}
}
}
}, {schemaVersion:'wii-pheno/1.0', source:'04库/审度提取', rows:232, generatedAt:'2026-11-03'}); })();


/* ==== pheno-data-batchAB.js ==== */
/* 物候数据 · 批 A（经济 6）+ 批 B（蔬菜 8）+ 批 C（粮 4 + 果 6）—— 自动生成，勿手改
   源：审度定稿 JSON（schema v1.4.6 / batchA+batchB）
   生成器：build_batchAB.py
   映射：FROST/CHILLING/CHILLWIND→frost，HEAT/HOTWIND→heat，DROUGHT→drought，
         RAINSPELL/WATERLOG→rainy（同阶段并存时合并取高严重度），FLOOD→storm，WIND/TYPHOON→wind
   平台无独立键而跳过：HAIL 120 条（不静默丢弃，已计数）
*/
(function(){ if(!window.WIIPheno || !window.WIIPheno.mergeCrops) return;
  var r = window.WIIPheno.mergeCrops({"peanut": {"name": "花生", "regions": {"northeast": {"note": "区域行给播种/苗期/开花下针/结荚/饱果 5 项；辽南熟期短", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0511", "to": "0520", "precision": "tenday", "days": "", "ops": "覆膜播种", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "播期低温烂种；秋季早霜影响成熟", "mech": "烂种、成熟不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期", "from": "0521", "to": "0630", "precision": "tenday", "days": "", "ops": "查苗、中耕、治地下虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P3", "name": "开花下针期", "from": "0701", "to": "0731", "precision": "month", "days": "", "ops": "培土迎针、补钙", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": "持续>35℃抑制开花下针", "mech": "开花下针受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P4", "name": "结荚期", "from": "0801", "to": "0831", "precision": "month", "days": "", "ops": "保叶、排渍", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P5", "name": "饱果成熟期", "from": "0911", "to": "0930", "precision": "tenday", "days": "", "ops": "排涝、适期收获", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "播期低温烂种；秋季早霜影响成熟", "mech": "烂种、成熟不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期遇雨荚果发芽霉变", "mech": "荚果发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "区域行给春播/开花下针/结荚/收获 4 项；缺苗期单列", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "起垄覆膜、适期播种", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "播期低温烂种；秋季早霜影响成熟", "mech": "烂种、成熟不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "开花下针期", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "培土迎针、控旺、补钙", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": "持续>35℃抑制开花下针", "mech": "开花下针受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "结荚期", "from": "0801", "to": "0831", "precision": "month", "days": "", "ops": "保叶、防徒长、排渍", "track": "作物", "confidence": "高", "windowNote": "；起点由库内原始区间前推至 0801（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P4", "name": "饱果成熟期", "from": "0901", "to": "1031", "precision": "month", "days": "", "ops": "排涝、适期收获", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "播期低温烂种；秋季早霜影响成熟", "mech": "烂种、成熟不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期遇雨荚果发芽霉变", "mech": "荚果发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}, {"name": "夏播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0601", "to": "0620", "precision": "tenday", "days": "", "ops": "麦后抢播", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P2", "name": "开花下针期", "from": "0701", "to": "0831", "precision": "month", "days": "", "ops": "培土迎针、补钙", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": "持续>35℃抑制开花下针", "mech": "开花下针受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "结荚期", "from": "0901", "to": "0930", "precision": "month", "days": "", "ops": "保叶、排渍", "track": "作物", "confidence": "高", "windowNote": "；起点由库内原始区间前推至 0901（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P4", "name": "饱果成熟期", "from": "1001", "to": "1031", "precision": "month", "days": "", "ops": "排涝、适期收获", "track": "作物", "confidence": "低", "windowNote": null, "perils": {"rainy": {"thr": "收获期遇雨荚果发芽霉变", "mech": "荚果发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "区域行给春播/花期/结荚/收获；灌区零星，非主产", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0501", "to": "0510", "precision": "tenday", "days": "", "ops": "适期播种", "track": "作物", "confidence": "低", "windowNote": null, "perils": {"frost": {"thr": "播期低温烂种；秋季早霜影响成熟", "mech": "烂种、成熟不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "开花下针期", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "培土迎针", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "根层含水<55% 灌水", "mech": "需灌水（防御触发级，不等于已减产）", "numeric": true, "thrType": "defense_trigger", "basis": "A_numeric", "agroAnchor": false, "severity": 1, "severitySource": "derived_from_text_severity", "level": "低", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 55, "unit": "%", "op": "<", "useAs": "serviceTrigger", "payoutEligible": false, "useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于风险减量服务提示"}}}, {"id": "P3", "name": "结荚期", "from": "0801", "to": "0831", "precision": "month", "days": "", "ops": "排渍", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "根层含水<55% 灌水", "mech": "需灌水（防御触发级，不等于已减产）", "numeric": true, "thrType": "defense_trigger", "basis": "A_numeric", "agroAnchor": false, "severity": 1, "severitySource": "derived_from_text_severity", "level": "低", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 55, "unit": "%", "op": "<", "useAs": "serviceTrigger", "payoutEligible": false, "useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于风险减量服务提示"}}}, {"id": "P4", "name": "饱果成熟期", "from": "0901", "to": "1031", "precision": "month", "days": "", "ops": "适期收获", "track": "作物", "confidence": "低", "windowNote": null, "perils": {"frost": {"thr": "播期低温烂种；秋季早霜影响成熟", "mech": "烂种、成熟不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "区域行给播种/开花下针/结荚/收获 4 项", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0421", "to": "0531", "precision": "month", "days": "", "ops": "起垄、施基肥", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P2", "name": "开花下针期", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "培土迎针、补钙", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": "持续>35℃抑制开花下针", "mech": "开花下针受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "结荚期", "from": "0801", "to": "0831", "precision": "month", "days": "", "ops": "保叶、排渍", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P4", "name": "饱果成熟期", "from": "0901", "to": "1031", "precision": "month", "days": "", "ops": "排涝、适期收获", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "收获期遇雨荚果发芽霉变", "mech": "荚果发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "区域行给春花/秋花生与花期6–9月、结荚7–10月、收9–11月；区间为合并值", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0421", "to": "0531", "precision": "month", "days": "", "ops": "起垄、施基肥", "track": "作物", "confidence": "低", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P2", "name": "开花下针期", "from": "0601", "to": "0930", "precision": "month", "days": "", "ops": "培土迎针", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "结荚期", "from": "1001", "to": "1031", "precision": "month", "days": "", "ops": "排渍", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 1001（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P4", "name": "饱果成熟期", "from": "1101", "to": "1130", "precision": "month", "days": "", "ops": "适期收获", "track": "作物", "confidence": "低", "windowNote": "；起点由库内原始区间前推至 1101（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"rainy": {"thr": "收获期遇雨荚果发芽霉变", "mech": "荚果发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}, {"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种（秋花生）", "from": "0701", "to": "0831", "precision": "month", "days": "", "ops": "抢播、排水", "track": "作物", "confidence": "低", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P2", "name": "开花下针期", "from": "0901", "to": "0930", "precision": "month", "days": "", "ops": "培土迎针", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "结荚期", "from": "1001", "to": "1031", "precision": "month", "days": "", "ops": "排渍", "track": "作物", "confidence": "低", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "饱果成熟期", "from": "1101", "to": "1130", "precision": "month", "days": "", "ops": "适期收获", "track": "作物", "confidence": "低", "windowNote": null, "perils": {"rainy": {"thr": "收获期遇雨荚果发芽霉变", "mech": "荚果发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "south": {"note": "区域行给春花2–3月、花期4–5月、结荚5–6月、收6–7月", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0201", "to": "0331", "precision": "month", "days": "", "ops": "起垄、施基肥", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P2", "name": "开花下针期", "from": "0401", "to": "0531", "precision": "month", "days": "", "ops": "培土迎针、补钙", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": "持续>35℃抑制开花下针", "mech": "开花下针受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "结荚期", "from": "0601", "to": "0630", "precision": "month", "days": "", "ops": "保叶、排渍", "track": "作物", "confidence": "高", "windowNote": "；起点由库内原始区间前推至 0601（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P4", "name": "饱果成熟期", "from": "0701", "to": "0731", "precision": "month", "days": "", "ops": "排涝、适期收获", "track": "作物", "confidence": "高", "windowNote": "；起点由库内原始区间前推至 0701（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"rainy": {"thr": "收获期遇雨荚果发芽霉变", "mech": "荚果发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}, {"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种（秋花生）", "from": "0701", "to": "0831", "precision": "month", "days": "", "ops": "抢播、排水", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P2", "name": "开花下针期", "from": "0901", "to": "1030", "precision": "month", "days": "", "ops": "培土迎针", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "结荚期", "from": "1031", "to": "1130", "precision": "month", "days": "", "ops": "排渍", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 1031（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"drought": {"thr": "开花结荚期缺水空秕多", "mech": "空秕增多、荚果不饱满", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天即烂针烂果", "mech": "根系窒息、烂根烂果", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": false, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "valueMax": 2, "unit": "d", "op": ">=", "runDays": [1, 2]}}}, {"id": "P4", "name": "饱果成熟期", "from": "1201", "to": "1231", "precision": "month", "days": "", "ops": "适期收获", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 1201（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"rainy": {"thr": "收获期遇雨荚果发芽霉变", "mech": "荚果发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 0}, "sugarbeet": {"name": "甜菜", "regions": {"northeast": {"note": "区域行给播种/苗期/繁茂/糖分积累+收9下–10月，5 项齐全", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0411", "to": "0420", "precision": "tenday", "days": "", "ops": "整地、施基肥、适期播种", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期", "from": "0421", "to": "0610", "precision": "tenday", "days": "", "ops": "查苗、间苗定苗、治虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "块根腐烂、含糖下降", "mech": "烂根、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "繁茂期（叶丛/块根增长）", "from": "0611", "to": "0831", "precision": "month", "days": "", "ops": "追肥、灌水、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "根层含水<60% 灌水", "mech": "需灌水（防御触发级）", "numeric": true, "thrType": "defense_trigger", "basis": "A_numeric", "agroAnchor": false, "severity": 1, "severitySource": "derived_from_text_severity", "level": "低", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 60, "unit": "%", "op": "<", "useAs": "serviceTrigger", "payoutEligible": false, "useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于风险减量服务提示"}, "heat": {"thr": "持续>30℃抑制生长、降低含糖", "mech": "生长受抑、含糖下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "块根腐烂、含糖下降", "mech": "烂根、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "糖分积累期", "from": "0901", "to": "1010", "precision": "tenday", "days": "", "ops": "控氮、排渍、促糖", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "糖分积累期阴雨降糖、病害重", "mech": "降糖、病害重", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五", "thrMergedFrom": "WATERLOG"}}}, {"id": "P5", "name": "收获", "from": "1011", "to": "1031", "precision": "month", "days": "", "ops": "适期收获、清洁去杂", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 1011（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "区域行给 4 项（糖分积累未单列，按收9下–10月派生）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0411", "to": "0420", "precision": "tenday", "days": "", "ops": "整地、施基肥", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期", "from": "0421", "to": "0610", "precision": "tenday", "days": "", "ops": "查苗、间苗定苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "块根腐烂、含糖下降", "mech": "烂根、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "繁茂期（叶丛/块根增长）", "from": "0611", "to": "0831", "precision": "month", "days": "", "ops": "追肥、灌水", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "根层含水<60% 灌水", "mech": "需灌水（防御触发级）", "numeric": true, "thrType": "defense_trigger", "basis": "A_numeric", "agroAnchor": false, "severity": 1, "severitySource": "derived_from_text_severity", "level": "低", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 60, "unit": "%", "op": "<", "useAs": "serviceTrigger", "payoutEligible": false, "useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于风险减量服务提示"}, "heat": {"thr": "持续>30℃抑制生长、降低含糖", "mech": "生长受抑、含糖下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "块根腐烂、含糖下降", "mech": "烂根、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "糖分积累期", "from": "0901", "to": "1010", "precision": "tenday", "days": "", "ops": "控氮、促糖", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "糖分积累期阴雨降糖、病害重", "mech": "降糖、病害重", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P5", "name": "收获", "from": "1011", "to": "1031", "precision": "month", "days": "", "ops": "适期收获", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 1011（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "区域行给 4 项；西北灌区为主，渍涝风险低（WATERLOG 仅作占位提示）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0411", "to": "0420", "precision": "tenday", "days": "", "ops": "整地、施基肥", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期", "from": "0421", "to": "0610", "precision": "tenday", "days": "", "ops": "查苗、间苗定苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "块根腐烂、含糖下降", "mech": "烂根、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "繁茂期（叶丛/块根增长）", "from": "0611", "to": "0831", "precision": "month", "days": "", "ops": "水肥一体化、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "根层含水<60% 灌水", "mech": "需灌水（防御触发级）", "numeric": true, "thrType": "defense_trigger", "basis": "A_numeric", "agroAnchor": false, "severity": 1, "severitySource": "derived_from_text_severity", "level": "低", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 60, "unit": "%", "op": "<", "useAs": "serviceTrigger", "payoutEligible": false, "useAsNote": "原文为灌水线（防御触发级），不得作为起赔点，仅用于风险减量服务提示"}, "heat": {"thr": "持续>30℃抑制生长、降低含糖", "mech": "生长受抑、含糖下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "块根腐烂、含糖下降", "mech": "烂根、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "糖分积累期", "from": "0901", "to": "1010", "precision": "tenday", "days": "", "ops": "控水控氮促糖", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "糖分积累期阴雨降糖、病害重", "mech": "降糖、病害重", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P5", "name": "收获", "from": "1011", "to": "1031", "precision": "month", "days": "", "ops": "适期收获、及时交售", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 1011（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"frost": {"thr": "早霜冻伤叶片影响产量与工艺品质", "mech": "叶片冻伤、含糖下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 0}, "tobacco": {"name": "烟草", "regions": {"huanghuai": {"note": "区域行给育苗3–4月、移栽5月、旺长6–7月、成熟采收7–9月", "plantable": true, "seasons": [{"name": "春烟", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "苗期（育苗）", "from": "0301", "to": "0430", "precision": "month", "days": "", "ops": "间苗、防病、剪叶炼苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "移栽期低温死苗，秋季早霜影响上部叶成熟", "mech": "死苗、上部叶不熟", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "还苗—团棵期", "from": "0511", "to": "0620", "precision": "tenday", "days": "", "ops": "查苗、中耕、追肥", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "根系窒息、病害暴发", "mech": "烂根、病害暴发", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "旺长期", "from": "0621", "to": "0731", "precision": "tenday", "days": "", "ops": "培土、灌水", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "旺长期缺水影响产量与叶片开片", "mech": "叶片开片不足、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": "旺长期高温抑制生长", "mech": "生长受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P4", "name": "成熟采收期", "from": "0801", "to": "0930", "precision": "month", "days": "", "ops": "打顶抹杈、分层采收、烘烤", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"rainy": {"thr": "成熟期阴雨难烘烤、病害重、品质降", "mech": "难烘烤、品质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "区域行给育苗3–4/移栽5月/旺长6–7月/收8–9月；陇南陕南零星", "plantable": true, "seasons": [{"name": "春烟", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "苗期（育苗）", "from": "0301", "to": "0430", "precision": "month", "days": "", "ops": "间苗、炼苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "移栽期低温死苗，秋季早霜影响上部叶成熟", "mech": "死苗、上部叶不熟", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "还苗—团棵期", "from": "0511", "to": "0620", "precision": "tenday", "days": "", "ops": "查苗、中耕", "track": "作物", "confidence": "中", "windowNote": null, "perils": {}}, {"id": "P3", "name": "旺长期", "from": "0621", "to": "0731", "precision": "tenday", "days": "", "ops": "培土、灌水", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "旺长期缺水影响产量与叶片开片", "mech": "叶片开片不足、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟采收期", "from": "0801", "to": "0930", "precision": "month", "days": "", "ops": "打顶抹杈、分层采收", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "成熟期阴雨难烘烤、病害重、品质降", "mech": "难烘烤、品质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "区域行给育苗12–3月/移栽4–5月/旺长6–7月/收7–9月；育苗跨年", "plantable": true, "seasons": [{"name": "春烟", "assumed": false, "completeness": "partial", "annualWindowAllowed": false, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "苗期（育苗）", "from": "1201", "to": "0331", "precision": "month", "days": "", "ops": "间苗、炼苗", "track": "作物", "confidence": "中", "windowNote": "库内育苗 12–3 月，跨年：起 y0（12月）止 y1（次年3月）", "perils": {"frost": {"thr": "移栽期低温死苗，秋季早霜影响上部叶成熟", "mech": "死苗、上部叶不熟", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "还苗—团棵期", "from": "0401", "to": "0510", "precision": "tenday", "days": "", "ops": "查苗、中耕、追肥", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "根系窒息、病害暴发", "mech": "烂根、病害暴发", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "旺长期", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "培土、灌水", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "旺长期缺水影响产量与叶片开片", "mech": "叶片开片不足、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟采收期", "from": "0801", "to": "0930", "precision": "month", "days": "", "ops": "打顶抹杈、分层采收", "track": "作物", "confidence": "高", "windowNote": "；起点由库内原始区间前推至 0801（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"rainy": {"thr": "成熟期阴雨难烘烤、病害重、品质降", "mech": "难烘烤、品质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "区域行给育苗2–3月/移栽4–5月/旺长6–7月/收7–9月", "plantable": true, "seasons": [{"name": "春烟", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "苗期（育苗）", "from": "0201", "to": "0331", "precision": "month", "days": "", "ops": "间苗、炼苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "移栽期低温死苗，秋季早霜影响上部叶成熟", "mech": "死苗、上部叶不熟", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "还苗—团棵期", "from": "0401", "to": "0510", "precision": "tenday", "days": "", "ops": "查苗、中耕、追肥", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "根系窒息、病害暴发", "mech": "烂根、病害暴发", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "旺长期", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "培土、灌水", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "旺长期缺水影响产量与叶片开片", "mech": "叶片开片不足、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟采收期", "from": "0801", "to": "0930", "precision": "month", "days": "", "ops": "打顶抹杈、分层采收、烘烤", "track": "作物", "confidence": "高", "windowNote": "；起点由库内原始区间前推至 0801（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"rainy": {"thr": "成熟期阴雨难烘烤、病害重、品质降", "mech": "难烘烤、品质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "south": {"note": "库内华南仅给移栽3–4月/旺长6–7月/收7–9月，缺育苗期", "plantable": true, "seasons": [{"name": "春烟", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "还苗—团棵期", "from": "0301", "to": "0430", "precision": "month", "days": "", "ops": "查苗、中耕", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "根系窒息、病害暴发", "mech": "烂根、病害暴发", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "旺长期", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "培土、灌水", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "旺长期缺水影响产量与叶片开片", "mech": "叶片开片不足、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "成熟采收期", "from": "0801", "to": "0930", "precision": "month", "days": "", "ops": "打顶抹杈、分层采收", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 0801（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"rainy": {"thr": "成熟期阴雨难烘烤、病害重、品质降", "mech": "难烘烤、品质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 10}, "silkworm": {"name": "桑蚕", "regions": {"northeast": {"note": "仅辽南少量；桑树萌芽4月、春蚕5月、秋蚕8–9月", "plantable": true, "seasons": [{"name": "多批次", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "桑树萌芽", "from": "0401", "to": "0430", "precision": "month", "days": "", "ops": "追肥、防霜", "track": "桑园", "confidence": "低", "windowNote": null, "perils": {"frost": {"thr": "春季倒春寒冻伤桑芽影响叶量", "mech": "桑芽冻伤、叶量下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "春蚕（催青—幼虫—上蔟）", "from": "0501", "to": "0531", "precision": "month", "days": "", "ops": "催青、饲育、上蔟", "track": "养蚕", "confidence": "中", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "秋蚕（催青—幼虫—上蔟）", "from": "0801", "to": "0930", "precision": "month", "days": "", "ops": "饲育、上蔟、采茧", "track": "养蚕", "confidence": "中", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}}}]}]}, "huanghuai": {"note": "黄河下游蚕区；桑旺长4–10月、春蚕4–5月、夏秋蚕6–10月", "plantable": true, "seasons": [{"name": "多批次", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "桑树旺盛生长", "from": "0401", "to": "1031", "precision": "month", "days": "", "ops": "夏伐、追肥、采叶", "track": "桑园", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "桑叶老化、叶质差", "mech": "叶质下降、茧质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "rainy": {"thr": "桑园渍害、蚕室受淹", "mech": "桑园烂根、蚕室受淹", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "春蚕（催青—幼虫—上蔟）", "from": "0401", "to": "0531", "precision": "month", "days": "", "ops": "催青、良桑饱食、上蔟", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "夏秋蚕（催青—幼虫—上蔟）", "from": "0601", "to": "1031", "precision": "month", "days": "", "ops": "饲育、控温湿、上蔟", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "陕南/南疆零星；春蚕5月、秋蚕8–9月", "plantable": true, "seasons": [{"name": "多批次", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "春蚕（催青—幼虫—上蔟）", "from": "0501", "to": "0531", "precision": "month", "days": "", "ops": "催青、饲育、上蔟", "track": "养蚕", "confidence": "中", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}}}, {"id": "P2", "name": "秋蚕（催青—幼虫—上蔟）", "from": "0801", "to": "0930", "precision": "month", "days": "", "ops": "饲育、上蔟", "track": "养蚕", "confidence": "中", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}}}]}]}, "yangtze": {"note": "传统蚕桑主产区；春蚕4–5月、夏蚕6–7月、秋蚕8–10月", "plantable": true, "seasons": [{"name": "多批次", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "桑树休眠—萌芽", "from": "0101", "to": "0331", "precision": "month", "days": "", "ops": "冬伐、施基肥、清园", "track": "桑园", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "春季倒春寒冻伤桑芽影响叶量", "mech": "桑芽冻伤、叶量下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "桑树旺盛生长", "from": "0401", "to": "1031", "precision": "month", "days": "", "ops": "夏伐、追肥、采叶", "track": "桑园", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "桑叶老化、叶质差", "mech": "叶质下降、茧质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "rainy": {"thr": "桑园渍害、蚕室受淹", "mech": "桑园烂根、蚕室受淹", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "春蚕（催青—幼虫—上蔟）", "from": "0401", "to": "0531", "precision": "month", "days": "", "ops": "催青、良桑饱食、上蔟", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "夏蚕（催青—幼虫—上蔟）", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "饲育、控温湿", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P5", "name": "秋蚕（催青—幼虫—上蔟）", "from": "0801", "to": "1031", "precision": "month", "days": "", "ops": "饲育、上蔟、采茧", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "西南蚕区（川渝滇黔）；春蚕4–5月、秋蚕8–10月多批次", "plantable": true, "seasons": [{"name": "多批次", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "桑树休眠—萌芽", "from": "0101", "to": "0331", "precision": "month", "days": "", "ops": "冬伐、施基肥", "track": "桑园", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "春季倒春寒冻伤桑芽影响叶量", "mech": "桑芽冻伤、叶量下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "桑树旺盛生长", "from": "0401", "to": "1031", "precision": "month", "days": "", "ops": "夏伐、追肥、采叶", "track": "桑园", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "桑叶老化、叶质差", "mech": "叶质下降、茧质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "rainy": {"thr": "桑园渍害、蚕室受淹", "mech": "桑园烂根、蚕室受淹", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "春蚕（催青—幼虫—上蔟）", "from": "0401", "to": "0531", "precision": "month", "days": "", "ops": "催青、饲育、上蔟", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "秋蚕（催青—幼虫—上蔟）", "from": "0801", "to": "1031", "precision": "month", "days": "", "ops": "多批次饲育、上蔟", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "south": {"note": "桂为最大蚕区；全年多批次3–11月，春蚕3–4月、夏秋蚕5–11月（合并值）", "plantable": true, "seasons": [{"name": "多批次", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "桑树旺盛生长", "from": "0301", "to": "1130", "precision": "month", "days": "", "ops": "夏伐、追肥、采叶", "track": "桑园", "confidence": "中", "windowNote": null, "perils": {"drought": {"thr": "桑叶老化、叶质差", "mech": "叶质下降、茧质降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "rainy": {"thr": "桑园渍害、蚕室受淹", "mech": "桑园烂根、蚕室受淹", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "春蚕（催青—幼虫—上蔟）", "from": "0301", "to": "0430", "precision": "month", "days": "", "ops": "催青、饲育、上蔟", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "夏秋蚕（多批次，催青—幼虫—上蔟）", "from": "0501", "to": "1130", "precision": "month", "days": "", "ops": "多批次饲育、上蔟、采茧", "track": "养蚕", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "蚕期>30℃发育迟缓、蔟中死笼茧", "mech": "发育迟缓、死笼茧", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">="}, "rainy": {"thr": "蚕病（脓病、僵病）暴发", "mech": "蚕病暴发、批量死亡", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 0}, "ramie": {"name": "苎麻", "regions": {"yangtze": {"note": "苎麻主产区（湘鄂赣）；头麻4–6/二麻6–8/三麻8–10，年收3茬", "plantable": true, "seasons": [{"name": "多年生宿根", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "头麻", "from": "0401", "to": "0531", "precision": "month", "days": "", "ops": "破秆中耕、催苗肥、防渍", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"frost": {"thr": "苎麻春季霜冻伤苗", "mech": "苗期冻伤", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "二麻", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "水肥、防暴雨渍涝、剥麻", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}, "heat": {"thr": "夏季高温抑制生长", "mech": "生长受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "三麻", "from": "0801", "to": "1031", "precision": "month", "days": "", "ops": "抗旱、剥麻、冬管准备", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "三麻高温干旱减产", "mech": "纤维变短、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期阴雨致原麻霉变、脱胶难", "mech": "原麻霉变、脱胶难", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "苎麻主产区（川渝黔）；年收3茬", "plantable": true, "seasons": [{"name": "多年生宿根", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "头麻", "from": "0401", "to": "0531", "precision": "month", "days": "", "ops": "破秆中耕、催苗肥", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"frost": {"thr": "苎麻春季霜冻伤苗", "mech": "苗期冻伤", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "二麻", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "水肥、防渍、剥麻", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "三麻", "from": "0801", "to": "1031", "precision": "month", "days": "", "ops": "抗旱、剥麻", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "三麻高温干旱减产", "mech": "纤维变短、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期阴雨致原麻霉变、脱胶难", "mech": "原麻霉变、脱胶难", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "south": {"note": "华南苎麻区（桂粤）；库内给年收3茬3–11月，为合并区间", "plantable": true, "seasons": [{"name": "多年生宿根", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "头麻", "from": "0401", "to": "0531", "precision": "month", "days": "", "ops": "破秆中耕", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "二麻", "from": "0601", "to": "0731", "precision": "month", "days": "", "ops": "水肥、剥麻", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}, "heat": {"thr": "夏季高温抑制生长", "mech": "生长受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "三麻", "from": "0801", "to": "1130", "precision": "month", "days": "", "ops": "抗旱、剥麻", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "三麻高温干旱减产", "mech": "纤维变短、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期阴雨致原麻霉变、脱胶难", "mech": "原麻霉变、脱胶难", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 0}, "flax": {"name": "亚麻", "regions": {"northeast": {"note": "纤用亚麻/胡麻主产区；苗期4下–6上、开花6中–7上、工艺成熟7下、收7下–8月", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0411", "to": "0420", "precision": "tenday", "days": "", "ops": "整地、适期播种", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "亚麻苗期冻害", "mech": "苗期冻害、缺苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期—现蕾", "from": "0421", "to": "0610", "precision": "tenday", "days": "", "ops": "间苗、中耕", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"frost": {"thr": "亚麻苗期冻害", "mech": "苗期冻害、缺苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "开花—工艺成熟", "from": "0611", "to": "0731", "precision": "tenday", "days": "", "ops": "防病、适时收", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期>28℃纤维变粗降质", "mech": "纤维变粗、品质降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 28, "unit": "℃", "op": ">="}, "rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}, "drought": {"thr": "干旱致纤维产量下降", "mech": "纤维变短、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "收获（纤/籽）", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "拔收、沤麻、晾晒", "track": "作物", "confidence": "高", "windowNote": "；起点由库内原始区间前推至 0801（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"rainy": {"thr": "收获期阴雨致原麻霉变、脱胶难", "mech": "原麻霉变、脱胶难", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "冷凉北缘（蒙中、晋、冀北）适亚麻；收7月", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种", "from": "0411", "to": "0420", "precision": "tenday", "days": "", "ops": "整地、适期播种", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "亚麻苗期冻害", "mech": "苗期冻害、缺苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期—现蕾", "from": "0421", "to": "0610", "precision": "tenday", "days": "", "ops": "间苗、中耕", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"frost": {"thr": "亚麻苗期冻害", "mech": "苗期冻害、缺苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "开花—工艺成熟", "from": "0611", "to": "0710", "precision": "tenday", "days": "", "ops": "防病、适时收", "track": "作物", "confidence": "高", "windowNote": "；终点由库内「6中–7上」取 7上 末（0710），避免与 7月收获重叠", "perils": {"heat": {"thr": "开花期>28℃纤维变粗降质", "mech": "纤维变粗、品质降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 28, "unit": "℃", "op": ">="}, "rainy": {"thr": "麻类极怕涝，根系窒息、烂根", "mech": "烂根、死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "WATERLOG", "hazardRaw": "洪涝/渍害", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "收获", "from": "0711", "to": "0731", "precision": "tenday", "days": "", "ops": "拔收、沤麻", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 0801（前一阶段终点+1），属设计裁剪非库内物候；起点改为 7中（库内「收7月」）", "perils": {"rainy": {"thr": "收获期阴雨致原麻霉变、脱胶难", "mech": "原麻霉变、脱胶难", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "胡麻主产区（新甘宁蒙西）；苗期5–6月、开花6下–7月、收7–8月", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种（亚麻/胡麻）", "from": "0411", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、播种", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "亚麻苗期冻害", "mech": "苗期冻害、缺苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期—现蕾", "from": "0501", "to": "0610", "precision": "tenday", "days": "", "ops": "间苗、中耕", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"frost": {"thr": "亚麻苗期冻害", "mech": "苗期冻害、缺苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "开花—工艺成熟", "from": "0621", "to": "0731", "precision": "tenday", "days": "", "ops": "防病、适时收", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期>28℃纤维变粗降质", "mech": "纤维变粗、品质降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 28, "unit": "℃", "op": ">="}, "drought": {"thr": "干旱致纤维产量下降", "mech": "纤维变短、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "收获", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "拔收、脱粒/沤麻", "track": "作物", "confidence": "中", "windowNote": "；起点由库内原始区间前推至 0801（前一阶段终点+1），属设计裁剪非库内物候", "perils": {"rainy": {"thr": "收获期阴雨致原麻霉变、脱胶难", "mech": "原麻霉变、脱胶难", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 0}, "tomato": {"name": "番茄", "regions": {"northeast": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0321", "to": "0331", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0601", "to": "0720", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0721", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "huanghuai": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0101", "to": "0131", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0301", "to": "0331", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0401", "to": "0420", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0421", "to": "0630", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0621", "to": "0630", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "northwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0321", "to": "0331", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0601", "to": "0620", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0621", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "tibet": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "夏茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0421", "to": "0430", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0601", "to": "0630", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0701", "to": "0731", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "yangtze": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0201", "to": "0210", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0521", "to": "0710", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0711", "to": "0720", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "southwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0201", "to": "0210", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P4", "name": "采收期", "from": "0501", "to": "0810", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0711", "to": "0720", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P4", "name": "采收期", "from": "0901", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "south": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "1101", "to": "1130", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "1201", "to": "0131", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0201", "to": "0510", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 或地温<10℃ 冷害", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}}, "notMappedPerils": 8}, "cucumber": {"name": "黄瓜", "regions": {"northeast": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0321", "to": "0331", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0601", "to": "0720", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >12 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 12, "unit": "h", "op": ">", "runDays": [12, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0721", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "huanghuai": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0101", "to": "0131", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0301", "to": "0331", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0401", "to": "0420", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >12 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 12, "unit": "h", "op": ">", "runDays": [12, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0421", "to": "0630", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0621", "to": "0630", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >12 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 12, "unit": "h", "op": ">", "runDays": [12, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "northwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0321", "to": "0331", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0601", "to": "0620", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >12 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 12, "unit": "h", "op": ">", "runDays": [12, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0621", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "tibet": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "夏茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0421", "to": "0430", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0601", "to": "0630", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0701", "to": "0731", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >12 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 12, "unit": "h", "op": ">", "runDays": [12, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "yangtze": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0201", "to": "0210", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >12 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 12, "unit": "h", "op": ">", "runDays": [12, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0521", "to": "0710", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0711", "to": "0720", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >12 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 12, "unit": "h", "op": ">", "runDays": [12, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "southwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0201", "to": "0210", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P4", "name": "采收期", "from": "0501", "to": "0810", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0711", "to": "0720", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P4", "name": "采收期", "from": "0901", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "south": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "1101", "to": "1130", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "1201", "to": "0131", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >12 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 12, "unit": "h", "op": ">", "runDays": [12, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0201", "to": "0510", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}}, "notMappedPerils": 8}, "chili": {"name": "辣椒", "regions": {"northeast": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0321", "to": "0331", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0601", "to": "0720", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0721", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "huanghuai": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0101", "to": "0131", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0301", "to": "0331", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0401", "to": "0420", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0421", "to": "0630", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0621", "to": "0630", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "northwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0321", "to": "0331", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0601", "to": "0620", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0621", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "tibet": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "夏茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0421", "to": "0430", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0601", "to": "0630", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0701", "to": "0731", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "yangtze": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0201", "to": "0210", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0521", "to": "0710", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0711", "to": "0720", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "southwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0201", "to": "0210", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P4", "name": "采收期", "from": "0501", "to": "0810", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0711", "to": "0720", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P4", "name": "采收期", "from": "0901", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "south": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "1101", "to": "1130", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "1201", "to": "0131", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0201", "to": "0510", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}}, "notMappedPerils": 8}, "eggplant": {"name": "茄子", "regions": {"northeast": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0321", "to": "0331", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0601", "to": "0720", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0721", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "huanghuai": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0101", "to": "0131", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0301", "to": "0331", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0401", "to": "0420", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0421", "to": "0630", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0621", "to": "0630", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "northwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0321", "to": "0331", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0601", "to": "0620", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0621", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "tibet": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "夏茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0421", "to": "0430", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0601", "to": "0630", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0701", "to": "0731", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "yangtze": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0201", "to": "0210", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0521", "to": "0710", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0711", "to": "0720", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "southwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0201", "to": "0210", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P4", "name": "采收期", "from": "0501", "to": "0810", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}, {"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0711", "to": "0720", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P4", "name": "采收期", "from": "0901", "to": "1031", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}, "south": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种育苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "浸种催芽、穴盘育苗、控温防病", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "定植缓苗", "from": "1101", "to": "1130", "precision": "tenday", "days": "", "ops": "浇缓苗水、保温/遮荫、查苗补苗", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P3", "name": "开花坐果—结果盛期", "from": "1201", "to": "0131", "precision": "tenday", "days": "", "ops": "保花保果、水肥、分批采收、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">35℃ 持续 3 天", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">=", "runDays": [3, null]}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0201", "to": "0510", "precision": "tenday", "days": "", "ops": "分批采收、预冷", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "≤5℃ 冷害、0℃ 冻死", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}]}]}}, "notMappedPerils": 8}, "cabbage": {"name": "大白菜", "regions": {"northeast": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0721", "to": "0731", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0801", "to": "0826", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0827", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}]}, "huanghuai": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0801", "to": "0810", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0811", "to": "0915", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0916", "to": "1020", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1021", "to": "1110", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}, {"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0311", "to": "0320", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0321", "to": "0420", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0421", "to": "0520", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0521", "to": "0610", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}]}, "northwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0721", "to": "0731", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1001", "to": "1031", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}]}, "tibet": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "夏茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0511", "to": "0520", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0521", "to": "0625", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0626", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}]}, "yangtze": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0811", "to": "0820", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0821", "to": "0925", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0926", "to": "1031", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1101", "to": "1130", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}, {"name": "夏秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0621", "to": "0630", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0701", "to": "0716", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0717", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}]}, "southwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0811", "to": "0820", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0821", "to": "0925", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0926", "to": "1031", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1101", "to": "1210", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}]}, "south": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "1021", "to": "1031", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1101", "to": "1201", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1202", "to": "1231", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0101", "to": "0310", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "-2℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -2, "unit": "℃", "op": "<="}}}]}]}}, "notMappedPerils": 9}, "radish": {"name": "萝卜", "regions": {"northeast": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0721", "to": "0731", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0801", "to": "0826", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0827", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}]}, "huanghuai": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0801", "to": "0810", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0811", "to": "0915", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0916", "to": "1020", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1021", "to": "1110", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}, {"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0311", "to": "0320", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0321", "to": "0420", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0421", "to": "0520", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0521", "to": "0610", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}]}, "northwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0721", "to": "0731", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1001", "to": "1031", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}]}, "tibet": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "夏茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0511", "to": "0520", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0521", "to": "0625", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0626", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}]}, "yangtze": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0811", "to": "0820", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0821", "to": "0925", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0926", "to": "1031", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1101", "to": "1130", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}, {"name": "夏秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0621", "to": "0630", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0701", "to": "0716", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0717", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}]}, "southwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0811", "to": "0820", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0821", "to": "0925", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0926", "to": "1031", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1101", "to": "1210", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}]}, "south": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "1021", "to": "1031", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1101", "to": "1201", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1202", "to": "1231", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0101", "to": "0310", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−1℃ 以下受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -1, "unit": "℃", "op": "<="}}}]}]}}, "notMappedPerils": 9}, "spinach": {"name": "菠菜", "regions": {"northeast": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0801", "to": "0810", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0811", "to": "0831", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}, {"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0401", "to": "0410", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0411", "to": "0430", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0521", "to": "0620", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}]}, "huanghuai": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0821", "to": "0831", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1011", "to": "1120", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}, {"name": "越冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1001", "to": "1215", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1216", "to": "0228", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0301", "to": "0410", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}, {"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0311", "to": "0320", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0321", "to": "0410", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0411", "to": "0430", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}]}, "northwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0821", "to": "0831", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0901", "to": "0920", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1011", "to": "1120", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}, {"name": "越冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1001", "to": "1215", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1216", "to": "0228", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0301", "to": "0420", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}]}, "tibet": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "夏茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0511", "to": "0520", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0521", "to": "0610", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0611", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0701", "to": "0810", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}]}, "yangtze": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0911", "to": "0920", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0921", "to": "1011", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1012", "to": "1031", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1101", "to": "1210", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}, {"name": "春茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0221", "to": "0228", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0301", "to": "0316", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0317", "to": "0331", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0401", "to": "0510", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}]}, "southwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0911", "to": "0920", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0921", "to": "1011", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1012", "to": "1031", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "1101", "to": "1220", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}]}, "south": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "冬茬", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "1021", "to": "1031", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1101", "to": "1201", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1202", "to": "1231", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 5 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [5, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0101", "to": "0310", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−8℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -8, "unit": "℃", "op": "<="}}}]}]}}, "notMappedPerils": 12}, "garlic": {"name": "大蒜", "regions": {"northeast": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0311", "to": "0320", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0321", "to": "0510", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0511", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0701", "to": "0810", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}]}]}, "huanghuai": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1001", "to": "0114", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0115", "to": "0430", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0501", "to": "0610", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}]}]}, "northwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1001", "to": "0114", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0115", "to": "0430", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0501", "to": "0610", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}]}]}, "tibet": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0311", "to": "0320", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "0321", "to": "0510", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0511", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0701", "to": "0810", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}]}]}, "yangtze": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1001", "to": "0114", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "0115", "to": "0430", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}]}]}, "southwest": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0921", "to": "0930", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1001", "to": "1230", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1231", "to": "0331", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0401", "to": "0510", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}]}]}, "south": {"note": "库内区表以露地主茬为准（原文：保护地可周年生产，下表以露地主茬为准）", "plantable": true, "seasons": [{"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "1021", "to": "1031", "precision": "tenday", "days": "", "ops": "直播、浇蒙头水、防地下害虫", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "苗期—莲座期", "from": "1101", "to": "1230", "precision": "tenday", "days": "", "ops": "间苗定苗、蹲苗、追肥、防病", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P3", "name": "膨大/结球期", "from": "1231", "to": "0228", "precision": "tenday", "days": "", "ops": "水肥、防病、束叶/培土", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤相对含水量 <50% 持续 7 天", "mech": "生长停滞、落花落果/结球不实", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<", "runDays": [7, null]}, "storm": {"thr": "积水 >24 小时", "mech": "沤根、死苗、软腐/疫病暴发", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}, "heat": {"thr": ">25℃ 持续", "mech": "花粉败育/抽薹快、品质下降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "连续阴雨 >5 天", "mech": "光照不足、病害暴发、烂叶/裂果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": "连续降雨日数", "src": "04库·五", "value": 5, "unit": "d", "op": ">=", "runDays": [5, null]}}}, {"id": "P4", "name": "采收期", "from": "0301", "to": "0410", "precision": "tenday", "days": "", "ops": "适时采收、预冷贮运", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "−12℃ 以下（无覆盖）受冻", "mech": "冷害/冻死、落花落果", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": -12, "unit": "℃", "op": "<="}}}]}]}}, "notMappedPerils": 7}, "potato": {"name": "马铃薯", "regions": {"northeast": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0716", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}, "storm": {"thr": "积水 >1 天即烂薯死苗", "mech": "烂薯、死苗", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, null]}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0717", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0221", "to": "0310", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0311", "to": "0420", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}, "storm": {"thr": "积水 >1 天即烂薯死苗", "mech": "烂薯、死苗", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, null]}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0421", "to": "0531", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0601", "to": "0630", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}, {"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0801", "to": "0820", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 >1 天即烂薯死苗", "mech": "烂薯、死苗", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, null]}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0821", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0921", "to": "1020", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "1021", "to": "1110", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0701", "to": "0820", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 >1 天即烂薯死苗", "mech": "烂薯、死苗", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, null]}}}, {"id": "P4", "name": "成熟收获", "from": "0821", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "tibet": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0620", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0621", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0801", "to": "0910", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0111", "to": "0210", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0211", "to": "0401", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}, "storm": {"thr": "积水 >1 天即烂薯死苗", "mech": "烂薯、死苗", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, null]}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0402", "to": "0520", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0521", "to": "0620", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}, {"name": "秋播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0821", "to": "0910", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 >1 天即烂薯死苗", "mech": "烂薯、死苗", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, null]}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0911", "to": "1006", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "1007", "to": "1031", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}, "heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}}}, {"id": "P4", "name": "成熟收获", "from": "1101", "to": "1210", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "冬春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0121", "to": "0210", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0211", "to": "0322", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}, "storm": {"thr": "积水 >1 天即烂薯死苗", "mech": "烂薯、死苗", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, null]}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0323", "to": "0430", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0501", "to": "1010", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "south": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "冬播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "1021", "to": "1110", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 >1 天即烂薯死苗", "mech": "烂薯、死苗", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, null]}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "1111", "to": "1221", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "土壤含水量 <50% 影响", "mech": "块茎畸形、减产", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": "土壤相对含水量", "src": "04库·五", "value": 50, "unit": "%", "op": "<"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "1222", "to": "0131", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >25℃ 抑块茎形成", "mech": "块茎形成受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 25, "unit": "℃", "op": ">"}, "rainy": {"thr": "晚疫病暴发、收获难、烂薯", "mech": "晚疫病、烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0201", "to": "0410", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期与收获前霜冻致冻伤烂薯；块茎贮藏 <0℃ 冻害", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 4}, "sorghum": {"name": "高粱", "regions": {"northeast": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0716", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0717", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0706", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0707", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}, {"name": "夏播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0601", "to": "0620", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0621", "to": "0726", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0727", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}, "frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0706", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0707", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0706", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0707", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0321", "to": "0410", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0411", "to": "0615", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0616", "to": "0820", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0821", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 6}, "millet": {"name": "谷子", "regions": {"northeast": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0521", "to": "0721", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0722", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0521", "to": "0711", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0712", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}, {"name": "夏播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0611", "to": "0630", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0701", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0801", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}, "frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0521", "to": "0711", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0712", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0901", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春播", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "耐旱性强，但抽穗–灌浆缺水仍减产", "mech": "穗粒数下降", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "较耐淹，但长期积水致烂根死苗", "mech": "烂根死苗", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0701", "to": "0820", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "开花期 >35℃ 影响授粉", "mech": "授粉不良、结实率降", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "wind": {"thr": "抽穗后倒伏影响机收与品质", "mech": "倒伏", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "D", "valueType": "none", "hazardCode": "WIND", "hazardRaw": "风灾倒伏", "metric": null, "src": "04库·五"}}}, {"id": "P4", "name": "成熟收获", "from": "0821", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "苗期冷害、秋季早霜致灌浆不足", "mech": "灌浆不足", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "收获期穗发芽、霉变", "mech": "穗发芽、霉变", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 5}, "sweetpotato": {"name": "甘薯", "regions": {"huanghuai": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春薯", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0421", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0716", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "块根膨大期缺水致畸形、减产", "mech": "畸形薯、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天烂根烂薯", "mech": "烂根烂薯", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, 2]}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0717", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >30℃ 抑块根膨大", "mech": "块根膨大受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">"}}}, {"id": "P4", "name": "成熟收获", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}, "rainy": {"thr": "病害暴发、收获难、烂薯", "mech": "烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}, {"name": "夏薯", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0601", "to": "0620", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天烂根烂薯", "mech": "烂根烂薯", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, 2]}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0621", "to": "0805", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "块根膨大期缺水致畸形、减产", "mech": "畸形薯、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0806", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >30℃ 抑块根膨大", "mech": "块根膨大受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">"}}}, {"id": "P4", "name": "成熟收获", "from": "0921", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春薯", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0521", "to": "0721", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "块根膨大期缺水致畸形、减产", "mech": "畸形薯、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0722", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >30℃ 抑块根膨大", "mech": "块根膨大受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">"}}}, {"id": "P4", "name": "成熟收获", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春薯", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0521", "to": "0610", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天烂根烂薯", "mech": "烂根烂薯", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, 2]}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0611", "to": "0805", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "块根膨大期缺水致畸形、减产", "mech": "畸形薯、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0806", "to": "0930", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >30℃ 抑块根膨大", "mech": "块根膨大受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">"}}}, {"id": "P4", "name": "成熟收获", "from": "1001", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春薯", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0501", "to": "0520", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0521", "to": "0721", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "块根膨大期缺水致畸形、减产", "mech": "畸形薯、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 1–2 天烂根烂薯", "mech": "烂根烂薯", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, 2]}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0722", "to": "0920", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >30℃ 抑块根膨大", "mech": "块根膨大受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">"}}}, {"id": "P4", "name": "成熟收获", "from": "0921", "to": "1010", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}, "south": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春薯", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0401", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天烂根烂薯", "mech": "烂根烂薯", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, 2]}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0511", "to": "0706", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "块根膨大期缺水致畸形、减产", "mech": "畸形薯、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "0707", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >30℃ 抑块根膨大", "mech": "块根膨大受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">"}}}, {"id": "P4", "name": "成熟收获", "from": "0901", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}, {"name": "秋薯", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": false, "stages": [{"id": "P1", "name": "播种出苗", "from": "0721", "to": "0810", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"storm": {"thr": "积水 1–2 天烂根烂薯", "mech": "烂根烂薯", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 1, "unit": "d", "op": ">", "runDays": [1, 2]}}}, {"id": "P2", "name": "苗期/块茎形成", "from": "0811", "to": "0930", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "块根膨大期缺水致畸形、减产", "mech": "畸形薯、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}}}, {"id": "P3", "name": "关键生育期（抽穗/膨大）", "from": "1001", "to": "1120", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": "膨大期 >30℃ 抑块根膨大", "mech": "块根膨大受抑", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 30, "unit": "℃", "op": ">"}}}, {"id": "P4", "name": "成熟收获", "from": "1121", "to": "1231", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "生长后期霜冻致冻伤烂薯", "mech": "冻伤烂薯", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 7}, "pear": {"name": "梨", "regions": {"northeast": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0411", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花器 0℃ 以下数小时受冻", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0511", "to": "0620", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0621", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根黄化", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0801", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0321", "to": "0420", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花器 0℃ 以下数小时受冻", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0421", "to": "0610", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0611", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根黄化", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0801", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0401", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花器 0℃ 以下数小时受冻", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0615", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0616", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根黄化", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0801", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0301", "to": "0410", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花器 0℃ 以下数小时受冻", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0411", "to": "0521", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0522", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根黄化", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0701", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0221", "to": "0331", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花器 0℃ 以下数小时受冻", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0401", "to": "0516", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0517", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根黄化", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0701", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 5}, "peach": {"name": "桃", "regions": {"northeast": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0411", "to": "0510", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花期 0℃ 以下数小时致花器冻死", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0511", "to": "0605", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0606", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死亡", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0701", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0301", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花期 0℃ 以下数小时致花器冻死", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0516", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0517", "to": "0531", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死亡", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0601", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0321", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花期 0℃ 以下数小时致花器冻死", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0531", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0601", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死亡", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0701", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0301", "to": "0410", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花期 0℃ 以下数小时致花器冻死", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0411", "to": "0506", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0507", "to": "0531", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死亡", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0601", "to": "0831", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0221", "to": "0331", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "花期 0℃ 以下数小时致花器冻死", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0401", "to": "0415", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0416", "to": "0430", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死亡", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0501", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 5}, "grape": {"name": "葡萄", "regions": {"northeast": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0421", "to": "0531", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻死新梢花穗", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0601", "to": "0701", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0702", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0801", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "huanghuai": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0401", "to": "0531", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻死新梢花穗", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0601", "to": "0615", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0616", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0701", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0401", "to": "0531", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻死新梢花穗", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0601", "to": "0701", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0702", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0801", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0321", "to": "0531", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻死新梢花穗", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0601", "to": "0615", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0616", "to": "0630", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0701", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0301", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻死新梢花穗", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0516", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0517", "to": "0531", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >48 h 伤根", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0601", "to": "0930", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 5}, "kiwifruit": {"name": "猕猴桃", "regions": {"huanghuai": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0321", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻伤新梢花器", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0701", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0702", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死树", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0901", "to": "1031", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "northwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0321", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻伤新梢花器", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0701", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0702", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死树", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0901", "to": "1110", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "yangtze": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0321", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻伤新梢花器", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0701", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0702", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死树", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0901", "to": "1110", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0301", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "萌芽开花期 0℃ 以下数小时冻伤新梢花器", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 0, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0615", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0616", "to": "0731", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}, "storm": {"thr": "积水 >24–48 h 烂根死树", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 24, "unit": "h", "op": ">", "runDays": [24, null]}}}, {"id": "P4", "name": "采收", "from": "0801", "to": "1110", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 4}, "banana": {"name": "香蕉", "regions": {"south": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春植", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0201", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "<5℃ 叶片冻伤、<10℃ 生长停滞", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0701", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0702", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"wind": {"thr": "断枝落果、倒伏", "mech": "落果断枝", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "D", "valueType": "none", "hazardCode": "TYPHOON", "hazardRaw": "台风/大风", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 >48 h 烂根死株", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P4", "name": "采收", "from": "0901", "to": "1231", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "春植", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0201", "to": "0430", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "<5℃ 叶片冻伤、<10℃ 生长停滞", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 5, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0501", "to": "0701", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0702", "to": "0831", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"wind": {"thr": "断枝落果、倒伏", "mech": "落果断枝", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "D", "valueType": "none", "hazardCode": "TYPHOON", "hazardRaw": "台风/大风", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 >48 h 烂根死株", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0901", "to": "1231", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 0}, "lychee": {"name": "荔枝", "regions": {"south": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0101", "to": "0310", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "<2℃ 叶片受冻、0℃ 左右花穗幼果冻死", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0311", "to": "0405", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0406", "to": "0430", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"wind": {"thr": "断枝落果、倒伏", "mech": "落果断枝", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "D", "valueType": "none", "hazardCode": "TYPHOON", "hazardRaw": "台风/大风", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 >48 h 烂根", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0501", "to": "0731", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}, "southwest": {"note": "库内区表给播种/定植与收获端点；中间阶段按通用阶段表天数在端點间等分，属派生（非库内单列）", "plantable": true, "seasons": [{"name": "单季", "assumed": false, "completeness": "partial", "annualWindowAllowed": true, "multiYearPerennial": true, "stages": [{"id": "P1", "name": "萌芽/开花", "from": "0101", "to": "0310", "precision": "tenday", "days": "", "ops": "整地、适墒播种/定植、查苗补缺", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"frost": {"thr": "<2℃ 叶片受冻、0℃ 左右花穗幼果冻死", "mech": "花器/新梢/叶片受冻", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "B", "valueType": "numeric", "hazardCode": "FROST", "hazardRaw": "霜冻/低温", "metric": "日最低气温", "src": "04库·五", "value": 2, "unit": "℃", "op": "<="}}}, {"id": "P2", "name": "果实膨大/成熟", "from": "0311", "to": "0405", "precision": "tenday", "days": "", "ops": "水肥、病虫防控、关键期管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"drought": {"thr": "叶片萎蔫、果小、日灼", "mech": "果小、减产", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "C", "valueType": "directional", "hazardCode": "DROUGHT", "hazardRaw": "干旱", "metric": null, "src": "04库·五"}, "heat": {"thr": ">35℃ 日灼、光合受抑", "mech": "日灼、着色差", "numeric": true, "thrType": "harm_threshold", "basis": "B_proxy", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "中", "paramGrade": "B", "valueType": "numeric", "hazardCode": "HEAT", "hazardRaw": "高温热害", "metric": "日最高气温", "src": "04库·五", "value": 35, "unit": "℃", "op": ">="}}}, {"id": "P3", "name": "转色/成熟", "from": "0406", "to": "0430", "precision": "tenday", "days": "", "ops": "水肥、防倒/防病、品质管理", "track": "作物", "confidence": "高", "windowNote": null, "perils": {"wind": {"thr": "断枝落果、倒伏", "mech": "落果断枝", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "D", "valueType": "none", "hazardCode": "TYPHOON", "hazardRaw": "台风/大风", "metric": null, "src": "04库·五"}, "storm": {"thr": "积水 >48 h 烂根", "mech": "烂根黄化/死树", "numeric": true, "thrType": "harm_threshold", "basis": "A_numeric", "agroAnchor": true, "severity": 3, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "A", "valueType": "numeric", "hazardCode": "FLOOD", "hazardRaw": "洪涝", "metric": "田间积水时长", "src": "04库·五", "value": 48, "unit": "h", "op": ">", "runDays": [48, null]}}}, {"id": "P4", "name": "采收", "from": "0501", "to": "0731", "precision": "tenday", "days": "", "ops": "适期收获、晾晒/预冷、分级贮藏", "track": "作物", "confidence": "中", "windowNote": null, "perils": {"rainy": {"thr": "病害高发、裂果", "mech": "裂果、病害", "numeric": false, "thrType": "harm_threshold", "basis": "C_qualitative", "agroAnchor": false, "severity": 0, "severitySource": "derived_from_text_severity", "level": "高", "paramGrade": "C", "valueType": "directional", "hazardCode": "RAINSPELL", "hazardRaw": "连阴雨", "metric": null, "src": "04库·五"}}}]}]}}, "notMappedPerils": 0}}, {schemaVersion:"wii-pheno/1.0", batch:"A+B", records:156, stages:612, perils:1112});
  if (window.console) console.log("[WIIPheno] 批A+B+C 接入：新增 " + r.added.join(",") + (r.merged.length ? "；合并 " + r.merged.join(",") : ""));
})();


/* ==== engine-reverse.js ==== */
/* ============================================================
   引擎一 · 需求反推保险方案（输入关键需求 → 反推可落地方案）
   依赖：window.AGRI_KB
   输出：可被引擎二(方案测算费率)直接消费的 scheme 对象
   升级 v2：① 目标区域省→市→县三级级联（选县自动匹配气候带+坐标）
            ② 主要灾害可多选（组合设计）
            ③ 方案类型：阶梯型理赔阈值 / 线性理赔阈值（RWBCIS式）
            ④ 反推结果结合全生育期农事农时历与作物真实受灾机理
   ============================================================ */
(function () {
  'use strict';
  var KB = window.AGRI_KB;

  // 灾害中文名
  var PERIL_CN = { drought: '干旱/降水亏缺', frost: '低温霜冻', heat: '高温热害', rainy: '连阴雨渍涝', storm: '暴雨洪涝', wind: '大风倒伏' };
  var PERIL_LIST = ['drought', 'frost', 'heat', 'rainy', 'storm', 'wind'];

  // 经验费率基调（纯费率%，仅供反推占位，须用引擎二真实气象回测校准）
  var PERIL_BASE = { drought: [4, 7], frost: [3, 6], heat: [3, 6], rainy: [3, 5], storm: [2, 4], wind: [2, 4] };
  var ZONE_MULT = { northeast: 1.10, huanghuai: 1.05, yangtze: 1.10, southwest: 1.00, northwest: 1.15, south: 1.10 };

  function pct(x) { return (x * 100).toFixed(2) + '%'; }
  function rv(id) { return document.getElementById(id).value; }
  function chk(id) { var e = document.getElementById(id); return e ? e.checked : false; }

  /* ============================================================
     省 → 市 → 县 地理层级（气候带 z + 市坐标；县坐标取县治近似，取自所属市）
     覆盖阳光财险农险主要经营区域的代表农业县，县域坐标用于"送入引擎二取真实历史气象"
     ============================================================ */
  var GEO = {
    '黑龙江': { z: 'northeast', cities: {
      '哈尔滨': { lat: 45.80, lon: 126.53, c: ['哈尔滨市区', '五常市', '巴彦县', '尚志市', '双城区'] },
      '齐齐哈尔': { lat: 47.35, lon: 123.92, c: ['龙江县', '甘南县', '讷河市'] },
      '绥化': { lat: 46.63, lon: 126.97, c: ['北林区', '庆安县', '海伦市'] },
      '佳木斯': { lat: 46.81, lon: 130.37, c: ['富锦市', '桦南县', '桦川县'] } } },
    '吉林': { z: 'northeast', cities: {
      '长春': { lat: 43.82, lon: 125.32, c: ['农安县', '榆树市', '德惠市', '九台区'] },
      '松原': { lat: 45.14, lon: 124.82, c: ['前郭县', '长岭县', '乾安县'] },
      '四平': { lat: 43.17, lon: 124.35, c: ['梨树县', '伊通县', '双辽市'] },
      '吉林市': { lat: 43.84, lon: 126.55, c: ['舒兰市', '永吉县', '磐石市'] } } },
    '辽宁': { z: 'northeast', cities: {
      '沈阳': { lat: 41.80, lon: 123.43, c: ['新民市', '辽中区', '法库县'] },
      '铁岭': { lat: 42.29, lon: 123.84, c: ['昌图县', '开原市', '西丰县'] },
      '锦州': { lat: 41.10, lon: 121.13, c: ['黑山县', '北镇市', '义县'] } } },
    '内蒙古（东部）': { z: 'northeast', cities: {
      '呼伦贝尔': { lat: 49.21, lon: 119.77, c: ['扎兰屯市', '莫力达瓦旗', '阿荣旗'] },
      '兴安盟': { lat: 46.08, lon: 122.08, c: ['乌兰浩特市', '突泉县', '扎赉特旗'] },
      '通辽': { lat: 43.65, lon: 122.27, c: ['科左中旗', '开鲁县', '库伦旗'] },
      '赤峰': { lat: 42.26, lon: 118.92, c: ['翁牛特旗', '宁城县', '喀喇沁旗'] } } },
    '山东': { z: 'huanghuai', cities: {
      '聊城': { lat: 36.46, lon: 115.98, c: ['高唐县', '莘县', '冠县', '临清市'] },
      '德州': { lat: 37.43, lon: 116.36, c: ['禹城市', '平原县', '陵城区'] },
      '济南': { lat: 36.65, lon: 117.12, c: ['章丘区', '商河县', '济阳区'] },
      '菏泽': { lat: 35.23, lon: 115.48, c: ['曹县', '郓城县', '单县'] },
      '济宁': { lat: 35.41, lon: 116.59, c: ['汶上县', '嘉祥县', '兖州区'] } } },
    '河南': { z: 'huanghuai', cities: {
      '周口': { lat: 33.63, lon: 114.65, c: ['扶沟县', '太康县', '西华县', '沈丘县'] },
      '郑州': { lat: 34.75, lon: 113.62, c: ['新郑市', '中牟县', '荥阳市'] },
      '商丘': { lat: 34.41, lon: 115.65, c: ['夏邑县', '虞城县', '柘城县'] },
      '南阳': { lat: 32.99, lon: 112.53, c: ['邓州市', '唐河县', '新野县'] },
      '驻马店': { lat: 33.00, lon: 113.98, c: ['上蔡县', '正阳县', '平舆县'] } } },
    '河北': { z: 'huanghuai', cities: {
      '石家庄': { lat: 38.04, lon: 114.51, c: ['藁城区', '赵县', '栾城区'] },
      '邯郸': { lat: 36.61, lon: 114.49, c: ['大名县', '魏县', '曲周县'] },
      '保定': { lat: 38.87, lon: 115.46, c: ['清苑区', '定州市', '安国市'] },
      '沧州': { lat: 38.30, lon: 116.86, c: ['献县', '吴桥县', '河间市'] } } },
    '安徽（皖北）': { z: 'huanghuai', cities: {
      '合肥': { lat: 31.82, lon: 117.23, c: ['长丰县', '肥东县', '肥西县'] },
      '阜阳': { lat: 32.90, lon: 115.81, c: ['临泉县', '太和县', '颍上县'] },
      '宿州': { lat: 33.63, lon: 116.99, c: ['埇桥区', '灵璧县', '泗县'] },
      '蚌埠': { lat: 32.92, lon: 117.39, c: ['怀远县', '五河县'] } } },
    '江苏（苏北）': { z: 'huanghuai', cities: {
      '徐州': { lat: 34.27, lon: 117.18, c: ['邳州市', '睢宁县', '沛县'] },
      '盐城': { lat: 33.35, lon: 120.16, c: ['大丰区', '射阳县', '建湖县'] },
      '连云港': { lat: 34.60, lon: 119.16, c: ['东海县', '灌云县'] } } },
    '湖北': { z: 'yangtze', cities: {
      '武汉': { lat: 30.59, lon: 114.30, c: ['黄陂区', '江夏区', '新洲区'] },
      '黄冈': { lat: 30.45, lon: 114.87, c: ['浠水县', '蕲春县', '麻城市', '红安县'] },
      '荆州': { lat: 30.35, lon: 112.24, c: ['监利市', '洪湖市', '公安县'] },
      '襄阳': { lat: 32.01, lon: 112.12, c: ['枣阳市', '宜城市', '谷城县'] } } },
    '湖南': { z: 'yangtze', cities: {
      '长沙': { lat: 28.23, lon: 112.94, c: ['长沙县', '宁乡市', '浏阳市'] },
      '常德': { lat: 29.03, lon: 111.70, c: ['桃源县', '临澧县', '汉寿县'] },
      '益阳': { lat: 28.55, lon: 112.36, c: ['南县', '赫山区', '沅江市'] },
      '岳阳': { lat: 29.36, lon: 113.13, c: ['华容县', '岳阳县', '汨罗市'] } } },
    '江西': { z: 'yangtze', cities: {
      '南昌': { lat: 28.68, lon: 115.86, c: ['南昌县', '新建区', '进贤县'] },
      '九江': { lat: 29.71, lon: 116.00, c: ['都昌县', '永修县', '湖口县'] },
      '上饶': { lat: 28.45, lon: 117.97, c: ['鄱阳县', '余干县', '万年县'] },
      '吉安': { lat: 27.12, lon: 114.99, c: ['泰和县', '吉水县', '永丰县'] } } },
    '浙江': { z: 'yangtze', cities: {
      '杭州': { lat: 30.27, lon: 120.15, c: ['建德市', '桐庐县', '富阳区'] },
      '嘉兴': { lat: 30.75, lon: 120.75, c: ['海宁市', '桐乡市', '平湖市'] },
      '宁波': { lat: 29.87, lon: 121.55, c: ['余姚市', '慈溪市'] },
      '金华': { lat: 29.08, lon: 119.65, c: ['兰溪市', '义乌市'] } } },
    '安徽（皖南）': { z: 'yangtze', cities: {
      '芜湖': { lat: 31.33, lon: 118.43, c: ['无为市', '湾沚区'] },
      '安庆': { lat: 30.51, lon: 117.05, c: ['怀宁县', '望江县', '宿松县'] } } },
    '江苏（苏南）': { z: 'yangtze', cities: {
      '南京': { lat: 32.06, lon: 118.80, c: ['高淳区', '溧水区'] },
      '苏州': { lat: 31.30, lon: 120.62, c: ['常熟市', '太仓市'] } } },
    '四川': { z: 'southwest', cities: {
      '成都': { lat: 30.57, lon: 104.07, c: ['崇州市', '邛崃市', '金堂县'] },
      '绵阳': { lat: 31.47, lon: 104.68, c: ['三台县', '江油市', '梓潼县'] },
      '南充': { lat: 30.80, lon: 106.08, c: ['西充县', '南部县', '阆中市'] },
      '宜宾': { lat: 28.75, lon: 104.64, c: ['宜宾县', '江安县', '长宁县'] },
      '德阳': { lat: 31.13, lon: 104.40, c: ['中江县', '广汉市'] } } },
    '重庆': { z: 'southwest', cities: {
      '重庆': { lat: 29.56, lon: 106.55, c: ['合川区', '铜梁区', '垫江县', '忠县'] } } },
    '贵州': { z: 'southwest', cities: {
      '贵阳': { lat: 26.65, lon: 106.63, c: ['开阳县', '息烽县', '清镇市'] },
      '遵义': { lat: 27.73, lon: 106.92, c: ['湄潭县', '播州区', '凤冈县'] },
      '黔东南': { lat: 26.58, lon: 107.98, c: ['凯里市', '黎平县', '锦屏县'] } } },
    '云南': { z: 'southwest', cities: {
      '昆明': { lat: 25.04, lon: 102.71, c: ['宜良县', '石林县', '嵩明县'] },
      '曲靖': { lat: 25.49, lon: 103.68, c: ['陆良县', '师宗县', '罗平县'] },
      '玉溪': { lat: 24.35, lon: 102.55, c: ['通海县', '澄江市', '江川区'] },
      '红河': { lat: 23.37, lon: 103.37, c: ['建水县', '石屏县', '弥勒市'] } } },
    '陕西': { z: 'northwest', cities: {
      '西安': { lat: 34.34, lon: 108.94, c: ['周至县', '鄠邑区', '蓝田县'] },
      '渭南': { lat: 34.50, lon: 109.50, c: ['大荔县', '蒲城县', '富平县'] },
      '咸阳': { lat: 34.34, lon: 108.71, c: ['武功县', '兴平市', '三原县'] },
      '榆林': { lat: 38.29, lon: 109.74, c: ['榆阳区', '靖边县', '定边县'] } } },
    '甘肃': { z: 'northwest', cities: {
      '兰州': { lat: 36.06, lon: 103.83, c: ['榆中县', '永登县'] },
      '张掖': { lat: 38.93, lon: 100.45, c: ['临泽县', '高台县', '甘州区'] },
      '庆阳': { lat: 35.71, lon: 107.64, c: ['西峰区', '镇原县', '宁县'] },
      '酒泉': { lat: 39.74, lon: 98.49, c: ['敦煌市', '金塔县'] } } },
    '宁夏': { z: 'northwest', cities: {
      '银川': { lat: 38.49, lon: 106.23, c: ['贺兰县', '永宁县', '灵武市'] },
      '吴忠': { lat: 38.00, lon: 106.20, c: ['青铜峡市', '利通区', '盐池县'] } } },
    '新疆': { z: 'northwest', cities: {
      '乌鲁木齐': { lat: 43.83, lon: 87.62, c: ['米东区', '乌鲁木齐县'] },
      '昌吉': { lat: 44.02, lon: 87.30, c: ['昌吉市', '玛纳斯县', '呼图壁县'] },
      '伊犁': { lat: 43.92, lon: 81.32, c: ['伊宁市', '察布查尔县', '霍城县'] },
      '阿克苏': { lat: 41.17, lon: 80.27, c: ['温宿县', '沙雅县', '库车市'] } } },
    '山西': { z: 'northwest', cities: {
      '太原': { lat: 37.87, lon: 112.55, c: ['清徐县', '阳曲县', '娄烦县'] },
      '运城': { lat: 35.02, lon: 111.00, c: ['临猗县', '芮城县', '永济市'] },
      '晋中': { lat: 37.69, lon: 112.75, c: ['太谷区', '祁县', '平遥县'] } } },
    '内蒙古（西部）': { z: 'northwest', cities: {
      '呼和浩特': { lat: 40.84, lon: 111.75, c: ['土默特左旗', '托克托县', '和林格尔县'] },
      '巴彦淖尔': { lat: 40.74, lon: 107.40, c: ['临河区', '五原县', '杭锦后旗'] },
      '鄂尔多斯': { lat: 39.61, lon: 109.78, c: ['准格尔旗', '达拉特旗'] } } },
    '广东': { z: 'south', cities: {
      '广州': { lat: 23.13, lon: 113.26, c: ['从化区', '增城区', '花都区'] },
      '茂名': { lat: 21.66, lon: 110.93, c: ['高州市', '化州市', '信宜市'] },
      '湛江': { lat: 21.27, lon: 110.36, c: ['雷州市', '徐闻县', '遂溪县'] },
      '肇庆': { lat: 23.05, lon: 112.44, c: ['高要区', '四会市'] } } },
    '广西': { z: 'south', cities: {
      '南宁': { lat: 22.82, lon: 108.37, c: ['武鸣区', '隆安县', '上林县'] },
      '玉林': { lat: 22.63, lon: 110.18, c: ['陆川县', '博白县', '北流市'] },
      '桂林': { lat: 25.27, lon: 110.29, c: ['临桂区', '全州县', '灵川县'] },
      '柳州': { lat: 24.33, lon: 109.42, c: ['柳城县', '鹿寨县'] } } },
    '福建': { z: 'south', cities: {
      '福州': { lat: 26.07, lon: 119.30, c: ['闽侯县', '福清市', '长乐区'] },
      '漳州': { lat: 24.51, lon: 117.66, c: ['龙海区', '南靖县', '漳浦县'] },
      '泉州': { lat: 24.87, lon: 118.58, c: ['南安市', '安溪县', '惠安县'] } } },
    '海南': { z: 'south', cities: {
      '海口': { lat: 20.04, lon: 110.32, c: ['琼山区', '澄迈县'] },
      '三亚': { lat: 18.25, lon: 109.51, c: ['崖州区', '乐东县'] },
      '儋州': { lat: 19.52, lon: 109.58, c: ['儋州市', '临高县'] } } }
  };

  function geoMeta(prov, city, county) {
    var g = GEO[prov]; if (!g) return null;
    var c = g.cities[city]; if (!c) return null;
    return { zone: g.z, lat: c.lat, lon: c.lon };
  }

  // 初始化省→市→县级联
  function initGeo() {
    var prov = document.getElementById('rv-prov');
    if (!prov) return;
    Object.keys(GEO).forEach(function (p) {
      var o = document.createElement('option'); o.value = p; o.textContent = p; prov.appendChild(o);
    });
    function fillCity(p) {
      var cs = document.getElementById('rv-city'); cs.innerHTML = '<option value="">市</option>';
      var co = document.getElementById('rv-county'); co.innerHTML = '<option value="">县/区</option>';
      if (!p) return;
      Object.keys(GEO[p].cities).forEach(function (c) {
        var o = document.createElement('option'); o.value = c; o.textContent = c; cs.appendChild(o);
      });
    }
    function fillCounty(p, c) {
      var co = document.getElementById('rv-county'); co.innerHTML = '<option value="">县/区</option>';
      if (!p || !c) return;
      GEO[p].cities[c].c.forEach(function (x) {
        var o = document.createElement('option'); o.value = x; o.textContent = x; co.appendChild(o);
      });
    }
    prov.addEventListener('change', function () {
      fillCity(this.value);
      document.getElementById('rv-county').innerHTML = '<option value="">县/区</option>';
      document.getElementById('rv-geo-status').textContent = '已选省，继续选市、县';
    });
    document.getElementById('rv-city').addEventListener('change', function () {
      fillCounty(rv('rv-prov'), this.value);
      document.getElementById('rv-geo-status').textContent = '已选市，继续选县/区';
    });
    document.getElementById('rv-county').addEventListener('change', function () {
      var st = document.getElementById('rv-geo-status');
      if (!this.value) { st.textContent = '选县后自动匹配气候带，坐标自动送入引擎二取该县真实历史气象'; return; }
      var m = geoMeta(rv('rv-prov'), rv('rv-city'), this.value);
      if (m && document.getElementById('rv-zone')) document.getElementById('rv-zone').value = m.zone;
      st.innerHTML = '已选 <b>' + rv('rv-prov') + ' · ' + rv('rv-city') + ' · ' + this.value +
        '</b>　气候带：' + (KB.zones[m.zone] ? KB.zones[m.zone].name : m.zone) +
        '　坐标(县治近似)：' + m.lat.toFixed(2) + '°N, ' + m.lon.toFixed(2) + '°E（自动送入引擎二取真实历史气象）';
    });
  }

  /* ---------- 物候 / 子方案 ---------- */
  // 物候窗口：优先物候引擎（区域化·月旬精度·带耐受阈值）；无数据退回 KB 月份区间
  function phenoWindow(cropKey, zoneKey, peril) {
    var P = window.WIIPheno;
    if (!P || !cropKey || !P.getCrops()[cropKey]) return null;
    var rk = (P.ZONE2REGION && P.ZONE2REGION[zoneKey]) || zoneKey;
    var s = P.suggest(cropKey, rk, peril, { mode: 'core' });
    if (!s.ok) return { miss: true, reason: s.reason, region: rk };
    return {
      region: rk, sug: s,
      window: [s.window.m1, s.window.d1, s.window.m2, s.window.d2],
      label: s.anchor.season + '·' + s.anchor.stage,
      note: s.anchor.thr || s.anchor.note,
      mech: s.anchor.mech
    };
  }

  function findWindow(crop, peril) {
    var phases = crop.phenology || [];
    // 物候未接入：返回显式占位，**不得用月份区间兜底**——
    // 兜底会生成一个整体错季的方案，比报错危险得多。
    if (!phases.length) return { name: '物候待接入', m: null, vul: [], note: '该作物的区域物候数据尚未接入，无法按物候定位窗口', pending: true };
    for (var i = 0; i < phases.length; i++) {
      if (phases[i].vul.indexOf(peril) >= 0) return phases[i];
    }
    return phases[phases.length - 1];
  }

  // 单责任子方案（保留旧形状，兼容引擎二 loadFromScheme）
  function subScheme(crop, zoneKey, peril, sum, cropKey) {
    var tpl = KB.perilTpl[peril];
    var idx = KB.indexTypes[tpl.index];
    var ck = cropKey || (document.getElementById('rv-crop') ? document.getElementById('rv-crop').value : '');
    var pk = phenoWindow(ck, zoneKey, peril);
    var phase = findWindow(crop, peril);
    var pending = !!(phase.pending && !(pk && pk.window));
    // 兜底：KB 只到月份，日取 1 与 28 占位，前端会标注"仅月份粒度"
    var win = (pk && pk.window) ? pk.window : (phase.m ? [phase.m[0], 1, phase.m[1], 28] : null);
    return {
      peril: peril, perilName: PERIL_CN[peril],
      indexKey: tpl.index, indexName: idx.name, indexBase: idx.base, indexUnit: idx.unit, indexDir: idx.dir,
      window: win,
      windowLabel: (pk && pk.label) ? pk.label : phase.name,
      phenoNote: (pk && pk.note) ? pk.note : phase.note,
      pheno: pk || null, pending: pending,
      triggerParams: tpl.params, ratio: JSON.parse(JSON.stringify(tpl.ratio))
    };
  }

  // 当前勾选的灾害（按 PERIL_LIST 顺序）
  function getCheckedPerils() {
    var box = document.getElementById('rv-perils'); if (!box) return [];
    var out = [];
    PERIL_LIST.forEach(function (p) {
      var inp = box.querySelector('input[value="' + p + '"]');
      if (inp && inp.checked) out.push(p);
    });
    return out;
  }

  function buildScheme() {
    var cropKey = rv('rv-crop');
    var zoneKey = rv('rv-zone');
    var perils = getCheckedPerils();
    var sum = parseFloat(rv('rv-sum')) || 400;
    var rateCap = parseFloat(rv('rv-cap')) || 0;
    var insured = rv('rv-insured');
    var policy = chk('rv-policy');
    var paytype = rv('rv-paytype') || 'step';
    var crop = KB.crops[cropKey];
    var subs = perils.map(function (p) { return subScheme(crop, zoneKey, p, sum, cropKey); });
    var primary = subs[0] || null;
    var combo = null;
    if (subs.length > 1) {
      var p1 = subs[0], p2 = subs[1];
      var lo = Math.min(1, (PERIL_BASE[p1.peril][0] + PERIL_BASE[p2.peril][0]) / 100 * (ZONE_MULT[zoneKey] || 1));
      var hi = Math.min(1, (PERIL_BASE[p1.peril][1] + PERIL_BASE[p2.peril][1]) / 100 * (ZONE_MULT[zoneKey] || 1));
      combo = { primary: p1, secondary: p2, lo: lo, hi: hi };
    }
    var geo = geoMeta(rv('rv-prov'), rv('rv-city'), rv('rv-county'));
    return {
      crop: cropKey, cropName: crop.name, zone: zoneKey, zoneName: KB.zones[zoneKey] ? KB.zones[zoneKey].name : '—',
      perils: subs, primary: primary, combo: combo, paytype: paytype,
      sumInsured: sum, rateCap: rateCap, insured: insured, policy: policy,
      county: rv('rv-county') || '', city: rv('rv-city') || '', province: rv('rv-prov') || '', geo: geo
    };
  }

  function estimateRateOne(peril, zoneKey) {
    var base = PERIL_BASE[peril];
    var mult = ZONE_MULT[zoneKey] || 1.0;
    return { lo: Math.max(0.5, (base[0] - 1.2) * mult), hi: (base[1] + 1.2) * mult };
  }

  function renderRatioTable(idx) {
    var ratio = idx.ratio, dir = idx.indexDir, op = dir === 'low' ? '≤' : '≥', unit = idx.indexUnit;
    var keys = Object.keys(ratio).map(Number).sort(function (a, b) { return dir === 'low' ? b - a : a - b; });
    var rows = '';
    keys.forEach(function (k) { rows += '<tr><td>' + unit + ' ' + op + ' ' + fmtNum(k) + '</td><td>赔付 ' + pct(ratio[k]) + '</td></tr>'; });
    return '<table class="mini"><tr><th>触发条件</th><th>赔付强度</th></tr>' + rows + '</table>';
  }

  // 线性理赔阈值（RWBCIS式）：触发→退出区间线性折算
  function linearInfo(sub) {
    var dir = sub.indexDir;
    var ks = Object.keys(sub.ratio).map(Number).sort(function (a, b) { return a - b; });
    var T, E, cap;
    if (dir === 'low') { T = ks[ks.length - 1]; E = ks[0]; cap = sub.ratio[E]; }
    else { T = ks[0]; E = ks[ks.length - 1]; cap = sub.ratio[E]; }
    var mid = (T + E) / 2;
    return {
      dir: dir, T: T, E: E, cap: cap, unit: sub.indexUnit,
      formula: dir === 'low'
        ? '赔付率 = ' + pct(cap) + ' × (' + fmtNum(T) + ' − 指数值) ÷ (' + fmtNum(T) + ' − ' + fmtNum(E) + ')；指数 ≥ ' + fmtNum(T) + ' 赔0%，≤ ' + fmtNum(E) + ' 按 ' + pct(cap) + ' 封顶'
        : '赔付率 = ' + pct(cap) + ' × (指数值 − ' + fmtNum(T) + ') ÷ (' + fmtNum(E) + ' − ' + fmtNum(T) + ')；指数 ≤ ' + fmtNum(T) + ' 赔0%，≥ ' + fmtNum(E) + ' 按 ' + pct(cap) + ' 封顶',
      samples: [[T, 0], [mid, cap / 2], [E, cap]]
    };
  }
  function renderLinear(sub) {
    var L = linearInfo(sub), rows = '';
    L.samples.forEach(function (r) {
      rows += '<tr><td>' + sub.indexUnit + ' ' + fmtNum(r[0]) + '</td><td>赔付 ' + pct(r[1]) + '</td></tr>';
    });
    return '<table class="mini"><tr><th>指数值</th><th>赔付率</th></tr>' + rows + '</table>' +
      '<div class="note-sm">线性折算（' + (L.dir === 'low' ? '越低越赔' : '越高越赔') + '）：' + L.formula + '</div>';
  }

  function fmtNum(x) { return parseFloat(x.toFixed(2)).toString(); }
  function fmtMD(m, d) { return m + '月' + d + '日'; }
  function fmtSpan(arr) { return arr[0] + '月—' + arr[2] + '月'; }

  // 全生育期农事农时历（区域化 · 月旬粒度 · 带耐受阈值）
  function phenoCalendar(cropKey, zoneKey, peril) {
    var P = window.WIIPheno;
    var rk = (P && P.ZONE2REGION) ? (P.ZONE2REGION[zoneKey] || zoneKey) : zoneKey;
    var crop = KB.crops[cropKey];
    var cname = crop ? crop.name : cropKey;

    if (P && P.getCrops()[cropKey]) {
      var cal = P.calendar(cropKey, rk, peril);
      if (cal.length) {
        var rname = (P.REGIONS[rk] || {}).name || rk;
        var rows = cal.map(function (c) {
          var pl = c.perils.map(function (p) { return PERIL_CN[p] || p; }).join('、') || '—';
          return '<tr class="' + (c.sensitive ? 'sens' : '') + '">' +
            '<td class="pstage">' + c.name + (c.season ? '<div class="pzone">' + c.season + '</div>' : '') + '</td>' +
            '<td class="pzone">' + c.from + '–' + c.to + '<div>' + c.start + '–' + c.end + '</div></td>' +
            '<td class="pzone">' + (c.days || '—') + '</td>' +
            '<td class="pops">' + (c.ops || '—') + '</td>' +
            '<td>' + pl + '</td>' +
            '<td class="' + (c.thr ? 'pthr' : 'pnone') + '">' + (c.thr || '—（库内未给数值，待试点县标定）') + '</td>' +
            '</tr>';
        }).join('');
        return '<div class="rb-sub">全生育期农事农时历 · ' + cname + ' · ' + rname +
          '（月/旬取自 04 库，<span style="color:#e0792e;font-weight:700">黄底</span>为该主害敏感阶段）</div>' +
          '<table class="pcal"><tr><th>生育阶段</th><th>月旬 / 折日期</th><th>持续天数·积温</th><th>关键农事</th><th>主要怕灾</th><th>耐受阈值（库内原文）</th></tr>' +
          rows + '</table>' +
          '<div class="note-sm">' + (P.META ? P.META.caveat : '') + '</div>';
      }
    }

    // 兜底：KB 仅月份粒度
    if (!crop) return '';
    if (!crop.phenology || !crop.phenology.length) {
      // 未接入 ≠ 只有月份粒度。两者的话术必须分开，否则用户以为"精度低但能用"。
      return '<div class="rb-sub">全生育期农事农时历 · ' + cname + '</div>' +
        '<div class="note-sm" style="color:#c0392b;font-weight:600;padding:8px 0">' +
        '该作物的区域物候数据（生育阶段、关键农事、耐受阈值）尚未接入本平台，因此无农事农时历可展示。<br>' +
        '平台不会用月份区间代替物候——那会显示出一张"看着有内容、实际错季"的表。' +
        '待该作物物候批次交付后自动生效。</div>';
    }
    var rows2 = crop.phenology.map(function (ph) {
      var pcn = ph.vul.map(function (p) { return PERIL_CN[p]; }).join('、');
      return '<tr><td class="pstage">' + ph.name + '</td><td class="pzone">' + ph.m[0] + '月–' + ph.m[1] + '月</td><td>' + pcn + '</td><td class="pops">' + ph.note + '</td></tr>';
    }).join('');
    return '<div class="rb-sub">全生育期农事农时历（' + crop.name + '，仅月份粒度 · 未接入区域物候库）</div>' +
      '<table class="pcal"><tr><th>生育阶段</th><th>月份区间</th><th>主要怕灾</th><th>真实受灾机理</th></tr>' + rows2 + '</table>';
  }

  // 某种灾害在哪些物候阶段造成真实受灾（机理串联）
  function mechanismFor(crop, peril) {
    var hits = crop.phenology.filter(function (ph) { return ph.vul.indexOf(peril) >= 0; });
    if (!hits.length) return '<div class="note-sm">' + PERIL_CN[peril] + '：本作物物候库中无直接命中阶段（可结合县域实测标定）。</div>';
    return hits.map(function (ph) {
      return '<li><b>' + ph.name + '（' + fmtSpan(ph.m) + '）</b>：' + ph.note + '</li>';
    }).join('');
  }

  // 单责任卡片块（含农事农时 + 真实受灾机理 + 阶梯/线性赔付）
  function perilBlock(sub, paytype, tag) {
    var est = estimateRateOne(sub.peril, currentZone());
    var payout = paytype === 'linear' ? renderLinear(sub) : renderRatioTable(sub);
    var payLabel = paytype === 'linear' ? '线性理赔阈值（RWBCIS式）' : '阶梯型理赔阈值（分档查表）';
    return '<div class="res-block"><div class="rb-h">' + tag + ' · ' + sub.indexName + '（' + sub.perilName + '）</div>' +
      '<div class="rb-b">' +
      (sub.pending || !sub.window
        ? card('关键物候窗口（农事农时）', '物候待接入',
            '<span style="color:#c0392b;font-weight:700">该作物的区域物候数据尚未接入本平台，无法按物候定位窗口。</span><br>' +
            '平台**不使用月份区间兜底**——那会生成一个整体错季的方案，比不出方案更危险。<br>' +
            '请改选已接入的作物，或等该作物的物候批次交付后在「方案设计器」中手工设窗并标注依据。')
        : card('关键物候窗口（农事农时）', sub.windowLabel, '卡点：' + sub.phenoNote + '<br>建议保险期间：每年 ' + fmtMD(sub.window[0], sub.window[1]) + ' — ' + fmtMD(sub.window[2], sub.window[3]))) +
      card('真实受灾机理（作物对应）', PERIL_CN[sub.peril] + ' 命中阶段', '<ul class="mech">' + mechanismFor(currentCrop(), sub.peril) + '</ul>') +
      card('触发参数建议', '待试点县标定', sub.triggerParams) +
      card('经验费率区间（纯费率）', pct(est.lo / 100) + ' ~ ' + pct(est.hi / 100),
        '含费用率15%+风险附加10%后综合费率约 ' + pct(est.lo * 1.25 / 100) + ' ~ ' + pct(est.hi * 1.25 / 100) + '<br>补贴后农户端常封顶 1.5-2%') +
      '<div class="rb-sub">分段赔付函数 · ' + payLabel + '（保额 ' + currentSum() + ' 元/亩）</div>' + payout +
      '<div class="note-sm">赔付额 = 单位保额 × 指数赔付率（' + (paytype === 'linear' ? '线性折算' : '分档查表') + '），设起赔与封顶；阈值/比例以【】占位，待历史气象标定+监管批复。</div>' +
      '</div></div>';
  }

  function currentZone() { return rv('rv-zone'); }
  function currentSum() { return parseFloat(rv('rv-sum')) || 400; }
  function currentCrop() { return KB.crops[rv('rv-crop')]; }

  function basisRisk(s) {
    var region = s.county ? (s.province + '·' + s.city + '·' + s.county) : (s.zoneName || '—');
    var arr = [
      '① <b>农时物候精准匹配</b>：指数必须卡在作物最怕灾时点（如 ' + (s.primary ? s.primary.windowLabel : '关键物候窗口') + '），从源头降基差；',
      '② <b>网格化 + 加地面观测</b>：县域用多站/卫星网格化（ERA5 约 25km 网格，须以县站/省气候中心观测标定）；本方案目标县【' + region + '】坐标约 ' + (s.geo ? (s.geo.lat.toFixed(2) + '°N,' + s.geo.lon.toFixed(2) + '°E') : '待选') + '，可送入引擎二取真实历史气象。',
      '③ <b>遥感校验校准</b>：NDVI/降水反演作设计期校验与对农户/监管佐证（纯指数不叠加产量触发）；',
      '④ <b>机器学习量化基差</b>：建模"气象指数→实际损失"偏差分布，定位高基差区域/作物；',
      '⑤ <b>再保/区域分散</b>：系统性基差用再保与多县区组合分散；多责任合计时合计 ULR 须落在 70%-75%，勿机械平分。'
    ];
    return arr.join('<br>');
  }

  function render(scenarioKey) {
    var scheme, out;
    try { scheme = buildScheme(); } catch (e) { return; }
    out = document.getElementById('reverse-out');
    if (!scheme.perils.length) {
      out.innerHTML = '<div class="warn">请至少勾选一种「主要灾害」（可多选组合设计）后再反推。</div>';
      out.style.display = 'block';
      return;
    }

    var regionTxt = scheme.county
      ? (scheme.province + ' · ' + scheme.city + ' · <b>' + scheme.county + '</b>')
      : (scheme.zoneName || '—');
    var geoTxt = scheme.geo ? ('　坐标(县治近似)：' + scheme.geo.lat.toFixed(2) + '°N, ' + scheme.geo.lon.toFixed(2) + '°E') : '';

    var rateNote = scheme.rateCap > 0
      ? '<div class="warn">你设定的期望费率上限为 <b>' + pct(scheme.rateCap / 100) + '</b>；下方为经验费率区间，若超出需用引擎二回测后收紧阈值或提保额/调结构。</div>'
      : '';

    var comboNote = '';
    if (scheme.combo) {
      comboNote = '<div class="callout" style="margin-top:10px"><b>多责任合计前瞻：</b>主害（' + scheme.combo.primary.perilName +
        '）与次害（' + scheme.combo.secondary.perilName + '）合计经验纯费率约 ' + pct(scheme.combo.lo / 100) + ' ~ ' +
        pct(scheme.combo.hi / 100) + '。进入引擎二勾选「多责任合计」可逐年叠加两责赔付（封顶100%）真实回测<b>合计 ULR</b>，并校准至 70%-75% 可持续带。</div>';
    }

    var perilBlocks = scheme.perils.map(function (sub, i) {
      return perilBlock(sub, scheme.paytype, scheme.perils.length > 1 ? ('责任' + (i + 1)) : '主害责任');
    }).join('');

    var payIntro = scheme.paytype === 'linear'
      ? '<div class="res-block"><div class="rb-h">方案类型说明 · 线性理赔阈值（RWBCIS式）</div><div class="rb-b">触发即按"触发值→退出值"线性折算赔付，无分档跳变，平滑贴合农户损失曲线；适用于物候窗口内指数连续变化、农户损失近似线性的场景（印度 RWBCIS 主要形态）。退出值以上按封顶比例赔。</div></div>'
      : '<div class="res-block"><div class="rb-h">方案类型说明 · 阶梯型理赔阈值（分档查表）</div><div class="rb-b">达到档位即按固定比例赔付，规则直观、农户易懂、理赔口径清晰，是国内天气指数保险市场主流形态。每档设起赔与封顶。</div></div>';

    var html =
      '<div class="res-head">反推方案 · ' + scheme.cropName + ' · ' + regionTxt + geoTxt + '</div>' +
      '<div class="res-block"><div class="rb-h">全生育期农事农时历与真实受灾机理</div>' +
      '<div class="rb-b">' + phenoCalendar(scheme.crop, scheme.zone || rv('rv-zone'), (scheme.perils[0] || {}).peril) + '</div></div>' +
      perilBlocks +
      payIntro +
      '<div class="res-block"><div class="rb-h">基差风险治理（核心敌人）</div>' +
      '<div class="rb-b">' + basisRisk(scheme) + '</div></div>' +
      '<div class="res-block"><div class="rb-h">标定数据源与监管锚定</div>' +
      '<div class="rb-b">历史气象标定源：Open-Meteo Archive（ERA5 再分析，25km 网格，免费可溯源）作初算；<b>精算报备须以试点县国家气象站/省气候中心观测标定</b>。合规：金发〔2024〕35号(双精准)、银保监规〔2023〕4号(精算)、银保监规〔2022〕4号(承保理赔办法)。主体区分：<b>阳光财产保险股份有限公司≠阳光农业相互保险公司</b>。纯天气指数触发，遥感仅作校验/校准与佐证。</div></div>' +
      comboNote + rateNote +
      (scenarioKey ? scenarioBlock(scenarioKey, scheme) : '') +
      '<div class="res-actions"><button class="primary" id="rv-to-rate">→ 把此方案送入「方案测算费率」引擎' + (scheme.combo ? '（多责任合计）' : '') + '</button>' +
      '<button class="ghost" id="rv-copy">复制方案(JSON)</button></div>' +
      '<div class="note-sm">说明：本反推为方法论占位方案，所有阈值/费率以【】占位，最终以试点县历史气象数据标定与监管批复为准。</div>';

    out.innerHTML = html;
    out.style.display = 'block';

    document.getElementById('rv-to-rate').addEventListener('click', function () {
      // 先切页签再灌数据：若灌数据过程中抛错（例如该作物在本区无物候、窗口为空），
      // 至少用户还能看到引擎二本身并手工补录，而不是"点了没反应"。
      window.switchTab('rate');
      try {
        window.RateEngine.loadFromScheme(scheme);
      } catch (e) {
        var out = document.getElementById('rate-out');
        if (out) {
          out.style.display = 'block';
          out.innerHTML = '<div class="prog-err">方案已切到本页，但自动带入时出错：' + e.message +
            '<br>通常是因为该作物在本农业区没有可用物候窗口。请手动选择作物/主害并填写保险期间后再运行回测。</div>';
        }
      }
    });
    document.getElementById('rv-copy').addEventListener('click', function () {
      navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(scheme, null, 2));
      this.textContent = '已复制 ✓';
      var t = this; setTimeout(function () { t.textContent = '复制方案(JSON)'; }, 1500);
    });
  }

  function card(title, val, sub) {
    return '<div class="rc"><div class="rc-t">' + title + '</div><div class="rc-v">' + val + '</div><div class="rc-s">' + (sub || '') + '</div></div>';
  }

  // 场景化落地要点（把反推方案变成可交差的动作）
  function scenarioBlock(key, s) {
    if (key === 's1') {
      var lvl = s.combo ? '双责任（' + s.combo.primary.perilName + '+' + s.combo.secondary.perilName + '）' : '单责任（' + s.primary.perilName + '）';
      return '<div class="res-block scn"><div class="rb-h">场景：遴选 / 应标创新点 · 可直接写入应标文件</div>' +
        '<div class="rb-b"><ol class="scn-list">' +
        '<li><b>产品创新条款（评审加分项）</b>：在"产品创新/科技赋能"章节陈述——' + s.cropName + '天气指数保险（' + lvl + '），纯气象指数触发、遥感校验，理赔时效 T+0~T+3。</li>' +
        '<li><b>指数触发逻辑</b>：' + s.primary.indexName + '，卡点窗口 ' + s.primary.windowLabel + '（每年 ' + (s.primary.window[0]) + '月' + s.primary.window[1] + '日—' + s.primary.window[2] + '月' + s.primary.window[3] + '日），阈值以【】占位待试点县标定。</li>' +
        '<li><b>费率测算依据</b>：经验纯费率 ' + currentEst(s) + '；须用本平台引擎二以试点县真实气象回测 ULR，写入"费率科学依据"章节。</li>' +
        '<li><b>基差治理承诺</b>：农时物候精准匹配 + 网格化 + 遥感校准，作为"降争议"承诺写入服务方案。</li>' +
        '<li><b>合规锚定</b>：金发〔2024〕35号(双精准)、银保监规〔2023〕4号(精算)；主体写"阳光财产保险股份有限公司"。</li>' +
        '</ol><div class="note-sm">评审口径：产品创新 + 科技赋能 + 农户获得感 三项叠加最具加分价值；避免写"无灾返保费"等违规表述。</div></div></div>';
    }
    if (key === 's2') {
      return '<div class="res-block scn"><div class="rb-h">场景：县域特色险种立项 · 立项汇报要点</div>' +
        '<div class="rb-b"><ol class="scn-list">' +
        '<li><b>主害与物候依据</b>：' + s.cropName + '在' + s.zoneName + '最怕灾为' + s.primary.perilName + '，卡点窗口 ' + s.primary.windowLabel + '（' + s.primary.phenoNote + '）。</li>' +
        '<li><b>保额与费率区间</b>：建议保额 ' + s.sumInsured + ' 元/亩；纯费率 ' + currentEst(s) + '，综合费率(×1.25) 待引擎二回测校准。</li>' +
        '<li><b>财政可承受能力</b>：用本平台"财政补贴与农户封顶测算"测算各级分担，确保农户端封顶可控。</li>' +
        '<li><b>试点县遴选建议</b>：选该作物集中、气象站/省气候中心数据可得、基差可控的县先行小步试点（本平台可细分到县）。</li>' +
        '<li><b>基差治理与理赔路径</b>：农时物候匹配 + 遥感校验；定损争议由气象数据权威性兜底。</li>' +
        '</ol><div class="note-sm">立项节奏建议：立项标定(1-3月)→小步试点(4-9月)→扩面报备(10-12月)，与政策遴选周期错峰。</div></div></div>';
    }
    return '';
  }
  function currentEst(s) {
    var b = { drought: [4, 7], frost: [3, 6], heat: [3, 6], rainy: [3, 5], storm: [2, 4], wind: [2, 4] }[s.primary.peril];
    var m = { northeast: 1.10, huanghuai: 1.05, yangtze: 1.10, southwest: 1.00, northwest: 1.15, south: 1.10 }[s.zone] || 1;
    return (b[0] * m).toFixed(1) + '% ~ ' + (b[1] * m).toFixed(1) + '%';
  }

  /* ---------- 纯参数反推方案（供方案设计器"一键成案"调用，不依赖 DOM） ---------- */
  function propose(opt) {
    if (!opt) throw new Error('propose 缺少参数');
    var cropKey = opt.cropKey, zoneKey = opt.zoneKey || 'yangtze';
    var crop = KB.crops[cropKey];
    if (!crop) throw new Error('未知作物代码：' + cropKey);
    if (!opt.peril) throw new Error('请指定主害风险(peril)');
    var sum = opt.sum || 400;
    var subs = [subScheme(crop, zoneKey, opt.peril, sum, cropKey)];
    if (opt.peril2) subs.push(subScheme(crop, zoneKey, opt.peril2, sum, cropKey));
    var primary = subs[0];
    var combo = null;
    if (subs.length > 1) {
      var p1 = subs[0], p2 = subs[1];
      var lo = Math.min(1, (PERIL_BASE[p1.peril][0] + PERIL_BASE[p2.peril][0]) / 100 * (ZONE_MULT[zoneKey] || 1));
      var hi = Math.min(1, (PERIL_BASE[p1.peril][1] + PERIL_BASE[p2.peril][1]) / 100 * (ZONE_MULT[zoneKey] || 1));
      combo = { primary: p1, secondary: p2, lo: lo, hi: hi };
    }
    return {
      crop: cropKey, cropName: crop.name, zone: zoneKey,
      zoneName: KB.zones[zoneKey] ? KB.zones[zoneKey].name : '—',
      perils: subs, primary: primary, combo: combo, paytype: 'step',
      sumInsured: sum
    };
  }

  // 暴露 + 自初始化级联
  window.ReverseEngine = { init: initGeo, render: render, buildScheme: buildScheme, propose: propose };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGeo);
  else initGeo();
})();


/* ==== calibrate.js ==== */
/* ============================================================
   无站点近似标定引擎（Station-free Proxy Calibration）
   ------------------------------------------------------------
   在"不接国家气象站（CIMISS）/省气候中心"的前提下，仅用
   Open-Meteo/ERA5 公开再分析，使方案尽量贴近"站点标定"结果。
   三条近似手段（均来自公开文献，可溯源、可调）：
     ① 县域多格点均值：centroid + 4 个 ±0.25° 偏移格点逐日均值，
        模拟"县域多站平均"，降低单点采样误差（近似站点网均值）。
     ② 降水偏差校正：ERA5 日降水 RB 高估 +13.54%、微量<1mm 显著高估
        （长三角 185 站实证，MDPI 2026）→ 剔除 trace(<1mm)日 + 区域系数。
     ③ 指数-产量 R² 最优阈值：若用户提供历史单产，做指数→减产率回归，
        扫描候选 strike 取 R² 最大者（对应沁县谷子"最大 R² 最优匹配"法）。
   所有输出均标注"未接国家站·近似标定"，最终以站点观测为准。
   ============================================================ */
(function () {
  'use strict';

  // ① 县域多格点均值：把多格点逐日序列取均值（模拟多站网均值）
  function countyMean(arrays) {
    if (!arrays.length) return null;
    var base = arrays[0];
    var n = arrays.length;
    var out = { time: base.time.slice(), tmax: [], tmin: [], prcp: [], wind: [] };
    for (var i = 0; i < base.time.length; i++) {
      var sT = 0, sTmin = 0, sP = 0, sW = 0, c = 0;
      for (var k = 0; k < n; k++) {
        var a = arrays[k];
        if (i >= a.time.length) continue;
        if (a.tmax[i] != null) { sT += a.tmax[i]; sTmin += a.tmin[i]; sP += a.prcp[i]; sW += a.wind[i]; c++; }
      }
      if (!c) { out.tmax.push(null); out.tmin.push(null); out.prcp.push(null); out.wind.push(null); continue; }
      out.tmax.push(sT / c); out.tmin.push(sTmin / c); out.prcp.push(sP / c); out.wind.push(sW / c);
    }
    return out;
  }

  // ② 降水偏差校正：剔除 trace(<1mm) 日（ERA5 显著高估微量），
  //    再乘区域修正系数（默认 1.0；长三角文献 RB+13.54% → 可填 0.88 校正）。
  function biasCorrectPrecip(prcpDaily, factor) {
    var f = (factor && factor > 0) ? factor : 1.0;
    return prcpDaily.map(function (v) {
      var x = (v == null ? 0 : v);
      return x < 1 ? 0 : x * f;
    });
  }

  // 统一内部气象数据规范（canonical schema）
  // 平台内所有引擎一律只认 { time, tmax, tmin, prcp, wind }；
  // 外部源（Open-Meteo 原名 / NASA POWER / 站点导入）一律经此适配，杜绝字段口径错配。
  function ensureCanon(d) {
    if (!d) return { time: [], tmax: [], tmin: [], prcp: [], wind: [] };
    if (d.__canon) return d;
    var o = {
      time: d.time || [],
      tmax: d.tmax || d.temperature_2m_max || [],
      tmin: d.tmin || d.temperature_2m_min || [],
      prcp: d.prcp || d.precipitation_sum || [],
      wind: d.wind || d.wind_speed_10m_max || [],
      meta: d.meta || null,
      __canon: true
    };
    return o;
  }

  // 把 Open-Meteo daily 对象规整为本引擎内部字段
  function normDaily(d) {
    return {
      time: d.time || [],
      tmax: d.temperature_2m_max || [],
      tmin: d.temperature_2m_min || [],
      prcp: d.precipitation_sum || [],
      wind: d.wind_speed_10m_max || []
    };
  }

  // 对规整后 daily 应用降水偏差校正
  function correctDaily(d, precipFactor) {
    if (!d) return d;
    d.prcp = biasCorrectPrecip(d.prcp, precipFactor);
    return d;
  }

  // 原始指数值（用于回归 / 分位阈值），与 engine-rate.triggerRatio 同口径
  function rawIndex(peril, d, idx, minRun, heatMetric) {
    if (!idx || !idx.length) return 0;
    if (peril === 'rainy') {
      var p = idx.map(function (i) { return d.prcp[i] == null ? 0 : d.prcp[i]; });
      var run = 0, best = 0;
      for (var i = 0; i <= p.length; i++) {
        if (i < p.length && p[i] >= 1) { run++; }
        else { if (run >= (minRun || 3)) best = Math.max(best, run); run = 0; }
      }
      return best;
    }
    if (peril === 'storm') return Math.max.apply(null, idx.map(function (i) { return d.prcp[i] == null ? 0 : d.prcp[i]; }));
    if (peril === 'frost') { var t = idx.map(function (i) { return d.tmin[i]; }).filter(function (v) { return v != null; }); return t.length ? Math.min.apply(null, t) : 0; }
    if (peril === 'heat') {
      // 棉花库内明确写「日均温>35℃」，其余作物只写「>35℃」未标口径 → 默认日最高温。
      // 用 Tmax 代 Tavg 会把起赔线隐性下调约 4–5℃，导致常年触发，故按作物区分。
      var h = idx.map(function (i) {
        if (heatMetric === 'avg') {
          if (d.tmax[i] == null || d.tmin[i] == null) return null;
          return (d.tmax[i] + d.tmin[i]) / 2;
        }
        return d.tmax[i];
      }).filter(function (v) { return v != null; });
      return h.length ? Math.max.apply(null, h) : 0;
    }
    if (peril === 'drought') return idx.reduce(function (a, i) { return a + (d.prcp[i] == null ? 0 : d.prcp[i]); }, 0);
    if (peril === 'wind') return Math.max.apply(null, idx.map(function (i) { return (d.wind[i] == null ? 0 : d.wind[i]) / 3.6; }));
    return 0;
  }

  // ③ 指数→产量 线性回归 + R²
  function fitIndexYield(indexArr, yieldArr) {
    var ix = [], yy = [];
    for (var i = 0; i < Math.min(indexArr.length, yieldArr.length); i++) {
      if (!isNaN(indexArr[i]) && yieldArr[i] != null && !isNaN(yieldArr[i])) { ix.push(indexArr[i]); yy.push(yieldArr[i]); }
    }
    var m = ix.length; if (m < 3) return null;
    var sx = 0, sy = 0; for (var j = 0; j < m; j++) { sx += ix[j]; sy += yy[j]; }
    var mx = sx / m, my = sy / m, sxx = 0, sxy = 0, syy = 0;
    for (var j = 0; j < m; j++) { var dx = ix[j] - mx, dy = yy[j] - my; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
    var slope = sxx === 0 ? 0 : sxy / sxx;
    var r2 = (sxx === 0 || syy === 0) ? 0 : (sxy * sxy) / (sxx * syy);
    return { slope: slope, intercept: my - slope * mx, r2: r2, n: m, meanY: my };
  }

  // 最大 R² 阈值优化：扫描候选 strike，以"线性赔付"对减产率回归，取 R² 最大者
  function optimizeStrike(indexArr, yieldArr, dir) {
    var fit0 = fitIndexYield(indexArr, yieldArr);
    if (!fit0) return null;
    var meanY = fit0.meanY;
    var loss = yieldArr.map(function (y) { return (meanY - y) / meanY; }); // 减产率（正=受损）
    var vals = indexArr.filter(function (v) { return !isNaN(v); }).slice().sort(function (a, b) { return a - b; });
    if (vals.length < 3) return null;
    var lo = vals[0], hi = vals[vals.length - 1];
    if (hi === lo) return null;
    var best = null, steps = 40;
    for (var s = 0; s <= steps; s++) {
      var strike = lo + (hi - lo) * s / steps;
      var denom = hi - strike; if (denom <= 0) continue;
      var pay = indexArr.map(function (v) {
        var t = dir === 'low' ? (strike - v) / denom : (v - strike) / denom;
        return Math.max(0, Math.min(1, isNaN(t) ? 0 : t));
      });
      var f = fitIndexYield(pay, loss);
      if (f && (!best || f.r2 > best.r2)) best = { strike: strike, r2: f.r2, n: f.n };
    }
    return best;
  }

  // 分位阈值建议（可复现锚）：返回 p5/p10/p25/中位
  function suggestStrike(indexArr, dir) {
    var vals = indexArr.filter(function (v) { return !isNaN(v); }).slice().sort(function (a, b) { return a - b; });
    if (!vals.length) return null;
    function pct(p) { return vals[Math.min(vals.length - 1, Math.floor(vals.length * p))]; }
    return { p5: pct(.05), p10: pct(.10), p25: pct(.25), median: pct(.5), lo: vals[0], hi: vals[vals.length - 1] };
  }

  window.Calibrate = {
    countyMean: countyMean, biasCorrectPrecip: biasCorrectPrecip,
    normDaily: normDaily, correctDaily: correctDaily, rawIndex: rawIndex,
    ensureCanon: ensureCanon,
    fitIndexYield: fitIndexYield, optimizeStrike: optimizeStrike, suggestStrike: suggestStrike
  };
})();


/* ==== providers.js ==== */
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


/* ==== qc.js ==== */
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


/* ==== engine-rate.js ==== */
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

  /* ---------- 气象取数（多源 + 逐级降级） ----------
     旧实现直连 Open-Meteo，一旦该域被网络策略拦截就整条回测失败（"Failed to fetch"）。
     现在改为：ERA5 → NASA POWER → 直连兜底，任一可用即可出结果。
     返回仍保持 Open-Meteo 的 daily 形态，下游无需改动。 */
  async function fetchYear(lat, lon, y) {
    var lastErr = null;

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
    fetchYear: fetchYear, fetchYearCached: fetchYearCached,
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


/* ==== map.js ==== */
/* ============================================================
   县级选点地图（全国 · 合规边界）
   ------------------------------------------------------------
   渲染方式：行政区划 GeoJSON + 原生 Canvas 本地渲染。边界数据本地打包优先
   （assets/geo/：全国省界+各省市级+试点市县级，共 37 个文件 4.6MB），
   本地缺失的层级自动回退 DataV.GeoAtlas 远程拉取 —— 离线/file:// 均可秒开。
   边界数据基于国家基础地理信息标准，符合地图合规要求（无错绘国界/省界）。
   省 → 市 → 县 三级下钻，点击县多边形取质心(GCJ-02) → 写入 window.__mpCoord → 引擎二。
   首页(homemap)与选点页(pickmap)共用同一 CountyMap 类与边界缓存。
   ============================================================ */
(function () {
  'use strict';
  var BASE = 'https://geo.datav.aliyun.com/areas_v3/bound/';
  var LOCAL = 'assets/geo/'; // 本地打包边界（全国+省级+试点市），离线/file:///预览沙箱均可用
  var _cache = new Map(); // 全局缓存，首页与选点页共享，避免重复拉取

  function fetchJSON(adcode) {
    if (_cache.has(adcode)) return Promise.resolve(_cache.get(adcode));
    // ⚠️ DataV.GeoAtlas 有 Referer 防盗链：带 github.io 等外部来源的 Referer 会直接 403。
    // 必须显式 no-referrer，否则"省级能开、选市后县级列表全空"——而县级正是承保单元。
    var opt = { referrerPolicy: 'no-referrer', credentials: 'omit' };
    // 本地优先（秒开、离线可用）；本地没有该层级（如大部分市级）再走 DataV 远程兜底
    return fetch(LOCAL + adcode + '_full.json', opt)
      .then(function (r) { if (!r.ok) throw new Error('no-local'); return r.json(); })
      .catch(function () {
        return fetch(BASE + adcode + '_full.json', opt)
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
      })
      .then(function (j) { _cache.set(adcode, j); return j; });
  }

  function eachRing(geom, cb) {
    if (!geom) return;
    if (geom.type === 'Polygon') geom.coordinates.forEach(cb);
    else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(function (poly) { poly.forEach(cb); });
  }
  function eachCoord(geom, cb) {
    eachRing(geom, function (ring) { ring.forEach(function (c) { cb(c[0], c[1]); }); });
  }

  function CountyMap(opts) {
    this.provSel = document.getElementById(opts.provSel);
    this.citySel = document.getElementById(opts.citySel);
    this.countySel = document.getElementById(opts.countySel);
    this.canvas = document.getElementById(opts.canvas);
    this.statusEl = opts.status ? document.getElementById(opts.status) : null;
    this.backBtn = opts.back ? document.getElementById(opts.back) : null;
    this.onSelect = opts.onSelect || function () {};
    this.ctx = this.canvas.getContext('2d');
    this.features = []; this._paths = []; this.level = 'province';
    this.curProv = null; this.curCity = null; this.selName = null; // selName=当前选中县（金色高亮）
    this.dpr = window.devicePixelRatio || 1;
    this.W = 600; this.H = 430;
    this._bind();
    this.load('100000'); // 全国省界
  }

  CountyMap.prototype._setStatus = function (t) { if (this.statusEl) this.statusEl.textContent = t || ''; };

  CountyMap.prototype._bind = function () {
    var self = this;
    this.provSel.addEventListener('change', function () { self._drillProv(self.provSel.value); });
    this.citySel.addEventListener('change', function () { self._drillCity(self.citySel.value); });
    this.countySel.addEventListener('change', function () { self._onCountyChange(); });
    this.canvas.addEventListener('click', function (e) { self._onClick(e); });
    if (this.backBtn) this.backBtn.addEventListener('click', function () { self.back(); });
  };

  CountyMap.prototype.load = function (adcode) {
    var self = this;
    this._setStatus('边界数据加载中…');
    return fetchJSON(adcode).then(function (j) {
      self.features = j.features || [];
      self.level = self.features.length ? (self.features[0].properties.level || 'city') : 'province';
      self._populate(self.features);
      self.relayout();
      self._setStatus('');
      return j;
    }).catch(function (err) {
      self._setStatus('边界数据加载失败（本地 assets/geo 与 DataV.GeoAtlas 均不可达）：' + err.message);
    });
  };

  CountyMap.prototype._populate = function (features) {
    var lv = this.level;
    if (lv === 'province') this._fill(this.provSel, features, '省');
    else if (lv === 'city') { this._fill(this.citySel, features, '市'); this._fill(this.countySel, [], '—'); }
    else { this._fill(this.countySel, features, '县/区'); }
  };

  CountyMap.prototype._fill = function (sel, features, ph) {
    if (!sel) return;
    sel.innerHTML = '';
    var def = document.createElement('option'); def.value = ''; def.textContent = ph; sel.appendChild(def);
    features.forEach(function (f) {
      var o = document.createElement('option');
      o.value = f.properties.adcode; o.textContent = f.properties.name;
      var c = f.properties.centroid || f.properties.center;
      if (c) { o.dataset.lat = c[1]; o.dataset.lon = c[0]; o.dataset.name = f.properties.name; }
      sel.appendChild(o);
    });
  };

  CountyMap.prototype._drillProv = function (adcode) {
    if (!adcode) return;
    this.curProv = adcode; this.curCity = null;
    this.load(adcode);
  };
  CountyMap.prototype._drillCity = function (adcode) {
    if (!adcode) return;
    this.curCity = adcode;
    this.load(adcode);
  };
  CountyMap.prototype._onCountyChange = function () {
    var opt = this.countySel.selectedOptions[0];
    if (!opt || !opt.dataset.lat) return;
    this._selectCounty(opt.dataset.name, { lat: parseFloat(opt.dataset.lat), lon: parseFloat(opt.dataset.lon) }, opt.value);
  };

  CountyMap.prototype._bbox = function (feats, latFloor) {
    feats = feats || this.features;
    var minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
    feats.forEach(function (f) {
      eachCoord(f.geometry, function (lon, lat) {
        if (latFloor != null && lat < latFloor) return; // 南海岛礁不参与大陆定界
        if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
      });
    });
    if (minLon > maxLon) { minLon = 73; maxLon = 135; minLat = 18; maxLat = 54; }
    return { minLon: minLon, maxLon: maxLon, minLat: minLat, maxLat: maxLat };
  };

  /* 投影：x = lon×cos(中纬)（修正经纬度实际长度差），y 线性；
     再按包围盒宽高比 contain 缩放并居中 —— 保证形状不失真。
     全国视图 latFloor=17：海南省三沙岛礁(至3.8°N)不拉扁大陆，由南海附图呈现 */
  CountyMap.prototype._computeTransform = function (feats, W, H, pad, latFloor) {
    var b = this._bbox(feats, latFloor);
    var midLat = (b.minLat + b.maxLat) / 2;
    var k = Math.cos(midLat * Math.PI / 180); // 经度修正系数
    var minPX = b.minLon * k, w = (b.maxLon - b.minLon) * k, h = b.maxLat - b.minLat;
    if (w <= 0 || h <= 0) { w = w || 1; h = h || 1; }
    var availW = W * (1 - pad * 2), availH = H * (1 - pad * 2);
    var s = Math.min(availW / w, availH / h);
    this._tf = {
      k: k, s: s,
      ox: W / 2 - ((minPX + w / 2) * s),      // 水平居中
      oyTop: H / 2 - (h / 2) * s,             // 垂直居中
      maxLat: b.maxLat
    };
  };

  CountyMap.prototype._project = function (lon, lat, tf) {
    var t = tf || this._tf;
    return [lon * t.k * t.s + t.ox, (t.maxLat - lat) * t.s + t.oyTop];
  };

  // 容器可见时才渲染（隐藏 tab 内 canvas 宽度为 0，跳过）
  CountyMap.prototype.relayout = function () {
    var rect = this.canvas.getBoundingClientRect();
    var cssW = rect.width || (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 0) || 600;
    var cssH = rect.height || 430;
    if (cssW < 2) return;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    this.W = cssW; this.H = cssH;
    try { this._render(); }
    catch (err) {
      // 渲染错误与"边界加载失败(网络)"分开提示，避免误导排查
      this._paths = [];
      this._setStatus('地图渲染异常：' + (err && err.message ? err.message : err));
    }
  };

  CountyMap.prototype._drawFeatures = function (feats, tf, fill, stroke, lw) {
    var ctx = this.ctx, self = this;
    feats.forEach(function (f) {
      var path = new Path2D();
      eachRing(f.geometry, function (ring) {
        ring.forEach(function (c, i) {
          var p = self._project(c[0], c[1], tf);
          if (i === 0) path.moveTo(p[0], p[1]); else path.lineTo(p[0], p[1]);
        });
        path.closePath();
      });
      ctx.fillStyle = fill; ctx.fill(path);
      ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(path);
      self._paths.push({ path: path, feature: f });
    });
  };

  /* 地名居中标注：取每个 feature 质心(GCJ-02) → 投影 → 居中 fillText。
     textAlign/textBaseline 保证"居中"；先白描边光晕再深色填充，保证任何底色上可读。
     仅标注当前层级（this.features 即当前下钻层级），下钻省→市→县自动随 features 变化。 */
  CountyMap.prototype._drawLabels = function (feats, tf) {
    var ctx = this.ctx, self = this;
    var lv = this.level;
    var base = lv === 'district' ? 9 : (lv === 'city' ? 11 : 12); // 县名最密→最小
    var fs = base * this.dpr;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // canvas font 简写中含空格的字体名必须整体加引号，否则整条 font 声明失效
    ctx.font = fs + 'px "PingFang SC","Microsoft YaHei","Hiragino Sans GB","Heiti SC",sans-serif';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, this.dpr * 2.2);
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';     // 白色光晕，压住描边/填充
    ctx.fillStyle = lv === 'district' ? '#5a4a1f' : '#23344f';
    feats.forEach(function (f) {
      var c = f.properties.centroid || f.properties.center;
      if (!c) return;
      var p = self._project(c[0], c[1], tf);
      // 超出画布安全跳过（避免质心异常拉出界）
      if (p[0] < -40 || p[0] > self.canvas.width + 40 || p[1] < -20 || p[1] > self.canvas.height + 20) return;
      ctx.strokeText(f.properties.name, p[0], p[1]);
      ctx.fillText(f.properties.name, p[0], p[1]);
    });
  };

  CountyMap.prototype._render = function () {
    if (!this.features.length) return;
    var ctx = this.ctx, self = this;
    var W = this.canvas.width, H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);
    this._paths = [];

    var fill = this.level === 'district' ? '#fff6dd' : (this.level === 'city' ? '#eef4fb' : '#e7eef7');
    var stroke = this.level === 'district' ? '#C9A24B' : '#3a5f9f';
    var lw = Math.max(0.5, this.dpr * 0.6);

    // 分离"南海诸岛"（全国视图专属）：主图只画大陆，南海按标准画法放右下角附图
    var main = [], southSea = [];
    this.features.forEach(function (f) {
      var n = f.properties.name || '';
      if (n.indexOf('南海诸岛') > -1 || f.properties.adcode === '100000_JD') southSea.push(f);
      else main.push(f);
    });

    // 主图：带纬度修正的等比投影，contain 居中；全国视图排除南海岛礁定界
    var latFloor = this.level === 'province' && southSea.length ? 17 : null;
    this._computeTransform(main.length ? main : this.features, W, H, 0.07, latFloor);
    this._drawFeatures(main, this._tf, fill, stroke, lw);

    // 选中县高亮（淡金填充+金棕描边）：县下拉↔地图双向匹配的可视反馈
    if (this.selName && this.level === 'district') {
      var selFeats = main.filter(function (f) { return f.properties.name === self.selName; });
      if (selFeats.length) this._drawFeatures(selFeats, this._tf, '#ffe9b3', '#C9822A', Math.max(1.2, this.dpr * 1.2));
    }

    // 地名居中标注（省/市/县）：高亮之后绘制，确保选中县名仍清晰
    this._drawLabels(main, this._tf);

    // 南海诸岛附图（右下角，比例尺独立，虚线框 —— 国家地图标准画法）
    if (southSea.length) {
      var iw = W * 0.16, ih = iw * 1.42;               // 南海纵向狭长
      var ix = W - iw - W * 0.03, iy = H - ih - H * 0.03;
      var b = this._bbox(southSea);
      var midK = Math.cos(((b.minLat + b.maxLat) / 2) * Math.PI / 180);
      var mw = (b.maxLon - b.minLon) * midK;
      var mh = b.maxLat - b.minLat;
      var s2 = Math.min(iw * 0.9 / mw, ih * 0.9 / mh);
      // 附图变换：bbox 中心对准附图框中心（x = lon×k×s + ox；y = (maxLat-lat)×s + oyTop）
      var sc = {
        k: midK, s: s2, maxLat: b.maxLat,
        ox: ix + iw / 2 - ((b.minLon + b.maxLon) / 2) * midK * s2,
        oyTop: iy + ih / 2 - (mh / 2) * s2
      };
      ctx.setLineDash([4 * this.dpr, 3 * this.dpr]);
      ctx.strokeStyle = '#8aa4c8'; ctx.lineWidth = Math.max(0.5, this.dpr * 0.5);
      ctx.strokeRect(ix, iy, iw, ih);
      ctx.setLineDash([]);
      ctx.font = Math.max(9, this.dpr * 10) + 'px sans-serif';
      ctx.fillStyle = '#5b7699';
      ctx.fillText('南海诸岛', ix + iw * 0.2, iy - 5 * this.dpr);
      this._drawFeatures(southSea, sc, fill, stroke, Math.max(0.4, this.dpr * 0.45));
    }
  };

  CountyMap.prototype._onClick = function (e) {
    var rect = this.canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * this.dpr;
    var y = (e.clientY - rect.top) * this.dpr;
    for (var i = this._paths.length - 1; i >= 0; i--) {
      if (this.ctx.isPointInPath(this._paths[i].path, x, y)) {
        this._pick(this._paths[i].feature); break;
      }
    }
  };

  CountyMap.prototype._pick = function (f) {
    var ad = f.properties.adcode, name = f.properties.name;
    if (this.level === 'province') { this.provSel.value = ad; this._drillProv(ad); }
    else if (this.level === 'city') { this.citySel.value = ad; this._drillCity(ad); }
    else { this._selectCounty(name, this._centroid(f), ad); }
  };

  CountyMap.prototype._centroid = function (f) {
    var c = f.properties.centroid || f.properties.center;
    if (c) return { lat: c[1], lon: c[0] };
    var b = this._bbox(); return { lat: (b.minLat + b.maxLat) / 2, lon: (b.minLon + b.maxLon) / 2 };
  };

  CountyMap.prototype._selectCounty = function (name, c, adcode) {
    window.__mpCoord = { lat: c.lat, lon: c.lon, name: name, adcode: adcode || null };
    this.selName = name; // 记录选中县 → 渲染层金色高亮
    this.onSelect(name, c.lat, c.lon, adcode);
  };

  CountyMap.prototype.back = function () {
    this.curProv = null; this.curCity = null;
    this.load('100000');
  };

  /* ---------- 工厂：首页 + 选点页两个实例 ---------- */
  window.CountyMap = CountyMap;
  window.MapPicker = {
    initHome: function () {
      if (!document.getElementById('homemap')) return;
      window.mapHome = new CountyMap({
        provSel: 'hm-prov', citySel: 'hm-city', countySel: 'hm-county',
        canvas: 'homemap', status: 'home-map-status', back: 'hm-back',
        onSelect: function (name, lat, lon) {
          var s = document.getElementById('hm-sel'); if (s) s.textContent = name;
          var la = document.getElementById('hm-lat'); if (la) la.textContent = lat.toFixed(4);
          var lo = document.getElementById('hm-lon'); if (lo) lo.textContent = lon.toFixed(4);
          var a = document.getElementById('hm-action'); if (a) a.style.display = 'flex';
          var rtla = document.getElementById('rt-lat'); if (rtla) rtla.value = lat.toFixed(4);
          var rtlo = document.getElementById('rt-lon'); if (rtlo) rtlo.value = lon.toFixed(4);
          // 同步引擎二 rt-city 下拉，避免"坐标已填但下拉仍是默认市"的视觉不一致
          var ci = document.getElementById('rt-city');
          if (ci && window.AGRI_KB && window.AGRI_KB.cities && ci.options.length) {
            var best = null, bd = 1e9;
            window.AGRI_KB.cities.forEach(function (c) {
              var d = Math.hypot((c.lat || 0) - lat, (c.lon || 0) - lon);
              if (d < bd) { bd = d; best = c; }
            });
            if (best) ci.value = best.lat + ',' + best.lon + ',' + best.z;
          }
        }
      });
    },
    initPicker: function () {
      if (!document.getElementById('pickmap')) return;
      window.mapPicker = new CountyMap({
        provSel: 'mp-prov', citySel: 'mp-city', countySel: 'mp-county',
        canvas: 'pickmap', status: 'map-status', back: 'mp-back',
        onSelect: function (name, lat, lon) {
          var s = document.getElementById('mp-sel'); if (s) s.textContent = name;
          var la = document.getElementById('mp-lat'); if (la) la.textContent = lat.toFixed(4);
          var lo = document.getElementById('mp-lon'); if (lo) lo.textContent = lon.toFixed(4);
        }
      });
      var apply = document.getElementById('mp-apply');
      if (apply) apply.addEventListener('click', function () {
        var c = window.__mpCoord;
        if (!c) { alert('请先在地图上或下拉中选择县/区'); return; }
        var la = document.getElementById('rt-lat'); if (la) la.value = c.lat.toFixed(4);
        var lo = document.getElementById('rt-lon'); if (lo) lo.value = c.lon.toFixed(4);
        switchTab('rate');
        var el = document.getElementById('rt-lat'); if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      var reset = document.getElementById('mp-reset');
      if (reset) reset.addEventListener('click', function () {
        var s = document.getElementById('mp-sel'); if (s) s.textContent = '未选择';
        var la = document.getElementById('mp-lat'); if (la) la.textContent = '—';
        var lo = document.getElementById('mp-lon'); if (lo) lo.textContent = '—';
        window.__mpCoord = null;
      });
    },
    /* 方案设计器输入面板内嵌选点地图：选县即回填 sd-lat/sd-lon/sd-county */
    initSchemeMap: function () {
      if (!document.getElementById('sdm-canvas')) return;
      window.mapScheme = new CountyMap({
        provSel: 'sdm-prov', citySel: 'sdm-city', countySel: 'sdm-county',
        canvas: 'sdm-canvas', status: 'sdm-status', back: 'sdm-back',
        onSelect: function (name, lat, lon) {
          var L = lat.toFixed(4), Lo = lon.toFixed(4);
          var la = document.getElementById('sd-lat'), lo = document.getElementById('sd-lon'), co = document.getElementById('sd-county');
          if (la) la.value = L; if (lo) lo.value = Lo; if (co) co.value = lat + ',' + lon + ',' + name;
          var s = document.getElementById('sdm-sel'); if (s) s.textContent = name;
          var sl = document.getElementById('sdm-lat'); if (sl) sl.textContent = L;
          var so = document.getElementById('sdm-lon'); if (so) so.textContent = Lo;
        }
      });
    },
    /* 引擎二输入面板内嵌选点地图：选县即回填 rt-lat/rt-lon/rt-city */
    initRateMap: function () {
      if (!document.getElementById('rtm-canvas')) return;
      window.mapRate = new CountyMap({
        provSel: 'rtm-prov', citySel: 'rtm-city', countySel: 'rtm-county',
        canvas: 'rtm-canvas', status: 'rtm-status', back: 'rtm-back',
        onSelect: function (name, lat, lon) {
          var L = lat.toFixed(4), Lo = lon.toFixed(4);
          var la = document.getElementById('rt-lat'), lo = document.getElementById('rt-lon'), ci = document.getElementById('rt-city');
          if (la) la.value = L; if (lo) lo.value = Lo; if (ci) ci.value = lat + ',' + lon + ',' + name;
          var s = document.getElementById('rtm-sel'); if (s) s.textContent = name;
          var sl = document.getElementById('rtm-lat'); if (sl) sl.textContent = L;
          var so = document.getElementById('rtm-lon'); if (so) so.textContent = Lo;
        }
      });
    }
  };
})();


/* ==== engine-scenario.js ==== */
/* ============================================================
   需求场景工作台（把工具嵌进阳光财险农险合伙人的真实业务动作）
   ------------------------------------------------------------
   s1 遴选/应标创新点  → 路由引擎一(场景化输出)
   s2 县域特色险种立项  → 路由引擎一(场景化输出)
   s3 财政补贴与农户封顶测算 → 专项计算器
   s4 基差风险评级与治理   → 专项计算器
   s5 区域连片巨灾指数     → 多县真实气象回测聚合
   s6 传统农险 vs 指数保险 决策对照 → 对照表
   ============================================================ */
(function () {
  'use strict';
  var KB = window.AGRI_KB;
  var RE = window.RateEngine;

  /* ---------- 场景卡片 + 路由 ---------- */
  function initCards() {
    var box = document.getElementById('scenario-cards');
    if (!box) return;
    KB.scenarios.forEach(function (s) {
      var card = document.createElement('div');
      card.className = 'scard';
      card.innerHTML = '<div class="sc-name">' + s.name + '</div>' +
        '<div class="sc-scene">' + s.scene + '</div>' +
        '<div class="sc-out">产出：' + s.out + '</div>' +
        '<div class="sc-go">' + (s.route === 'reverse' ? '去反推方案 →' : '打开测算器 →') + '</div>';
      card.addEventListener('click', function () { route(s); });
      box.appendChild(card);
    });
  }

  function route(s) {
    if (s.route === 'reverse') { prefillReverse(s.key); return; }
    // 显示对应测算面板
    document.querySelectorAll('.sc-panel').forEach(function (p) { p.style.display = 'none'; });
    var map = { s3: 'sc-s3', s4: 'sc-s4', s5: 'sc-s5', s6: 'sc-s6' };
    var el = document.getElementById(map[s.key]);
    if (el) el.style.display = 'block';
    window.switchTab('scenario');
  }

  // s1/s2 预填引擎一并发场景化反推
  function prefillReverse(key) {
    var presets = {
      s1: { crop: 'corn', zone: 'northeast', peril: 'frost', peril2: '', sum: 400, paytype: 'step' },
      s2: { crop: 'citrus', zone: 'south', peril: 'frost', peril2: 'storm', sum: 400, paytype: 'step' }
    };
    var p = presets[key];
    document.getElementById('rv-crop').value = p.crop;
    document.getElementById('rv-zone').value = p.zone;
    // 勾选主要灾害（可多选）
    var box = document.getElementById('rv-perils');
    if (box) box.querySelectorAll('input[type="checkbox"]').forEach(function (inp) {
      inp.checked = (inp.value === p.peril) || (p.peril2 && inp.value === p.peril2);
    });
    var pt = document.getElementById('rv-paytype'); if (pt) pt.value = p.paytype || 'step';
    document.getElementById('rv-sum').value = p.sum;
    window.__scn = key;
    window.switchTab('reverse');
    document.getElementById('reverse-empty').style.display = 'none';
    window.ReverseEngine.render(key);
  }

  /* ---------- 面板静态结构 ---------- */
  function buildPanels() {
    var stage = document.getElementById('sc-stage');
    if (!stage) return;
    stage.innerHTML =
      // S3 财政补贴封顶
      '<div class="sc-panel" id="sc-s3"><div class="sc-ph">财政补贴与农户端费率封顶测算</div>' +
      '<div class="sc-sub">给定保额、纯费率、费用率与各级财政补贴比例，倒推综合费率、各级分担与农户自缴，判断是否超封顶。</div>' +
      '<div class="calc-grid">' +
        fld('单位保额（元/亩）', '<input id="s3-sum" type="number" value="400" min="50" step="50">') +
        fld('纯费率（%，待引擎二回测）', '<input id="s3-pure" type="number" value="5" min="0" step="0.5">') +
        fld('费用率（%）', '<input id="s3-exp" type="number" value="15" min="0" step="1">') +
        fld('风险附加（%）', '<input id="s3-risk" type="number" value="10" min="0" step="1">') +
        fld('中央补贴（%保费）', '<input id="s3-c" type="number" value="0" min="0" step="5">') +
        fld('省级补贴（%保费）', '<input id="s3-p" type="number" value="30" min="0" step="5">') +
        fld('市/县补贴（%保费）', '<input id="s3-l" type="number" value="20" min="0" step="5">') +
        fld('农户端封顶（%保费）', '<input id="s3-cap" type="number" value="2" min="0" step="0.5">') +
      '</div>' +
      '<div class="btn-row"><button class="btn primary" id="s3-run">测算</button></div>' +
      '<div id="s3-out"></div></div>' +
      // S4 基差风险评级
      '<div class="sc-panel" id="sc-s4"><div class="sc-ph">基差风险评级与治理</div>' +
      '<div class="sc-sub">"指数触发但农户没受灾"是指数保险最大 objections；立项/应标前自评基差等级与治理手段。</div>' +
      '<div class="calc-grid">' +
        fld('作物', '<select id="s4-crop"></select>') +
        fld('指数/灾害', '<select id="s4-peril"></select>') +
        fld('县域数据可得性', '<select id="s4-data"><option value="0">好（多站+卫星网格）</option><option value="0.5" selected>中（单站）</option><option value="1">差（缺站）</option></select>') +
        fld('遥感校验校准', '<select id="s4-rs"><option value="0" selected>已做</option><option value="1.5">未做</option></select>') +
        fld('农时物候卡准', '<select id="s4-pheno"><option value="0" selected>已卡准</option><option value="1.5">未卡准</option></select>') +
      '</div>' +
      '<div class="btn-row"><button class="btn primary" id="s4-run">评级</button></div>' +
      '<div id="s4-out"></div></div>' +
      // S5 区域连片巨灾
      '<div class="sc-panel" id="sc-s5"><div class="sc-ph">区域连片巨灾指数（多县真实气象回测聚合）</div>' +
      '<div class="sc-sub">用于巨灾债券或中农再对接：选≤4个县，回测"≥K县同一年触发"的巨灾频率与 ULR。限时 10 年 × ≤4 县。</div>' +
      '<div class="calc-grid">' +
        '<div class="fld" style="grid-column:1/3"><label>选择县区（勾选≤4个）</label><div id="s5-counties" class="county-chk"></div></div>' +
        fld('保险责任', '<select id="s5-peril"></select>') +
        fld('≥K 县同触发', '<select id="s5-k"><option value="2">≥2 县</option><option value="3">≥3 县</option></select>') +
        fld('起止（月/日）', '<div class="row4"><input id="s5-m1" type="number" value="5" min="1" max="12"><input id="s5-d1" type="number" value="20" min="1" max="31"><input id="s5-m2" type="number" value="6" min="1" max="12"><input id="s5-d2" type="number" value="20" min="1" max="31"></div>') +
        fld('试算费率（%保费）', '<input id="s5-trial" type="number" value="5" min="0" step="0.5">') +
        fld('历史年数', '<select id="s5-years"><option value="10" selected>10 年</option></select>') +
      '</div>' +
      '<div id="s5-ratio"></div>' +
      '<div class="btn-row"><button class="btn primary" id="s5-run">运行区域回测</button></div>' +
      '<div id="s5-prog" style="display:none"></div><div id="s5-out"></div></div>' +
      // S6 决策对照
      '<div class="sc-panel" id="sc-s6"><div class="sc-ph">传统农险 vs 天气指数保险 · 决策对照</div>' +
      '<div class="sc-sub">向领导汇报"该不该做指数化"的六维依据与判定规则。</div>' +
      '<div id="s6-out"></div></div>';

    // 填充 S4/S5 下拉
    fillSelect('s4-crop', KB.crops, function (k, v) { return v.name + '（' + v.cat + '）'; });
    fillSelect('s4-peril', { drought: '干旱/降水亏缺', frost: '低温霜冻', heat: '高温热害', rainy: '连阴雨渍涝', storm: '暴雨洪涝', wind: '大风倒伏' });
    fillSelect('s5-peril', { drought: '干旱/降水亏缺', frost: '低温霜冻', heat: '高温热害', rainy: '连阴雨渍涝', storm: '暴雨洪涝', wind: '大风倒伏' });
    buildCountyChecks();
    bindCalc();
    renderDecision();
  }

  function fld(label, html) { return '<div class="fld"><label>' + label + '</label>' + html + '</div>'; }
  function fillSelect(id, obj, fmt) {
    var s = document.getElementById(id); if (!s) return;
    Object.keys(obj).forEach(function (k) {
      var o = document.createElement('option'); o.value = k;
      o.textContent = fmt ? fmt(k, obj[k]) : obj[k]; s.appendChild(o);
    });
  }
  function buildCountyChecks() {
    var box = document.getElementById('s5-counties'); if (!box) return;
    var byProv = {};
    KB.cities.forEach(function (c) { (byProv[c.p] = byProv[c.p] || []).push(c); });
    Object.keys(byProv).forEach(function (p) {
      var g = document.createElement('div'); g.className = 'cc-group';
      g.innerHTML = '<div class="cc-prov">' + p + '</div>';
      byProv[p].forEach(function (c) {
        var id = 's5c_' + c.lat + '_' + c.lon;
        g.innerHTML += '<label class="cc-i"><input type="checkbox" class="s5c" data-lat="' + c.lat + '" data-lon="' + c.lon + '" data-n="' + c.n + '"> ' + c.n + '</label>';
      });
      box.appendChild(g);
    });
    box.querySelectorAll('.s5c').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var sel = box.querySelectorAll('.s5c:checked');
        if (sel.length > 4) { cb.checked = false; alert('最多勾选 4 个县'); }
      });
    });
  }

  /* ---------- 绑定计算按钮 ---------- */
  function bindCalc() {
    document.getElementById('s3-run').addEventListener('click', calcSubsidy);
    document.getElementById('s4-run').addEventListener('click', calcBasis);
    document.getElementById('s5-run').addEventListener('click', calcCatastrophe);
  }

  /* ===== S3 财政补贴封顶测算 ===== */
  function calcSubsidy() {
    var sum = +document.getElementById('s3-sum').value || 400;
    var pure = (+document.getElementById('s3-pure').value || 0) / 100;
    var exp = (+document.getElementById('s3-exp').value || 0) / 100;
    var risk = (+document.getElementById('s3-risk').value || 0) / 100;
    var c = +document.getElementById('s3-c').value || 0;
    var p = +document.getElementById('s3-p').value || 0;
    var l = +document.getElementById('s3-l').value || 0;
    var cap = (+document.getElementById('s3-cap').value || 0) / 100;
    var out = document.getElementById('s3-out');
    var subFrac = (c + p + l) / 100;
    if (subFrac > 1) { out.innerHTML = '<div class="prog-err">各级补贴合计超过 100%，请检查补贴比例。</div>'; out.style.display = 'block'; return; }
    var compFrac = pure * (1 + exp + risk);
    var farmerFrac = compFrac * (1 - subFrac);
    var over = farmerFrac > cap;
    var effFarmer = over ? cap : farmerFrac;
    var gap = over ? (farmerFrac - cap) : 0;
    var totalSub = subFrac + gap; // 含封顶缺口补足
    var pct = function (x) { return (x * 100).toFixed(2) + '%'; };
    var html =
      '<div class="kpi-row">' +
        kpi('综合费率', pct(compFrac), '纯费率×(1+费用率+风险附加)') +
        kpi('农户自缴（实际封顶内）', pct(effFarmer), over ? '已封顶，超出部分转财政' : '未超封顶') +
        kpi('农户自缴金额', (sum * effFarmer).toFixed(1) + ' 元/亩', '保额 × 农户自缴比例') +
        kpi('财政总负担', pct(totalSub), '各级补贴 + 封顶缺口补足') +
      '</div>' +
      '<div class="kpi-row" style="margin-top:10px">' +
        kpi('中央补贴', pct(compFrac * c / 100), c + '% × 综合费率') +
        kpi('省级补贴', pct(compFrac * p / 100), p + '% × 综合费率') +
        kpi('市/县补贴', pct(compFrac * l / 100), l + '% × 综合费率') +
        kpi('是否超农户封顶', over ? '超 · 已补足' : '未超', over ? '缺口 ' + pct(gap) + ' 由财政承担' : '农户端可控') +
      '</div>' +
      '<div class="note-sm">注：补贴比例按"占保费比例"口径；农户端封顶常见 1.5%-2%（政策性）。纯费率须由引擎二以试点县真实气象回测得到，此处为占位输入。最终以财政承受能力与监管批复为准。</div>';
    out.innerHTML = html; out.style.display = 'block';
  }

  /* ===== S4 基差风险评级 ===== */
  function calcBasis() {
    var peril = document.getElementById('s4-peril').value;
    var base = { low: 1, mid: 2, high: 3 }[KB.basisBase[peril]] || 2;
    var data = +document.getElementById('s4-data').value;
    var rs = +document.getElementById('s4-rs').value;
    var pheno = +document.getElementById('s4-pheno').value;
    // 数据/遥感/农时按"基线0、缺失才加罚"计分，避免常规操作把中基差误判为低
    var score = base + data + rs + pheno;
    score = Math.max(1, Math.min(5, score));
    var level = score <= 1 ? '低' : score <= 3 ? '中' : '高';
    var cls = level === '低' ? 'lv-low' : level === '中' ? 'lv-mid' : 'lv-high';
    var gov = [];
    if (level === '高') {
      gov.push('强烈建议先以"指数+产量双触发"过渡（突破纯指数边界须监管同意，标注于报备材料）；');
      gov.push('引入遥感校验赔付：以 NDVI/降水反演校验指数是否对应实际受灾，抑制"该赔未赔"；');
      gov.push('组建共保体/引入再保分散系统性基差；提高起赔线、收窄边缘赔付段；');
    } else if (level === '中') {
      gov.push('网格化 + 卫星遥感校准：县域用多站/ERA5 网格(25km)插值，并以县站观测标定；');
      gov.push('卡准农时物候 + 分段赔付设起赔与封顶；灾年附遥感佐证降低争议；');
    } else {
      gov.push('基差基本可控：维持农时物候精准匹配 + 地面站校验；');
      gov.push('可作为优先指数化推广品类，理赔争议低、农户获得感强。');
    }
    if (rs === 1) gov.push('当前未做遥感校验——基差显著偏高，务必补上（纯指数边界下遥感仅作校验/校准）。');
    if (pheno === 1) gov.push('当前未卡准农时物候——这是基差最大来源，必须重做物候窗口匹配。');
    var html =
      '<div class="basis-box"><div class="basis-lv ' + cls + '">基差风险等级：' + level + '</div>' +
      '<div class="basis-score">评分 ' + score + '/5（固有 ' + base + ' + 数据 ' + data + ' + 遥感 ' + rs + ' + 农时 ' + pheno + '）</div>' +
      '<div class="basis-gov"><b>治理手段清单</b><br>' + gov.map(function (g) { return '· ' + g; }).join('<br>') + '</div>' +
      '<div class="note-sm">基差治理主轴是农时物候精准匹配；纯天气指数触发，遥感仅作设计期校验/校准与对农户、监管的直观佐证。</div></div>';
    document.getElementById('s4-out').innerHTML = html;
  }

  /* ===== S5 区域连片巨灾 ===== */
  var SDEFS = {
    rainy: [['3', 10], ['5', 20], ['7', 30]], storm: [['50', 10], ['100', 20]],
    frost: [['-1', 10], ['-3', 20], ['-5', 30]], heat: [['35', 10], ['37', 20], ['39', 30]],
    drought: [['40', 10], ['20', 20], ['5', 30]], wind: [['13.8', 10], ['17', 20], ['20.8', 30]]
  };
  function calcCatastrophe() {
    var checked = Array.prototype.slice.call(document.querySelectorAll('.s5c:checked'));
    if (checked.length < 2) { document.getElementById('s5-out').innerHTML = '<div class="prog-err">请至少勾选 2 个县。</div>'; return; }
    var peril = document.getElementById('s5-peril').value;
    var K = +document.getElementById('s5-k').value;
    var m1 = +document.getElementById('s5-m1').value, d1 = +document.getElementById('s5-d1').value;
    var m2 = +document.getElementById('s5-m2').value, d2 = +document.getElementById('s5-d2').value;
    var trial = (+document.getElementById('s5-trial').value) || 0;
    var years = +document.getElementById('s5-years').value;
    var ratio = {}; SDEFS[peril].forEach(function (p) { ratio[p[0]] = (+p[1]) / 100; });
    var dir = (peril === 'frost' || peril === 'drought') ? 'low' : 'high';
    var counties = checked.map(function (c) { return { n: c.dataset.n, lat: +c.dataset.lat, lon: +c.dataset.lon }; });
    var prog = document.getElementById('s5-prog');
    prog.style.display = 'block';
    prog.innerHTML = '<div class="prog-t">区域回测中（' + counties.length + '县 × ' + years + '年 真实气象）…</div><div class="prog-bar"><i id="s5-bar"></i></div><div class="prog-s" id="s5-ps"></div>';
    var bar = document.getElementById('s5-bar'), ps = document.getElementById('s5-ps');
    (async function () {
      var annualByCounty = [];
      var total = counties.length * years, done = 0;
      for (var ci = 0; ci < counties.length; ci++) {
        var arr = [];
        for (var y = 2026 - years; y <= 2025; y++) {
          try {
            var daily = await RE.fetchYear(counties[ci].lat, counties[ci].lon, y);
            var idx = RE.windowIdx(daily.time, m1, d1, m2, d2);
            arr.push(RE.triggerRatio(peril, daily, idx, { ratio: ratio, minRun: 3 }));
          } catch (e) { arr.push(0); }
          done++; bar.style.width = Math.round(done / total * 100) + '%';
          if (ps) ps.textContent = counties[ci].n + ' ' + y;
          await sleep(200);
        }
        annualByCounty.push(arr);
      }
      // 区域巨灾年：≥K 县同年触发(>0)
      var region = [];
      for (var y2 = 0; y2 < years; y2++) {
        var trig = annualByCounty.filter(function (a) { return a[y2] > 0; }).length;
        region.push(trig >= K ? 1 : 0);
      }
      var mean = region.reduce(function (a, b) { return a + b; }, 0) / region.length;
      var catYears = region.filter(function (x) { return x > 0; }).length;
      var ulr = trial > 0 ? (mean / (trial / 100)) : null;
      var verdict = ulr == null ? '' : (ulr >= 0.70 && ulr <= 0.75) ? '<span class="lv-low">ULR 落 70-75% 可持续带</span>' :
        ulr < 0.70 ? '<span class="lv-mid">ULR<70%，区域触发偏稀，可放宽/提质</span>' : '<span class="lv-high">ULR>75%，触发过频，须收紧阈值</span>';
      var pct = function (x) { return (x * 100).toFixed(1) + '%'; };
      var html =
        '<div class="kpi-row">' +
          kpi('区域巨灾触发频率', pct(mean), '≥' + K + '县同年触发 占比') +
          kpi('巨灾年数 / 总年', catYears + ' / ' + years, '历史期区域连片灾频率') +
          kpi('ULR（对试算保费）', ulr != null ? (ulr * 100).toFixed(0) + '%' : '—', '目标带 70-75%') +
          kpi('适用建议', K + '县连片', '适合巨灾债券/中农再对接') +
        '</div>' +
        '<div class="basis-gov">' + verdict + '<br>区域指数以"连片触发"平滑单县基差；阈值建议取单县 DEFS 略收紧，确保区域触发与真实连片灾一致。</div>' +
        '<div class="note-sm">数据真实可溯源（Open-Meteo/ERA5 约25km网格）；精算报备须以省气候中心/县站观测标定。最终以监管批复为准。</div>';
      document.getElementById('s5-out').innerHTML = html;
      prog.style.display = 'none';
    })();
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ===== S6 决策对照 ===== */
  function renderDecision() {
    var box = document.getElementById('s6-out'); if (!box) return;
    var rows = KB.decisionCompare.map(function (d) {
      return '<tr><td>' + d.dim + '</td><td>' + d.trad + '</td><td class="' + (d.wiiWin ? 'win' : 'lose') + '">' + d.wii + '</td></tr>';
    }).join('');
    box.innerHTML =
      '<table class="decision"><tr><th>维度</th><th>传统农险</th><th>天气指数保险</th></tr>' + rows + '</table>' +
      '<div class="basis-gov"><b>判定规则（建议做指数化）：</b><br>' +
      '· 基差可控（低温/高温/连阴雨/暴雨等指数与产量相关性高、空间异质小）+ 定损成本高/理赔时效要求高 → 优先指数化；<br>' +
      '· 大风/冰雹等站点难测、空间异质大 → 基差高，先做"指数+产量双触发"过渡或暂缓；<br>' +
      '· 财政杠杆诉求强（低定损成本撬动更高保障）→ 指数化更优。</div>';
  }

  function kpi(t, v, s) {
    return '<div class="kpi"><div class="kpi-t">' + t + '</div><div class="kpi-v">' + v + '</div><div class="kpi-s">' + s + '</div></div>';
  }

  window.Scenarios = {
    init: function () { initCards(); buildPanels(); }
  };
})();


/* ==== engine-scheme.js ==== */
/* ============================================================
   方案设计器（聚合"反推" + "费率校准" → 一份可交付的天气指数保险方案）
   ------------------------------------------------------------
   输入：县(优先本地缓存) / 作物 / 主害 / 次害(可选) / 物候窗口 / 保额 / 承保面积 / 试算费率 / 场景
   流程：ReverseEngine.propose 反推方案 → RateEngine.compute 真实气象回测校准 → 组装完整方案
   输出：结构化天气指数保险方案(可导出JSON / 打印)；含指数设计、费率、基差治理、合规锚定。
   ============================================================ */
(function () {
  'use strict';
  var KB = window.AGRI_KB;
  var PERIL_CN = { drought: '干旱/降水亏缺', frost: '低温霜冻', heat: '高温热害', rainy: '连阴雨渍涝', storm: '暴雨洪涝', wind: '大风倒伏' };
  var PERILS = [['drought', '干旱/降水亏缺'], ['frost', '低温霜冻'], ['heat', '高温热害'], ['rainy', '连阴雨渍涝'], ['storm', '暴雨洪涝'], ['wind', '大风倒伏']];
  var COMPLIANCE = [
    '金发〔2024〕35号《关于加快农业保险高质量发展的指导意见》（"双精准"：精准投保理赔）',
    '银保监规〔2023〕4号《农业保险精算规定（试行）》（费率测算与费用率上限）',
    '银保监规〔2022〕4号《农业保险承保理赔管理办法》（定损理赔时效）'
  ];
  var SRC_NOTE = 'Open-Meteo/ERA5 再分析（约25km网格，免费可溯源）作初算；精算报备须以试点县国家气象站/省气候中心观测标定。';

  function pct(x, d) { return (x * 100).toFixed(d === undefined ? 2 : d) + '%'; }
  function fmtMD(m, d) { return m + '月' + d + '日'; }

  // 由县经纬度反推气候带（与 KB.zones 键对齐；作物.zone 是描述性串不能直接当键）
  // 六带：south 华南 / yangtze 长江中下游 / huanghuai 黄淮海 / southwest 西南 / northwest 西北 / northeast 东北
  function zoneFromCoord(lat, lon) {
    if (lat < 26 && lon > 100) return 'south';                 // 粤桂闽琼
    if (lon < 108) return lat >= 32 ? 'northwest' : 'southwest'; // 甘宁新 vs 川渝云贵
    if (lat >= 40 && lon >= 118) return 'northeast';           // 黑吉辽蒙东
    if (lat >= 33 && lon >= 108) return 'huanghuai';           // 鲁豫冀皖苏北
    return 'yangtze';                                          // 长江中下游
  }

  function fmtNum(x) { return (Math.round(x * 100) / 100).toString(); }

  // 方案类型中文名（阶梯型理赔阈值 / 线性理赔阈值）——原调用处未定义会 ReferenceError，补上
  function payTypeName(t) { return t === 'linear' ? '线性理赔阈值' : '阶梯型理赔阈值'; }

  // 赔付函数「设计依据与校准口径」注（放在分段/线性赔付函数表正下方，逐条呼应三点硬要求）：
  // ①按方案类型专属设计 ②严格用目标县前 N 年逐日历史气象建模 ③回测纯风险损失率对齐预计目标
  function designBasisNote(f, calib, R) {
    var y0 = 2026 - R.n;
    var devNow = Math.abs(R.mean - calib.target) / calib.target;
    var ok = devNow <= 0.05;
    return '<div class="note-sm"><b>设计依据与校准口径（三项硬要求逐条对应）</b><br>' +
      '① <b>方案类型专属</b>：按「' + payTypeName(f.payType) + '」生成赔付函数' +
      (f.payType === 'linear' ? '——触发→封顶区间内连续线性折算，无档位跳变；' : '——落入档位按固定比例一次性赔付，不叠加；') + '<br>' +
      '② <b>历史建模口径</b>：触发/封顶阈值严格按 ' + f.countyName + ' 前 ' + R.n + ' 年（' + y0 + '–2025）逐日历史气象建模回测' +
      '（⭐试点县用本地站点缓存，其余县域 ERA5 再分析网格），逐年赔付率均值即回测纯风险损失率；<br>' +
      '③ <b>纯风险损失率对齐</b>：回测 <b>' + pct(R.mean) + '</b>，与预计纯风险损失率 ' + f.ulr + '% 偏差 ' + pct(devNow, 1) +
      (ok ? '，≤5% 达标——本表阈值与定价可直接采用。' : '，已达可行域内最贴近值——可调整物候窗口或切换方案类型后重新设计。') +
      ' 逐年赔付明细见「三、费率回测」。</div>';
  }

  // 由基准 ratio 映射生成"起赔阈值"变体（保持分段赔付档位与步长，仅平移起赔线）
  // high 方向：阈值越大越难触发；low 方向：阈值越小(越负)越难触发
  function variantRatios(base, t0list, dir, unit) {
    var keys = Object.keys(base).map(Number).sort(function (a, b) { return a - b; });
    var pay = keys.map(function (k) { return base[k]; }); // 升序键对应赔付档
    var n = keys.length, step = keys[1] - keys[0];
    return t0list.map(function (t0) {
      var r = {};
      for (var i = 0; i < n; i++) {
        var k = dir === 'high' ? t0 + step * i : t0 - step * i;
        r[k] = dir === 'high' ? pay[i] : pay[n - 1 - i];
      }
      return { ratio: r, label: (dir === 'high' ? '≥' : '≤') + fmtNum(t0) + unit };
    });
  }

  // 构造 per-peril 阈值扫描变体（对标 ParameterPro 的 trigger definition & validation）
  function buildSweep(f, scheme) {
    var dir = scheme.primary.indexDir, unit = scheme.primary.indexUnit, base = scheme.primary.ratio;
    if (f.peril === 'rainy') {
      return [3, 4, 5, 7].map(function (d) {
        return { label: '起赔 ' + d + ' 日', ratio: base, minRun: d, unit: '连续降水日数' };
      });
    }
    var t0map = {
      heat: [33, 35, 37], frost: [-3, -1], storm: [30, 50, 70],
      wind: [11, 13.8, 17], drought: [20, 40]
    };
    var t0list = t0map[f.peril] || [Object.keys(base).map(Number).sort(function (a, b) { return a - b; })[0]];
    return variantRatios(base, t0list, dir, unit).map(function (v) {
      return { label: v.label, ratio: v.ratio, minRun: undefined, unit: unit };
    });
  }

  function init() {
    var cs = document.getElementById('sd-crop');
    if (!cs) return;
    if (window.WIICrops) WIICrops.fillCropSelect(cs);
    else Object.keys(KB.crops).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = KB.crops[k].name; cs.appendChild(o); });
    var pl = document.getElementById('sd-peril');
    PERILS.forEach(function (p) { var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; pl.appendChild(o); });
    var pl2 = document.getElementById('sd-peril2');
    pl2.innerHTML = '<option value="">— 不添加次害 —</option>';
    PERILS.forEach(function (p) { var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; pl2.appendChild(o); });

    // 缓存县下拉
    fetch('assets/data/counties.json').then(function (r) { return r.json(); }).then(function (j) {
      var sel = document.getElementById('sd-county');
      if (!sel) return;
      (j.counties || []).forEach(function (c) {
        var o = document.createElement('option');
        o.value = c.lat + ',' + c.lon + ',' + c.name;
        o.textContent = c.name + '（' + c.prov + '·' + c.city + '）';
        sel.appendChild(o);
      });
    }).catch(function () { });

    document.getElementById('sd-go').addEventListener('click', run);
    document.getElementById('sd-reset').addEventListener('click', function () {
      document.getElementById('scheme-out').style.display = 'none';
      document.getElementById('scheme-out').innerHTML = '';
    });
  }

  function readForm() {
    var cv = (document.getElementById('sd-county').value || '').split(',');
    var lat = parseFloat(document.getElementById('sd-lat').value) || +cv[0];
    var lon = parseFloat(document.getElementById('sd-lon').value) || +cv[1];
    var countyName = (document.getElementById('sd-county').value || '').split(',')[2] || (lat ? (lat.toFixed(2) + ',' + lon.toFixed(2)) : '—');
    var crop = document.getElementById('sd-crop').value;
    var peril = document.getElementById('sd-peril').value;
    var peril2 = document.getElementById('sd-peril2').value || '';
    var sum = parseFloat(document.getElementById('sd-sum').value) || 400;
    var area = parseFloat(document.getElementById('sd-area').value) || 0; // 万亩
    var trial = parseFloat(document.getElementById('sd-trial').value) || 0;
    var scenario = document.getElementById('sd-scenario').value || '';
    var m1 = +document.getElementById('sd-m1').value, d1 = +document.getElementById('sd-d1').value;
    var m2 = +document.getElementById('sd-m2').value, d2 = +document.getElementById('sd-d2').value;
    return { lat: lat, lon: lon, countyName: countyName, crop: crop, peril: peril, peril2: peril2,
      sum: sum, area: area, trial: trial, scenario: scenario, m1: m1, d1: d1, m2: m2, d2: d2 };
  }

  function showErr(msg) {
    var out = document.getElementById('scheme-out');
    if (out) { out.style.display = 'block'; out.innerHTML = '<div class="warn" style="margin:0">' + msg + '</div>'; }
  }
  async function run() {
    var f = readForm();
    if (!f.crop) { showErr('请选择作物'); return; }
    if (!f.peril) { showErr('请选择主害风险'); return; }
    if (!(f.lat && f.lon)) { showErr('请选择或手动输入目标县的经纬度（可在地图上选县，或用面板顶部下拉选县）。'); return; }
    if (!(f.m1 >= 1 && f.m1 <= 12 && f.d1 >= 1 && f.d1 <= 31 && f.m2 >= 1 && f.m2 <= 12 && f.d2 >= 1 && f.d2 <= 31)) {
      showErr('保险期间月/日填写不合法：月份 1–12，日期 1–31。'); return;
    }
    var out = document.getElementById('scheme-out');
    out.style.display = 'block';
    out.innerHTML = '<div class="prog-t">正在设计完整方案（反推 + 真实气象回测校准）…<div class="prog-bar"><i class="spin"></i></div></div>';

    // 1) 反推方案（zoneKey 由县经纬度反推，作物.zone 是描述性串不可直接当键）
    var zoneKey = zoneFromCoord(f.lat, f.lon) || 'yangtze';
    var scheme = window.ReverseEngine.propose({
      cropKey: f.crop, zoneKey: zoneKey, peril: f.peril, peril2: f.peril2, sum: f.sum
    });
    // 覆盖物候窗口为用户设定
    scheme.primary.window = [f.m1, f.d1, f.m2, f.d2];
    if (scheme.combo) scheme.combo.secondary.window = [f.m1, f.d1, f.m2, f.d2];

    // 2) 真实气象回测校准
    var S = {
      lat: f.lat, lon: f.lon, crop: f.crop, peril: f.peril,
      peril2: f.peril2, multi: !!f.peril2,
      m1: f.m1, d1: f.d1, m2: f.m2, d2: f.d2,
      sum: f.sum, trial: f.trial, years: 20, minRun: 3,
      ratio: scheme.primary.ratio,
      ratio2: scheme.combo ? scheme.combo.secondary.ratio : {},
      dir: (f.peril === 'frost' || f.peril === 'drought') ? 'low' : 'high',
      dir2: (f.peril2 === 'frost' || f.peril2 === 'drought') ? 'low' : 'high',
      source: 'openmeteo'
    };
    var R;
    try { R = await window.RateEngine.compute(S); }
    catch (e) { out.innerHTML = '<div class="prog-err">气象回测失败：' + e.message + '</div>'; return; }

    // 2.5) 阈值灵敏度分析（一次性取数、逐变体重算，对标 ParameterPro trigger validation）
    var sweep = buildSweep(f, scheme);
    var sens;
    try { sens = await window.RateEngine.sensitivity(S, sweep); }
    catch (e) { sens = null; }

    // 3) 组装完整方案
    renderScheme(f, scheme, R, sens, out);
  }

  function renderScheme(f, scheme, R, sens, out) {
    var perilCN1 = PERIL_CN[f.peril];
    var perilCN2 = f.peril2 ? PERIL_CN[f.peril2] : '';
    var idx = scheme.primary.indexName;
    var verdictMap = {
      pass: ['通过 · 维持', '当前试算费率与阈值基本成立，合计 ULR 落 70%-75% 可持续区间。'],
      rich: ['费率偏高 · 可让利', '合计 ULR 低于 70%，初版费率偏厚，可适度下调或放宽阈值提升农户获得感。'],
      refix: ['严重偏低 · 须重定价', '合计 ULR 远超 75%，初版费率严重低估真实风险，须收紧阈值+提费率后再报备。'],
      na: ['—', '未填试算费率，下方仅给纯费率区间。']
    };
    var v = verdictMap[R.verdict];
    var zoneName = KB.crops[f.crop].zone || '—';

    // 市场同类产品锚点（取经所得，仅作参照非我司定值）
    var mref = (KB.marketRefs || []).filter(function (r) { return r.peril === f.peril; });
    var mrefHtml = mref.length ? mref.map(function (r) {
      var rows = [
        ['产品/机构', '<b>' + r.name + '</b> · ' + r.org + ' · ' + r.region + '（' + r.year + '）'],
        ['保险责任', r.liability || '—'],
        ['指数', r.index],
        ['触发/理赔阈值', r.triggerParam]
      ];
      return '<div class="refrow"><table class="reftb">' +
        rows.map(function (row) {
          return '<tr><th>' + row[0] + '</th><td>' + row[1] + '</td></tr>';
        }).join('') +
        '</table><span class="note-sm">' + r.note + ' 来源：' + r.src + '</span></div>';
    }).join('') : '';

    // 再保与风险分散 / 灾前风险减量
    var reinsHtml = [
      '① <b>系统性巨灾用再保分散</b>：县域连片巨灾（如整片黄淮海烂场雨）同频赔付，须通过中国农业再保险共同体(中农再)或国际再保(Swiss Re/Munich Re)转嫁尾部风险；',
      '② <b>ULR 是再保定价锚</b>：本方案合计 ULR ' + (R.ulr != null ? pct(R.ulr, 0) : '—') + '，超 75% 须先收紧阈值+提费率，否则再保成本陡增；',
      '③ <b>多责任/多县区组合对冲</b>：选空间相关性低的县区与灾因组合，平滑组合波动，降低再保资本占用；',
      '④ <b>衍生品/ILS 可选</b>：价格+气象复合型风险（如松江"水稻高温指数保险+衍生品"）可叠加天气衍生品或巨灾债券转移容量。'
    ].join('<br>');
    var riskWarn = (f.peril === 'rainy') ? '起赔日数-1' : '阈值约90%';
    var tech = KB.agriTech ? KB.agriTech[f.peril] : null;
    var techActs = tech ? tech.acts : [];
    var riskHtml = [
      '① <b>灾前预警阈值</b>：' + (tech ? tech.warn : '将触发线前移至"临近触发"预警') + '，提前向农户推送防范；',
      '② <b>减损农技（灾前）</b>：' + (techActs.length ? techActs.join('；') + '。' : (scheme.primary.phenoNote || '')) + ' 把"事后赔付"变为"灾前少损"；',
      '③ <b>自动理赔闭环</b>：触发即赔、免现场定损（对标辛集梨"理赔触发告知书一键生成"），理赔时效缩至 T+0~T+3；',
      '④ <b>遥感协同佐证</b>：NDVI/降水反演作灾前监测与灾后果园/地块级佐证，降基差争议。'
    ].join('<br>');

    // 农业知识卡：品种关键气象指标 + 主害敏感生育期 + 本区气候基准（固化知识，直接呈现）
    var clim = KB.cropClim ? KB.cropClim[f.crop] : null;
    var pheno = (KB.crops[f.crop].phenology || []).filter(function (p) { return (p.vul || []).indexOf(f.peril) >= 0; });
    var agroHtml = '<div class="rb-sub">农业知识卡 · 品种生长期与灾害特点（农艺参考值 · 非我司定值）</div>';
    if (clim) {
      agroHtml += '<table class="mini"><tr><th>关键气象指标</th><th>参考值</th></tr>'
        + '<tr><td>≥10℃活动积温</td><td>' + clim.gdd + ' ℃·d</td></tr>'
        + '<tr><td>全生育期</td><td>' + clim.days + ' 天</td></tr>'
        + '<tr><td>适宜温度</td><td>' + clim.temp + ' ℃</td></tr>'
        + '<tr><td>关键期需水</td><td>' + clim.water + ' mm</td></tr>'
        + '<tr><td>播期 / 收期</td><td>' + clim.sow + ' / ' + clim.harvest + '</td></tr>'
        + (clim.note ? '<tr><td>备注</td><td>' + clim.note + '</td></tr>' : '')
        + '</table>';
    }
    if (pheno.length) {
      agroHtml += '<div class="rb-sub">主害「' + perilCN1 + '」敏感生育期</div><table class="mini"><tr><th>生育阶段</th><th>月份</th><th>灾害机理</th></tr>'
        + pheno.map(function (p) { return '<tr><td>' + p.name + '</td><td>' + p.m[0] + '–' + p.m[1] + '月</td><td>' + (p.note || '—') + '</td></tr>'; }).join('')
        + '</table>';
    }
    var band = KB.climBands ? KB.climBands[zoneFromCoord(f.lat, f.lon)] : null;
    if (band) {
      agroHtml += '<div class="note-sm">本区常年气候基准（背景参照）：年均温 ' + band.tat + '℃｜年降水 ' + band.rain + 'mm｜≥10℃积温 ' + band.gdd + '℃·d｜无霜期 ' + band.frostfree + '天</div>';
    }

    var sensRows = sens ? sens.map(function (row) {
      return '<tr><td>' + row.label + '</td><td>' + pct(row.mean) + '</td><td>' + pct(row.rate) + '</td><td>' + (row.ulr != null ? pct(row.ulr, 0) : '—') + '</td><td>' + row.triggerYears + '/' + row.n + '</td></tr>';
    }).join('') : '';

    var ratioRows = function (ratio, dir, unit) {
      var op = dir === 'low' ? '≤' : '≥';
      return Object.keys(ratio).map(Number).sort(function (a, b) { return dir === 'low' ? b - a : a - b; })
        .map(function (k) { return '<tr><td>' + unit + ' ' + op + ' ' + k + '</td><td>赔付 ' + pct(ratio[k]) + '</td></tr>'; }).join('');
    };
    var primaryRatio = ratioRows(scheme.primary.ratio, scheme.primary.indexDir, scheme.primary.indexUnit);
    var secRatio = scheme.combo ? ratioRows(scheme.combo.secondary.ratio, scheme.combo.secondary.indexDir, scheme.combo.secondary.indexUnit) : '';

    var basis = [
      '① <b>农时物候精准匹配</b>：指数卡在' + scheme.primary.windowLabel + '（' + scheme.primary.phenoNote + '），从源头降基差；',
      '② <b>网格化 + 地面观测</b>：县域用多站/卫星网格化，以' + f.countyName + '县气象站/省气候中心观测标定；',
      '③ <b>遥感校验校准</b>：NDVI/降水反演作设计期校验与对农户、监管佐证（纯指数不叠加产量触发）；',
      '④ <b>机器学习量化基差</b>：建模"气象指数→实际损失"偏差分布，定位高基差区域；',
      '⑤ <b>再保/区域分散</b>：系统性基差用再保与多县区组合分散；多责任合计时合计 ULR 须落 70%-75%，勿机械平分。'
    ].join('<br>');

    var scenarioTag = f.scenario ? ('<div class="warn">已绑定场景：' + ({ s1: '遴选/应标创新点', s2: '县域特色险种立项', s3: '财政补贴与农户封顶', s4: '基差风险评级治理', s5: '区域连片巨灾', s6: '传统 vs 指数决策' }[f.scenario]) + '（相关要点见"需求场景"工作台）</div>') : '';

    var exportObj = {
      生成时间: new Date().toISOString().slice(0, 10),
      区域: { 县: f.countyName, 经纬度: [f.lat, f.lon], 农业区: zoneName },
      作物: { 代码: f.crop, 名称: scheme.cropName, 保额: f.sum, 承保面积_万亩: f.area || null },
      主害责任: {
        灾害: perilCN1, 指数: idx, 触发依据: scheme.primary.indexBase,
        物候窗口: scheme.primary.windowLabel + '（' + fmtMD(f.m1, f.d1) + '—' + fmtMD(f.m2, f.d2) + '）',
        分段赔付比例表: scheme.primary.ratio
      },
      次害责任: scheme.combo ? { 灾害: perilCN2, 指数: scheme.combo.secondary.indexName, 分段赔付比例表: scheme.combo.secondary.ratio } : null,
      费率回测: {
        数据来源: R.usedSrc || 'Open-Meteo/ERA5', 样本年数: R.n,
        期望年赔付率_纯: pct(R.mean), 纯费率区间: pct(R.lo) + '~' + pct(R.hi),
        建议综合费率: pct(R.rateMean), 综合费率区间: pct(R.rateLo) + '~' + pct(R.rateHi),
        触发年数: R.triggerYears + '/' + R.n, ULR: R.ulr != null ? pct(R.ulr, 0) : null,
        校准结论: v[0] + '：' + v[1], 逐年赔付率: R.combined.map(function (x, i) { return { 年: 2026 - R.n + i, 赔付率: +(x * 100).toFixed(2) }; })
      },
      基差治理: basis, 再保安排: reinsHtml, 风险减量: riskHtml,
      阈值灵敏度: sens ? sens : '取数失败', 合规锚定: COMPLIANCE, 免责: SRC_NOTE + ' 主体区分：阳光财险≠阳光农互。'
    };
    window.__lastScheme = exportObj;

    var html =
      '<div class="res-head">天气指数保险方案 · ' + scheme.cropName + ' · ' + f.countyName + ' · ' + perilCN1 + (perilCN2 ? '+' + perilCN2 : '') + '</div>' +
      scenarioTag +
      '<div class="kpi-row">' +
        kpi('作物 / 区域', scheme.cropName + '<br>' + zoneName, '保额 ' + f.sum + ' 元/亩' + (f.area ? ' · 承保 ' + f.area + ' 万亩' : '')) +
        kpi('建议综合费率', pct(R.rateMean), '含费用15%+风险附加10%') +
        kpi('纯费率 Bootstrap 区间', pct(R.lo) + '~' + pct(R.hi), R.n + '年历史 95%置信') +
        kpi('合计 ULR / 结论', (R.ulr != null ? pct(R.ulr, 0) : '—'), v[0]) +
      '</div>' +
      '<div class="res-block"><div class="rb-h">一、指数与触发设计（主害 ' + perilCN1 + '）</div><div class="rb-b">' +
        card('气象指数', idx, scheme.primary.indexBase) +
        card('关键物候窗口', scheme.primary.windowLabel, scheme.primary.phenoNote) +
        card('建议保险期间', fmtMD(f.m1, f.d1) + ' — ' + fmtMD(f.m2, f.d2), '每年同窗') +
        card('数据来源', R.usedSrc || 'Open-Meteo/ERA5', SRC_NOTE + '（分辨率约25km格点；县域尺度平滑降基差）') +
        '<div class="rb-sub">分段赔付函数（保额 ' + f.sum + ' 元/亩）</div>' +
        '<table class="mini"><tr><th>触发条件</th><th>赔付强度</th></tr>' + primaryRatio + '</table>' +
        (mrefHtml ? '<div class="rb-sub">市场同类产品怎么设（取经锚点 · 参考非定值）</div>' + mrefHtml : '') +
        agroHtml +
      '</div></div>' +
      (scheme.combo ? '<div class="res-block"><div class="rb-h">二、次害责任（' + perilCN2 + '）</div><div class="rb-b">' +
        card('气象指数', scheme.combo.secondary.indexName, scheme.combo.secondary.indexBase) +
        '<table class="mini"><tr><th>触发条件</th><th>赔付强度</th></tr>' + secRatio + '</table>' +
        '<div class="note-sm">多责任合计：逐年两责赔付叠加封顶 100%，合计 ULR 须落 70%-75%。</div>' +
      '</div></div>' : '') +
      '<div class="res-block"><div class="rb-h">三、费率回测（真实气象验证）</div><div class="rb-b">' +
        card('期望年赔付率（纯风险损失率）', pct(R.mean), '多年历史均值') +
        card('触发年数', R.triggerYears + ' / ' + R.n, '历史出险频率') +
        card('最重赔付年', pct(R.maxR), '封顶前最大年赔付率') +
        card('校准结论', v[0], v[1]) +
        '<div class="rb-sub">逐年赔付率（' + (2026 - R.n) + '–2025，占保额比例）</div>' +
        '<canvas id="sd-chart" width="760" height="220"></canvas>' +
      '</div></div>' +
      '<div class="res-block"><div class="rb-h">四、阈值灵敏度分析（平移起赔线看费率 · 对标 ParameterPro）</div><div class="rb-b">' +
        '<div class="note-sm">同一县域/作物，仅平移"起赔阈值"对期望赔付率与合计 ULR 的影响（ULR 目标带 70%-75%）。据此在"农户获得感"与"费率可持续"间取平衡。</div>' +
        (sens ? '<table class="mini"><tr><th>起赔阈值(变体)</th><th>期望年赔付率</th><th>建议综合费率</th><th>合计 ULR</th><th>触发年</th></tr>' + sensRows + '</table><canvas id="sd-sens-chart" width="760" height="170"></canvas>'
              : '<div class="note-sm">灵敏度分析取数失败，可重试。</div>') +
      '</div></div>' +
      '<div class="res-block"><div class="rb-h">五、基差风险治理（核心敌人）</div><div class="rb-b">' + basis + '</div></div>' +
      '<div class="res-block"><div class="rb-h">六、再保与风险分散（对接中农再/国际再保/ILS）</div><div class="rb-b">' + reinsHtml + '</div></div>' +
      '<div class="res-block"><div class="rb-h">七、灾前预警与风险减量（保防减救赔全流程）</div><div class="rb-b">' + riskHtml + '</div></div>' +
      '<div class="res-block"><div class="rb-h">八、政策合规锚定</div><div class="rb-b">' + COMPLIANCE.map(function (c) { return '· ' + c; }).join('<br>') + '</div></div>' +
      '<div class="res-actions"><button class="primary" id="sd-export">导出方案(JSON)</button><button class="ghost" id="sd-print">打印 / 存为PDF</button></div>' +
      '<div class="note-sm">说明：本方案由平台自动反推 + 真实气象回测生成；阈值/费率以【】占位，最终以试点县历史气象数据标定、精算报备与监管批复为准。主体区分：阳光财险≠阳光农互。</div>';

    out.innerHTML = html;
    /* ---------- 导出闸门：判定逻辑在 WIIPheno.gate()（可单测），此处只负责拦 ---------- */
    function runGate(action) {
      var P = window.WIIPheno;
      if (!P || !P.getCrops()[f.crop]) return true;
      var zk = zoneFromCoord(f.lat, f.lon) || 'yangtze';
      var rk = (P.ZONE2REGION && P.ZONE2REGION[zk]) || zk;
      var g = P.gate(f.crop, rk, scheme.primary.peril, f.m1, f.d1, f.m2, f.d2);
      if (g.block) { alert('【已阻断' + action + '】\n\n' + g.msg); return false; }
      if (g.notice) { alert('【设计说明】\n\n' + g.notice); return true; }
      if (g.warn && !confirm('提示：' + g.warn + '\n\n仍要继续' + action + '吗？')) return false;
      return true;
    }

    document.getElementById('sd-export').addEventListener('click', function () {
      if (!runGate('导出')) return;
      var blob = new Blob([JSON.stringify(window.__lastScheme, null, 2)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = '天气指数保险方案_' + scheme.cropName + '_' + f.countyName + '.json'; a.click();
    });
    document.getElementById('sd-print').addEventListener('click', function () {
      if (!runGate('打印')) return;
      window.print();
    });
    drawChart(R, 'sd-chart');
    if (sens) drawSens(sens, 'sd-sens-chart');
  }

  function drawSens(sens, id) {
    var cv = document.getElementById(id); if (!cv) return;
    var ctx = cv.getContext('2d'); var W = cv.width, H = cv.height, padL = 46, padB = 26, padT = 12, padR = 12;
    ctx.clearRect(0, 0, W, H);
    var data = sens.map(function (s) { return s.ulr != null ? s.ulr : s.mean; }); // 无试算费率时用纯赔付率
    var n = data.length;
    var maxV = Math.max.apply(null, data) * 1.15 || 0.05;
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
      var bh = data[i] / maxV * plotH;
      ctx.fillStyle = (sens[i].ulr != null && sens[i].ulr > 0.75) ? '#c0392b' : (sens[i].ulr != null && sens[i].ulr < 0.70 ? '#e0a32e' : '#3b9b6b');
      ctx.fillRect(padL + i * bw + bw * 0.2, H - padB - bh, bw * 0.6, bh);
      ctx.fillStyle = '#5b6b7b'; ctx.textAlign = 'center'; ctx.font = '10px sans-serif';
      ctx.fillText(sens[i].label.replace(/[≥≤]/, ''), padL + i * bw + bw / 2, H - padB + 15);
    }
  }

  function kpi(t, v, s) { return '<div class="kpi"><div class="kpi-t">' + t + '</div><div class="kpi-v">' + v + '</div><div class="kpi-s">' + s + '</div></div>'; }
  function card(t, v, s) { return '<div class="rc"><div class="rc-t">' + t + '</div><div class="rc-v">' + v + '</div><div class="rc-s">' + s + '</div></div>'; }

  function drawChart(R, id) {
    var cv = document.getElementById(id); if (!cv) return;
    var ctx = cv.getContext('2d'); var W = cv.width, H = cv.height, padL = 42, padB = 28, padT = 12, padR = 12;
    ctx.clearRect(0, 0, W, H);
    var data = R.combined, n = data.length;
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
      var bh = data[i] / maxV * plotH;
      ctx.fillStyle = data[i] > 0 ? '#e0792e' : '#bcd0c4';
      ctx.fillRect(padL + i * bw + bw * 0.18, H - padB - bh, bw * 0.64, bh);
    }
    var ey = H - padB - R.mean / maxV * plotH;
    ctx.strokeStyle = '#c0392b'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padL, ey); ctx.lineTo(W - padR, ey); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#5b6b7b'; ctx.textAlign = 'center';
    var y0 = 2026 - n;
    [0, Math.floor(n / 2), n - 1].forEach(function (i) { ctx.fillText((y0 + i), padL + i * bw + bw / 2, H - padB + 16); });
  }

  window.SchemeDesigner = { init: init, zoneFromCoord: zoneFromCoord };
})();


/* ==== app.js ==== */
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
