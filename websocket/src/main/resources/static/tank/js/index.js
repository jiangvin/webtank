//主程序,业务逻辑
(function () {
    const game = Resource.getGame();
    //启动页
    (function () {
        const stageMenu = Menu.getOrCreateMenu(game);

        //事件绑定 - 按按钮才触发
        Common.buttonBind(function (e) {
            const name = Common.inputText();

            //检测是否输入名字
            if (name === "") {
                Common.addMessage("名字不能为空!", "#ff0000");
                return;
            }

            //检测名字是否重复
            Common.getRequest('/user/checkName?name=' + name, function () {
                //设定是否为触控模式
                Common.setTouch(e.currentTarget.id === "button2");

                //开始连接
                Status.setStatus(Status.getStatusPause(), "等待连接中...");
                Common.stompConnect(name, function () {
                    updateAfterConnect(name);
                });
            });
        });

        //其他函数定义
        const updateAfterConnect = function (name) {
            const tankLogo = Menu.getTankLogo();
            stageMenu.updateItemId(tankLogo, name);
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

            //注册事件
            game.addTimeEvent("CLIENT_READY", function () {
                Common.sendStompMessage(
                    {
                        "x": tankLogo.x,
                        "y": tankLogo.y,
                        "speed": tankLogo.speed,
                        "orientation": tankLogo.orientation,
                        "action": tankLogo.action
                    }, "CLIENT_READY");
                Common.addConnectTimeoutEvent();
            }, 50);

            game.addMessageEvent("SERVER_READY", function () {
                if (Status.getStatusValue() !== Status.getStatusPause()) {
                    return;
                }

                Menu.showRoomList();
            });
        }
    })();
    game.init();
})();
