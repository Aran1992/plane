const fs = require("fs");
const path = require("path");

function copyFile(filePath, targetPath) {
    if (fs.existsSync(targetPath) === false) {
        fs.mkdirSync(targetPath);
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
        fs.mkdirSync(newDirPath);
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

copyDir("C:\\Projects\\plane\\images", "C:\\Projects\\plane\\wx\\");
copyDir("C:\\Projects\\plane\\js", "C:\\Projects\\plane\\wx\\");
copyFile("C:\\Projects\\plane\\config.js", "C:\\Projects\\plane\\wx\\");
