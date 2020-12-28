import Resource from "./resource.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/28
 */

CanvasRenderingContext2D.prototype.displayFillRoundRect = function (x, y, w, h, radius) {
    this.beginPath();

    if (Resource.getNeedOffset()) {
        x += Resource.getOffset().x;
        y += Resource.getOffset().y;
    }

    x *= Resource.getScale();
    y *= Resource.getScale();
    w *= Resource.getScale();
    h *= Resource.getScale();
    radius *= Resource.getScale();

    //右下角
    this.arc(x + w - radius, y + h - radius, radius,
        0, Math.PI / 2);
    this.lineTo(x + radius, y + h);

    //左下角
    this.arc(x + radius, y + h - radius, radius,
        Math.PI / 2, Math.PI);
    this.lineTo(x, y + radius);

    //左上角
    this.arc(x + radius, y + radius, radius,
        Math.PI, Math.PI * 3 / 2);
    this.lineTo(x + w - radius, y);

    //右上角
    this.arc(x + w - radius, y + radius, radius,
        -Math.PI / 2, 0);
    this.lineTo(x + w, y + h - radius);
    this.closePath();
    this.fill();
    this.restore();
};

CanvasRenderingContext2D.prototype.displayCenter = function (imageId, x, y, w, h) {
    this.displayBase(imageId, x, y, w, h, "center");
};

CanvasRenderingContext2D.prototype.displayTopLeft = function (imageId, x, y, w, h) {
    this.displayBase(imageId, x, y, w, h, "topLeft");
};

CanvasRenderingContext2D.prototype.displayCenterRate = function (imageId, rateX, rateY, rateW, rateH) {
    this.displayRate(imageId, rateX, rateY, rateW, rateH, "center");
};

CanvasRenderingContext2D.prototype.displayRate = function (imageId, rateX, rateY, rateW, rateH, align) {
    const img = Resource.getImage(imageId);
    if (!img) {
        return;
    }

    let w;
    if (rateW) {
        w = Resource.formatWidth() * rateW;
    } else {
        //未加载完毕的情况
        if (!img.width) {
            return;
        }
        w = img.width;
    }

    let h;
    if (rateH) {
        h = Resource.formatHeight() * rateH;
    } else {
        //未加载完毕的情况
        if (!img.width || !img.height) {
            return;
        }
        h = w * img.height / img.width;
    }

    const x = Resource.formatWidth() * rateX;
    const y = Resource.formatHeight() * rateY;

    this.displayBase(imageId, x, y, w, h, align);
};

CanvasRenderingContext2D.prototype.displayBase = function (imageId, x, y, w, h, align) {
    const img = Resource.getImage(imageId);
    if (!img) {
        return;
    }

    if (!w) {
        //未加载完毕的情况
        if (!img.width) {
            return;
        }
        w = img.width;
    }

    if (!h) {
        //未加载完毕的情况
        if (!img.width || !img.height) {
            return;
        }
        h = w * img.height / img.width;
    }

    if (Resource.getNeedOffset()) {
        x = x + Resource.getOffset().x;
        y = y + Resource.getOffset().y;
    }

    x = x * Resource.getScale();
    y = y * Resource.getScale();
    w = w * Resource.getScale();
    h = h * Resource.getScale();

    switch (align) {
        case "center":
            x = x - w / 2;
            y = y - h / 2;
            break;
    }

    this.drawImage(img,
        0, 0,
        img.width, img.height,
        x, y,
        w, h);
};

CanvasRenderingContext2D.prototype.displayText = function (text, x, y, size, bold, offset, font) {
    if (!font) {
        font = "Arial";
    }
    if (offset === undefined) {
        offset = Resource.getNeedOffset();
    }

    if (x < 0) {
        x = Resource.formatWidth(!offset) + x;
    } else {
        if (offset) {
            x += Resource.getOffset().x;
        }
    }
    if (y < 0) {
        y = Resource.formatHeight(!offset) + y;
    } else {
        if (offset) {
            y += Resource.getOffset().y;
        }
    }

    x = Math.round(x * Resource.getScale());
    y = Math.round(y * Resource.getScale());
    size = Math.round(size * Resource.getScale());
    this.font = bold ? "bold " : " " + size + "px " + font;
    this.fillText(text, x, y);
};