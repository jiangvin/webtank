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
    public List<String> queryMapIdList() {
        return create.select(MAP.ID).from(MAP).orderBy(DSL.length(MAP.DATA)).fetchInto(String.class);
    }

    public MapRecord queryFromId(String id) {
        return create.selectFrom(MAP).where(MAP.ID.eq(id)).fetchOne();
    }

    public void insertMap(String id, String secret, String data) {
        create.insertInto(MAP)
        .set(MAP.ID, id)
        .set(MAP.DATA, data)
        .set(MAP.SECRET, secret)
        .onDuplicateKeyUpdate()
        .set(MAP.DATA, data)
        .set(MAP.UPDATE_TIME, DSL.currentTimestamp()).execute();
    }
}
