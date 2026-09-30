// ===== UTILIDADES =====
function generarCodigo() {
    return 'AP-' + Math.floor(1000 + Math.random() * 9000);
}

function generarFactura() {
    return 'FAC-' + Date.now().toString().slice(-6);
}

function generarTiempoEstimado() {
    const totalMinutos = Math.floor(Math.random() * (240 - 20 + 1)) + 20;
    if (totalMinutos < 60) return totalMinutos + ' minutos';
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    if (minutos === 0) return horas === 1 ? '1 hora' : horas + ' horas';
    return (horas === 1 ? '1 hora' : horas + ' horas') + ' y ' + minutos + ' minutos';
}

function getData(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ===== MENÚ MÓVIL =====
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
if (menuToggle) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('activo'));
}
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('activo'));
});

// ===== FORMULARIO MECÁNICO =====
const formMecanico = document.getElementById('formMecanico');
const modalExito = document.getElementById('modalExito');
const contenidoExito = document.getElementById('contenidoExito');
const cerrarExito = document.getElementById('cerrarExito');

if (formMecanico) {
    formMecanico.addEventListener('submit', function (e) {
        e.preventDefault();
        const fd = new FormData(formMecanico);
        const codigo = generarCodigo();
        const tiempo = generarTiempoEstimado();

        const solicitud = {
            id: Date.now(),
            codigo: codigo,
            nombre: fd.get('nombre'),
            telefono: fd.get('telefono'),
            vehiculo: fd.get('vehiculo'),
            averia: fd.get('averia'),
            ubicacion: fd.get('ubicacion'),
            descripcion: fd.get('descripcion') || '',
            estado: 'Solicitada',
            tiempoEstimado: tiempo,
            fecha: new Date().toLocaleString('es-DO')
        };

        const solicitudes = getData('solicitudes');
        solicitudes.push(solicitud);
        saveData('solicitudes', solicitudes);

        // También guardamos una factura básica
        const facturas = getData('facturas');
        facturas.push({
            id: Date.now(),
            numero: generarFactura(),
            tipo: 'Servicio a domicilio',
            cliente: solicitud.nombre,
            telefono: solicitud.telefono,
            detalle: solicitud.averia + ' - ' + solicitud.vehiculo,
            total: 'Por cotizar',
            fecha: solicitud.fecha,
            codigo: codigo
        });
        saveData('facturas', facturas);

        contenidoExito.innerHTML = `
      <h3 style="color:#22c55e; margin-bottom:10px;">¡Solicitud enviada!</h3>
      <p style="color:#ccc; margin-bottom:15px;">Guarda tu código de seguimiento:</p>
      <div style="background:#121212; border:2px solid #ff6b00; border-radius:10px; padding:18px; text-align:center; margin-bottom:15px;">
        <div style="font-size:0.9rem; color:#aaa;">Código</div>
        <div style="font-size:2rem; font-weight:700; color:#ff6b00; letter-spacing:2px;">${codigo}</div>
      </div>
      <p style="color:#aaa; margin-bottom:8px;">⏱ Tiempo estimado de llegada: <strong style="color:#ff6b00;">${tiempo}</strong></p>
      <p style="color:#888; font-size:0.9rem;">Puedes consultar el estado en la sección Seguimiento.</p>
    `;
        modalExito.classList.add('activo');
        formMecanico.reset();
    });
}

if (cerrarExito) {
    cerrarExito.addEventListener('click', () => modalExito.classList.remove('activo'));
}

// ===== COMPRA DE PIEZAS =====
const botonesComprar = document.querySelectorAll('.btn-comprar');
const modalCompra = document.getElementById('modalCompra');
const cerrarCompra = document.getElementById('cerrarCompra');
const piezaSeleccionada = document.getElementById('piezaSeleccionada');
const inputPieza = document.getElementById('inputPieza');
const inputPrecio = document.getElementById('inputPrecio');
const formPedido = document.getElementById('formPedido');

botonesComprar.forEach(btn => {
    btn.addEventListener('click', () => {
        const pieza = btn.getAttribute('data-pieza');
        const precio = btn.getAttribute('data-precio');
        piezaSeleccionada.textContent = `Pieza: ${pieza} — RD$ ${Number(precio).toLocaleString('es-DO')}`;
        inputPieza.value = pieza;
        inputPrecio.value = precio;
        modalCompra.classList.add('activo');
    });
});

