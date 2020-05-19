//菜单场景，用于封装菜单场景的所有操作
{
    function Menu() {
        this.stage = null;
        this.tankLogo = null;

        this.roomStart = null;
        this.roomLimit = null;
        this.roomCount = null;

        this.pageInfo = null;          //当前页数和总页数
        this.showSelectWindow = null;

        this.roomMap = null;           //房间列表
        this.selectRoomId = null;      //加入时选中的房间号
    }

    Menu.getOrCreateMenu = function (game) {
        if (this.stage) {
            return this.stage;
        }

        //开始初始化
        this.stage = game.createStage();

        //扩展消息函数
        const thisMenu = this;
        this.stage.receiveStompMessageExtension = function (messageDto) {
            if (messageDto.note === "CREAT_ROOM") {
                queryRoomList(thisMenu);
            }
        };

        this.tankLogo = this.stage.createTank({
            image: Common.getRandomTankImage(),
            x: Common.width() / 2,
            y: Common.height() * .45,
            orientation: 3,
            scale: 1.5
        });

        //游戏名
        this.stage.createItem({
            draw: function (context) {
                context.font = 'bold 55px Helvetica';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = '#FFF';
                context.fillText('坦克大战', Common.width() / 2, 40);
            }
        });

        //提示信息
        this.stage.createItem({
            id: "info1",
            draw: function (context) {
                context.font = '24px Helvetica';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = '#949494';
                context.fillText('键盘: 上下左右/空格/回车控制游戏', Common.width() / 2, Common.height() * .6);
            }
        });
        this.stage.createItem({
            id: "info2",
            draw: function (context) {
                context.font = '24px Helvetica';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = '#949494';
                context.fillText('触控: 触控屏幕控制游戏', Common.width() / 2, Common.height() * .6 + 30);
            }
        });

        return this.stage;
    };

    Menu.getTankLogo = function () {
        return this.tankLogo;
    };

    /**
     * 连接成功后删除操作提示信息
     */
    Menu.deleteInfo = function () {
        this.stage.items.delete("info1");
        this.stage.items.delete("info2");

        this.stage.createItem({
            id: "info3",
            draw: function (context) {
                context.font = '30px Helvetica';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = '#949494';
                context.fillText('请创建或者加入房间', Common.width() / 2, Common.height() * .8);
            }
        });
    };

    /**
     * 设定是否显示选择窗
     */
    Menu.showSelect = function (show) {
        if (show !== undefined) {
            this.showSelectWindow = show;
        }
        Menu.getSelect().style.visibility = this.showSelectWindow ? 'visible' : 'hidden';
    };

    Menu.getSelect = function () {
        return document.getElementById('room-list');
    };

    Menu.showRoomList = function () {
        const thisMenu = this;

        this.roomStart = 0;
        this.roomLimit = 5;
        const selectWindow = Menu.getSelect();
        generateWindowWidth(selectWindow);

        //添加末端的按钮
        const div = document.createElement('div');
        div.className = "select-item";
        div.id = "button-label";
        selectWindow.appendChild(div);

        const btnJoin = document.createElement('button');
        btnJoin.textContent = "加入房间";
        btnJoin.className = "action";
        btnJoin.onclick = function () {
            joinRoom(thisMenu);
        };
        div.appendChild(btnJoin);

        const btnCreate = document.createElement('button');
        btnCreate.textContent = "创建房间";
        btnCreate.className = "action";
        btnCreate.onclick = function () {
            Common.getRequest("/user/getMaps", function (data) {
                createRoom(data);
            });
        };
        div.appendChild(btnCreate);

        const btnNext = document.createElement('button');
        btnNext.textContent = "下一页";
        btnNext.className = "right";
        btnNext.onclick = function () {
            const pageInfo = generatePageInfo(thisMenu);
            if (pageInfo.currentPage >= pageInfo.totalPage) {
                Common.addMessage("这已经是最后一页", "#FF0");
            } else {
                thisMenu.roomStart += thisMenu.roomLimit;
            }
            queryRoomList(thisMenu);
        };
        div.appendChild(btnNext);

        const btnFront = document.createElement('button');
        btnFront.textContent = "上一页";
        btnFront.className = "right";
        btnFront.onclick = function () {
            if (generatePageInfo(thisMenu).currentPage <= 1) {
                Common.addMessage("这已经是第一页", "#FF0");
            } else {
                thisMenu.roomStart -= thisMenu.roomLimit;
            }
            queryRoomList(thisMenu);
        };
        div.appendChild(btnFront);

        this.pageInfo = document.createElement('label');
        this.pageInfo.textContent = "1/1";
        this.pageInfo.className = "right";
        div.appendChild(this.pageInfo);

        Menu.showSelect(true);
        queryRoomList(this);
    };

    const queryRoomList = function (menu) {

        /**
         * @param room {{roomId,mapId,roomType,creator,userCount}}
         * @param data {{roomList,roomCount}}
         */
        Common.getRequest('/user/getRooms?start=' + menu.roomStart + "&limit=" + menu.roomLimit, function (data) {
            updatePageInfo(menu, data.roomCount);

            //删除之前的元素
            const buttonChild = document.getElementById("button-label");
            const selectWindow = Menu.getSelect();
            for (let i = 0; i < selectWindow.childNodes.length; ++i) {
                const child = selectWindow.childNodes[i];
                if (child.nodeType === 1 && child.id !== "button-label") {
                    selectWindow.removeChild(child);
                    --i;
                }
            }

            if (!menu.roomMap) {
                menu.roomMap = new Map();
            } else {
                menu.roomMap.clear();
            }
            let selectFlag = false;
            data.roomList.forEach(function (room) {
                menu.roomMap.set(room.roomId, room);

                let div = document.createElement('div');
                div.className = "select-item";
                div.setAttribute("roomType", room.roomType);
                selectWindow.insertBefore(div, buttonChild);

                const input = document.createElement('input');
                input.type = 'radio';
                input.id = room.roomId;
                input.name = "drone";
                div.appendChild(input);
                input.onchange = function (e) {
                    selectRoomChange(e, menu);
                };

                const label = document.createElement('label');
                label.setAttribute("for", input.id);
                label.className = "radio-label";
                label.textContent = "房间名:" + room.roomId
                    + " 地图名:" + room.mapId
                    + " [" + room.roomType
                    + "] 创建者:" + room.creator
                    + " 人数:" + room.userCount;
                div.appendChild(label);

                //第一个元素被选中
                if (selectFlag === false) {
                    menu.selectRoomId = room.roomId;
                    input.checked = true;
                    selectFlag = true;
                    const select = Resource.getSelect([]);
                    select.id = "selectGroup";
                    select.style.float = "right";
                    div.appendChild(select);
                    setSelectGroup(room.roomType);
                }
            });
        });
    };

    const selectRoomChange = function (e, menu) {
        menu.selectRoomId = e.currentTarget.id;
        const div = e.currentTarget.parentElement;
        div.append(document.getElementById("selectGroup"));
        setSelectGroup(div.getAttribute("roomType"));
    };

    const updatePageInfo = function (menu, roomCount) {
        if (roomCount) {
            menu.roomCount = roomCount;
        }

        const pageInfo = generatePageInfo(menu);
        menu.pageInfo.textContent = pageInfo.currentPage + "/" + pageInfo.totalPage;
    };

    const generatePageInfo = function (menu) {
        let pageInfo = {};
        pageInfo.currentPage = menu.roomStart / menu.roomLimit + 1;
        if (!menu.roomCount) {
            pageInfo.totalPage = pageInfo.currentPage;
        } else {
            pageInfo.totalPage = Math.ceil(menu.roomCount / menu.roomLimit);
        }
        return pageInfo;
    };

    const generateWindowWidth = function (selectWindow) {
        let width = 65000 / Common.width();
        if (width < 50) {
            width = 50;
        }
        if (width > 90) {
            width = 90;
        }
        let left = 50 - width / 2;
        selectWindow.style.left = left + "%";
        selectWindow.style.width = width + "%";
    };

    const createRoom = function (data) {
        //删除原本的所有DIV元素
        const selectWindow = Menu.getSelect();
        for (let i = 0; i < selectWindow.childNodes.length; ++i) {
            const child = selectWindow.childNodes[i];
            if (child.nodeType === 1) {
                selectWindow.removeChild(child);
                --i;
            }
        }

        //增加房间名输出框
        const div = document.createElement('div');
        div.className = "select-item";
        const label = document.createElement('label');
        label.className = "radio-label";
        label.textContent = "房间:";
        div.appendChild(label);
        let input = document.createElement('input');
        input.type = "text";
        input.id = "input-room-name";
        input.placeholder = "请输入房间名";
        input.className = "input-room-name";
        div.appendChild(input);
        selectWindow.appendChild(div);

        selectWindow.appendChild(createRoomSelect("地图:", "selectMap", data));
        const selectType = createRoomSelect(
            "类型:",
            "selectType",
            ["PVE", "PVP", "EVE"],
            ["闯关", "对战", "电脑对战"]);

        //AI设定
        const selectAi = document.createElement('select');
        selectAi.id = "selectAi";
        const aiSimple = document.createElement('option');
        aiSimple.text = "简单电脑";
        aiSimple.value = "SIMPLE";
        selectAi.add(aiSimple);
        const aiCustom = document.createElement('option');
        aiCustom.text = "外部接入";
        aiCustom.value = "-1";
        selectAi.add(aiCustom);

        //样式
        selectAi.style.position = "relative";
        selectAi.style.top = ".1em";
        selectAi.style.marginLeft = "1em";
        selectType.appendChild(selectAi);

        selectWindow.appendChild(selectType);

        document.getElementById("selectType").onchange = function () {
            const value = $('#selectType').val();
            setSelectGroup(value);
            setSelectAi(value);
        };
        selectWindow.appendChild(createRoomSelect("队伍:", "selectGroup", []));
        setSelectGroup($('#selectType').val());

        const divButton = document.createElement('div');
        divButton.className = "select-item";
        selectWindow.appendChild(divButton);

        const buttonCommit = document.createElement("button");
        buttonCommit.textContent = "确定";
        buttonCommit.className = "action";
        buttonCommit.onclick = function () {
            createRoomToServer();
        };
        divButton.appendChild(buttonCommit);
        const buttonCancel = document.createElement("button");
        buttonCancel.textContent = "返回";
        buttonCancel.className = "action";
        buttonCancel.onclick = function () {
            Menu.showRoomList();
        };
        divButton.appendChild(buttonCancel);
    };

    const setSelectAi = function (selectType) {
        if (selectType === "PVE" || selectType === "EVE") {
            document.getElementById('selectAi').style.visibility = 'visible';
        } else {
            document.getElementById('selectAi').style.visibility = 'hidden';

        }
    };

    const setSelectGroup = function (selectType) {
        const selectGroup = $('#selectGroup');
        selectGroup.find('option').remove().end();
        switch (selectType) {
            case "PVP":
                selectGroup.append('<option value="RED">红队</option>');
                selectGroup.append('<option value="BLUE">蓝队</option>');
                selectGroup.append('<option value="VIEW">观看</option>');
                break;
            case "PVE":
                selectGroup.append('<option value="RED">玩家</option>');
                selectGroup.append('<option value="VIEW">观看</option>');
                break;
            case "EVE":
                selectGroup.append('<option value="VIEW">观看</option>');
                break;
        }
    };

    const createRoomSelect = function (typeText, selectId, optionValues, optionTexts) {
        const div = document.createElement('div');
        div.className = "select-item";
        const label = document.createElement('label');
        label.className = "radio-label";
        label.textContent = typeText;
        div.appendChild(label);
        const select = Resource.getSelect(optionValues, optionTexts);
        select.id = selectId;
        select.style.width = "12em";
        div.appendChild(select);
        return div;
    };

    const createRoomToServer = function () {
        const roomId = $('#input-room-name').val();
        if (roomId === "") {
            Common.addMessage("房间号不能为空!", "#F00");
            return;
        }

        Common.getRequest("/user/checkRoomName?name=" + roomId, function () {
            const mapId = $('#selectMap').val();
            const roomType = $('#selectType').val();
            const group = $('#selectGroup').val();

            Room.getOrCreateRoom({
                "roomId": roomId,
                "roomType": roomType,
                "mapId": mapId
            });
            Common.runNextStage();

            //AI传输设定
            const selectAi = $('#selectAi');
            selectAi.css("visibility", "hidden");
            const ai = selectAi.val();
            if (roomType !== "PVP" && ai !== "-1") {
                Common.getRequest("/user/getBotAddress", function (url) {
                    Resource.getGame().addTimeEvent("connect_ai",
                        function () {
                            Common.postRequest(url,
                                {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                {
                                    "roomId": roomId,
                                    "teamType": "BLUE",
                                    "botType": ai
                                })
                        }, 5 * 60)
                });
            }

            Status.setStatus(Status.getStatusPause(), "房间创建中...");
            Common.sendStompMessage({
                "roomId": roomId,
                "mapId": mapId,
                "roomType": roomType,
                "joinTeamType": group
            }, "CREATE_ROOM");
            Common.addConnectTimeoutEvent(function () {
                Common.runLastStage();
            });
        });
    };

    const joinRoom = function (menu) {
        const selectGroup = $('#selectGroup').val();
        const roomId = menu.selectRoomId;
        if (!roomId) {
            Common.addMessage("当前没有房间！", "#f00");
            return;
        }

        const data = menu.roomMap.get(roomId);
        Room.getOrCreateRoom({
            "roomId": roomId,
            "mapId": data.mapId,
            "roomType": data.roomType
        });
        Common.runNextStage();
        Status.setStatus(Status.getStatusPause(), "加入房间中...");
        Common.sendStompMessage({
            "roomId": roomId,
            "joinTeamType": selectGroup
        }, "JOIN_ROOM");
        Common.addConnectTimeoutEvent(function () {
            Common.runLastStage();
        });
    }
}