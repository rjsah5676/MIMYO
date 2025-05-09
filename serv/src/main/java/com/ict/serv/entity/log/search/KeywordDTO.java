package com.ict.serv.entity.log.search;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class KeywordDTO {
    private String keyword;
    private Long count;
    private Object change;
}
