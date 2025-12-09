package com.SebastianCornejo.Proyecto.Fullstack.controller;

import com.SebastianCornejo.Proyecto.Fullstack.dto.RespuestaVenta;
import com.SebastianCornejo.Proyecto.Fullstack.dto.SolicitudVentaOpcional;
import com.SebastianCornejo.Proyecto.Fullstack.dto.RespuestaPagoVenta;
import com.SebastianCornejo.Proyecto.Fullstack.dto.OrdenResumen;
import com.SebastianCornejo.Proyecto.Fullstack.dto.OrdenConDetalles;
import com.SebastianCornejo.Proyecto.Fullstack.dto.ItemOrdenDTO;
import com.SebastianCornejo.Proyecto.Fullstack.entity.*;
import com.SebastianCornejo.Proyecto.Fullstack.exception.PeticionInvalidaException;
import com.SebastianCornejo.Proyecto.Fullstack.exception.RecursoNoEncontradoException;
import com.SebastianCornejo.Proyecto.Fullstack.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import com.SebastianCornejo.Proyecto.Fullstack.dto.SolicitudVentaDirecta;
import com.SebastianCornejo.Proyecto.Fullstack.dto.SolicitudConfirmacionVenta;
import com.SebastianCornejo.Proyecto.Fullstack.dto.SolicitudRechazoVenta;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/ventas")
@Tag(name = "Ventas", description = "Procesamiento de compras y actualización de stock")
@SecurityRequirement(name = "bearerAuth")
public class ControladorVentas {

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioCarrito repositorioCarrito;
    private final RepositorioItemCarrito repositorioItemCarrito;
    private final RepositorioProducto repositorioProducto;
    private final RepositorioVenta repositorioVenta;
    private final RepositorioDetalleVenta repositorioDetalleVenta;
    private final RepositorioSeguimientoPedido repositorioSeguimientoPedido;
    private final RepositorioBoleta repositorioBoleta;
    private final RepositorioDetalleBoleta repositorioDetalleBoleta;

    public ControladorVentas(RepositorioUsuario repositorioUsuario,
                             RepositorioCarrito repositorioCarrito,
                             RepositorioItemCarrito repositorioItemCarrito,
                             RepositorioProducto repositorioProducto,
                             RepositorioVenta repositorioVenta,
                             RepositorioDetalleVenta repositorioDetalleVenta,
                             RepositorioSeguimientoPedido repositorioSeguimientoPedido,
                             RepositorioBoleta repositorioBoleta,
                             RepositorioDetalleBoleta repositorioDetalleBoleta) {
        this.repositorioUsuario = repositorioUsuario;
        this.repositorioCarrito = repositorioCarrito;
        this.repositorioItemCarrito = repositorioItemCarrito;
        this.repositorioProducto = repositorioProducto;
        this.repositorioVenta = repositorioVenta;
        this.repositorioDetalleVenta = repositorioDetalleVenta;
        this.repositorioSeguimientoPedido = repositorioSeguimientoPedido;
        this.repositorioBoleta = repositorioBoleta;
        this.repositorioDetalleBoleta = repositorioDetalleBoleta;
    }

