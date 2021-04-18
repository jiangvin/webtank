import Stage from "../share/stage/stage.js";
import Resource from "../share/tool/resource.js";
import Common from "../share/tool/common.js";
import Loading from "../share/stage/loading.js";

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2021/4/17
 */

export default class Login extends Stage {
    constructor() {
        super();

        Loading.createBaseBackground(this);

        //button
        const w = Resource.instance.windowInfo.realW;
        const h = Resource.instance.windowInfo.realH;

        const buttonW = w * 0.3;
        const buttonH = buttonW * 60 / 486;

        const button = wx.createUserInfoButton({
            type: 'image',
            image: 'https://xiwen100.com/static/wx_start.png',
            style: {
                left: h * 0.32,
                top: (w - buttonW) / 2,
                width: buttonH,
                height: buttonW
            }
        });
        this.button = button;

        button.hide();
        button.onTap((userRes) => {
            button.destroy();
            wx.login({
                success: function (res) {
                    const wxUser = {
                        code: res.code,
                        platform: wx.getSystemInfoSync().platform,
                        device: wx.getSystemInfoSync().model,
                        username: userRes.userInfo.nickName
                    };
                    Common.postRequest("/user/wxLogin", wxUser , data => {
                        if (data) {
                            Resource.getUser().deviceId = data.userId;
                            Resource.setUser(data);
                            Common.nextStage();
                        }
                    });
                }
            });
        });
    }

    init() {
        this.button.show();
    }
}