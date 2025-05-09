package com.ict.serv.repository.product;

import com.ict.serv.entity.product.Option;
import com.ict.serv.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByProduct(Product product);

    List<Option> findAllByProduct(Product product);
}
