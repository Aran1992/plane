export default class Utils {
    static removeItemFromArray(array, item) {
        let index = array.findIndex(item_ => item === item_);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    static keys(json) {
        let arr = [];
        for (let name in json) {
            if (json.hasOwnProperty(name)) {
                arr.push(name);
            }
        }
        return arr;
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

    static angle2radian(angle) {
        return angle / 180 * Math.PI;
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

    static calcPointsDistance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    static calcRadians(sp, ep) {
        let x = ep.x - sp.x;
        let y = ep.y - sp.y;
        if (x > 0) {
            return Math.atan(y / x);
        } else if (x < 0) {
            return Math.atan(y / x) + Math.PI;
        } else if (x === 0) {
            if (y > 0) {
                return Math.PI / 2;
            } else if (y < 0) {
                return Math.PI / 2 * 3;
            } else {
                return 0;
            }
        }
    }

    static copyProperty(src, dst) {
        for (let key in dst) {
            if (dst.hasOwnProperty(key)) {
                src[key] = dst[key];
            }
        }
        return src;
    }

    static copy(src) {
        return JSON.parse(JSON.stringify(src));
    }
}