if (cerrarCompra) {
    cerrarCompra.addEventListener('click', () => modalCompra.classList.remove('activo'));
}

if (formPedido) {
    formPedido.addEventListener('submit', function (e) {
        e.preventDefault();
        const fd = new FormData(formPedido);
        const codigo = generarCodigo();
        const facturaNum = generarFactura();
        const tiempo = generarTiempoEstimado();
        const precio = Number(inputPrecio.value);
        const itbis = Math.round(precio * 0.18);
        const total = precio + itbis;

        const pedido = {
            id: Date.now(),
            codigo: codigo,
            factura: facturaNum,
            pieza: inputPieza.value,
            precio: precio,
            itbis: itbis,
            total: total,
            nombre: fd.get('nombre'),
            telefono: fd.get('telefono'),
            direccion: fd.get('direccion'),
            tarjeta: fd.get('tarjeta').slice(-4),
            estado: 'Pendiente',
            tiempoEstimado: tiempo,
            fecha: new Date().toLocaleString('es-DO')
        };

        const pedidos = getData('pedidos');
        pedidos.push(pedido);
        saveData('pedidos', pedidos);

        const facturas = getData('facturas');
        facturas.push({
            id: Date.now(),
            numero: facturaNum,
            tipo: 'Venta de pieza',
            cliente: pedido.nombre,
            telefono: pedido.telefono,
            detalle: pedido.pieza,
            subtotal: precio,
            itbis: itbis,
            total: total,
            fecha: pedido.fecha,
            codigo: codigo
        });
        saveData('facturas', facturas);

        modalCompra.classList.remove('activo');
        formPedido.reset();

        contenidoExito.innerHTML = `
      <h3 style="color:#22c55e; margin-bottom:10px;">¡Pago realizado!</h3>
      <p style="color:#ccc; margin-bottom:15px;">Tu factura digital:</p>
      <div style="background:#121212; border:1px solid #333; border-radius:10px; padding:18px; margin-bottom:15px;">
        <p><strong>Factura:</strong> ${facturaNum}</p>
        <p><strong>Código:</strong> ${codigo}</p>
        <p><strong>Pieza:</strong> ${pedido.pieza}</p>
        <p><strong>Subtotal:</strong> RD$ ${precio.toLocaleString('es-DO')}</p>
        <p><strong>ITBIS (18%):</strong> RD$ ${itbis.toLocaleString('es-DO')}</p>
        <p style="font-size:1.2rem; color:#ff6b00; margin-top:8px;"><strong>Total:</strong> RD$ ${total.toLocaleString('es-DO')}</p>
      </div>
      <p style="color:#aaa;">⏱ Tiempo estimado de entrega: <strong style="color:#ff6b00;">${tiempo}</strong></p>
    `;
        modalExito.classList.add('activo');
    });
}

// ===== SEGUIMIENTO =====
const btnSeguimiento = document.getElementById('btnSeguimiento');
const codigoInput = document.getElementById('codigoSeguimiento');
const resultado = document.getElementById('resultadoSeguimiento');
const estadoTitulo = document.getElementById('estadoTitulo');
const estadoBadge = document.getElementById('estadoBadge');
const timeline = document.getElementById('timeline');
const estadoMensaje = document.getElementById('estadoMensaje');
const tiempoEstimadoEl = document.getElementById('tiempoEstimado');

const estadosLista = [
    { nombre: 'Solicitada', mensaje: 'Tu solicitud fue recibida correctamente.' },
    { nombre: 'Asignada', mensaje: 'Ya asignamos un mecánico a tu solicitud.' },
    { nombre: 'En camino', mensaje: 'El mecánico está en camino hacia tu ubicación.' },
    { nombre: 'En sitio', mensaje: 'El mecánico ya está en el lugar realizando el diagnóstico.' },
    { nombre: 'Finalizada', mensaje: 'El servicio ha sido completado. ¡Gracias por confiar en nosotros!' }
];

