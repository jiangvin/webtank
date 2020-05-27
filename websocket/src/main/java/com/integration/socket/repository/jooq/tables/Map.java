/*
 * This file is generated by jOOQ.
 */
package com.integration.socket.repository.jooq.tables;


import com.integration.socket.repository.jooq.DefaultSchema;
import com.integration.socket.repository.jooq.Indexes;
import com.integration.socket.repository.jooq.Keys;
import com.integration.socket.repository.jooq.tables.records.MapRecord;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.ForeignKey;
import org.jooq.Index;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Schema;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.UniqueKey;
import org.jooq.impl.DSL;
import org.jooq.impl.TableImpl;


/**
 * This class is generated by jOOQ.
 */
@Generated(
value = {
    "http://www.jooq.org",
    "jOOQ version:3.11.11"
},
comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Map extends TableImpl<MapRecord> {

    private static final long serialVersionUID = -21149046;

    /**
     * The reference instance of <code>map</code>
     */
    public static final Map MAP = new Map();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<MapRecord> getRecordType() {
        return MapRecord.class;
    }

    /**
     * The column <code>map.id</code>.
     */
    public final TableField<MapRecord, String> ID = createField("id", org.jooq.impl.SQLDataType.VARCHAR(128).nullable(false), this, "");

    /**
     * The column <code>map.data</code>.
     */
    public final TableField<MapRecord, String> DATA = createField("data", org.jooq.impl.SQLDataType.CLOB.nullable(false), this, "");

    /**
     * The column <code>map.create_time</code>.
     */
    public final TableField<MapRecord, Timestamp> CREATE_TIME = createField("create_time", org.jooq.impl.SQLDataType.TIMESTAMP.nullable(false).defaultValue(org.jooq.impl.DSL.field("CURRENT_TIMESTAMP", org.jooq.impl.SQLDataType.TIMESTAMP)), this, "");

    /**
     * The column <code>map.update_time</code>.
     */
    public final TableField<MapRecord, Timestamp> UPDATE_TIME = createField("update_time", org.jooq.impl.SQLDataType.TIMESTAMP, this, "");

    /**
     * The column <code>map.secret</code>.
     */
    public final TableField<MapRecord, String> SECRET = createField("secret", org.jooq.impl.SQLDataType.VARCHAR(128), this, "");

    /**
     * The column <code>map.name</code>.
     */
    public final TableField<MapRecord, String> NAME = createField("name", org.jooq.impl.SQLDataType.VARCHAR(128).nullable(false), this, "");

    /**
     * Create a <code>map</code> table reference
     */
    public Map() {
        this(DSL.name("map"), null);
    }

    /**
     * Create an aliased <code>map</code> table reference
     */
    public Map(String alias) {
        this(DSL.name(alias), MAP);
    }

    /**
     * Create an aliased <code>map</code> table reference
     */
    public Map(Name alias) {
        this(alias, MAP);
    }

    private Map(Name alias, Table<MapRecord> aliased) {
        this(alias, aliased, null);
    }

    private Map(Name alias, Table<MapRecord> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, DSL.comment(""));
    }

    public <O extends Record> Map(Table<O> child, ForeignKey<O, MapRecord> key) {
        super(child, key, MAP);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Schema getSchema() {
        return DefaultSchema.DEFAULT_SCHEMA;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Index> getIndexes() {
        return Arrays.<Index>asList(Indexes.MAP_PRIMARY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public UniqueKey<MapRecord> getPrimaryKey() {
        return Keys.KEY_MAP_PRIMARY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UniqueKey<MapRecord>> getKeys() {
        return Arrays.<UniqueKey<MapRecord>>asList(Keys.KEY_MAP_PRIMARY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map as(String alias) {
        return new Map(DSL.name(alias), this);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map as(Name alias) {
        return new Map(alias, this);
    }

    /**
     * Rename this table
     */
    @Override
    public Map rename(String name) {
        return new Map(DSL.name(name), null);
    }

    /**
     * Rename this table
     */
    @Override
    public Map rename(Name name) {
        return new Map(name, null);
    }
}
