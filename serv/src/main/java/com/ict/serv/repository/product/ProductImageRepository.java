package com.ict.serv.repository.product;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.product.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findAllByProduct(Product product);
}
