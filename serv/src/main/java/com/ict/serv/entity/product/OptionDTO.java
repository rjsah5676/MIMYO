package com.ict.serv.entity.product;

import lombok.Data;

import java.util.List;

@Data
public class OptionDTO {
    private String mainOptionName;
    private List<SubOptionDTO> subOptions;
}
