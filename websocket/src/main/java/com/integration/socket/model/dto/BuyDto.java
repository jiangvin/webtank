package com.integration.socket.model.dto;

import com.integration.socket.model.BuyType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * @author 蒋文龙(Vin)
 * @description
 * @date 2020/6/22
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BuyDto {
    @NonNull private String userId;
    @NonNull private BuyType buyType;
}
