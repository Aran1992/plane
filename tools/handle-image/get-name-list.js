const fs = require("fs");
const path = require("path");
let files = fs.readdirSync(path.join(__dirname, "images"));
let data = `window.nameList = ${JSON.stringify(files, undefined, "\t")};`;
fs.writeFileSync(path.join(__dirname, "list.js"), data, "utf8");
