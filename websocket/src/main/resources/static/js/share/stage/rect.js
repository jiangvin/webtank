/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/13
 */
import Item from "./item.js";
import Resource from "../tool/resource.js";

export default class Rect extends Item {
    constructor(x, y, width, height, image) {
        super();

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if (image) {
            this.image = image;
        } else {
            this.image = Resource.getImage("button");
        }
        this.z = 9;
    }

    draw(ctx) {
        const imageWidth = this.image.width / 3;
        const imageHeight = this.image.height / 3;

        const rectStartX = this.x - this.width / 2;
        const rectStartY = this.y - this.height / 2;
        //将图片切成9块，防止边缘拉升

        //left-top
        ctx.drawImage(this.image,
            0, 0,
            imageWidth, imageHeight,
            rectStartX, rectStartY,
            imageWidth, imageHeight);

        //top
        ctx.drawImage(this.image,
            imageWidth, 0,
            imageWidth, imageHeight,
            rectStartX + imageWidth, rectStartY,
            this.width - imageWidth * 2, imageHeight);

        //right-top
        ctx.drawImage(this.image,
            imageWidth * 2, 0,
            imageWidth, imageHeight,
            rectStartX + this.width - imageWidth, rectStartY,
            imageWidth, imageHeight);

        //left-middle
        ctx.drawImage(this.image,
            0, imageHeight,
            imageWidth, imageHeight,
            rectStartX, rectStartY + imageHeight,
            imageWidth, this.height - imageHeight * 2);

        //middle
        ctx.drawImage(this.image,
            imageWidth, imageHeight,
            imageWidth, imageHeight,
            rectStartX + imageWidth, rectStartY + imageHeight,
            this.width - imageWidth * 2, this.height - imageHeight * 2);

        //right-middle
        ctx.drawImage(this.image,
            imageWidth * 2, imageHeight,
            imageWidth, imageHeight,
            rectStartX + this.width - imageWidth, rectStartY + imageHeight,
            imageWidth, this.height - imageHeight * 2);

        //left-bottom
        ctx.drawImage(this.image,
            0, imageHeight * 2,
            imageWidth, imageHeight,
            rectStartX, rectStartY + this.height - imageHeight,
            imageWidth, imageHeight);

        //bottom
        ctx.drawImage(this.image,
            imageWidth, imageHeight * 2,
            imageWidth, imageHeight,
            rectStartX + imageWidth, rectStartY + this.height - imageHeight,
            this.width - imageWidth * 2, imageHeight);

        //right-bottom
        ctx.drawImage(this.image,
            imageWidth * 2, imageHeight * 2,
            imageWidth, imageHeight,
            rectStartX + this.width - imageWidth, rectStartY + this.height - imageHeight,
            imageWidth, imageHeight);
    }
}