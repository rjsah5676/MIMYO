package com.ict.serv.entity.Inquiries;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryViewResponseDTO {
    private Inquiry inquiry;
    private Response response;
}
