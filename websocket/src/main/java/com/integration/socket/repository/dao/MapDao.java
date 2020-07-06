package com.integration.socket.repository.dao;

import com.integration.socket.repository.jooq.tables.records.MapRecord;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/14
 */

@Repository
public class MapDao extends BaseDao {
    public List<String> queryMapNameList() {
        return create.select(MAP.NAME).from(MAP).orderBy(MAP.ID).fetchInto(String.class);
    }

    public MapRecord queryFromId(int id, int subId) {
        return create.selectFrom(MAP).where(MAP.ID.eq(id)).and(MAP.SUB_ID.eq(subId)).fetchOne();
    }

    public MapRecord queryFromName(String name) {
        return create.selectFrom(MAP).where(MAP.NAME.eq(name)).fetchOne();
    }

    public void insertMap(String name, String secret, int width, int height, String data) {
        create.insertInto(MAP)
        .set(MAP.NAME, name)
        .set(MAP.DATA, data)
        .set(MAP.WIDTH, width)
        .set(MAP.HEIGHT, height)
        .set(MAP.SECRET, secret).execute();
    }

    public void resetId() {
        List<MapRecord> list = create.fetch("SELECT * FROM map order by width * height;").into(MapRecord.class);
        for (int i = 0; i < list.size(); ++i) {
            MapRecord record = list.get(i);
            if (record.getId() == null || record.getId() != i + 1) {
                record.setId(i + 1);
                record.update();
            }
        }
    }

    public int queryMaxSubId(int id) {
        return create.select(DSL.max(MAP.SUB_ID)).from(MAP).where(MAP.ID.eq(id)).fetchOneInto(Integer.class);
    }
}
