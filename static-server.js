const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
let server = http.createServer(function (req, res) {
    console.log("url", req.url);
    const filepath = path.resolve(__dirname, "." + req.url);
    if (fs.existsSync(filepath) && fs.lstatSync(filepath).isFile()) {
        const type = mime.getType(filepath);
        res.setHeader("Content-Type", type);
        let stream = fs.createReadStream(filepath);
        stream.pipe(res);
    }
});
console.log("访问 http://localhost:8080/index.html");
server.listen(8080);