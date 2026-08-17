/* ═══════════════════════════════════════════
   团务业务规则模块（第三刀）
   一处定义，全站复用。改规则只动这个文件。
   ═══════════════════════════════════════════ */
var RULES = (function () {
  "use strict";

  /* ---------- ① 教育评议：优秀比例 ≤ 30% ---------- */
  function evaluationReport(list) {
    // list: [{memberId, name, grade}]
    var total = list.length;
    var excellent = list.filter(function (x) { return x.grade === "优秀"; }).length;
    var ratio = total > 0 ? excellent / total : 0;
    var allowed = Math.floor(total * 0.30);          // 30% 上限（向下取整人数）
    var over = excellent - allowed;
    return {
      total: total,
      excellent: excellent,
      allowed: allowed,
      ratio: ratio,
      over: over > 0 ? over : 0,
      pass: over <= 0
    };
  }
  function checkEvaluation(list) {
    var r = evaluationReport(list);
    if (list.length === 0) return { ok: false, msg: "参评团员为空，无法保存" };
    if (!r.pass) {
      return {
        ok: false,
        msg: "优秀比例 " + Math.round(r.ratio * 100) + "% 超过 30% 上限（优秀 " + r.excellent + "/" + r.total + "，上限 " + r.allowed + " 人），超出 " + r.over + " 人，请先调整等次"
      };
    }
    return { ok: true, msg: "优秀比例 " + Math.round(r.ratio * 100) + "% 合规（优秀 " + r.excellent + "/" + r.total + "，上限 " + r.allowed + " 人）" };
  }

  /* ---------- ② 推优条件核查 ---------- */
  // 团龄（年）：joinDate "YYYY-MM" 距今天数（兼容存量脏格式：2024年12月/2024.12/2024-1/202412）
  function tuiyouYears(joinDate) {
    if (!joinDate) return null;
    var s = String(joinDate).trim();
    var m = s.match(/^(\d{4})-(\d{1,2})$/);
    if (!m) m = s.match(/(\d{4})\D{0,2}(\d{1,2})/);
    if (!m) return null;
    var now = new Date();
    var years = (now.getFullYear() - parseInt(m[1], 10)) + (now.getMonth() + 1 - parseInt(m[2], 10)) / 12;
    return Math.round(years * 10) / 10;
  }
  // 学号推断入学年：25xxxxxxx → 2025 级（仅提示用，不作年龄依据）
  function entryYear(studentId) {
    var m = String(studentId || "").match(/^(\d{2})/);
    if (!m) return null;
    return 2000 + parseInt(m[1], 10);
  }
  function checkTuiyouMember(m) {
    // 返回 {pass, problems:[原因]}
    var problems = [];
    var age = null;
    if (m.birthMonth) {
      var bs = String(m.birthMonth).trim();
      var bm = bs.match(/^(\d{4})-(\d{1,2})$/);
      if (!bm) bm = bs.match(/(\d{4})\D{0,2}(\d{1,2})/);
      if (bm) {
        var now = new Date();
        age = now.getFullYear() - parseInt(bm[1], 10);
        if (now.getMonth() + 1 < parseInt(bm[2], 10)) age -= 1; // 未过生日，月份粒度取保守值
      }
    }
    if (m.age !== undefined && m.age !== null && m.age !== "") age = Number(m.age);
    if (age === null) {
      problems.push("缺出生年月，无法核查年龄（请在团员台账补录）");
    } else if (age < 18) {
      problems.push("未满 18 周岁（" + age + " 岁）");
    }
    var yrs = tuiyouYears(m.joinDate);
    if (yrs === null) {
      problems.push("缺入团时间，无法核查团龄");
    } else if (yrs < 1) {
      problems.push("团龄不足 1 年（" + yrs + " 年）");
    }
    return { pass: problems.length === 0, problems: problems, age: age, years: yrs };
  }
  // 团员数（所有按团员数计算的比率统一走这里，避免口径翻车）
  function tuanYuanCount(list) {
    return (list || []).filter(function (m) { return m.memberType === "团员"; }).length;
  }
  // 批次比例：推优人数 ≤ 团员总数 20%（推优入党实施办法：基数=团支部团员人数）
  function checkTuiyouBatch(candidateCount, members) {
    var base = tuanYuanCount(members);
    var limit = Math.floor(base * 0.20);
    if (candidateCount > limit) {
      return { ok: false, msg: "推优人数 " + candidateCount + " 超过团员总数 20% 上限（团员 " + base + " 人 → 上限 " + limit + " 人），请削减" };
    }
    return { ok: true, msg: "推优人数 " + candidateCount + "/" + limit + " 合规（团员 " + base + " 人）" };
  }

  /* ---------- ③ 劳动实践两级达标 ---------- */
  function volunteerStatus(hours, target) {
    var h = Number(hours) || 0;
    var t = Number(target) || 0;
    return {
      hours: h,
      target: t,
      pass: h >= t,
      remain: Math.max(0, Math.round((t - h) * 10) / 10)
    };
  }

  /* ---------- ④ 月度节奏配置（全年 12 个月，驱动总览看板） ---------- */
  var MONTHLY_RHYTHM = {
    1: ["教育评议收尾", "团籍注册收尾", "智慧团建信息更新"],
    2: ["返家乡社会实践"],
    3: ["学雷锋志愿服务月", "评议结果公示表彰", "团费收缴"],
    4: ["推优入党集中开展", "五四评优申报"],
    5: ["五四主题团日", "新团员入团仪式", "心理健康月"],
    6: ["毕业季组织关系转出", "期末总结", "三下乡动员"],
    7: ["暑期社会实践实施"],
    8: ["暑期社会实践收尾", "下学年规划", "开学季准备"],
    9: ["支部换届", "新生团组织关系转入", "团籍注册（开学1个月内）", "新学期计划", "团费收缴"],
    10: ["团员台账核对", "推优摸底"],
    11: ["专题理论学习", "推优计划上报"],
    12: ["团员教育评议启动", "年度总结与述职", "新年主题团日"]
  };

  /* ---------- ⑤ 评优门槛提示（看板埋点） ---------- */
  var AWARD_HINTS = [
    "参评「优秀共青团员」需教育评议为优秀等次，年限要求以当年评选文件为准",
    "参评「五四红旗团支部」成立年限等要求以当年评选文件为准"
  ];

  /* ---------- ⑥ 校历档位映射（配置层默认值，toukai 19:22：校情非通用） ----------
     不同学校校历差一个月，另一团支书改这里或 D.settings.layerMap 覆盖即可适配 */
  var DEFAULT_LAYER_MAP = [
    { months: [6,7,8], hint: "暑期档 · 实践登记 + 开学材料预备 + 青年大学习假期档" },
    { months: [9], hint: "开学季 · 团籍注册 / 换届 / 新学期计划" }
  ];

  return {
    evaluationReport: evaluationReport,
    checkEvaluation: checkEvaluation,
    tuiyouYears: tuiyouYears,
    entryYear: entryYear,
    checkTuiyouMember: checkTuiyouMember,
    checkTuiyouBatch: checkTuiyouBatch,
    volunteerStatus: volunteerStatus,
    tuanYuanCount: tuanYuanCount,
    MONTHLY_RHYTHM: MONTHLY_RHYTHM,
    AWARD_HINTS: AWARD_HINTS,
    DEFAULT_LAYER_MAP: DEFAULT_LAYER_MAP
  };
})();
