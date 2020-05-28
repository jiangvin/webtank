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
        orientation: 0,         //当前定位方向,0-3 上下左右
        hasShield: false,       //是否有护盾

        //动画相关
        play: null,

        update: function () {   //更新参数信息
        },
    };
    Common.extend(this, this.settings, this.params);
    if (this.id === "") {
        this.id = Resource.getId();
    }
}