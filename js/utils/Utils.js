export default class Utils {
    static removeItemFromArray(array, item) {
        let index = array.findIndex(item_ => item === item_);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    static values(json) {
        let arr = [];
        for (let name in json) {
            if (json.hasOwnProperty(name)) {
                arr.push(json[name]);
            }
        }
        return arr;
    }

    static recursiveValues(json) {
        let arr = [];
        for (let name in json) {
            if (json.hasOwnProperty(name)) {
                if (json[name].length !== undefined) {
                    arr = arr.concat(json[name]);
                } else {
                    arr.push(json[name]);
                }
            }
        }
        return arr;
    }

    static radian2angle(radian) {
        return radian / Math.PI * 180;
    }

    static isPointInRect(point, rect) {
        return point.x >= rect.x
            && point.x <= rect.x + rect.width
            && point.y >= rect.y
            && point.y <= rect.y + rect.height;
    }

    static randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    static randomIntInRange(min, max) {
        return min + Math.floor(Math.random() * (max + 1 - min));
    }

    static randomChoose(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    static getLast(arr) {
        return arr[arr.length - 1];
    }
}
