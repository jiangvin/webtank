/*
 * This file is generated by jOOQ.
 */
package com.integration.socket.repository.jooq;


import com.integration.socket.repository.jooq.tables.Map;
import com.integration.socket.repository.jooq.tables.RankBoard;
import com.integration.socket.repository.jooq.tables.Star;
import com.integration.socket.repository.jooq.tables.User;

import javax.annotation.Generated;


/**
 * Convenience access to all tables in 
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.11.11"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Tables {

    /**
     * The table <code>map</code>.
     */
    public static final Map MAP = com.integration.socket.repository.jooq.tables.Map.MAP;

    /**
     * The table <code>rank_board</code>.
     */
    public static final RankBoard RANK_BOARD = com.integration.socket.repository.jooq.tables.RankBoard.RANK_BOARD;

    /**
     * The table <code>star</code>.
     */
    public static final Star STAR = com.integration.socket.repository.jooq.tables.Star.STAR;

    /**
     * The table <code>user</code>.
     */
    public static final User USER = com.integration.socket.repository.jooq.tables.User.USER;
}
