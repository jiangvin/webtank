package com.integration.socket.service;

import com.integration.socket.model.MapUnitType;
import com.integration.socket.model.RoomType;
import com.integration.socket.model.bo.MapBo;
import com.integration.socket.model.dto.RoomDto;
import com.integration.socket.util.CommonUtil;
import com.integration.util.model.CustomException;
import lombok.Cleanup;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/10
 */

@Service
@Slf4j
public class MapService {

    private static class KeyValue {
        private String key;
        private String value;
    }

    private static final String DEFAULT = "default";

    private static final String MAP_SIZE = "map_size";

    private static final String PLAYERS = "players";

    private static final String COMPUTERS = "computers";

    private static final String COMPUTER_START = "computer_start";

    private static final String MAP_CONTENT = "map_content";

    private static final String URL_PREFIX = "http://localhost/tank/map/";

    private static final String PLAYER_DEFAULT_TYPE = "tank01";

    MapBo loadMap(RoomDto roomDto) {
        String mapId = roomDto.getMapId();
        if (!DEFAULT.equals(mapId)) {
            throw new CustomException("找不到地图资源!");
        }

        //根据类型调整数据
        MapBo mapBo = readFile(mapId);
        if (roomDto.getRoomType() == RoomType.PVP) {
            mapBo.duplicatePlayer();
        } else if (roomDto.getRoomType() == RoomType.EVE) {
            mapBo.duplicateComputer();
        }
        return mapBo;
    }

    private MapBo readFile(String mapId) {
        MapBo mapBo = new MapBo();
        int lineIndex = 0;
        try {
            URL url = new URL(URL_PREFIX + mapId + ".txt");
            @Cleanup BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()));
            String line;
            int readMapLineNumber = -1;
            while ((line = reader.readLine()) != null) {
                ++lineIndex;
                if (line.startsWith("#") || StringUtils.isEmpty(line)) {
                    continue;
                }
                if (readMapLineNumber <= -1) {
                    KeyValue kv = getKeyValue(line);
                    switch (kv.key) {
                        case MAP_SIZE:
                            String[] infos = kv.value.split("x");
                            mapBo.setMaxGridX(Integer.parseInt(infos[0]));
                            mapBo.setMaxGridY(Integer.parseInt(infos[1]));
                            mapBo.setWidth(mapBo.getMaxGridX() * CommonUtil.UNIT_SIZE);
                            mapBo.setHeight(mapBo.getMaxGridY() * CommonUtil.UNIT_SIZE);
                            break;
                        case PLAYERS:
                            mapBo.getPlayerLife().put(PLAYER_DEFAULT_TYPE, Integer.parseInt(kv.value));
                            break;
                        case COMPUTERS:
                            parseComputers(mapBo, kv.value);
                            break;
                        case COMPUTER_START:
                            mapBo.setComputerStartCount(Integer.parseInt(kv.value));
                            break;
                        case MAP_CONTENT:
                            readMapLineNumber = 0;
                            break;
                        default:
                            break;
                    }
                } else {
                    if (mapBo.getMaxGridX() <= 0 || mapBo.getMaxGridY() <= 0) {
                        throw new CustomException("地图宽高异常!");
                    }
                    char[] chars = line.toCharArray();
                    for (int i = 0; i < mapBo.getMaxGridX(); ++i) {
                        readMapContent(chars[i], i, readMapLineNumber, mapBo);
                    }
                    ++readMapLineNumber;
                    if (readMapLineNumber >= mapBo.getMaxGridY()) {
                        readMapLineNumber = -1;
                    }
                }
            }
        } catch (Exception e) {
            log.error("catch read file error:", e);
            throw new CustomException(String.format("地图读取错误! 行数:%d, 错误 :%s", lineIndex, e.getMessage()));
        }
        mapBo.checkSelf();
        return mapBo;
    }

    private KeyValue getKeyValue(String line) {
        int index = line.indexOf("=");
        if (index <= 0) {
            throw new CustomException("地图格式错误!");
        }
        KeyValue kv = new KeyValue();
        kv.key = line.substring(0, index).toLowerCase();
        kv.value = line.substring(index + 1).toLowerCase();
        return kv;
    }

    private void readMapContent(char info, int x, int y, MapBo mapBo) {
        switch (info) {
            case '1':
                mapBo.getUnitMap().put(CommonUtil.generateKey(x, y), MapUnitType.BRICK);
                break;
            case '2':
                mapBo.getUnitMap().put(CommonUtil.generateKey(x, y), MapUnitType.IRON);
                break;
            case '3':
                mapBo.getUnitMap().put(CommonUtil.generateKey(x, y), MapUnitType.RIVER);
                break;
            case '4':
                mapBo.getUnitMap().put(CommonUtil.generateKey(x, y), MapUnitType.GRASS);
                break;
            case 'K':
                mapBo.getUnitMap().put(CommonUtil.generateKey(x, y), MapUnitType.RED_KING);
                break;
            case 'C':
                mapBo.getUnitMap().put(CommonUtil.generateKey(x, y), MapUnitType.BLUE_KING);
                break;
            case 'P':
                mapBo.getPlayerStartPoints().add(CommonUtil.generateKey(x, y));
                break;
            case 'E':
                mapBo.getComputerStartPoints().add(CommonUtil.generateKey(x, y));
                break;
            default:
                break;
        }
    }

    private void parseComputers(MapBo mapBo, String line) {
        String[] infos = line.split(",");
        for (String info : infos) {
            String[] kv = info.split(":");
            mapBo.getComputerLife().put(kv[0], Integer.parseInt(kv[1]));
        }
    }
}
