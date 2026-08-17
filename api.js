/* ═══════════════════════════════════════════
   API 通道层（第四刀）
   统一封装后端 pywebview 接口；浏览器预览模式优雅降级。
   用法：API.call("save_data",[json]) / API.importExcelBase64(b64,name) ...
   ═══════════════════════════════════════════ */
var API = (function () {
  "use strict";

  function hasBridge() {
    return !!(window.pywebview && window.pywebview.api);
  }

  function call(name, args) {
    return new Promise(function (resolve, reject) {
      if (!hasBridge()) {
        reject(new Error("当前为浏览器预览模式，无桌面桥接（pywebview），该功能需在桌面应用中运行"));
        return;
      }
      try {
        var fn = window.pywebview.api[name];
        if (typeof fn !== "function") {
          reject(new Error("后端接口不存在: " + name));
          return;
        }
        var p = fn.apply(window.pywebview.api, args || []);
        if (p && typeof p.then === "function") {
          p.then(resolve).catch(reject);
        } else {
          resolve(p);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  // ---- 业务接口 ----
  function importExcelBase64(b64, filename) {
    return call("parse_excel_base64", [b64, filename]).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || "导入失败（未知错误）");
      return r;
    });
  }
  function askAi(msg, dbJson) {
    return call("ask_ai", [msg, dbJson]).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || "norm无响应");
      return r.reply;
    });
  }
  function batchArchive(dbJson) { return call("batch_archive", [dbJson]); }
  function generateReport(dbJson) { return call("generate_report", [dbJson]); }
  function saveData(jsonStr) { return call("save_data", [jsonStr]); }
  function loadData() { return call("load_data", []); }
  function openAiWindow() { return call("open_ai_window", []); }
  function openSmartWindow(url) { return call("open_smart_window", [url]); }
  function parseDocx(b64, name) { return call("parse_docx", [b64, name]); }
  function navZhtj() { return call("nav_zhtj", []); }
  function navBack() { return call("nav_back", []); }
  function listPhotos() { return call("list_photos", []); }
  function deletePhoto(name) { return call("delete_photo", [name]); }
  function chooseBackupDir() { return call("choose_backup_dir", []); }
  function saveBackup(dir, filename, content) { return call("save_backup", [dir, filename, content]); }

  return {
    hasBridge: hasBridge,
    call: call,
    importExcelBase64: importExcelBase64,
    askAi: askAi,
    batchArchive: batchArchive,
    generateReport: generateReport,
    saveData: saveData,
    loadData: loadData,
    openAiWindow: openAiWindow,
    openSmartWindow: openSmartWindow,
    parseDocx: parseDocx,
    navZhtj: navZhtj,
    navBack: navBack,
    listPhotos: listPhotos,
    deletePhoto: deletePhoto,
    chooseBackupDir: chooseBackupDir,
    saveBackup: saveBackup
  };
})();
