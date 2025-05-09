package com.ict.serv.controller;

import com.ict.serv.service.RouletteService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roulette")
public class RouletteController {

    private final RouletteService rouletteService;

    public RouletteController(RouletteService rouletteService) {
        this.rouletteService = rouletteService;
    }

    @GetMapping("/check")
    public boolean canSpinToday() {
        return rouletteService.canSpinToday();
    }

    @PostMapping("/spin")
    public String spin() {
        return rouletteService.spinAndAddPoint();
    }
}
