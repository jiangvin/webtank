function Item(params) {
    this.params = params || {};
    this.settings = {
        stage: null,
        id: "",
        showId: false,          //是否显示id
        image: null,            //相应图片
        teamId: 0,                //团队信息
        scale: 1.0,             //图片放大的倍数
        x: 0,					//位置坐标:横坐标
        y: 0,					//位置坐标:纵坐标
        z: 0,                   //位置坐标:大值覆盖小值，不允许小于0
        screenPoint: {},         //屏幕坐标
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
            this.screenPoint = this.stage.convertToScreenPoint({x: this.x, y: this.y});
            drawId(this, context);
            drawImage(this, context);
            drawTeam(this, context);
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
        context.fillStyle = getColor(item);

        const x = item.screenPoint.x;
        const y = item.screenPoint.y - (item.image.height / item.image.heightPics) * item.scale / 2 - 5;
        context.fillText(item.id, x, y);
    };

    const drawImage = function (item, context) {
        const displayWidth = item.image.width / item.image.widthPics * item.scale;
        const displayHeight = item.image.height / item.image.heightPics * item.scale;

        context.drawImage(item.image,
            item.orientation * item.image.width / item.image.widthPics, 0,
            item.image.width / item.image.widthPics, item.image.height / item.image.heightPics,
            item.screenPoint.x - displayWidth / 2, item.screenPoint.y - displayHeight / 2,
            displayWidth, displayHeight);
    };

    const drawTeam = function (item, context) {
        if (!item.stage.showTeam || item.teamId <= 0 || item.teamId > 2) {
            return;
        }

        context.strokeStyle = getColor(item);
        const size = Resource.getUnitSize();
        context.strokeRect(item.screenPoint.x - size / 2, item.screenPoint.y - size / 2, size, size);
    };

    const getColor = function (item) {
        if (!item.stage.showTeam) {
            return "#FFF";
        }

        switch (item.teamId) {
            case 1:
                return '#F00';
            case 2:
                return '#00F';
            default:
                return "#FFF";
        }
    };
}