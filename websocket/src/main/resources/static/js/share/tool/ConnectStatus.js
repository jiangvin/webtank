import Connect from "./connect.js";
import Common from "./common.js";
import Resource from "./resource.js";
import Status from "./status.js";
import ControlUnit from "../item/controlunit.js";

/**
 * @author 蒋文龙(Vin)
 * @description 网络连接状态检测, 在netEngine中使用，每两秒检测一次
 *              如果延迟低于两秒，则在两秒后重复操作
 *              如果延迟高于两秒，警告2次后设成暂停状态
 *
 * @date 2021/1/3
 */

export default class ConnectStatus {
    constructor(engine) {
        this.engine = engine;

        //发起请求的开始时间
        this.requestTime = null;
        //警告次数
        this.warningTimes = 0;

        this.statusCache = null;

        this.addConnectCheckEvent();
    }

    addConnectCheckEvent() {
        const MAX_CONNECT_TIME = 2000;

        const callback = () => {
            //已经断开连接
            if (Connect.status() === false) {
                //再关闭一次，排除一些情况
                Connect.disconnect();
                Status.setStatus(Status.statusPause());
                this.createDisconnectItem();
                return;
            }

            //每两秒运行一次
            this.engine.addTimeEvent(120, callback, true);

            if (this.requestTime === null) {
                this.requestTime = new Date().getTime();
                Common.getRequest("/multiplePlayers/ping", () => {
                    const responseTime = new Date().getTime();
                    const delay = responseTime - this.requestTime;
                    Resource.getRoot().netDelay = delay;
                    //清空requestTime,方便下次连接
                    this.requestTime = null;
                    //解除报警
                    if (delay < MAX_CONNECT_TIME) {
                        this.clearWarningTimes();
                    }
                });
                return;
            }

            const responseTime = new Date().getTime();
            const delay = responseTime - this.requestTime;
            if (delay >= MAX_CONNECT_TIME) {
                this.addWarningTimes();
            }
        };

        console.log("connect status will be checked per 120 frames...");
        this.engine.addTimeEvent(120, callback, true);
    }

    addWarningTimes() {
        const MAX_WARNING_TIMES = 1;
        ++this.warningTimes;
        if (Status.getValue() === Status.statusPauseForNet()) {
            return;
        }
        if (this.warningTimes > MAX_WARNING_TIMES) {
            this.statusCache = Status.getValue();
            Status.setStatus(Status.statusPauseForNet());
        }
    }

    clearWarningTimes() {
        this.warningTimes = 0;
        if (Status.getValue() !== Status.statusPauseForNet()) {
            return;
        }
        Status.setStatus(this.statusCache);
    }

    createDisconnectItem() {
        //显示蒙版和文字
        this.engine.room.createItem({
            draw: function (ctx) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, Resource.width(), Resource.height());
                ctx.globalAlpha = 1;

                ctx.font = (100 * Resource.getScale()) + 'px gameFont';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFF';
                ctx.fillText("与服务器连接断开", Resource.width() / 2, Resource.height() * .4);
            }
        });

        //显示返回按钮
        this.engine.room.createItem({
            draw: function (ctx) {
                ctx.displayCenter("button_home",
                    960, 620,
                    350, 120, 0, true);
            },
            controlUnit: new ControlUnit({
                center: {
                    x: 960,
                    y: 620
                },
                size: {
                    w: 350,
                    h: 120
                },
                callback: () => {
                    Resource.getRoot().gotoStage("menu");
                },
                needOffset: true
            })
        });
    }
}