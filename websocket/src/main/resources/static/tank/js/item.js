function Item(params) {
    this.params = params || {};
    this.settings = {
        id: "",
        showId: false,          //是否显示id
        image: null,            //相应图片
        scale: 1.0,             //图片放大的倍数
        x: 0,					//位置坐标:横坐标
        y: 0,					//位置坐标:纵坐标
        z: 0,                   //位置坐标:大值覆盖小值，不允许小于0

        speed: 0,
        action: 0,              //动作,0是停,1是走
        orientation: 0,			//当前定位方向,0-3 上下左右

        //动画相关
        play: null,

        update: function () {   //更新参数信息
            if (this.play) {
                this.play.update();
            }
        },
        draw: function (context) {
            drawId(this, context);
            drawImage(this, context);
        },
    };
    Common.extend(this, this.settings, this.params);
    if (this.id === "") {
        this.id = Resource.getId();
    }

    const drawId = function (item, context) {
        if (!item.showId) {
            return;
        }

        context.font = '14px Helvetica';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.fillStyle = '#FFF';

        const x = item.x;
        const y = item.y - (item.image.height / item.image.heightPics) * item.scale / 2 - 5;
        context.fillText(item.id, x, y);
    };

    const drawImage = function (item, context) {
        const displayWidth = item.image.width / item.image.widthPics * item.scale;
        const displayHeight = item.image.height / item.image.heightPics * item.scale;

        context.drawImage(item.image,
            item.orientation * item.image.width / item.image.widthPics, 0,
            item.image.width / item.image.widthPics, item.image.height / item.image.heightPics,
            item.x - displayWidth / 2, item.y - displayHeight / 2,
            displayWidth, displayHeight);
    };
}