if (btnSeguimiento) {
    btnSeguimiento.addEventListener('click', () => {
        const codigo = codigoInput.value.trim().toUpperCase();
        if (!codigo) return alert('Ingresa un código de seguimiento');

        // Buscar en solicitudes y pedidos guardados
        const solicitudes = getData('solicitudes');
        const pedidos = getData('pedidos');
        let item = solicitudes.find(s => s.codigo === codigo) || pedidos.find(p => p.codigo === codigo);

        let estadoIndex = 0;
        let mensaje = '';
        let tiempo = '';

        if (item) {
            const idx = estadosLista.findIndex(e => e.nombre === item.estado);
            estadoIndex = idx >= 0 ? idx : 0;
            mensaje = estadosLista[estadoIndex].mensaje;
            tiempo = item.tiempoEstimado || generarTiempoEstimado();
        } else {
            // Simulación si no existe
            estadoIndex = Math.floor(Math.random() * estadosLista.length);
            mensaje = estadosLista[estadoIndex].mensaje;
            tiempo = generarTiempoEstimado();
        }

        estadoTitulo.textContent = `Orden ${codigo}`;
        estadoBadge.textContent = estadosLista[estadoIndex].nombre;
        estadoMensaje.textContent = mensaje;
        tiempoEstimadoEl.innerHTML = `⏱ Tiempo estimado: <strong>${tiempo}</strong>`;

        timeline.innerHTML = '';
        estadosLista.forEach((est, index) => {
            const step = document.createElement('div');
            step.className = 'timeline-step';
            let dotClass = 'timeline-dot';
            if (index < estadoIndex) dotClass += ' completado';
            if (index === estadoIndex) dotClass += ' activo';
            step.innerHTML = `<div class="${dotClass}">${index < estadoIndex ? '✓' : index + 1}</div><div class="timeline-label">${est.nombre}</div>`;
            timeline.appendChild(step);
        });

        resultado.style.display = 'block';
    });
}

if (codigoInput) {
    codigoInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') btnSeguimiento.click();
    });
}

// ===== ADMIN =====
const btnAdminOculto = document.getElementById('btnAdminOculto');
const modalLogin = document.getElementById('modalLogin');
const cerrarLogin = document.getElementById('cerrarLogin');
const btnLogin = document.getElementById('btnLogin');
const adminEmail = document.getElementById('adminEmail');
const adminPass = document.getElementById('adminPass');
const errorLogin = document.getElementById('errorLogin');
const panelAdmin = document.getElementById('panelAdmin');
const btnSalirAdmin = document.getElementById('btnSalirAdmin');
const contenidoAdmin = document.getElementById('contenidoAdmin');
const buscarAdmin = document.getElementById('buscarAdmin');

const ADMIN_EMAIL = 'admin@autoprecision.com';
const ADMIN_PASS = 'admin123';

if (btnAdminOculto) {
    btnAdminOculto.addEventListener('click', () => {
        modalLogin.classList.add('activo');
        errorLogin.style.display = 'none';
    });
}

if (cerrarLogin) {
    cerrarLogin.addEventListener('click', () => modalLogin.classList.remove('activo'));
}

if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        if (adminEmail.value.trim() === ADMIN_EMAIL && adminPass.value === ADMIN_PASS) {
            modalLogin.classList.remove('activo');
            panelAdmin.style.display = 'block';
            document.body.style.overflow = 'hidden';
            mostrarTab('solicitudes');
        } else {
            errorLogin.style.display = 'block';
        }
    });
}

if (btnSalirAdmin) {
    btnSalirAdmin.addEventListener('click', () => {
        panelAdmin.style.display = 'none';
        document.body.style.overflow = '';
        adminEmail.value = '';
        adminPass.value = '';
    });
}

// Tabs admin
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        mostrarTab(btn.getAttribute('data-tab'));
    });
});

