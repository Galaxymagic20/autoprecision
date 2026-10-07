const PIEZAS_INICIALES = [
    { id: 1, nombre: 'Batería 12V', precio: 6500, stock: 15, emoji: '🔋' },
    { id: 2, nombre: 'Aceite sintético 5W-30', precio: 1850, stock: 40, emoji: '🛢️' },
    { id: 3, nombre: 'Pastillas de freno', precio: 3200, stock: 25, emoji: '🛑' },
    { id: 4, nombre: 'Filtro de aire', precio: 950, stock: 50, emoji: '⚙️' },
    { id: 5, nombre: 'Motor de arranque', precio: 12800, stock: 8, emoji: '🔧' },
    { id: 6, nombre: 'Kit de bujías', precio: 2400, stock: 30, emoji: '💡' }
];

const USUARIOS = [
    { email: 'admin@autoprecision.com', password: 'admin123', rol: 'admin', nombre: 'Administrador' },
    { email: 'carlos@autoprecision.com', password: 'mecanico123', rol: 'mecanico', nombre: 'Carlos', especialidad: 'Batería / eléctricos' },
    { email: 'maria@autoprecision.com', password: 'mecanico123', rol: 'mecanico', nombre: 'María', especialidad: 'Frenos y suspensión' }
];

const ESTADOS = [
    { nombre: 'Solicitada', mensaje: 'Tu solicitud fue recibida correctamente.' },
    { nombre: 'Asignada', mensaje: 'Ya asignamos un mecánico a tu solicitud.' },
    { nombre: 'En camino', mensaje: 'El mecánico está en camino hacia tu ubicación.' },
    { nombre: 'En sitio', mensaje: 'El mecánico ya está en el lugar realizando el diagnóstico.' },
    { nombre: 'Finalizada', mensaje: 'El servicio ha sido completado. ¡Gracias por confiar en nosotros!' }
];

function getData(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function initPiezas() {
    if (!localStorage.getItem('piezas')) saveData('piezas', PIEZAS_INICIALES);
}

function generarCodigo() { return 'AP-' + Math.floor(1000 + Math.random() * 9000); }
function generarFactura() { return 'FAC-' + Date.now().toString().slice(-6); }
function generarTiempo() {
    const mins = Math.floor(Math.random() * (240 - 20 + 1)) + 20;
    if (mins < 60) return mins + ' minutos';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return h === 1 ? '1 hora' : h + ' horas';
    return (h === 1 ? '1 hora' : h + ' horas') + ' y ' + m + ' minutos';
}

function renderPiezas() {
    initPiezas();
    const piezas = getData('piezas');
    const cont = document.getElementById('listaPiezas');
    if (!cont) return;

    cont.innerHTML = piezas.map(p => {
        let stockClass = 'stock-ok';
        let stockText = 'Stock: ' + p.stock;
        if (p.stock === 0) { stockClass = 'stock-agotado'; stockText = 'Agotado'; }
        else if (p.stock <= 5) { stockClass = 'stock-bajo'; stockText = 'Quedan ' + p.stock; }

        return '<div class="producto' + (p.stock === 0 ? ' sin-stock' : '') + '">' +
            '<div class="producto-img">' + p.emoji + '</div>' +
            '<h3>' + p.nombre + '</h3>' +
            '<p class="precio">RD$ ' + p.precio.toLocaleString('es-DO') + '</p>' +
            '<span class="stock-badge ' + stockClass + '">' + stockText + '</span>' +
            (p.stock > 0
                ? '<button class="btn btn-primary btn-comprar" data-id="' + p.id + '" data-pieza="' + p.nombre + '" data-precio="' + p.precio + '">Comprar</button>'
                : '<button class="btn btn-outline" disabled>Sin stock</button>') +
            '</div>';
    }).join('');

    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('piezaSeleccionada').textContent =
                'Pieza: ' + btn.dataset.pieza + ' — RD$ ' + Number(btn.dataset.precio).toLocaleString('es-DO');
            document.getElementById('inputPieza').value = btn.dataset.pieza;
            document.getElementById('inputPrecio').value = btn.dataset.precio;
            document.getElementById('inputPiezaId').value = btn.dataset.id;
            document.getElementById('modalCompra').classList.add('activo');
        });
    });
}

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
if (menuToggle) menuToggle.addEventListener('click', () => nav.classList.toggle('activo'));
document.querySelectorAll('.nav a').forEach(l => l.addEventListener('click', () => nav.classList.remove('activo')));

