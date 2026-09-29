// ===== MENÚ MÓVIL =====
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('activo');
    });
}

document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('activo');
    });
});

// ===== GENERAR CÓDIGO ALEATORIO =====
function generarCodigo() {
    const numero = Math.floor(1000 + Math.random() * 9000);
    return `AP-${numero}`;
}

// ===== FORMULARIO MECÁNICO =====
const formMecanico = document.getElementById('formMecanico');
const modalExito = document.getElementById('modalExito');
const codigoMostrado = document.getElementById('codigoMostrado');
const codigoHidden = document.getElementById('codigoSeguimientoHidden');
const cerrarExito = document.getElementById('cerrarExito');
const btnIrSeguimiento = document.getElementById('btnIrSeguimiento');

if (formMecanico) {
    formMecanico.addEventListener('submit', async function (e) {
        e.preventDefault();

        const codigo = generarCodigo();
        codigoHidden.value = codigo;

        const formData = new FormData(formMecanico);

        try {
            const response = await fetch(formMecanico.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                codigoMostrado.textContent = codigo;
                modalExito.classList.add('activo');
                formMecanico.reset();
            } else {
                alert('Hubo un error al enviar. Intenta de nuevo.');
            }
        } catch (error) {
            alert('Error de conexión. Revisa tu internet.');
        }
    });
}

if (cerrarExito) {
    cerrarExito.addEventListener('click', () => {
        modalExito.classList.remove('activo');
    });
}

if (btnIrSeguimiento) {
    btnIrSeguimiento.addEventListener('click', () => {
        modalExito.classList.remove('activo');
        document.getElementById('seguimiento').scrollIntoView({ behavior: 'smooth' });
    });
}

// ===== MODAL COMPRA =====
const botonesComprar = document.querySelectorAll('.btn-comprar');
const modalCompra = document.getElementById('modalCompra');
const cerrarCompra = document.getElementById('cerrarCompra');
const piezaSeleccionada = document.getElementById('piezaSeleccionada');
const inputPieza = document.getElementById('inputPieza');
const inputPrecio = document.getElementById('inputPrecio');

botonesComprar.forEach(boton => {
    boton.addEventListener('click', () => {
        const pieza = boton.getAttribute('data-pieza');
        const precio = boton.getAttribute('data-precio');

        piezaSeleccionada.textContent = `Pieza: ${pieza} — RD$ ${Number(precio).toLocaleString('es-DO')}`;
        inputPieza.value = pieza;
        inputPrecio.value = `RD$ ${Number(precio).toLocaleString('es-DO')}`;

        modalCompra.classList.add('activo');
    });
});

if (cerrarCompra) {
    cerrarCompra.addEventListener('click', () => {
        modalCompra.classList.remove('activo');
    });
}

modalCompra.addEventListener('click', (e) => {
    if (e.target === modalCompra) {
        modalCompra.classList.remove('activo');
    }
});

// ===== SEGUIMIENTO =====
const btnSeguimiento = document.getElementById('btnSeguimiento');
const codigoInput = document.getElementById('codigoSeguimiento');
const resultado = document.getElementById('resultadoSeguimiento');
const estadoTitulo = document.getElementById('estadoTitulo');
const estadoBadge = document.getElementById('estadoBadge');
const timeline = document.getElementById('timeline');
const estadoMensaje = document.getElementById('estadoMensaje');
const tiempoEstimado = document.getElementById('tiempoEstimado');

const estados = [
    { nombre: 'Solicitada', mensaje: 'Tu solicitud fue recibida correctamente.' },
    { nombre: 'Asignada', mensaje: 'Ya asignamos un mecánico a tu solicitud.' },
    { nombre: 'En camino', mensaje: 'El mecánico está en camino hacia tu ubicación.' },
    { nombre: 'En sitio', mensaje: 'El mecánico ya está en el lugar realizando el diagnóstico.' },
    { nombre: 'Finalizada', mensaje: 'El servicio ha sido completado. ¡Gracias por confiar en nosotros!' }
];

if (btnSeguimiento) {
    btnSeguimiento.addEventListener('click', () => {
        const codigo = codigoInput.value.trim().toUpperCase();

        if (!codigo) {
            alert('Por favor ingresa un código de seguimiento');
            return;
        }

        const estadoIndex = Math.floor(Math.random() * estados.length);
        const estadoActual = estados[estadoIndex];

        // Tiempo estimado aleatorio entre 1 y 48 horas
        const horas = Math.floor(Math.random() * 48) + 1;

        estadoTitulo.textContent = `Orden ${codigo}`;
        estadoBadge.textContent = estadoActual.nombre;
        estadoMensaje.textContent = estadoActual.mensaje;
        tiempoEstimado.innerHTML = `⏱ Tiempo estimado de llegada / finalización: <strong>${horas} hora${horas > 1 ? 's' : ''}</strong>`;

        timeline.innerHTML = '';
        estados.forEach((est, index) => {
            const step = document.createElement('div');
            step.className = 'timeline-step';

            let dotClass = 'timeline-dot';
            if (index < estadoIndex) dotClass += ' completado';
            if (index === estadoIndex) dotClass += ' activo';

            step.innerHTML = `
        <div class="${dotClass}">${index < estadoIndex ? '✓' : index + 1}</div>
        <div class="timeline-label">${est.nombre}</div>
      `;
            timeline.appendChild(step);
        });

        resultado.style.display = 'block';
    });
}

if (codigoInput) {
    codigoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnSeguimiento.click();
        }
    });
}