function mostrarTab(tab) {
    let html = '';
    const q = (buscarAdmin.value || '').toLowerCase();

    if (tab === 'solicitudes') {
        let data = getData('solicitudes');
        if (q) data = data.filter(s =>
            s.nombre.toLowerCase().includes(q) ||
            s.codigo.toLowerCase().includes(q) ||
            s.telefono.includes(q)
        );
        if (data.length === 0) html = '<p style="color:#888;">No hay solicitudes.</p>';
        data.reverse().forEach(s => {
            html += `
        <div class="admin-card">
          <h4>${s.codigo} — ${s.nombre}</h4>
          <p><strong>Teléfono:</strong> ${s.telefono}</p>
          <p><strong>Vehículo:</strong> ${s.vehiculo}</p>
          <p><strong>Avería:</strong> ${s.averia}</p>
          <p><strong>Ubicación:</strong> ${s.ubicacion}</p>
          <p><strong>Fecha:</strong> ${s.fecha}</p>
          <p><strong>Tiempo est.:</strong> ${s.tiempoEstimado || '-'}</p>
          <select class="estado-select" data-id="${s.id}" data-tipo="solicitud">
            <option ${s.estado === 'Solicitada' ? 'selected' : ''}>Solicitada</option>
            <option ${s.estado === 'Asignada' ? 'selected' : ''}>Asignada</option>
            <option ${s.estado === 'En camino' ? 'selected' : ''}>En camino</option>
            <option ${s.estado === 'En sitio' ? 'selected' : ''}>En sitio</option>
            <option ${s.estado === 'Finalizada' ? 'selected' : ''}>Finalizada</option>
            <option ${s.estado === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
          </select>
        </div>`;
        });
    }

    if (tab === 'pedidos') {
        let data = getData('pedidos');
        if (q) data = data.filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            p.codigo.toLowerCase().includes(q) ||
            p.telefono.includes(q)
        );
        if (data.length === 0) html = '<p style="color:#888;">No hay pedidos.</p>';
        data.reverse().forEach(p => {
            html += `
        <div class="admin-card">
          <h4>${p.codigo} — ${p.nombre}</h4>
          <p><strong>Pieza:</strong> ${p.pieza}</p>
          <p><strong>Total:</strong> RD$ ${Number(p.total).toLocaleString('es-DO')}</p>
          <p><strong>Teléfono:</strong> ${p.telefono}</p>
          <p><strong>Dirección:</strong> ${p.direccion}</p>
          <p><strong>Factura:</strong> ${p.factura}</p>
          <p><strong>Fecha:</strong> ${p.fecha}</p>
          <p><strong>Estado:</strong> ${p.estado}</p>
        </div>`;
        });
    }

    if (tab === 'facturas') {
        let data = getData('facturas');
        if (q) data = data.filter(f =>
            (f.cliente || '').toLowerCase().includes(q) ||
            (f.numero || '').toLowerCase().includes(q) ||
            (f.codigo || '').toLowerCase().includes(q)
        );
        if (data.length === 0) html = '<p style="color:#888;">No hay facturas.</p>';
        data.reverse().forEach(f => {
            html += `
        <div class="admin-card">
          <h4>${f.numero}</h4>
          <p><strong>Tipo:</strong> ${f.tipo}</p>
          <p><strong>Cliente:</strong> ${f.cliente}</p>
          <p><strong>Detalle:</strong> ${f.detalle}</p>
          <p><strong>Total:</strong> ${typeof f.total === 'number' ? 'RD$ ' + f.total.toLocaleString('es-DO') : f.total}</p>
          <p><strong>Código:</strong> ${f.codigo || '-'}</p>
          <p><strong>Fecha:</strong> ${f.fecha}</p>
        </div>`;
        });
    }

    contenidoAdmin.innerHTML = html;

    // Cambiar estado de solicitudes
    document.querySelectorAll('.estado-select').forEach(sel => {
        sel.addEventListener('change', function () {
            const id = Number(this.getAttribute('data-id'));
            const solicitudes = getData('solicitudes');
            const idx = solicitudes.findIndex(s => s.id === id);
            if (idx >= 0) {
                solicitudes[idx].estado = this.value;
                saveData('solicitudes', solicitudes);
            }
        });
    });
}

if (buscarAdmin) {
    buscarAdmin.addEventListener('input', () => {
        const tabActivo = document.querySelector('.tab-btn.activo');
        if (tabActivo) mostrarTab(tabActivo.getAttribute('data-tab'));
    });
}
