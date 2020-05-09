//主程序,业务逻辑
(function () {
    const game = Resource.getGame();
    //启动页
    (function () {
        const stageMenu = Menu.getOrCreateMenu(game);

        //事件绑定 - 按按钮才触发
        Common.buttonBind(function (e) {
            const name = Common.inputText();
            const isTouch = e.currentTarget.id === "button2";

            //检测是否输入名字
            if (name === "") {
                Common.addMessage("名字不能为空!", "#ff0000");
                return;
            }

            //检测名字是否重复
            Common.getRequest('/user/checkName?name=' + name, function () {
                //先设定为暂停
                Status.setStatus(Status.getStatusPause(), "等待连接中...");

                //开始连接
                Common.stompConnect(name, function () {
                    updateAfterConnect(name, isTouch);
                });
            });
        });

        const updateAfterConnect = function (name, isTouch) {
            //更新logo id
            const tankLogo = Menu.getTankLogo();
            stageMenu.updateItemId(tankLogo, name, false);

            //注册事件
            game.addTimeEvent("CLIENT_READY", function () {
                Common.sendStompMessage(
                    {
                        "x": tankLogo.x,
                        "y": tankLogo.y,
                        "orientation": tankLogo.orientation,
                        "action": tankLogo.action
                    }, "CLIENT_READY");
                Common.addConnectTimeoutEvent();
            }, 50);
            game.addMessageEvent("SERVER_READY", function () {
                if (Status.getStatusValue() !== Status.getStatusPause()) {
                    return;
                }

                Common.setTouch(isTouch);
                game.addConnectCheckEvent();

                //隐藏输入框和按钮
                Common.inputEnable(false);
                Common.buttonEnable(false);

                //删除提示文字
                Menu.deleteInfo();

                //重设输入框的属性和事件
                Common.inputResize();
                Common.inputBindMessageControl();

                //新增文字描述来取代按钮和输入框
                stageMenu.createItem({
                    draw: function (context) {
                        context.font = '30px Arial';
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillStyle = '#5E6C77';
                        context.fillText('你的名字: ' + name, Common.width() / 2, 85);
                    }
                });
                tankLogo.showId = true;

                //增加tank logo 动画
                tankLogo.timeout = 30;
                tankLogo.animationStatus = -0.05;
                tankLogo.animation = function () {
                    this.scale += this.animationStatus;
                    if (this.timeout === 20 || this.timeout === 10) {
                        this.animationStatus = 0.05;
                    }
                    if (this.timeout === 5 || this.timeout === 15) {
                        this.animationStatus = -0.05;
                    }
                };

                //显示房间列表
                Menu.showRoomList();
            });
        }
    })();
    game.init();
})();
