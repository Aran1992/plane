function getRect(imageData, filter) {
    let data = imageData.data;
    let top = imageData.height, right = -1, bottom = -1, left = imageData.width;
    for (let i = 0; i < data.length; i += 4) {
        let column = i / 4 % imageData.width,
            row = Math.floor(i / 4 / imageData.width);
        if (filter([data[i], data[i + 1], data[i + 2], data[i + 3]])) {
            if (row < top) {
                top = row;
            }
            if (row > bottom) {
                bottom = row;
            }
            if (column < left) {
                left = column;
            }
            if (column > right) {
                right = column;
            }
        }
    }
    return {left, right, top, bottom};
}

function getImageData(canvas, ctx, img) {
    let width = img.width;
    let height = img.height;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
}

function trimTransparentPart(imageData) {
    let newImageData = {};

    let data = imageData.data;

    let {left, right, top, bottom} = getRect(imageData, ([r, g, b, a]) => a !== 0);

    newImageData.width = right - left + 1;
    newImageData.height = bottom - top + 1;

    let newData = [];
    for (let i = 0; i < data.length; i += 4) {
        let column = i / 4 % imageData.width,
            row = Math.floor(i / 4 / imageData.width);
        if (column >= left && column <= right && row >= top && row <= bottom) {
            newData = newData.concat([data[i], data[i + 1], data[i + 2], data[i + 3]]);
        }
    }
    newImageData.data = newData;
    return newImageData;
}

function completeSymetryPart(imageData) {
    let {left, right, top, bottom} = getRect(imageData, ([r, g, b, a]) => a === 255);
    right = imageData.width - 1 - right;
    bottom = imageData.height - 1 - bottom;
    if (top > bottom) {
        let part = [];
        let row = top - bottom;
        let count = row * imageData.width;
        for (let i = 0; i < count; i++) {
            part = part.concat([0, 0, 0, 0]);
        }
        imageData.data = imageData.data.concat(part);
        imageData.height += row;
    } else if (top < bottom) {
        let part = [];
        let row = bottom - top;
        let count = row * imageData.width;
        for (let i = 0; i < count; i++) {
            part = part.concat([0, 0, 0, 0]);
        }
        imageData.data = part.concat(imageData.data);
        imageData.height += row;
    }

    if (left > right) {
        let column = left - right;
        let part = [];
        for (let i = 0; i < column; i++) {
            part = part.concat([0, 0, 0, 0]);
        }
        let newData = imageData.data.splice(0, 4);
        for (let i = 0; i <= imageData.data.length; i += 4) {
            let column = i / 4 % imageData.width;
            if (column === 0) {
                newData = newData.concat(part);
            }
            let arr = [imageData.data[i + 0], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3],];
            newData = newData.concat(arr);
        }
        imageData.data = newData;
        imageData.width += column;
    } else if (left < right) {
        let column = right - left;
        let part = [];
        for (let i = 0; i < column; i++) {
            part = part.concat([0, 0, 0, 0]);
        }
        let newData = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
            let column = i / 4 % imageData.width;
            if (column === 0) {
                newData = newData.concat(part);
            }
            let arr = [imageData.data[i + 0], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3],];
            newData = newData.concat(arr);
        }
        imageData.data = newData;
        imageData.width += column;
    }
    return imageData;
}

function putImageData(canvas, ctx, imageData) {
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    let data = imageData.data;
    let width = imageData.width;
    for (let i = 0; i < data.length; i += 4) {
        ctx.fillStyle = `rgba(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3] / 255})`;
        let column = i / 4 % width, row = Math.floor(i / 4 / width);
        ctx.fillRect(column, row, 1, 1);
    }
}

function downloadCanvasImage(canvas, name) {
    let url = canvas.toDataURL("image/png");
    let a = document.createElement("a");
    let event = new MouseEvent("click");
    a.download = name || "下载图片名称";
    a.href = url;
    a.dispatchEvent(event);
}

function handleImage(name) {
    let img = new Image();
    img.src = `images/${name}`;
    img.onload = () => {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let imageData = getImageData(canvas, ctx, img);
        imageData = trimTransparentPart(imageData);
        imageData = completeSymetryPart(imageData);
        putImageData(canvas, ctx, imageData);
        downloadCanvasImage(canvas, name);
    };
}

window.onload = () => {
    window.nameList.forEach(name => handleImage(name));
};
