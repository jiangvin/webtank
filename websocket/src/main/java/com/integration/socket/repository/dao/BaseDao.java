package com.integration.socket.repository.dao;

import com.integration.socket.repository.jooq.Tables;
import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.jooq.impl.DataSourceConnectionProvider;
import org.jooq.impl.DefaultConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/5/14
 */
@Repository
public abstract class BaseDao extends Tables {
    private DataSource dataSource;
    DSLContext create;

    @Autowired
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    private void init() {
        TransactionAwareDataSourceProxy proxy = new TransactionAwareDataSourceProxy(dataSource);
        Configuration configuration = new DefaultConfiguration();
        configuration.set(new DataSourceConnectionProvider(proxy)).set(SQLDialect.MARIADB);
        create = DSL.using(configuration);
    }
}
