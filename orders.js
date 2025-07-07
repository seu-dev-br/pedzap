// orders.js

document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.getElementById('orders-table-body');
    const apiBaseUrl = 'http://localhost:3001/api';

    async function loadOrders() {
        try {
            const response = await fetch(`${apiBaseUrl}/orders/all`);
            const result = await response.json();
            const orders = result.orders;
            ordersTableBody.innerHTML = '';
            if (!orders.length) {
                ordersTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Nenhum pedido encontrado.</td></tr>';
                return;
            }
            for (const order of orders) {
                // Busca itens do pedido
                const itemsResp = await fetch(`${apiBaseUrl}/orders/${order.id}/items`);
                const itemsResult = await itemsResp.json();
                const items = itemsResult.items;
                let total = 0;
                let itensStr = '';
                items.forEach(item => {
                    itensStr += `${item.product_name} (x${item.quantity})<br>`;
                    total += item.product_price * item.quantity;
                });
                let statusClass = 'status-aberto';
                if (order.status === 'finalizado') statusClass = 'status-finalizado';
                if (order.status === 'entrega') statusClass = 'status-entrega';
                ordersTableBody.innerHTML += `
                    <tr data-order-id="${order.id}">
                        <td>${order.id}</td>
                        <td class="${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td>
                        <td>${order.user_id}</td>
                        <td>${itensStr}</td>
                        <td>${order.observation || ''}</td>
                        <td>${order.address || ''}</td>
                        <td>${order.payment_method || ''}</td>
                        <td>R$ ${total.toFixed(2).replace('.', ',')}</td>
                        <td>
                            <button class="print-order-btn" data-id="${order.id}">🖨️ Imprimir</button>
                            ${order.status === 'aberto' ? `<button class="entrega-btn" data-id="${order.id}">Saiu para Entrega</button>` : ''}
                            ${order.status !== 'finalizado' ? `<button class="finalizar-btn" data-id="${order.id}">Finalizar</button>` : ''}
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            ordersTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Erro ao carregar pedidos.</td></tr>`;
        }
    }

    ordersTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.classList.contains('print-order-btn')) {
            const row = target.closest('tr');
            if (!row) return;
            const printContent = row.outerHTML;
            const printWindow = window.open('', '', 'width=600,height=600');
            printWindow.document.write(`
                <html><head><title>Imprimir Pedido</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    td, th { border: 1px solid #ccc; padding: 8px; }
                    th { background: #eee; }
                </style>
                </head><body>
                <h2>Pedido #${row.children[0].textContent}</h2>
                <table>${printContent}</table>
                </body></html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            return;
        }
        if (target.classList.contains('entrega-btn')) {
            const id = target.dataset.id;
            await fetch(`${apiBaseUrl}/orders/${id}/entrega`, { method: 'PUT' });
            loadOrders();
        }
        if (target.classList.contains('finalizar-btn')) {
            const id = target.dataset.id;
            await fetch(`${apiBaseUrl}/orders/${id}/finalizar`, { method: 'PUT' });
            loadOrders();
        }
    });

    document.getElementById('print-btn').addEventListener('click', () => {
        window.print();
    });

    loadOrders();
    setInterval(loadOrders, 10000); // Atualiza a cada 10s
});
