const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const root = "../config";
const outputRoot = "../dist";

function parseConfig(inputFilePath, outFilePath) {
    const buf = fs.readFileSync(inputFilePath);
    const wb = xlsx.read(buf, {type: "buffer"});
    const sheet = wb.Sheets.Sheet1;
    const [defaults, ...values] = xlsx.utils.sheet_to_json(sheet).slice(2);
    const map = {};
    values.forEach(value => {
        for (const key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                if (!value.hasOwnProperty(key)) {
                    value[key] = defaults[key];
                }
            }
        }
        map[value.id] = value;
    });
    fs.writeFileSync(outFilePath, JSON.stringify(map));
}

function recreateConfig() {
    const files = fs.readdirSync(root);
    files.forEach(filename => {
        if (filename.endsWith(".csv")) {
            const inputFilepath = path.join(root, filename);
            const outputFilepath = path.join(outputRoot, filename.replace(".csv", ".json"));
            try {
                parseConfig(inputFilepath, outputFilepath);
            } catch (e) {
                console.error(e);
            }
        }
    });
    console.log("recreateConfig success");
}

recreateConfig();

fs.watch(root, {recursive: true}, (event, filename) => {
    console.log(event, filename);
    if (filename && event === "change") {
        if (filename.endsWith(".csv")) {
            recreateConfig();
        }
    }
});