document.getElementById('formMecanico').addEventListener('submit', function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    const codigo = generarCodigo();
    const tiempo = generarTiempo();
    let mecanicoEmail = 'carlos@autoprecision.com';
    const averia = fd.get('averia');
    if (averia === 'Frenos' || averia === 'Suspensión') mecanicoEmail = 'maria@autoprecision.com';

    const solicitud = {
        id: Date.now(),
        codigo,
        nombre: fd.get('nombre'),
        telefono: fd.get('telefono'),
        vehiculo: fd.get('vehiculo'),
        averia,
        ubicacion: fd.get('ubicacion'),
        descripcion: fd.get('descripcion') || '',
        estado: 'Asignada',
        mecanico: mecanicoEmail,
        tiempoEstimado: tiempo,
        fecha: new Date().toLocaleString('es-DO')
    };

    const sols = getData('solicitudes');
    sols.push(solicitud);
    saveData('solicitudes', sols);

    const facts = getData('facturas');
    facts.push({
        id: Date.now(),
        numero: generarFactura(),
        tipo: 'Servicio a domicilio',
        cliente: solicitud.nombre,
        telefono: solicitud.telefono,
        detalle: averia + ' - ' + solicitud.vehiculo,
        total: 'Por cotizar',
        fecha: solicitud.fecha,
        codigo
    });
    saveData('facturas', facts);

    document.getElementById('contenidoExito').innerHTML =
        '<h3 style="color:#22c55e;margin-bottom:10px;">¡Solicitud enviada!</h3>' +
        '<p style="color:#ccc;margin-bottom:15px;">Guarda tu código de seguimiento:</p>' +
        '<div style="background:#121212;border:2px solid #ff6b00;border-radius:10px;padding:18px;text-align:center;margin-bottom:15px;">' +
        '<div style="font-size:0.9rem;color:#aaa;">Código</div>' +
        '<div style="font-size:2rem;font-weight:700;color:#ff6b00;letter-spacing:2px;">' + codigo + '</div></div>' +
        '<p style="color:#aaa;margin-bottom:8px;">⏱ Tiempo estimado: <strong style="color:#ff6b00;">' + tiempo + '</strong></p>' +
        '<p style="color:#888;font-size:0.9rem;">Un mecánico ya fue asignado. Consulta el estado en Seguimiento.</p>';
    document.getElementById('modalExito').classList.add('activo');
    this.reset();
});

document.getElementById('cerrarExito').addEventListener('click', () => {
    document.getElementById('modalExito').classList.remove('activo');
});

document.getElementById('cerrarCompra').addEventListener('click', () => {
    document.getElementById('modalCompra').classList.remove('activo');
});

document.getElementById('formPedido').addEventListener('submit', function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    const piezaId = Number(document.getElementById('inputPiezaId').value);
    const precio = Number(document.getElementById('inputPrecio').value);
    const piezaNombre = document.getElementById('inputPieza').value;

    const piezas = getData('piezas');
    const idx = piezas.findIndex(p => p.id === piezaId);
    if (idx >= 0) {
        if (piezas[idx].stock <= 0) { alert('Sin stock disponible'); return; }
        piezas[idx].stock -= 1;
        saveData('piezas', piezas);
    }

    const codigo = generarCodigo();
    const facturaNum = generarFactura();
    const tiempo = generarTiempo();
    const itbis = Math.round(precio * 0.18);
    const total = precio + itbis;

    const pedido = {
        id: Date.now(),
        codigo,
        factura: facturaNum,
        pieza: piezaNombre,
        precio, itbis, total,
        nombre: fd.get('nombre'),
        telefono: fd.get('telefono'),
        direccion: fd.get('direccion'),
        tarjeta: (fd.get('tarjeta') || '').slice(-4),
        estado: 'Pendiente',
        tiempoEstimado: tiempo,
        fecha: new Date().toLocaleString('es-DO')
    };

    const pedidos = getData('pedidos');
    pedidos.push(pedido);
    saveData('pedidos', pedidos);

    const facts = getData('facturas');
    facts.push({
        id: Date.now(),
        numero: facturaNum,
        tipo: 'Venta de pieza',
        cliente: pedido.nombre,
        telefono: pedido.telefono,
        detalle: piezaNombre,
        subtotal: precio,
        itbis,
        total,
        fecha: pedido.fecha,
        codigo
    });
    saveData('facturas', facts);

    document.getElementById('modalCompra').classList.remove('activo');
    this.reset();
    renderPiezas();

    document.getElementById('contenidoExito').innerHTML =
        '<h3 style="color:#22c55e;margin-bottom:10px;">¡Pago realizado!</h3>' +
        '<div style="background:#121212;border:1px solid #333;border-radius:10px;padding:18px;margin-bottom:15px;">' +
        '<p><strong>Factura:</strong> ' + facturaNum + '</p>' +
        '<p><strong>Código:</strong> ' + codigo + '</p>' +
        '<p><strong>Pieza:</strong> ' + piezaNombre + '</p>' +
        '<p><strong>Subtotal:</strong> RD$ ' + precio.toLocaleString('es-DO') + '</p>' +
        '<p><strong>ITBIS (18%):</strong> RD$ ' + itbis.toLocaleString('es-DO') + '</p>' +
        '<p style="font-size:1.2rem;color:#ff6b00;margin-top:8px;"><strong>Total:</strong> RD$ ' + total.toLocaleString('es-DO') + '</p></div>' +
        '<p style="color:#aaa;">⏱ Tiempo estimado de entrega: <strong style="color:#ff6b00;">' + tiempo + '</strong></p>';
    document.getElementById('modalExito').classList.add('activo');
});

