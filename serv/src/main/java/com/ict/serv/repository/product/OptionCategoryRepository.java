package com.ict.serv.repository.product;

import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.OptionCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OptionCategoryRepository extends JpaRepository<OptionCategory, Long> {
    void deleteAllByOption(Option option);
}
