package com.ict.serv.entity.notice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeUpdateRequest {
    private String noticeName;
    private String state;
    private String content;
}
