// Abrir modal de compra
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

// Cerrar modal
cerrarCompra.addEventListener('click', () => {
    modalCompra.classList.remove('activo');
});

modalCompra.addEventListener('click', (e) => {
    if (e.target === modalCompra) {
        modalCompra.classList.remove('activo');
    }
});