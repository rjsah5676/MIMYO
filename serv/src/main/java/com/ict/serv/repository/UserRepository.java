package com.ict.serv.repository;

import com.ict.serv.entity.Authority;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<Object> findByUserid(String userid);
    User findByEmail(String email);
    User findUserById(long id);
    User findUserByUserid(String userid);
    List<User> findUserByAuthority(Authority authority);
    int countByUserid(String userid);
    int countByTel(String tel);
    long countByAuthority(Authority authority);
    Page<User> findByUseridContainingOrUsernameContaining(String userid, String username, Pageable pageable);
    Page<User> findByAuthorityAndUseridContainingOrAuthorityAndUsernameContaining(Authority authority1, String userid, Authority authority2, String username, Pageable pageable);
}
