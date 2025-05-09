package com.ict.serv.service;

import com.ict.serv.entity.order.Orders;
import com.ict.serv.entity.order.Shipping;
import com.ict.serv.entity.order.ShippingRequestDTO;
import com.ict.serv.entity.order.ShippingState;
import com.ict.serv.repository.order.OrderRepository;
import com.ict.serv.repository.order.ShippingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingService {
    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;
    private final TaskScheduler taskScheduler;

    public List<Shipping> selectShippingByOrders(Orders orders) {
        return shippingRepository.findAllByOrders(orders);
    }

    public void startShipping(ShippingRequestDTO request) {
        Orders order = orderRepository.findById(request.getOrderId()).orElseThrow(() -> new RuntimeException("Order not found"));

        Shipping shipping = new Shipping();
        shipping.setState(ShippingState.ONGOING);
        shipping.setInvoiceNumber(request.getInvoiceNumber());
        shipping.setOrders(order);

        shippingRepository.save(shipping);

        order.setShippingState(ShippingState.ONGOING);
        orderRepository.save(order);

        LocalDateTime time = LocalDateTime.now().plusMinutes(120);
        Date date = Date.from(time.atZone(ZoneId.systemDefault()).toInstant());

        taskScheduler.schedule(() -> finishShipping(shipping.getId(), order.getId()), date);
    }

    private void finishShipping(Long shippingId, Long orderId) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new RuntimeException("Shipping not found"));
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if(shipping.getState() == ShippingState.ONGOING) {
            shipping.setState(ShippingState.FINISH);
            shipping.setEnd_time(LocalDateTime.now());

            order.setShippingState(ShippingState.FINISH);

            shippingRepository.save(shipping);
            orderRepository.save(order);
        }
    }
    public void saveOrderAndShipping(Shipping shipping, Orders orders) {
        shippingRepository.save(shipping);
        orderRepository.save(orders);
    }
}
