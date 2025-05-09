package com.ict.serv.repository;

import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportSort;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findAllByStateOrderByIdDesc(ReportState state, PageRequest pg);

    List<Report> findAllByStateAndSortOrderByIdDesc(ReportState state, ReportSort sort, PageRequest of);

    List<Report> findAllByStateAndReportTypeContainingOrderByIdDesc(ReportState state, String category, PageRequest of);

    List<Report> findAllByStateAndSortAndReportTypeContainingOrderByIdDesc(ReportState state, ReportSort sort, String category, PageRequest of);

    @Query("SELECT r FROM Report r " +
            "WHERE r.state = :state " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    List<Report> findAllIdByStateAndContainingSearchWord(@Param("state") ReportState state, @Param("searchWord") String searchWord, PageRequest of);

    @Query("SELECT r FROM Report r " +
            "WHERE r.state = :state " +
            //"AND r.sort LIKE %:sort% " +
            "AND r.sort = :sort " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    List<Report> findAllIdByStateAndSortAndContainingSearchWord(@Param("state") ReportState state, @Param("sort") ReportSort sort, @Param("searchWord")String searchWord, PageRequest of);

    @Query("SELECT r FROM Report r " +
            "WHERE r.state = :state " +
            "AND r.reportType LIKE %:reportType% " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    List<Report> findAllByStateAndReportTypeContainingAndSearchWord(@Param("state") ReportState state, @Param("reportType") String reportType, @Param("searchWord") String searchWord, PageRequest of);

    @Query("SELECT r FROM Report r " +
            "WHERE r.state = :state " +
            //"AND r.sort LIKE %:sort% " +
            "AND r.sort = :sort " +
            "AND r.reportType LIKE %:reportType% " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    List<Report> findAllByStateAndSortAndReportTypeContainingAndSearchWord(@Param("state") ReportState state, @Param("sort") ReportSort sort, @Param("category") String category, @Param("searchWord") String searchWord, PageRequest of);

    int countIdByState(ReportState state);

    int countIdByStateAndReportTypeContaining(ReportState state, String category);

    @Query("SELECT COUNT(r) FROM Report r " +
            "WHERE r.state = :state " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    int countIdByStateAndContainingSearchWord(@Param("state") ReportState state, @Param("searchWord") String searchWord);

    @Query("SELECT COUNT(r) FROM Report r " +
            "WHERE r.state = :state " +
            "AND r.reportType LIKE %:reportType% " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    int countIdByStateAndReportTypeContainingAndSearchWord(@Param("state") ReportState state, @Param("reportType") String reportType, @Param("searchWord") String searchWord);

    //int countIdByReportUser(User user);

    List<Report> findAllByUserFromOrderByCreateDateDesc(User user, PageRequest of);

    int countIdByUserFrom(User user);

    int countIdByStateAndSort(ReportState state, ReportSort sort);

    int countIdByStateAndSortAndReportTypeContaining(ReportState state, ReportSort sort, String category);

    @Query("SELECT COUNT(r) FROM Report r " +
            "WHERE r.state = :state " +
            //"AND r.sort LIKE %:sort% " +
            "AND r.sort = :sort " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    int countIdByStateAndSortAndContainingSearchWord(@Param("state")ReportState state, @Param("sort")ReportSort sort, @Param("searchWord")String searchWord);

    @Query("SELECT COUNT(r) FROM Report r " +
            "WHERE r.state = :state " +
            //"AND r.sort LIKE %:sort% " +
            "AND r.sort = :sort " +
            "AND r.reportType LIKE %:reportType% " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    int countIdByStateAndSortAndReportTypeContainingAndSearchWord(@Param("state")ReportState state, @Param("sort")ReportSort sort, @Param("category")String category, @Param("searchWord")String searchWord);
}
