package com.ict.serv.repository;

import com.ict.serv.entity.user.Address;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findAllByUser(User user);
}