document.getElementById('btnSeguimiento').addEventListener('click', () => {
    const codigo = document.getElementById('codigoSeguimiento').value.trim().toUpperCase();
    if (!codigo) return alert('Ingresa un código');

    const sols = getData('solicitudes');
    const peds = getData('pedidos');
    let item = sols.find(s => s.codigo === codigo) || peds.find(p => p.codigo === codigo);

    let estadoIndex = 0;
    let mensaje = '';
    let tiempo = '';

    if (item) {
        const idx = ESTADOS.findIndex(e => e.nombre === item.estado);
        estadoIndex = idx >= 0 ? idx : 0;
        mensaje = ESTADOS[estadoIndex].mensaje;
        tiempo = item.tiempoEstimado || generarTiempo();
    } else {
        estadoIndex = Math.floor(Math.random() * ESTADOS.length);
        mensaje = ESTADOS[estadoIndex].mensaje;
        tiempo = generarTiempo();
    }

    document.getElementById('estadoTitulo').textContent = 'Orden ' + codigo;
    document.getElementById('estadoBadge').textContent = ESTADOS[estadoIndex].nombre;
    document.getElementById('estadoMensaje').textContent = mensaje;
    document.getElementById('tiempoEstimado').innerHTML = '⏱ Tiempo estimado: <strong>' + tiempo + '</strong>';

    const tl = document.getElementById('timeline');
    tl.innerHTML = '';
    ESTADOS.forEach((est, i) => {
        const step = document.createElement('div');
        step.className = 'timeline-step';
        let cls = 'timeline-dot';
        if (i < estadoIndex) cls += ' completado';
        if (i === estadoIndex) cls += ' activo';
        step.innerHTML = '<div class="' + cls + '">' + (i < estadoIndex ? '✓' : (i + 1)) + '</div><div class="timeline-label">' + est.nombre + '</div>';
        tl.appendChild(step);
    });

    document.getElementById('resultadoSeguimiento').style.display = 'block';
});

document.getElementById('codigoSeguimiento').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('btnSeguimiento').click();
});

document.getElementById('btnAdminOculto').addEventListener('click', () => {
    document.getElementById('modalLogin').classList.add('activo');
    document.getElementById('errorLogin').style.display = 'none';
});

document.getElementById('cerrarLogin').addEventListener('click', () => {
    document.getElementById('modalLogin').classList.remove('activo');
});

document.getElementById('btnLogin').addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const user = USUARIOS.find(u => u.email === email && u.password === pass);

    if (!user) {
        document.getElementById('errorLogin').style.display = 'block';
        return;
    }

    document.getElementById('modalLogin').classList.remove('activo');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPass').value = '';
    document.body.style.overflow = 'hidden';

    if (user.rol === 'admin') {
        document.getElementById('panelAdmin').style.display = 'block';
        mostrarTabAdmin('solicitudes');
    } else {
        document.getElementById('nombreMecanico').textContent = user.nombre;
        document.getElementById('panelMecanico').style.display = 'block';
        document.getElementById('panelMecanico').dataset.email = user.email;
        renderTrabajosMecanico(user.email);
    }
});

document.getElementById('btnSalirAdmin').addEventListener('click', () => {
    document.getElementById('panelAdmin').style.display = 'none';
    document.body.style.overflow = '';
});

document.getElementById('btnSalirMecanico').addEventListener('click', () => {
    document.getElementById('panelMecanico').style.display = 'none';
    document.body.style.overflow = '';
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        mostrarTabAdmin(btn.dataset.tab);
    });
});

