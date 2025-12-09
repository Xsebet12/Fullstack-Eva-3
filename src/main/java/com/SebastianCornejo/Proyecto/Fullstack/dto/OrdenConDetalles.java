package com.SebastianCornejo.Proyecto.Fullstack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class OrdenConDetalles {
    private Long id;
    private java.time.Instant fecha;
    private java.math.BigDecimal total;
    private String estadoPago;
    private String estadoEnvio;
    private String numeroSeguimiento;
    private Long numeroBoleta;
    private java.util.List<ItemOrdenDTO> items;
}
