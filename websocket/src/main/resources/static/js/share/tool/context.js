import Resource from "./resource.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/12/28
 */

export default class Context {
    constructor() {

    }

    static contextExtension(ctx) {
        ctx.fontSize = 30;

        ctx.displayFillRoundRect = function (x, y, w, h, radius) {
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

        ctx.displayAlphaMask = function () {
            this.globalAlpha = 0.6;
            this.fillStyle = '#000';
            this.fillRect(0, 0, Resource.width(), Resource.height());
            this.globalAlpha = 1;
        };

        ctx.displayCenter = function (imageId, x, y, w, h, indexX, offset) {
            this.displayBase(imageId, x, y, w, h, "center", indexX, offset);
        };

        ctx.displayTopLeft = function (imageId, x, y, w, h) {
            this.displayBase(imageId, x, y, w, h, "topLeft");
        };

        ctx.displayCenterRate = function (imageId, rateX, rateY, rateW, rateH) {
            this.displayRate(imageId, rateX, rateY, rateW, rateH, "center");
        };

        ctx.displayRate = function (imageId, rateX, rateY, rateW, rateH, align) {
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

        ctx.displayBase = function (imageId, x, y, w, h, align, indexX, offset) {
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
                h = w * (img.height / img.heightPics) / (img.width / img.widthPics);
            }

            if (offset === undefined) {
                offset = Resource.getNeedOffset();
            }

            const p = this.posForFormatToScreen(x, y, offset);
            x = p.x;
            y = p.y;

            w = w * Resource.getScale();
            h = h * Resource.getScale();

            switch (align) {
                case "center":
                    x = x - w / 2;
                    y = y - h / 2;
                    break;
            }

            if (indexX === undefined) {
                indexX = 0;
            }

            this.drawImage(img,
                indexX * img.width / img.widthPics, 0,
                img.width / img.widthPics, img.height,
                x, y,
                w, h);
        };

        ctx.displayStrokeText = function (text, x, y, size, bold, offset, font) {
            const status = this.generateTextStatus(x, y, size, bold, offset, font);
            this.strokeText(text, status.x, status.y);
            this.fillText(text, status.x, status.y);
        };

        ctx.displayGameText = function (text, x, y, size, bold, offset) {
            this.displayText(text, x, y, size, bold, offset, "ZhenyanGB");
        };

        ctx.displayText = function (text, x, y, size, bold, offset, font) {
            const status = this.generateTextStatus(x, y, size, bold, offset, font);
            this.fillText(text, status.x, status.y);
        };

        ctx.generateTextStatus = function (x, y, size, bold, offset, font) {
            if (!size) {
                size = this.fontSize;
            }
            if (!font) {
                font = "Arial";
            }

            size = Math.round(size * Resource.getScale());
            this.font = ((bold === true) ? "bold " : " ") + size + "px " + font;

            if (offset === undefined) {
                offset = Resource.getNeedOffset();
            }
            return this.posForFormatToScreen(x, y, offset);
        };

        ctx.posForFormatToScreen = function (x, y, offset) {
            const p = {
                x: x,
                y: y
            };

            //offset下不支持负数显示

            if (offset) {
                p.x = x + Resource.getOffset().x;
                p.y = y + Resource.getOffset().y;
            } else {
                if (p.x < 0) {
                    p.x = Resource.formatWidth(offset) + x;
                }
                if (p.y < 0) {
                    p.y = Resource.formatHeight(offset) + y;
                }
            }

            p.x *= Resource.getScale();
            p.y *= Resource.getScale();

            return p;
        };
    }
}