    @PostMapping("/ingresar")
    @Operation(summary = "Ingresar venta", description = "Valida stock, genera venta y detalles, actualiza stock y limpia carrito")
    @Transactional
    public ResponseEntity<RespuestaVenta> ingresar(@AuthenticationPrincipal UserDetails principal, @RequestBody(required = false) SolicitudVentaOpcional body){
        if (principal == null) throw new PeticionInvalidaException("Usuario no autenticado");
        Usuario u = repositorioUsuario.findByCorreo(principal.getUsername())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        if (body != null && body.getItems() != null && !body.getItems().isEmpty()) {
            BigDecimal total = BigDecimal.ZERO;
            for (SolicitudVentaOpcional.Item it : body.getItems()) {
                if (it.getProductoId() == null || it.getCantidad() == null || it.getCantidad() <= 0) throw new PeticionInvalidaException("Item inválido");
                Producto p = repositorioProducto.findById(it.getProductoId())
                        .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
                int disponible = Math.max(0, p.getStock() == null ? 0 : p.getStock());
                if (it.getCantidad() > disponible) throw new PeticionInvalidaException("Stock insuficiente para " + p.getNombre() + ". Disponible: " + disponible);
                BigDecimal unitPrice = p.getPrecio();
                if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) throw new PeticionInvalidaException("Producto sin precio válido");
                if (u instanceof Cliente cliente && cliente.getTipoCliente() == TipoCliente.VIP) {
                    unitPrice = unitPrice.multiply(new java.math.BigDecimal("0.85"));
                }
                total = total.add(unitPrice.multiply(BigDecimal.valueOf(it.getCantidad())));
            }
            Venta venta = Venta.builder()
                    .usuario(u)
                    .fecha(Instant.now())
                    .total(total)
                    .metodoPago(body.getMetodoPago())
                    .canal(body.getCanal())
                    .estadoPago("aceptado")
                    .build();
            venta = repositorioVenta.save(venta);
            for (SolicitudVentaOpcional.Item it : body.getItems()) {
                Producto p = repositorioProducto.findById(it.getProductoId()).orElseThrow();
                int nuevoStock = Math.max(0, (p.getStock() == null ? 0 : p.getStock()) - it.getCantidad());
                p.setStock(nuevoStock);
                repositorioProducto.save(p);
                BigDecimal unitPrice = p.getPrecio();
                if (u instanceof Cliente cliente && cliente.getTipoCliente() == TipoCliente.VIP) {
                    unitPrice = unitPrice.multiply(new java.math.BigDecimal("0.85"));
                }
                DetalleVenta dv = DetalleVenta.builder()
                        .venta(venta)
                        .producto(p)
                        .cantidad(it.getCantidad())
                        .precioUnitario(unitPrice)
                        .subtotal(unitPrice.multiply(BigDecimal.valueOf(it.getCantidad())))
                        .build();
                repositorioDetalleVenta.save(dv);
            }
            java.math.BigDecimal montoNeto = venta.getTotal();
            java.math.BigDecimal montoIva = montoNeto.multiply(new java.math.BigDecimal("0.19")).setScale(2, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal montoTotal = montoNeto.add(montoIva);
            Long ultimo = repositorioBoleta.findTopByOrderByNumeroDesc().map(Boleta::getNumero).orElse(1000000L);
            Long numeroBoleta = ultimo + 1;
            Boleta boleta = Boleta.builder()
                    .venta(venta)
                    .numero(numeroBoleta)
                    .fecha(Instant.now())
                    .montoNeto(montoNeto)
                    .montoIva(montoIva)
                    .montoTotal(montoTotal)
                    .build();
            boleta = repositorioBoleta.save(boleta);
            for (SolicitudVentaOpcional.Item it : body.getItems()) {
                Producto p = repositorioProducto.findById(it.getProductoId()).orElseThrow();
                java.math.BigDecimal unitPrice = p.getPrecio();
                if (u instanceof Cliente cliente && cliente.getTipoCliente() == TipoCliente.VIP) {
                    unitPrice = unitPrice.multiply(new java.math.BigDecimal("0.85"));
                }
                DetalleBoleta db = DetalleBoleta.builder()
                        .boleta(boleta)
                        .producto(p)
                        .cantidad(it.getCantidad())
                        .precioUnitario(unitPrice)
                        .subtotal(unitPrice.multiply(java.math.BigDecimal.valueOf(it.getCantidad())))
                        .build();
                repositorioDetalleBoleta.save(db);
            }
            java.util.UUID uuid = java.util.UUID.randomUUID();
            SeguimientoPedido seg = SeguimientoPedido.builder()
                    .venta(venta)
                    .createdAt(Instant.now())
                    .estadoEnvio("pendiente")
                    .numeroSeguimiento(uuid.toString())
                    .build();
            seg = repositorioSeguimientoPedido.save(seg);
            RespuestaVenta resp = new RespuestaVenta(venta.getId(), total, body.getItems().stream().mapToInt(SolicitudVentaOpcional.Item::getCantidad).sum(), "Compra registrada exitosamente", seg.getNumeroSeguimiento(), numeroBoleta);
            return ResponseEntity.ok(resp);
        } else {
            Carrito cart = repositorioCarrito.findByUsuario(u)
                    .orElseGet(() -> repositorioCarrito.save(Carrito.builder().usuario(u).items(new HashSet<>()).build()));
            Set<ItemCarrito> itemsSet = cart.getItems();
            List<ItemCarrito> items = repositorioItemCarrito.findByCarritoId(cart.getId());
            if (items.isEmpty()) throw new PeticionInvalidaException("El carrito está vacío");
            BigDecimal total = BigDecimal.ZERO;
            for (ItemCarrito it : items) {
                Producto p = repositorioProducto.findById(it.getProducto().getId())
                        .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
                int disponible = Math.max(0, p.getStock() == null ? 0 : p.getStock());
                if (it.getCantidad() > disponible) {
                    throw new PeticionInvalidaException("Stock insuficiente para " + p.getNombre() + ". Disponible: " + disponible);
                }
                total = total.add(it.getSubtotal());
            }
            Venta venta = Venta.builder()
                    .usuario(u)
                    .fecha(Instant.now())
                    .total(total)
                    .metodoPago(body != null ? body.getMetodoPago() : null)
                    .canal(body != null ? body.getCanal() : null)
                    .estadoPago("aceptado")
                    .build();
            venta = repositorioVenta.save(venta);
            for (ItemCarrito it : items) {
                Producto p = repositorioProducto.findById(it.getProducto().getId()).orElseThrow();
                int nuevoStock = Math.max(0, (p.getStock() == null ? 0 : p.getStock()) - it.getCantidad());
                p.setStock(nuevoStock);
                repositorioProducto.save(p);
                DetalleVenta dv = DetalleVenta.builder()
                        .venta(venta)
                        .producto(p)
                        .cantidad(it.getCantidad())
                        .precioUnitario(it.getPrecioUnitario())
                        .subtotal(it.getSubtotal())
                        .build();
                repositorioDetalleVenta.save(dv);
            }
            if (!items.isEmpty()) {
                repositorioItemCarrito.deleteAll(items);
            }
            java.math.BigDecimal montoNeto = venta.getTotal();
            java.math.BigDecimal montoIva = montoNeto.multiply(new java.math.BigDecimal("0.19")).setScale(2, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal montoTotal = montoNeto.add(montoIva);
            Long ultimo = repositorioBoleta.findTopByOrderByNumeroDesc().map(Boleta::getNumero).orElse(1000000L);
            Long numeroBoleta = ultimo + 1;
            Boleta boleta = Boleta.builder()
                    .venta(venta)
                    .numero(numeroBoleta)
                    .fecha(Instant.now())
                    .montoNeto(montoNeto)
                    .montoIva(montoIva)
                    .montoTotal(montoTotal)
                    .build();
            boleta = repositorioBoleta.save(boleta);
            for (ItemCarrito it : items) {
                DetalleBoleta db = DetalleBoleta.builder()
                        .boleta(boleta)
                        .producto(it.getProducto())
                        .cantidad(it.getCantidad())
                        .precioUnitario(it.getPrecioUnitario())
                        .subtotal(it.getSubtotal())
                        .build();
                repositorioDetalleBoleta.save(db);
            }
            java.util.UUID uuid = java.util.UUID.randomUUID();
            SeguimientoPedido seg = SeguimientoPedido.builder()
                    .venta(venta)
                    .createdAt(Instant.now())
                    .estadoEnvio("pendiente")
                    .numeroSeguimiento(uuid.toString())
                    .build();
            seg = repositorioSeguimientoPedido.save(seg);
            RespuestaVenta resp = new RespuestaVenta(venta.getId(), total, items.stream().mapToInt(ItemCarrito::getCantidad).sum(), "Compra registrada exitosamente", seg.getNumeroSeguimiento(), numeroBoleta);
            return ResponseEntity.ok(resp);
        }
    }

    @PostMapping("/{id}/aceptar")
    @Operation(summary = "Aceptar venta")
    @Transactional
    @PreAuthorize("hasAnyRole('EMPLEADO','ADMIN')")
    public ResponseEntity<RespuestaPagoVenta> aceptar(@PathVariable Long id, @RequestBody(required = false) SolicitudConfirmacionVenta body){
        Venta venta = repositorioVenta.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Venta no encontrada"));
        venta.setEstadoPago("aceptado");
        venta = repositorioVenta.save(venta);
        repositorioSeguimientoPedido.findFirstByVentaId(id).ifPresent(seg -> {
            seg.setEstadoEnvio("preparando");
            repositorioSeguimientoPedido.save(seg);
        });
        return ResponseEntity.ok(new RespuestaPagoVenta(venta.getId(), "aceptado"));
    }

    @PostMapping("/{id}/rechazar")
    @Operation(summary = "Rechazar venta")
    @Transactional
    @PreAuthorize("hasAnyRole('EMPLEADO','ADMIN')")
    public ResponseEntity<RespuestaPagoVenta> rechazar(@PathVariable Long id, @RequestBody(required = false) SolicitudRechazoVenta body){
        Venta venta = repositorioVenta.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Venta no encontrada"));
        java.util.List<DetalleVenta> detalles = repositorioDetalleVenta.findByVentaId(id);
        for (DetalleVenta dv : detalles) {
            Producto p = repositorioProducto.findById(dv.getProducto().getId()).orElse(null);
            if (p != null) {
                int nuevo = Math.max(0, (p.getStock() == null ? 0 : p.getStock()) + (dv.getCantidad() == null ? 0 : dv.getCantidad()));
                p.setStock(nuevo);
                repositorioProducto.save(p);
            }
            dv.setCantidad(0);
            repositorioDetalleVenta.save(dv);
        }
        venta.setEstadoPago("rechazado");
        venta = repositorioVenta.save(venta);
        repositorioSeguimientoPedido.findFirstByVentaId(id).ifPresent(seg -> {
            seg.setEstadoEnvio("rechazado");
            repositorioSeguimientoPedido.save(seg);
        });
        return ResponseEntity.ok(new RespuestaPagoVenta(venta.getId(), venta.getEstadoPago()));
    }

    @PostMapping("/{id}/despachado")
    @Operation(summary = "Marcar como despachado")
    @Transactional
    @PreAuthorize("hasAnyRole('EMPLEADO','ADMIN')")
    public ResponseEntity<SeguimientoPedido> despachado(@PathVariable Long id){
        repositorioVenta.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Venta no encontrada"));
        java.util.Optional<SeguimientoPedido> segOpt = repositorioSeguimientoPedido.findFirstByVentaId(id);
        if (segOpt.isPresent()) {
            SeguimientoPedido seg = segOpt.get();
            seg.setEstadoEnvio("despachado");
            seg = repositorioSeguimientoPedido.save(seg);
            return ResponseEntity.ok(seg);
        }
        return ResponseEntity.ok(null);
    }

    @PostMapping("/{id}/entregado")
    @Operation(summary = "Marcar como entregado")
    @Transactional
    @PreAuthorize("hasAnyRole('EMPLEADO','ADMIN')")
    public ResponseEntity<SeguimientoPedido> entregado(@PathVariable Long id){
        repositorioVenta.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Venta no encontrada"));
        java.util.Optional<SeguimientoPedido> segOpt = repositorioSeguimientoPedido.findFirstByVentaId(id);
        if (segOpt.isPresent()) {
            SeguimientoPedido seg = segOpt.get();
            seg.setEstadoEnvio("entregado");
            seg = repositorioSeguimientoPedido.save(seg);
            return ResponseEntity.ok(seg);
        }
        return ResponseEntity.ok(null);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @Operation(summary = "Eliminar venta", description = "Elimina la venta y sus registros asociados (seguimiento y boleta, si existen)")
    @Transactional
    @PreAuthorize("hasAnyRole('EMPLEADO','ADMIN')")
    public ResponseEntity<Void> eliminar(@org.springframework.web.bind.annotation.PathVariable Long id){
        Venta venta = repositorioVenta.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Venta no encontrada"));
        repositorioSeguimientoPedido.findFirstByVentaId(id).ifPresent(seg -> {
            try { repositorioSeguimientoPedido.delete(seg); } catch (Exception ignored) {}
        });
        repositorioBoleta.findByVentaId(id).ifPresent(b -> {
            try {
                for (DetalleBoleta db : repositorioDetalleBoleta.findByBoletaId(b.getId())) {
                    try { repositorioDetalleBoleta.delete(db); } catch (Exception ignored) {}
                }
                repositorioBoleta.delete(b);
            } catch (Exception ignored) {}
        });
        repositorioVenta.delete(venta);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ingresar-directa")
    @Operation(summary = "Ingresar venta directa", description = "Genera venta y detalles desde items del body")
    @Transactional
    public ResponseEntity<RespuestaVenta> ingresarDirecta(@AuthenticationPrincipal UserDetails principal, @RequestBody SolicitudVentaDirecta body){
        if (principal == null) throw new PeticionInvalidaException("Usuario no autenticado");
        if (body == null || body.getItems() == null || body.getItems().isEmpty()) throw new PeticionInvalidaException("Items vacíos");
        Usuario u = repositorioUsuario.findByCorreo(principal.getUsername())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        BigDecimal total = BigDecimal.ZERO;
        for (SolicitudVentaDirecta.Item it : body.getItems()) {
            if (it.getProductoId() == null || it.getCantidad() == null || it.getCantidad() <= 0) throw new PeticionInvalidaException("Item inválido");
            Producto p = repositorioProducto.findById(it.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado"));
            int disponible = Math.max(0, p.getStock() == null ? 0 : p.getStock());
            if (it.getCantidad() > disponible) throw new PeticionInvalidaException("Stock insuficiente para " + p.getNombre() + ". Disponible: " + disponible);
            BigDecimal unitPrice = p.getPrecio();
            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) throw new PeticionInvalidaException("Producto sin precio válido");
            if (u instanceof Cliente cliente && cliente.getTipoCliente() == TipoCliente.VIP) {
                unitPrice = unitPrice.multiply(new java.math.BigDecimal("0.85"));
            }
            total = total.add(unitPrice.multiply(BigDecimal.valueOf(it.getCantidad())));
        }
        Venta venta = Venta.builder()
                .usuario(u)
                .fecha(Instant.now())
                .total(total)
                .metodoPago(body.getMetodoPago())
                .canal(body.getCanal())
                .estadoPago("aceptado")
                .build();
        venta = repositorioVenta.save(venta);
        for (SolicitudVentaDirecta.Item it : body.getItems()) {
            Producto p = repositorioProducto.findById(it.getProductoId()).orElseThrow();
            int nuevoStock = Math.max(0, (p.getStock() == null ? 0 : p.getStock()) - it.getCantidad());
            p.setStock(nuevoStock);
            repositorioProducto.save(p);
            BigDecimal unitPrice = p.getPrecio();
            if (u instanceof Cliente cliente && cliente.getTipoCliente() == TipoCliente.VIP) {
                unitPrice = unitPrice.multiply(new java.math.BigDecimal("0.85"));
            }
            DetalleVenta dv = DetalleVenta.builder()
                    .venta(venta)
                    .producto(p)
                    .cantidad(it.getCantidad())
                    .precioUnitario(unitPrice)
                    .subtotal(unitPrice.multiply(BigDecimal.valueOf(it.getCantidad())))
                    .build();
            repositorioDetalleVenta.save(dv);
        }
        java.math.BigDecimal montoNeto = venta.getTotal();
        java.math.BigDecimal montoIva = montoNeto.multiply(new java.math.BigDecimal("0.19")).setScale(2, java.math.RoundingMode.HALF_UP);
        java.math.BigDecimal montoTotal = montoNeto.add(montoIva);
        Long ultimo = repositorioBoleta.findTopByOrderByNumeroDesc().map(Boleta::getNumero).orElse(1000000L);
        Long numeroBoleta = ultimo + 1;
        Boleta boleta = Boleta.builder()
                .venta(venta)
                .numero(numeroBoleta)
                .fecha(Instant.now())
                .montoNeto(montoNeto)
                .montoIva(montoIva)
                .montoTotal(montoTotal)
                .build();
        boleta = repositorioBoleta.save(boleta);
        for (SolicitudVentaDirecta.Item it : body.getItems()) {
            Producto p = repositorioProducto.findById(it.getProductoId()).orElseThrow();
            java.math.BigDecimal unitPrice = p.getPrecio();
            if (u instanceof Cliente cliente && cliente.getTipoCliente() == TipoCliente.VIP) {
                unitPrice = unitPrice.multiply(new java.math.BigDecimal("0.85"));
            }
            DetalleBoleta db = DetalleBoleta.builder()
                    .boleta(boleta)
                    .producto(p)
                    .cantidad(it.getCantidad())
                    .precioUnitario(unitPrice)
                    .subtotal(unitPrice.multiply(java.math.BigDecimal.valueOf(it.getCantidad())))
                    .build();
            repositorioDetalleBoleta.save(db);
        }
        java.util.UUID uuid = java.util.UUID.randomUUID();
        SeguimientoPedido seg = SeguimientoPedido.builder()
                .venta(venta)
                .createdAt(Instant.now())
                .estadoEnvio("pendiente")
                .numeroSeguimiento(uuid.toString())
                .build();
        seg = repositorioSeguimientoPedido.save(seg);
        RespuestaVenta resp = new RespuestaVenta(venta.getId(), total, body.getItems().stream().mapToInt(SolicitudVentaDirecta.Item::getCantidad).sum(), "Compra registrada exitosamente", seg.getNumeroSeguimiento(), numeroBoleta);
        return ResponseEntity.ok(resp);
    }
 
    @GetMapping("/mias")
    @Operation(summary = "Listar mis ventas")
    @Transactional(readOnly = true)
    public ResponseEntity<java.util.List<OrdenResumen>> misVentas(@AuthenticationPrincipal UserDetails principal){
        if (principal == null) throw new PeticionInvalidaException("Usuario no autenticado");
        Usuario u = repositorioUsuario.findByCorreo(principal.getUsername())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        java.util.List<Venta> ventas = repositorioVenta.findByUsuarioId(u.getId());
        java.util.List<OrdenResumen> out = new java.util.ArrayList<>();
        for (Venta v : ventas) {
            java.util.Optional<SeguimientoPedido> segOpt = repositorioSeguimientoPedido.findFirstByVentaId(v.getId());
            String estadoEnvio = segOpt.map(SeguimientoPedido::getEstadoEnvio).orElse(null);
            String numeroSeguimiento = segOpt.map(SeguimientoPedido::getNumeroSeguimiento).orElse(null);
            Long numeroBoleta = repositorioBoleta.findByVentaId(v.getId()).map(Boleta::getNumero).orElse(null);
            out.add(new OrdenResumen(v.getId(), v.getFecha(), v.getTotal(), v.getEstadoPago(), estadoEnvio, numeroSeguimiento, numeroBoleta));
        }
        return ResponseEntity.ok(out);
    }

    @GetMapping("/mias/detalles")
    @Operation(summary = "Listar mis ventas detalladas")
    @Transactional(readOnly = true)
    public ResponseEntity<java.util.List<OrdenConDetalles>> misVentasDetalladas(@AuthenticationPrincipal UserDetails principal){
        if (principal == null) throw new PeticionInvalidaException("Usuario no autenticado");
        Usuario u = repositorioUsuario.findByCorreo(principal.getUsername())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        java.util.List<Venta> ventas = repositorioVenta.findByUsuarioId(u.getId());
        java.util.List<OrdenConDetalles> out = new java.util.ArrayList<>();
        for (Venta v : ventas) {
            java.util.Optional<SeguimientoPedido> segOpt = repositorioSeguimientoPedido.findFirstByVentaId(v.getId());
            String estadoEnvio = segOpt.map(SeguimientoPedido::getEstadoEnvio).orElse(null);
            String numeroSeguimiento = segOpt.map(SeguimientoPedido::getNumeroSeguimiento).orElse(null);
            java.util.List<DetalleVenta> detalles = repositorioDetalleVenta.findByVentaId(v.getId());
            java.util.List<ItemOrdenDTO> items = new java.util.ArrayList<>();
            for (DetalleVenta dv : detalles) {
                String nombre = dv.getProducto() != null ? dv.getProducto().getNombre() : null;
                items.add(new ItemOrdenDTO(nombre, dv.getCantidad(), dv.getPrecioUnitario(), dv.getSubtotal()));
            }
            Long numeroBoleta = repositorioBoleta.findByVentaId(v.getId()).map(Boleta::getNumero).orElse(null);
            out.add(new OrdenConDetalles(v.getId(), v.getFecha(), v.getTotal(), v.getEstadoPago(), estadoEnvio, numeroSeguimiento, numeroBoleta, items));
        }
        return ResponseEntity.ok(out);
    }
    @GetMapping
    @Operation(summary = "Listar ventas (admin)")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('EMPLEADO','ADMIN')")
    public ResponseEntity<java.util.List<OrdenResumen>> listar(@RequestParam(name = "estadoPago", required = false) String estadoPago,
                                                                                                            @RequestParam(name = "estadoEnvio", required = false) String estadoEnvio){
        java.util.List<Venta> ventas = repositorioVenta.findAll();
        java.util.List<OrdenResumen> out = new java.util.ArrayList<>();
        for (Venta v : ventas) {
            java.util.Optional<SeguimientoPedido> segOpt = repositorioSeguimientoPedido.findFirstByVentaId(v.getId());
            String estadoEnvioActual = segOpt.map(SeguimientoPedido::getEstadoEnvio).orElse(null);
            String numeroSeguimiento = segOpt.map(SeguimientoPedido::getNumeroSeguimiento).orElse(null);
            if (estadoPago != null && v.getEstadoPago() != null && !v.getEstadoPago().equalsIgnoreCase(estadoPago)) continue;
            if (estadoPago != null && v.getEstadoPago() == null) continue;
            if (estadoEnvio != null && estadoEnvioActual != null && !estadoEnvioActual.equalsIgnoreCase(estadoEnvio)) continue;
            if (estadoEnvio != null && estadoEnvioActual == null) continue;
            Long numeroBoleta = repositorioBoleta.findByVentaId(v.getId()).map(Boleta::getNumero).orElse(null);
            out.add(new OrdenResumen(v.getId(), v.getFecha(), v.getTotal(), v.getEstadoPago(), estadoEnvioActual, numeroSeguimiento, numeroBoleta));
        }
        return ResponseEntity.ok(out);
    }
}
