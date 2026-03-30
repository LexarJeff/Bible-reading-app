const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "www", "index.html"), "utf8");
var pass = 0, fail = 0;
function chk(name, str) { if (html.indexOf(str) !== -1) { console.log("PASS: " + name); pass++; } else { console.log("FAIL: " + name); fail++; } }
function chkNot(name, str) { if (html.indexOf(str) === -1) { console.log("PASS: " + name); pass++; } else { console.log("FAIL: " + name); fail++; } }
chk("v2.0.3 version", "2.0.3");
chkNot("no v2.0.2", "2.0.2");
chk("stylePickerModal", "stylePickerModal");
chk("pacePickerModal", "pacePickerModal");
chkNot("no planPickerModal", "planPickerModal");
chkNot("no orderPickerModal", "orderPickerModal");
chk("selectStyle", "window.selectStyle");
chk("hideStylePicker", "window.hideStylePicker");
chk("backToStylePicker", "window.backToStylePicker");
chk("pace-bible-only", "pace-bible-only");
chkNot("no remapChronoDays", "remapChronoDays");
chk("chrono migration", "chrono-v203-migrated");
chk("chrono book filter", "r.chapters.indexOf(bookName)");
chk("chrono stats filter", "r.chapters.indexOf(book)");
chk("style then pace", "style then pace");
chk("chrono box styling", "width:auto;min-width:48px");
console.log("" + pass + " passed, " + fail + " failed");
if (fail > 0) process.exit(1);