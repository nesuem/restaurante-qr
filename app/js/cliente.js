document.addEventListener('DOMContentLoaded', () => {
    // DATOS (en una app real, vendrían del panel de admin)
    const menuData = JSON.parse(localStorage.getItem('menuRestaurante')) || [
        { id: 1, nombre: 'Bebidas', platos: [{ id: 101, nombre: 'Refresco', precio: 2.50 }] },
        { id: 2, nombre: 'Entrantes', platos: [{ id: 201, nombre: 'Ensalada', precio: 8.00 }] }
    ];
    let carrito = [];
    const mesaId = new URLSearchParams(window.location.search).get('mesa') || '?';
    
    const numeroMesaEl = document.getElementById('numero-mesa');
    const menuContainer = document.getElementById('menu-container');
    const carritoFooter = document.getElementById('carrito-footer');
    const carritoContador = document.getElementById('carrito-contador');
    const carritoTotal = document.getElementById('carrito-total');
    const modal = document.getElementById('pedido-modal');
    const pedidoLista = document.getElementById('pedido-lista');
    const modalTotal = document.getElementById('modal-total');
    const confirmarPedidoBtn = document.getElementById('confirmar-pedido-btn');

    numeroMesaEl.textContent = mesaId;

    function renderMenu() {
        menuContainer.innerHTML = menuData.map(cat => `
            <section><h2 class="text-2xl font-bold mb-4">${cat.nombre}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${cat.platos.map(plato => `
                <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <div><h3 class="font-bold text-lg">${plato.nombre}</h3><p class="text-sm text-gray-500">${plato.precio.toFixed(2)} €</p></div>
                    <button class="btn-anadir bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-lg" data-id="${plato.id}">Añadir</button>
                </div>`).join('')}
            </div></section>`).join('');
    }

    function actualizarVista() {
        const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const precioTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        carritoContador.textContent = totalProductos;
        carritoTotal.textContent = precioTotal.toFixed(2);
        carritoFooter.classList.toggle('hidden', carrito.length === 0);
        modalTotal.textContent = precioTotal.toFixed(2);
        pedidoLista.innerHTML = carrito.map(item => `<div class="flex justify-between items-center py-2 border-b"><p>${item.cantidad}x ${item.nombre}</p><span>${(item.precio * item.cantidad).toFixed(2)} €</span></div>`).join('');
        confirmarPedidoBtn.disabled = carrito.length === 0;
    }

    function anadirAlCarrito(productoId) {
        const plato = menuData.flatMap(c => c.platos).find(p => p.id === productoId);
        if (!plato) return;
        const itemEnCarrito = carrito.find(item => item.id === productoId);
        if (itemEnCarrito) {
            itemEnCarrito.cantidad++;
        } else {
            carrito.push({ id: plato.id, nombre: plato.nombre, precio: plato.precio, cantidad: 1 });
        }
        actualizarVista();
    }

    function enviarPedido() {
        if(carrito.length === 0 || mesaId === '?') return;
        const pedidosPendientes = JSON.parse(localStorage.getItem('pedidosPendientes')) || [];
        pedidosPendientes.push({ mesaId, items: carrito });
        localStorage.setItem('pedidosPendientes', JSON.stringify(pedidosPendientes));
        alert('¡Pedido enviado a cocina!');
        carrito = [];
        actualizarVista();
        modal.classList.add('hidden');
    }

    menuContainer.addEventListener('click', e => {
        if (e.target.classList.contains('btn-anadir')) {
            anadirAlCarrito(parseInt(e.target.dataset.id));
        }
    });
    
    document.getElementById('ver-pedido-btn').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('cerrar-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('confirmar-pedido-btn').addEventListener('click', enviarPedido);

    renderMenu();
});