function mostrarTabAdmin(tab) {
    const q = (document.getElementById('buscarAdmin').value || '').toLowerCase();
    let html = '';

    if (tab === 'solicitudes') {
        let data = getData('solicitudes');
        if (q) data = data.filter(s =>
            s.nombre.toLowerCase().includes(q) || s.codigo.toLowerCase().includes(q) || s.telefono.includes(q)
        );
        if (!data.length) html = '<p class="empty-msg">No hay solicitudes</p>';
        data.reverse().forEach(s => {
            const mec = USUARIOS.find(u => u.email === s.mecanico);
            html += '<div class="admin-card"><h4>' + s.codigo + ' — ' + s.nombre + '</h4>' +
                '<p><strong>Tel:</strong> ' + s.telefono + ' | <strong>Vehículo:</strong> ' + s.vehiculo + '</p>' +
                '<p><strong>Avería:</strong> ' + s.averia + ' | <strong>Ubicación:</strong> ' + s.ubicacion + '</p>' +
                '<p><strong>Mecánico:</strong> ' + (mec ? mec.nombre : 'Sin asignar') + ' | <strong>Estado:</strong> ' + s.estado + '</p>' +
                '<p><strong>Fecha:</strong> ' + s.fecha + '</p>' +
                '<select class="estado-select" data-id="' + s.id + '">' +
                ESTADOS.map(e => '<option' + (s.estado === e.nombre ? ' selected' : '') + '>' + e.nombre + '</option>').join('') +
                '<option' + (s.estado === 'Cancelada' ? ' selected' : '') + '>Cancelada</option></select></div>';
        });
    }

    if (tab === 'pedidos') {
        let data = getData('pedidos');
        if (q) data = data.filter(p =>
            p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.telefono.includes(q)
        );
        if (!data.length) html = '<p class="empty-msg">No hay pedidos</p>';
        data.reverse().forEach(p => {
            html += '<div class="admin-card"><h4>' + p.codigo + ' — ' + p.nombre + '</h4>' +
                '<p><strong>Pieza:</strong> ' + p.pieza + ' | <strong>Total:</strong> RD$ ' + Number(p.total).toLocaleString('es-DO') + '</p>' +
                '<p><strong>Tel:</strong> ' + p.telefono + ' | <strong>Dirección:</strong> ' + p.direccion + '</p>' +
                '<p><strong>Factura:</strong> ' + p.factura + ' | <strong>Estado:</strong> ' + p.estado + '</p>' +
                '<p><strong>Fecha:</strong> ' + p.fecha + '</p></div>';
        });
    }

    if (tab === 'facturas') {
        let data = getData('facturas');
        if (q) data = data.filter(f =>
            (f.cliente || '').toLowerCase().includes(q) || (f.numero || '').toLowerCase().includes(q) || (f.codigo || '').toLowerCase().includes(q)
        );
        if (!data.length) html = '<p class="empty-msg">No hay facturas</p>';
        data.reverse().forEach(f => {
            html += '<div class="admin-card"><h4>' + f.numero + '</h4>' +
                '<p><strong>Tipo:</strong> ' + f.tipo + ' | <strong>Cliente:</strong> ' + f.cliente + '</p>' +
                '<p><strong>Detalle:</strong> ' + f.detalle + '</p>' +
                '<p><strong>Total:</strong> ' + (typeof f.total === 'number' ? 'RD$ ' + f.total.toLocaleString('es-DO') : f.total) + '</p>' +
                '<p><strong>Código:</strong> ' + (f.codigo || '-') + ' | <strong>Fecha:</strong> ' + f.fecha + '</p></div>';
        });
    }

    if (tab === 'stock') {
        const piezas = getData('piezas');
        html = '<p style="color:#aaa;margin-bottom:15px;">Edita el stock y guarda los cambios.</p>';
        piezas.forEach(p => {
            html += '<div class="admin-card"><h4>' + p.emoji + ' ' + p.nombre + '</h4>' +
                '<p>Precio: RD$ ' + p.precio.toLocaleString('es-DO') + '</p>' +
                '<div class="stock-row"><label>Stock actual:</label>' +
                '<input type="number" class="stock-input" data-id="' + p.id + '" value="' + p.stock + '" min="0">' +
                '<button class="btn btn-primary btn-sm btn-guardar-stock" data-id="' + p.id + '">Guardar</button></div></div>';
        });
    }

    if (tab === 'mecanicos') {
        const mecs = USUARIOS.filter(u => u.rol === 'mecanico');
        mecs.forEach(m => {
            const trabajos = getData('solicitudes').filter(s => s.mecanico === m.email && s.estado !== 'Finalizada' && s.estado !== 'Cancelada');
            html += '<div class="admin-card"><h4>' + m.nombre + '</h4>' +
                '<p><strong>Email:</strong> ' + m.email + '</p>' +
                '<p><strong>Especialidad:</strong> ' + (m.especialidad || '-') + '</p>' +
                '<p><strong>Trabajos activos:</strong> ' + trabajos.length + '</p></div>';
        });
    }

    document.getElementById('contenidoAdmin').innerHTML = html;

    document.querySelectorAll('.estado-select').forEach(sel => {
        sel.addEventListener('change', function () {
            const id = Number(this.dataset.id);
            const sols = getData('solicitudes');
            const i = sols.findIndex(s => s.id === id);
            if (i >= 0) { sols[i].estado = this.value; saveData('solicitudes', sols); }
        });
    });

    document.querySelectorAll('.btn-guardar-stock').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = Number(this.dataset.id);
            const input = document.querySelector('.stock-input[data-id="' + id + '"]');
            const val = Math.max(0, Number(input.value) || 0);
            const piezas = getData('piezas');
            const i = piezas.findIndex(p => p.id === id);
            if (i >= 0) {
                piezas[i].stock = val;
                saveData('piezas', piezas);
                renderPiezas();
                this.textContent = '✓ Guardado';
                setTimeout(() => { this.textContent = 'Guardar'; }, 1500);
            }
        });
    });
}

