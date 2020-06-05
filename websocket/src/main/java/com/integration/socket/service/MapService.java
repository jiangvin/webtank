package com.integration.socket.service;

import com.integration.dto.map.MapUnitType;
import com.integration.dto.room.RoomType;
import com.integration.socket.model.bo.MapBo;
import com.integration.socket.model.dto.MapEditDto;
import com.integration.socket.model.dto.StringCountDto;
import com.integration.socket.repository.dao.MapDao;
import com.integration.socket.repository.jooq.tables.records.MapRecord;
import com.integration.util.CommonUtil;
import com.integration.util.model.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Random;

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

    @Autowired
    private MapDao mapDao;

    private Random random = new Random();

    private static final String MAP_SIZE = "map_size";

    private static final String PLAYERS = "players";

    private static final String COMPUTERS = "computers";

    private static final String COMPUTER_START = "computer_start";

    private static final String MAP_CONTENT = "map_content";

    private static final String PLAYER_DEFAULT_TYPE = "tank01";

    public MapBo loadNextMap(int mapId, RoomType roomType) {
        if (mapDao.queryFromId(mapId) == null) {
            return null;
        }
        return loadMap(mapId, roomType);
    }

    private MapBo loadMap(MapRecord record, RoomType roomType) {
        if (record == null) {
            throw new CustomException("找不到地图资源!");
        }
        String content = record.getData();
        if (StringUtils.isEmpty(content)) {
            throw new CustomException("找不到地图资源!");
        }

        MapBo mapBo = readFile(content);
        mapBo.setMapId(record.getId());
        mapBo.setMapName(record.getName());

        //根据类型调整数据
        if (roomType == RoomType.PVP) {
            mapBo.duplicatePlayer();
            mapBo.removeMapUnit(MapUnitType.RED_KING);
            mapBo.removeMapUnit(MapUnitType.BLUE_KING);
        } else if (roomType == RoomType.EVE) {
            mapBo.duplicateComputer();
        } else if (roomType == RoomType.PVE) {
            mapBo.removeMapUnit(MapUnitType.BLUE_KING);
        }
        return mapBo;
    }

    public MapBo loadMap(int mapId, RoomType roomType) {
        return loadMap(mapDao.queryFromId(mapId), roomType);
    }

    public MapBo loadRandomMap(List<String> loadedMapNames, RoomType roomType) {
        List<String> mapNames = mapDao.queryMapNameList();
        for (String name : loadedMapNames) {
            mapNames.remove(name);
        }

        if (mapNames.isEmpty()) {
            return null;
        }

        String mapName = mapNames.get(random.nextInt(mapNames.size()));
        loadedMapNames.add(mapName);
        return loadMap(mapDao.queryFromName(mapName), roomType);
    }

    public void saveMap(MapEditDto mapEditDto) {
        if (StringUtils.isEmpty(mapEditDto.getName())) {
            throw new CustomException("名字不能为空");
        }
        MapBo mapBo = readFile(mapEditDto.getData());

        MapRecord mapRecord = mapDao.queryFromName(mapEditDto.getName());
        if (mapRecord != null) {
            if (mapRecord.getSecret() != null && !mapRecord.getSecret().equals(mapEditDto.getPw())) {
                throw new CustomException("密码校验出错,请重新输入密码或者修改地图名存为新地图");
            }
            mapRecord.setData(mapEditDto.getData());
            mapRecord.setWidth(mapBo.getMaxGridX());
            mapRecord.setHeight(mapBo.getMaxGridY());
            mapRecord.update();
            mapDao.resetId();
            return;
        }

        String secret = null;
        if (!StringUtils.isEmpty(mapEditDto.getPw())) {
            secret = mapEditDto.getPw();
        }
        mapDao.insertMap(mapEditDto.getName(), secret, mapBo.getMaxGridX(), mapBo.getMaxGridY(), mapEditDto.getData());
        mapDao.resetId();
    }

    private MapBo readFile(String content) {
        MapBo mapBo = new MapBo();
        String[] lines = content.replace("\r", "").split("\n");
        int lineIndex = 0;
        int readMapLineNumber = -1;
        try {
            for (lineIndex = 0; lineIndex < lines.length; ++lineIndex) {
                String line = lines[lineIndex].trim();
                if (line.startsWith("#") || StringUtils.isEmpty(line)) {
                    continue;
                }
                if (readMapLineNumber <= -1) {
                    KeyValue kv = getKeyValue(line);
                    if (kv == null) {
                        continue;
                    }
                    switch (kv.key) {
                        case MAP_SIZE:
                            String[] infos = kv.value.split("x");
                            mapBo.setMaxGridX(Integer.parseInt(infos[0]));
                            mapBo.setMaxGridY(Integer.parseInt(infos[1]));
                            mapBo.setWidth(mapBo.getMaxGridX() * CommonUtil.UNIT_SIZE);
                            mapBo.setHeight(mapBo.getMaxGridY() * CommonUtil.UNIT_SIZE);
                            break;
                        case PLAYERS:
                            mapBo.getPlayerLife().add(new StringCountDto(PLAYER_DEFAULT_TYPE, Integer.parseInt(kv.value)));
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
            throw new CustomException(String.format("地图读取错误! 行数:%d, 错误 :%s", lineIndex + 1, e.getMessage()));
        }
        mapBo.setTotalLifeCount();
        mapBo.checkSelf();
        return mapBo;
    }

    private KeyValue getKeyValue(String line) {
        int index = line.indexOf("=");
        if (index <= 0) {
            return null;
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
            case 'k':
                mapBo.getUnitMap().put(CommonUtil.generateKey(x, y), MapUnitType.RED_KING);
                break;
            case 'C':
            case 'c':
                mapBo.getUnitMap().put(CommonUtil.generateKey(x, y), MapUnitType.BLUE_KING);
                break;
            case 'P':
            case 'p':
                mapBo.getPlayerStartPoints().add(CommonUtil.generateKey(x, y));
                break;
            case 'E':
            case 'e':
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
            mapBo.getComputerLife().add(new StringCountDto(kv[0], Integer.parseInt(kv[1])));
        }
    }
}
