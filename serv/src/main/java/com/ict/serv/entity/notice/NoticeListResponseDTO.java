package com.ict.serv.entity.notice;

import com.ict.serv.entity.notice.Notice;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeListResponseDTO {
    private List<Notice> noticeList;
    private int totalCount;
}