document.getElementById('buscarAdmin').addEventListener('input', () => {
    const tab = document.querySelector('.tab-btn.activo');
    if (tab) mostrarTabAdmin(tab.dataset.tab);
});

function renderTrabajosMecanico(email) {
    const sols = getData('solicitudes').filter(s => s.mecanico === email);
    const cont = document.getElementById('listaTrabajosMecanico');
    const activos = sols.filter(s => s.estado !== 'Finalizada' && s.estado !== 'Cancelada');
    const finalizados = sols.filter(s => s.estado === 'Finalizada');

    if (!activos.length && !finalizados.length) {
        cont.innerHTML = '<p class="empty-msg">No tienes trabajos asignados todavía.</p>';
        return;
    }

    let html = '';

    if (activos.length) {
        html += '<p style="color:#aaa;margin-bottom:12px;font-size:0.9rem;">Activos</p>';
        activos.reverse().forEach(s => {
            html += '<div class="trabajo-card"><h4>' + s.codigo + '</h4>' +
                '<p><strong>Avería:</strong> ' + s.averia + '</p>' +
                '<p><strong>Vehículo:</strong> ' + s.vehiculo + '</p>' +
                '<p><strong>Ubicación:</strong> ' + s.ubicacion + '</p>' +
                (s.descripcion ? '<p><strong>Notas:</strong> ' + s.descripcion + '</p>' : '') +
                '<p><strong>Estado actual:</strong> <span style="color:#ff6b00;">' + s.estado + '</span></p>' +
                '<div class="acciones">';
            if (s.estado !== 'En camino' && s.estado !== 'En sitio' && s.estado !== 'Finalizada') {
                html += '<button class="btn-estado btn-camino" data-id="' + s.id + '" data-estado="En camino">Voy en camino</button>';
            }
            if (s.estado === 'En camino') {
                html += '<button class="btn-estado btn-sitio" data-id="' + s.id + '" data-estado="En sitio">Ya estoy en el sitio</button>';
            }
            if (s.estado === 'En sitio' || s.estado === 'En camino') {
                html += '<button class="btn-estado btn-finalizada" data-id="' + s.id + '" data-estado="Finalizada">Marcar finalizado</button>';
            }
            html += '</div></div>';
        });
    }

    if (finalizados.length) {
        html += '<p style="color:#666;margin:25px 0 12px;font-size:0.9rem;">Completados</p>';
        finalizados.slice(-5).reverse().forEach(s => {
            html += '<div class="trabajo-card" style="opacity:0.7;border-left-color:#22c55e;">' +
                '<h4>' + s.codigo + ' ✓</h4>' +
                '<p>' + s.averia + ' — ' + s.vehiculo + '</p>' +
                '<p style="color:#22c55e;">Finalizada</p></div>';
        });
    }

    cont.innerHTML = html;

    cont.querySelectorAll('.btn-estado').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = Number(this.dataset.id);
            const nuevoEstado = this.dataset.estado;
            const sols = getData('solicitudes');
            const i = sols.findIndex(s => s.id === id);
            if (i >= 0) {
                sols[i].estado = nuevoEstado;
                saveData('solicitudes', sols);
                renderTrabajosMecanico(email);
            }
        });
    });
}

renderPiezas();
