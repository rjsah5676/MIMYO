package com.ict.serv.service;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.entity.Inquiries.Inquiry;
import com.ict.serv.entity.Inquiries.InquiryPagingVO;
import com.ict.serv.entity.Inquiries.InquiryState;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.repository.ReportRepository;
import com.ict.serv.repository.UserRepository;
import com.ict.serv.repository.inquiry.InquiryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
    private final ReportRepository report_repo;
    private final InquiryRepository inquiryRepository;
    private final EntityManager entityManager;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    public Optional<Report> selectReport(Long id) {
        return report_repo.findById(id);
    }
    public void deleteReport(Long id) {
        report_repo.deleteById(id);
    }
    public List<Report> getAllReport(PagingVO pvo, ReportState state){
        boolean no_word = pvo.getSearchWord() == null || pvo.getSearchWord().isEmpty();
        boolean no_cat = pvo.getCategory()==null || pvo.getCategory().isEmpty();
        boolean no_sort = pvo.getSort()==null;
        if(no_word) pvo.setSearchWord("");
        if(no_word && no_cat) {
            if(no_sort) return report_repo.findAllByStateOrderByIdDesc(pvo.getState(), PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
            return report_repo.findAllByStateAndSortOrderByIdDesc(pvo.getState(),pvo.getSort(), PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        }
        else if(no_word){
            if(no_sort) return report_repo.findAllByStateAndReportTypeContainingOrderByIdDesc(pvo.getState(),pvo.getCategory(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
            return report_repo.findAllByStateAndSortAndReportTypeContainingOrderByIdDesc(pvo.getState(),pvo.getSort(),pvo.getCategory(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        }else if(no_cat) {
            if(no_sort) return report_repo.findAllIdByStateAndContainingSearchWord(pvo.getState(),pvo.getSearchWord(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
            return report_repo.findAllIdByStateAndSortAndContainingSearchWord(pvo.getState(),pvo.getSort(),pvo.getSearchWord(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        }
        else {
            if(no_sort) return report_repo.findAllByStateAndReportTypeContainingAndSearchWord(pvo.getState(),pvo.getCategory(),pvo.getSearchWord(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
            return report_repo.findAllByStateAndSortAndReportTypeContainingAndSearchWord(pvo.getState(),pvo.getSort(),pvo.getCategory(),pvo.getSearchWord(),PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
        }
    }

    public int totalRecord(PagingVO pvo) {
        boolean no_word = pvo.getSearchWord() == null || pvo.getSearchWord().isEmpty();
        boolean no_cat = pvo.getCategory()==null || pvo.getCategory().isEmpty();
        boolean no_sort = pvo.getSort()==null;
        if(no_word) pvo.setSearchWord("");
        if (no_word && no_cat){
            if(no_sort) return report_repo.countIdByState(pvo.getState());
            return report_repo.countIdByStateAndSort(pvo.getState(),pvo.getSort());
        }
        else if(no_word) {
            if(no_sort) return report_repo.countIdByStateAndReportTypeContaining(pvo.getState(),pvo.getCategory());
            return report_repo.countIdByStateAndSortAndReportTypeContaining(pvo.getState(),pvo.getSort(),pvo.getCategory());
        } else if(no_cat){
            if(no_sort) return report_repo.countIdByStateAndContainingSearchWord(pvo.getState(),pvo.getSearchWord());
            return report_repo.countIdByStateAndSortAndContainingSearchWord(pvo.getState(),pvo.getSort(),pvo.getSearchWord());
        }
        else {
            if(no_sort) return report_repo.countIdByStateAndReportTypeContainingAndSearchWord(pvo.getState(),pvo.getCategory(),pvo.getSearchWord());
            return report_repo.countIdByStateAndSortAndReportTypeContainingAndSearchWord(pvo.getState(),pvo.getSort(),pvo.getCategory(),pvo.getSearchWord());
        }
    }

    @Transactional(readOnly = true)
    public long countAdminInquiries(InquiryState status, String inquiryType) {
        Specification<Inquiry> spec = createInquirySpecification(status, inquiryType, false);
        return inquiryRepository.count(spec);
    }

    @Transactional(readOnly = true)
    public List<Inquiry> getAdminInquiryList(InquiryPagingVO pvo, InquiryState status, String inquiryType) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Inquiry> cq = cb.createQuery(Inquiry.class);
        Root<Inquiry> inquiryRoot = cq.from(Inquiry.class);

        Specification<Inquiry> spec = createInquirySpecification(status, inquiryType, true);
        Predicate predicate = spec.toPredicate(inquiryRoot, cq, cb);
        cq.where(predicate);

        Sort sort = parseSortParameter(pvo.getSort());
        List<Order> orders = new ArrayList<>();
        if (sort != null) {
            for (Sort.Order order : sort) {
                try {
                    Path<Object> path = inquiryRoot.get(order.getProperty());
                    if (order.isAscending()) {
                        orders.add(cb.asc(path));
                    } else {
                        orders.add(cb.desc(path));
                    }
                } catch (IllegalArgumentException e) {

                }
            }
        }
        if (!orders.isEmpty()) {
            cq.orderBy(orders);
        } else {
            cq.orderBy(cb.desc(inquiryRoot.get("inquiryWritedate")));
        }

        TypedQuery<Inquiry> query = entityManager.createQuery(cq);
        query.setFirstResult(pvo.getOffset());
        query.setMaxResults(pvo.getOnePageRecord());

        List<Inquiry> resultList = query.getResultList();
        return resultList;
    }

    private Specification<Inquiry> createInquirySpecification(InquiryState status, String inquiryType, boolean fetchJoins) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("inquiryStatus"), status));
            if (StringUtils.hasText(inquiryType)) {
                predicates.add(criteriaBuilder.equal(root.get("inquiryType"), inquiryType));
            }

            if (fetchJoins && query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("user", JoinType.LEFT);
                root.fetch("response", JoinType.LEFT);
                query.distinct(true);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort parseSortParameter(String sortStr) {
        try {
            if (StringUtils.hasText(sortStr)) {
                String[] sortParams = sortStr.split(",");
                if (sortParams.length > 0) {
                    String property = sortParams[0];
                    Sort.Direction direction = Sort.Direction.ASC;
                    if (sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])) {
                        direction = Sort.Direction.DESC;
                    }
                    return Sort.by(direction, property);
                }
            }
        } catch (Exception e) {

        }
        return Sort.by(Sort.Direction.DESC, "inquiryWritedate");
    }
    @Transactional(readOnly = true)
    public Inquiry getAdminInquiryDetailById(Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new EntityNotFoundException("Inquiry not found with ID: " + inquiryId));
        return inquiry;
    }
}
