package com.ict.serv.entity.message;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageResponseDTO {
    private Long id;
    private String username;
    private String userid;
    private String imgUrl;
}
