package com.ict.serv.repository;

import com.ict.serv.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendRepository extends JpaRepository<Product, Long> {
}
