package com.ict.serv.controller.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductPagingVO {
    private String searchWord;

    /* 카테고리 */
    private String eventCategory;
    private String targetCategory;
    private String productCategory;

    private String sort;

    private int nowPage = 1;
    private int onePageRecord = 5;

    private int totalRecord;
    private int totalPage;

    private int offset;

    private int onePageCount = 5;
    private int startPageNum = 1;

    public void setNowPage(int nowPage) {
        this.nowPage = nowPage;

        offset = (nowPage - 1) * onePageRecord;

        startPageNum = (nowPage - 1) / onePageCount * onePageCount + 1;
    }
    public void setTotalRecord(int totalRecord) {
        this.totalRecord = totalRecord;

        totalPage = (totalRecord % onePageRecord == 0) ?
                totalRecord / onePageRecord : totalRecord / onePageRecord + 1;
    }
}