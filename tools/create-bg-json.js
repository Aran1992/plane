const fs = require("fs");

let data = fs.readFileSync("C:\\Projects\\bike\\myLaya\\laya\\pages\\hello.scene", "utf8");
let json = JSON.parse(data);
json.child.shift();
json = json.child.map(data => {
    return {
        x: data.props.x,
        y: data.props.y,
        texture: data.props.texture.replace("hello/", "images/")
    };
});
fs.writeFileSync("test.json", JSON.stringify(json), "utf8");
