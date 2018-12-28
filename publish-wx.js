const fs = require("fs");
const path = require("path");

function copyFile(filePath, targetPath) {
    if (fs.existsSync(targetPath) === false) {
        fs.mkdirSync(targetPath, {recursive: true});
    }
    let data = fs.readFileSync(filePath);
    let arr = filePath.split("\\");
    let fileName = arr[arr.length - 1];
    let newFilePath = path.join(targetPath, fileName);
    fs.writeFileSync(newFilePath, data);
}

function copyDir(dirPath, targetPath) {
    let arr = dirPath.split("\\");
    let dirName = arr[arr.length - 1];
    let newDirPath = path.join(targetPath, dirName);
    if (fs.existsSync(newDirPath) === false) {
        fs.mkdirSync(newDirPath, {recursive: true});
    }
    let files = fs.readdirSync(dirPath);
    files.forEach(file => {
        let filePath = path.join(dirPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            copyDir(filePath, newDirPath);
        } else {
            let data = fs.readFileSync(filePath);
            let newFilePath = path.join(newDirPath, file);
            fs.writeFileSync(newFilePath, data);
        }
    });
}


function deleteAll(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(file => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteAll(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

// deleteAll("wx");
copyDir("images", "wx\\");
copyDir("sounds", "wx\\");
copyDir("js", "wx\\");
copyFile("config.js", "wx\\");
copyFile("run-option.js", "wx\\");
copyFile("game.js", "wx\\");
copyFile("game.json", "wx\\");
copyFile("project.config.json", "wx\\");
