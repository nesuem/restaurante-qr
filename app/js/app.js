document.addEventListener('DOMContentLoaded', () => {
    // ESTADO
    let menuData = JSON.parse(localStorage.getItem('menuRestaurante')) || [
        { id: 1, nombre: 'Bebidas', platos: [{ id: 101, nombre: 'Refresco', precio: 2.50 }] },
        { id: 2, nombre: 'Entrantes', platos: [{ id: 201, nombre: 'Ensalada', precio: 8.00 }] }
    ];
    let mesasData = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, estado: 'libre' }));
    let pedidosData = [];
    let nextPedidoId = 1;

    // ELEMENTOS DEL DOM
    const mesasGrid = document.getElementById('mesas-grid');
    const pedidosPendientesContainer = document.getElementById('pedidos-pendientes');
    const pedidosConfirmadosContainer = document.getElementById('pedidos-confirmados');

    // RENDERIZADO
    function renderAll() {
        if (window.lucide) lucide.createIcons();
        renderMesas();
        renderComandas();
        // Faltaría renderMenuEditor, lo añadiremos después
    }

    function renderMesas() {
        if (!mesasGrid) return;
        mesasGrid.innerHTML = mesasData.map(mesa => {
            const color = mesa.estado === 'libre' ? 'bg-gray-200' : 'bg-green-500 text-white';
            return `<div class="p-4 rounded-lg text-center shadow-sm ${color}"><div class="font-bold text-2xl">${mesa.id}</div><div>${mesa.estado}</div></div>`;
        }).join('');
    }

    function renderComandas() {
        const pendientes = pedidosData.filter(p => p.estado === 'pendiente');
        const confirmados = pedidosData.filter(p => p.estado === 'confirmado');
        
        if(pedidosPendientesContainer) {
            pedidosPendientesContainer.innerHTML = pendientes.length ? pendientes.map(p => createPedidoCard(p, true)).join('') : `<p class="text-gray-500 italic">No hay pedidos pendientes.</p>`;
        }
        if(pedidosConfirmadosContainer) {
            pedidosConfirmadosContainer.innerHTML = confirmados.length ? confirmados.map(p => createPedidoCard(p, false)).join('') : `<p class="text-gray-500 italic">No hay pedidos en cocina.</p>`;
        }
        if (window.lucide) lucide.createIcons();
    }

    function createPedidoCard(pedido, esPendiente) {
        const itemsHtml = pedido.items.map(item => `<li>${item.cantidad}x ${item.nombre}</li>`).join('');
        const botonHtml = esPendiente ? `<button data-id="${pedido.id}" class="activar-btn w-full mt-4 bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg">Confirmar Pedido</button>` : '';
        return `<div class="bg-white p-4 rounded-lg shadow-md border-l-4 ${esPendiente ? 'border-yellow-400' : 'border-green-400'}"><h4 class="font-bold">Mesa ${pedido.mesaId}</h4><ul>${itemsHtml}</ul>${botonHtml}</div>`;
    }

    // LÓGICA
    function findPlato(platoId) {
        for (const cat of menuData) {
            const plato = cat.platos.find(p => p.id === platoId);
            if (plato) return plato;
        }
        return null;
    }

    function revisarPedidos() {
        const pedidosPendientes = JSON.parse(localStorage.getItem('pedidosPendientes')) || [];
        if (pedidosPendientes.length > 0) {
            pedidosPendientes.forEach(pedido => {
                const mesa = mesasData.find(m => m.id == pedido.mesaId);
                if (mesa) {
                    const fullItems = pedido.items.map(item => ({...findPlato(item.platoId), cantidad: item.cantidad }));
                    pedidosData.push({ id: nextPedidoId++, mesaId: pedido.mesaId, items: fullItems, estado: 'pendiente' });
                    mesa.estado = 'activa';
                }
            });
            localStorage.removeItem('pedidosPendientes');
            renderAll();
        }
    }
    
    // EVENTOS
    document.getElementById('nav-menu').addEventListener('click', e => {
        const link = e.target.closest('.nav-link');
        if (link && link.dataset.target) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(link.dataset.target)?.classList.add('active');
        }
    });

    document.addEventListener('click', e => {
        if (e.target.classList.contains('activar-btn')) {
            const pedidoId = parseInt(e.target.dataset.id);
            const pedido = pedidosData.find(p => p.id === pedidoId);
            if(pedido) {
                pedido.estado = 'confirmado';
                renderAll();
            }
        }
    });

    // INICIALIZACIÓN
    renderAll();
    setInterval(revisarPedidos, 2000);
});