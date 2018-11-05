function values(json) {
    let arr = [];
    for (let name in json) {
        if (json.hasOwnProperty(name)) {
            arr.push(json[name]);
        }
    }
    return arr;
}