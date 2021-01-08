import Connect from "./connect.js";
import Common from "./common.js";
import Resource from "./resource.js";
import Status from "./status.js";
import ControlUnit from "../item/controlunit.js";

/**
 * @author 蒋文龙(Vin)
 * @description 网络连接状态检测, 在netEngine中使用，每两秒检测一次
 *              如果延迟高于3秒，则设成暂停状态
 *              如果延迟高于15秒，则自动关闭连接
 *
 * @date 2021/1/3
 */

export default class ConnectStatus {
    constructor(engine) {
        this.engine = engine;

        //发起请求的开始时间
        this.requestTime = null;

        //检测延迟，减少连接频率
        this.checkTimeout = 0;

        //警告次数
        this.warningTimes = 0;

        //暂停时候的状态缓存
        this.statusCache = null;

        this.addConnectCheckEvent();
    }

    addConnectCheckEvent() {
        //运行间隔时间
        const intervalFrames = 60;

        const MAX_CONNECT_TIME_FOR_BACK_TO_NORMAL = 1000;
        const MAX_CONNECT_TIME_FOR_PAUSE = 3000;

        const callback = () => {
            //已经断开连接
            if (Connect.status() === false) {
                this.disconnect();
                return;
            }

            this.engine.addTimeEvent(intervalFrames, callback, true);

            //正在连接中,还未获得响应
            if (this.requestTime !== null) {
                const responseTime = new Date().getTime();
                const delay = responseTime - this.requestTime;
                if (delay > MAX_CONNECT_TIME_FOR_PAUSE) {
                    this.pause();
                }
                return;
            }

            //还未连接,判断是否需要延迟
            if (this.checkTimeout > 0) {
                --this.checkTimeout;
                return;
            }

            //开始连接
            //注册回收事件
            this.requestTime = new Date().getTime();
            Common.addMessageEvent("PING", () => {
                const responseTime = new Date().getTime();
                const delay = responseTime - this.requestTime;
                Resource.getRoot().netDelay = delay;

                //清空requestTime,方便下次连接
                this.requestTime = null;

                //解除报警
                if (delay < MAX_CONNECT_TIME_FOR_BACK_TO_NORMAL) {
                    this.backToNormal();
                }
            });
            Connect.send("PING");
        };
        this.engine.addTimeEvent(intervalFrames, callback, true);
    }

    disconnect() {
        //再关闭一次，排除一些情况
        Connect.disconnect();
        Status.setStatus(Status.statusPause());
        this.createDisconnectItem();
    }

    pause() {
        if (this.warningTimes <= 0) {
            this.warningTimes = 1;
        } else {
            ++this.warningTimes;
        }

        if (!Status.isGaming()) {
            return;
        }
        this.statusCache = Status.getValue();
        Status.setStatus(Status.statusPauseForNet());
    }

    backToNormal() {
        --this.warningTimes;
        if (this.warningTimes > 0) {
            return;
        }

        //正常状态下设定下次连接延迟，减少检测频率
        this.checkTimeout = 1;

        if (Status.getValue() !== Status.statusPauseForNet()) {
            return;
        }
        Status.setStatus(this.statusCache);
    }

    createDisconnectItem() {
        //显示蒙版和文字
        this.engine.room.createItem({
            draw: function (ctx) {
                ctx.displayAlphaMask();
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