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
