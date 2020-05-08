//菜单场景，用于封装菜单场景的所有操作
{
    function Menu() {
        this.stage = null;
        this.tankLogo = null;

        this.roomStart = null;
        this.roomLimit = null;
        this.roomCount = null;
        this.pageInfo = null;
        this.showSelectWindow = null;
    }

    Menu.getOrCreateMenu = function (game) {
        if (this.stage) {
            return this.stage;
        }

        //开始初始化
        this.stage = game.createStage();

        const getRandomTankImage = function () {
            const id = new Date().getTime() % 9 + 1;
            return Resource.getImage("tank0" + id);
        };

        this.tankLogo = this.stage.createTank({
            image: getRandomTankImage(),
            x: Common.width() / 2,
            y: Common.height() * .45,
            speed: 1,
            orientation: 3,
            scale: 1.5,
            timeout: 30,
            animationStatus: -0.05,
            animation: function () {
                //logo animation
                this.scale += this.animationStatus;
                if (this.timeout === 20 || this.timeout === 10) {
                    this.animationStatus = 0.05;
                }
                if (this.timeout === 5 || this.timeout === 15) {
                    this.animationStatus = -0.05;
                }
            }
        });

        //游戏名
        this.stage.createItem({
            draw: function (context) {
                context.font = 'bold 55px Helvetica';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = '#FFF';
                context.fillText('Tank World', Common.width() / 2, 40);
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
        delete this.stage.items["info1"];
        delete this.stage.items["info2"];
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
        const thisMenu = this;
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

            let selectFlag = false;
            data.roomList.forEach(function (room) {
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
                    selectRoomChange(e);
                };

                const label = document.createElement('label');
                label.setAttribute("for", input.id);
                label.className = "radio-label";
                label.textContent = "房间名:" + room.roomId
                    + " 地图名:" + room.mapId
                    + "[" + room.roomType
                    + "] 创建者:" + room.creator
                    + " 人数:" + room.userCount;
                div.appendChild(label);

                //第一个元素被选中
                if (selectFlag === false) {
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

    const selectRoomChange = function (e) {
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

        selectWindow.appendChild(createRoomSelect("地图:", data, "selectMap"));
        selectWindow.appendChild(createRoomSelect("类型:", ["PVP", "PVE", "EVE"], "selectType"));
        document.getElementById("selectType").onchange = function () {
            setSelectGroup($('#selectType').val());
        };
        selectWindow.appendChild(createRoomSelect("队伍:", [], "selectGroup"));
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

    const createRoomSelect = function (typeText, options, selectId) {
        const div = document.createElement('div');
        div.className = "select-item";
        const label = document.createElement('label');
        label.className = "radio-label";
        label.textContent = typeText;
        div.appendChild(label);
        const select = Resource.getSelect(options);
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

            Room.getOrCreateRoom();
            Common.runNextStage();
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

    const joinRoomToServer = function () {
    }
}