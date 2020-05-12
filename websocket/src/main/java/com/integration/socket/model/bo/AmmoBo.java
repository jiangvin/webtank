package com.integration.socket.model.bo;

import com.integration.socket.model.OrientationType;
import com.integration.socket.model.TeamType;
import com.integration.socket.util.CommonUtil;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.awt.Point;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/9
 */

@Data
@AllArgsConstructor
public class AmmoBo {
    private String id;
    private String tankId;
    private TeamType teamType;
    private int lifeTime;
    private double x;
    private double y;
    private double speed;
    private boolean brokenIron;
    OrientationType orientationType;
    private String startGridKey;
    private String endGridKey;

    public void run() {
        switch (orientationType) {
            case UP:
                y -= speed;
                break;
            case DOWN:
                y += speed;
                break;
            case LEFT:
                x -= speed;
                break;
            case RIGHT:
                x += speed;
                break;
            default:
                break;
        }
    }

    public String generateStartGridKey() {
        Point point = generateStartGridPoint();
        return CommonUtil.generateKey(point.x, point.y);
    }

    public String generateEndGridKey() {
        Point point = generateStartGridPoint();
        switch (orientationType) {
            case UP:
                --point.y;
                break;
            case DOWN:
                ++point.y;
                break;
            case LEFT:
                --point.x;
                break;
            case RIGHT:
                ++point.x;
                break;
            default:
                break;
        }
        return CommonUtil.generateKey(point.x, point.y);
    }

    private Point generateStartGridPoint() {
        return new Point(
                   (int)(this.x / CommonUtil.UNIT_SIZE),
                   (int)(this.y / CommonUtil.UNIT_SIZE));
    }
}
