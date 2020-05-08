function Item(params) {
    this.params = params || {};
    this.settings = {
        id: Resource.getId(),
        showId: false,          //是否显示id
        image: null,            //相应图片
        scale: 1.0,             //图片放大的倍数
        x: 0,					//位置坐标:横坐标
        y: 0,					//位置坐标:纵坐标

        typeId: "",			    //类型id
        action: 0,              //动作,0是停,1是走
        orientation: 0,			//当前定位方向,0-3 上下左右

        //以下为动画相关
        frames: 1,				//速度等级,内部计算器times多少帧变化一次
        animationStatus: 0,	    //刷新画布计数(用于循环动画状态判断)
        timeout: 0,				//倒计时(用于过程动画状态判断)
        animation: null,
        update: function () {   //更新参数信息
            this.updateAnimation();
        },
        draw: function (context) {
            drawId(this, context);
            drawImage(this, context);
        },
        updateAnimation: function () {
            if (!this.timeout || !this.animation) {
                return;
            }

            if (this.timeout-- % this.frames) {
                return;
            }

            this.animation();
        }
    };
    Common.extend(this, this.settings, this.params);

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