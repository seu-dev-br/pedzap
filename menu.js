document.addEventListener('DOMContentLoaded', () => {

    const menuForm = document.getElementById('menu-form');
    const menuTableBody = document.getElementById('menu-table-body');
    const formTitle = document.getElementById('form-title');
    const apiBaseUrl = 'http://localhost:3001/api';

    let currentEditId = null;
    let menuItemsCache = [];

    async function loadMenu() {
        try {
            const response = await fetch(`${apiBaseUrl}/menu`);
            if (!response.ok) {
                throw new Error('Erro ao carregar o cardápio.');
            }
            const result = await response.json();
            menuItemsCache = result.data;

            menuTableBody.innerHTML = '';

            if (menuItemsCache.length === 0) {
                menuTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum item no cardápio ainda.</td></tr>';
                return;
            }

            menuItemsCache.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.category}</td>
                    <td>${item.name}</td>
                    <td>R$ ${Number(item.price).toFixed(2).replace('.', ',')}</td>
                    <td>
                        <button class="outline edit-btn" data-id="${item.id}">Editar</button>
                        <button class="secondary delete-btn" data-id="${item.id}">Excluir</button>
                    </td>
                `;
                menuTableBody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro:', error);
            menuTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Erro ao carregar. Tente reiniciar o app.</td></tr>`;
        }
    }

    // --- Gerenciamento de Categorias ---
    const categorySelect = document.getElementById('category');
    const manageBtn = document.getElementById('manage-categories-btn');
    const manageArea = document.getElementById('manage-categories-area');
    const manageList = document.getElementById('categories-manage-list');

    // Lista de gerenciamento (editar/excluir/adicionar inline)
    async function loadCategoriesManage() {
        const res = await fetch(`${apiBaseUrl}/categories`);
        const data = await res.json();
        manageList.innerHTML = '';
        data.categories.forEach(cat => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.justifyContent = 'space-between';
            li.style.gap = '8px';
            li.style.padding = '6px 0';
            li.innerHTML = `
                <span class="cat-name" style="flex:1;cursor:pointer;display:flex;align-items:center;gap:6px;">
                  <svg width='16' height='16' style='opacity:0.6;' viewBox='0 0 24 24'><path fill='currentColor' d='M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/></svg>
                  <span>${cat.name}</span>
                </span>
                <div style="display:flex;gap:6px;">
                  <button class="secondary delete-cat-btn" data-id="${cat.id}">Excluir</button>
                </div>
            `;
            // Edição inline
            const catNameSpan = li.querySelector('.cat-name');
            catNameSpan.addEventListener('click', async function() {
                const wrapper = this;
                const nameSpan = wrapper.querySelector('span');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = nameSpan.textContent;
                input.style.flex = '1';
                input.style.background = '#fffbe6';
                input.style.border = '2px solid #f7b500';
                input.style.borderRadius = '4px';
                input.style.padding = '4px 8px';
                input.style.fontWeight = 'bold';
                input.addEventListener('blur', async () => {
                    const newName = input.value.trim();
                    if (newName && newName !== nameSpan.textContent) {
                        await fetch(`${apiBaseUrl}/categories/${cat.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: newName })
                        });
                        await loadCategoriesManage();
                        await reloadAllCategories();
                    } else {
                        nameSpan.style.display = '';
                        input.replaceWith(nameSpan);
                    }
                });
                input.addEventListener('keydown', async (e) => {
                    if (e.key === 'Enter') {
                        input.blur();
                    } else if (e.key === 'Escape') {
                        nameSpan.style.display = '';
                        input.replaceWith(nameSpan);
                    }
                });
                nameSpan.replaceWith(input);
                input.focus();
            });
            manageList.appendChild(li);
        });
        // Adicionar campo de adicionar categoria como último item da lista
        const addLi = document.createElement('li');
        addLi.style.display = 'flex';
        addLi.style.alignItems = 'center';
        addLi.style.gap = '8px';
        addLi.style.padding = '6px 0';
        addLi.innerHTML = `
            <input type="text" id="category-name-inline" placeholder="Nova categoria" style="flex:1;max-width:200px;">
            <button id="add-category-inline" style="min-width:120px;">Adicionar</button>
        `;
        manageList.appendChild(addLi);
        // Evento de adicionar categoria
        addLi.querySelector('#add-category-inline').addEventListener('click', async () => {
            const input = addLi.querySelector('#category-name-inline');
            const name = input.value.trim();
            if (!name) return;
            await fetch(`${apiBaseUrl}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            input.value = '';
            await loadCategoriesManage();
            await reloadAllCategories();
        });
        addLi.querySelector('#category-name-inline').addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                addLi.querySelector('#add-category-inline').click();
            }
        });
        // Exclusão
        manageList.querySelectorAll('.delete-cat-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                if (confirm('Deseja realmente excluir esta categoria?')) {
                    await fetch(`${apiBaseUrl}/categories/${id}`, { method: 'DELETE' });
                    await loadCategoriesManage();
                    await reloadAllCategories();
                }
            });
        });
    }

    // Alternar área de gerenciamento dentro do formulário
    manageBtn.addEventListener('click', () => {
        if (manageArea.style.display === 'none') {
            manageArea.style.display = '';
            loadCategoriesManage();
            loadCategoriesSelect(); // força atualização
        } else {
            manageArea.style.display = 'none';
        }
    });

    // Carregar categorias no select ao iniciar
    async function loadCategoriesSelect() {
        const res = await fetch(`${apiBaseUrl}/categories`);
        const data = await res.json();
        categorySelect.innerHTML = '';
        // Aceita tanto 'categories' quanto 'data' como chave
        const categories = data.categories || data.data || [];
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.name;
            opt.textContent = cat.name;
            categorySelect.appendChild(opt);
        });
    }

    // Sempre garantir que o select de categorias seja preenchido
    document.addEventListener('DOMContentLoaded', () => {
        loadCategoriesSelect();
    });

    // Após adicionar, editar ou excluir categoria, atualizar o select
    async function reloadAllCategories() {
        await loadCategoriesSelect();
    }

    // Inicialização
    document.addEventListener('DOMContentLoaded', () => {
        loadCategoriesSelect();
    });

    menuForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(menuForm);
        const itemData = Object.fromEntries(formData.entries());
        itemData.price = Number(itemData.price);

        let url = `${apiBaseUrl}/menu`;
        let method = 'POST';

        if (currentEditId) {
            url = `${apiBaseUrl}/menu/${currentEditId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar o item.');
            }

            menuForm.reset();
            formTitle.textContent = 'Adicionar Novo Item';
            currentEditId = null;

            loadMenu();
            await reloadAllCategories();

        } catch (error) {
            console.error('Erro:', error);
            alert(`Não foi possível salvar o item: ${error.message}`);
        }
    });

    menuTableBody.addEventListener('click', async (event) => {
        const target = event.target;

        if (target && target.classList.contains('delete-btn')) {
            const id = target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este item?')) {
                try {
                    const response = await fetch(`${apiBaseUrl}/menu/${id}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) {
                        throw new Error('Erro ao excluir o item.');
                    }
                    loadMenu();
                } catch (error) {
                    console.error('Erro:', error);
                    alert('Não foi possível excluir o item.');
                }
            }
        }

        if (target && target.classList.contains('edit-btn')) {
            const id = target.dataset.id;
            const itemToEdit = menuItemsCache.find(item => item.id == id);
            
            if (itemToEdit) {
                document.getElementById('category').value = itemToEdit.category;
                document.getElementById('name').value = itemToEdit.name;
                document.getElementById('price').value = itemToEdit.price;
                document.getElementById('description').value = itemToEdit.description;
                
                currentEditId = id;
                formTitle.textContent = `Editando: ${itemToEdit.name}`;
                window.scrollTo(0, 0);
            }
        }
    });

    loadMenu();
});