/**
 * ui.js
 * Gerenciamento da interface do usuário
 */

class UI {
    /**
     * Inicializa elementos DOM
     */
    static initializeDOM() {
        this.elements = {
            // Header
            headerTitle: document.querySelector('.header-title'),
            btnSearch: document.getElementById('btn-search'),
            btnTheme: document.getElementById('btn-theme'),
            btnMenu: document.getElementById('btn-menu'),

            // Search
            searchBar: document.getElementById('search-bar'),
            searchInput: document.getElementById('search-input'),
            filterCategory: document.getElementById('filter-category'),
            filterLocation: document.getElementById('filter-location'),

            // Menu
            sidebarMenu: document.getElementById('sidebar-menu'),
            menuOverlay: document.getElementById('menu-overlay'),
            btnCloseMenu: document.getElementById('btn-close-menu'),
            menuItems: document.querySelectorAll('.menu-item'),

            // Main content
            mainContent: document.getElementById('main-content'),
            views: document.querySelectorAll('.view'),

            // Dashboard
            totalProducts: document.getElementById('total-products'),
            expiringProducts: document.getElementById('expiring-products'),
            expiredProducts: document.getElementById('expired-products'),
            missingProducts: document.getElementById('missing-products'),
            alertsSection: document.getElementById('alerts-section'),
            alertsContainer: document.getElementById('alerts-container'),
            expiringSection: document.getElementById('expiring-section'),
            expiringList: document.getElementById('expiring-list'),
            expiredSection: document.getElementById('expired-section'),
            expiredList: document.getElementById('expired-list'),

            // Quick actions
            btnNewProduct: document.getElementById('btn-new-product'),
            btnScanBarcode: document.getElementById('btn-scan-barcode'),
            btnShopping: document.getElementById('btn-shopping-list'),
            btnConsumption: document.getElementById('btn-consumption'),
            fabMenu: document.getElementById('fab-menu'),

            // Inventory
            inventoryList: document.getElementById('inventory-list'),
            btnAddProduct: document.getElementById('btn-add-product'),

            // Shopping list
            shoppingList: document.getElementById('shopping-list'),

            // History
            historyList: document.getElementById('history-list'),
            filterDateStart: document.getElementById('filter-date-start'),
            filterDateEnd: document.getElementById('filter-date-end'),
            filterHistoryType: document.getElementById('filter-history-type'),

            // Settings
            settingGithubToken: document.getElementById('setting-github-token'),
            settingGithubUser: document.getElementById('setting-github-user'),
            settingGithubRepo: document.getElementById('setting-github-repo'),
            btnSaveSettings: document.getElementById('btn-save-settings'),
            btnTestConnection: document.getElementById('btn-test-connection'),

            // Product modal
            productModal: document.getElementById('product-modal'),
            modalTitle: document.getElementById('modal-title'),
            productForm: document.getElementById('product-form'),
            btnCloseModal: document.getElementById('btn-close-modal'),
            btnCancelForm: document.getElementById('btn-cancel-form'),
            modalBody: document.querySelector('.modal-body'),

            // Consumption modal
            consumptionModal: document.getElementById('consumption-modal'),
            consumptionForm: document.getElementById('consumption-form'),
            consumptionProduct: document.getElementById('consumption-product'),
            btnCloseConsumption: document.getElementById('btn-close-consumption'),

            // Toast
            toastContainer: document.getElementById('toast-container'),

            // Menu items
            btnExport: document.getElementById('btn-export'),
            btnImport: document.getElementById('btn-import'),
            btnSync: document.getElementById('btn-sync'),

            // Splash
            splashScreen: document.getElementById('splash-screen')
        };
    }

    /**
     * Define tema
     */
    static setTheme(theme) {
        const body = document.body;
        const html = document.documentElement;

        if (theme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            html.classList.add('dark-mode');
            html.classList.remove('light-mode');
            this.elements.btnTheme.innerHTML = '<span>☀️</span>';
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            html.classList.add('light-mode');
            html.classList.remove('dark-mode');
            this.elements.btnTheme.innerHTML = '<span>🌙</span>';
        }

        Storage.saveTheme(theme);
    }

    /**
     * Detecta preferência de tema do sistema
     */
    static detectSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    /**
     * Muda visualização
     */
    static switchView(viewId) {
        this.elements.views.forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.closeMenu();
    }

    /**
     * Abre/fecha menu
     */
    static toggleMenu() {
        this.elements.sidebarMenu.classList.toggle('hidden');
        this.elements.menuOverlay.classList.toggle('hidden');
    }

    /**
     * Fecha menu
     */
    static closeMenu() {
        this.elements.sidebarMenu.classList.add('hidden');
        this.elements.menuOverlay.classList.add('hidden');
    }

    /**
     * Abre/fecha busca
     */
    static toggleSearch() {
        this.elements.searchBar.classList.toggle('hidden');
        if (!this.elements.searchBar.classList.contains('hidden')) {
            this.elements.searchInput.focus();
        }
    }

    /**
     * Abre modal de produto
     */
    static openProductModal(product = null) {
        this.elements.modalTitle.textContent = product ? 'Editar Produto' : 'Novo Produto';
        this.elements.productModal.classList.remove('hidden');

        if (product) {
            this.populateProductForm(product);
        } else {
            this.elements.productForm.reset();
        }

        this.updateCategoryOptions();
        this.updateLocationOptions();
    }

    /**
     * Fecha modal de produto
     */
    static closeProductModal() {
        this.elements.productModal.classList.add('hidden');
        this.elements.productForm.reset();
    }

    /**
     * Abre modal de consumo
     */
    static openConsumptionModal() {
        this.elements.consumptionModal.classList.remove('hidden');
        this.updateConsumptionProductOptions();
    }

    /**
     * Fecha modal de consumo
     */
    static closeConsumptionModal() {
        this.elements.consumptionModal.classList.add('hidden');
    }

    /**
     * Popula formulário de produto
     */
    static populateProductForm(product) {
        this.elements.productForm.elements.name.value = product.name || '';
        this.elements.productForm.elements.category.value = product.category || '';
        this.elements.productForm.elements.brand.value = product.brand || '';
        this.elements.productForm.elements.quantity.value = product.quantity || '';
        this.elements.productForm.elements.unit.value = product.unit || 'un';
        this.elements.productForm.elements.location.value = product.location || '';
        this.elements.productForm.elements.notes.value = product.notes || '';
        this.elements.productForm.elements.barcode.value = product.barcode || '';

        // Popula valididades
        this.updateValidityItems(product.validities || []);

        // Popula foto
        if (product.photo) {
            const preview = this.elements.productForm.querySelector('#photo-preview');
            preview.innerHTML = `<img src="${product.photo}" alt="Foto">`;
        }
    }

    /**
     * Atualiza opções de categoria
     */
    static updateCategoryOptions() {
        const select = this.elements.productForm.elements.category;
        select.innerHTML = '<option value="">Selecione uma categoria...</option>';

        Config.CATEGORIES.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon} ${category.name}`;
            select.appendChild(option);
        });

        const filterSelect = this.elements.filterCategory;
        filterSelect.innerHTML = '<option value="">Todas as categorias</option>';
        Config.CATEGORIES.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon} ${category.name}`;
            filterSelect.appendChild(option);
        });
    }

    /**
     * Atualiza opções de local
     */
    static updateLocationOptions() {
        const select = this.elements.productForm.elements.location;
        select.innerHTML = '<option value="">Selecione um local...</option>';

        Config.LOCATIONS.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id;
            option.textContent = `${location.icon} ${location.name}`;
            select.appendChild(option);
        });

        const filterSelect = this.elements.filterLocation;
        filterSelect.innerHTML = '<option value="">Todos os locais</option>';
        Config.LOCATIONS.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id;
            option.textContent = `${location.icon} ${location.name}`;
            filterSelect.appendChild(option);
        });
    }

    /**
     * Atualiza itens de validade
     */
    static updateValidityItems(validities = []) {
        const container = document.getElementById('validity-items');
        container.innerHTML = '';

        validities.forEach((validity, index) => {
            const item = document.createElement('div');
            item.className = 'validity-item';
            item.innerHTML = `
                <input type="date" value="${validity}" class="form-input validity-date">
                <button type="button" class="btn-remove-validity">🗑️</button>
            `;

            item.querySelector('.btn-remove-validity').addEventListener('click', (e) => {
                e.preventDefault();
                item.remove();
            });

            container.appendChild(item);
        });
    }

    /**
     * Atualiza opções de consumo
     */
    static updateConsumptionProductOptions() {
        const products = Database.getProducts().filter(p => p.quantity > 0);
        const select = this.elements.consumptionProduct;
        select.innerHTML = '<option value="">Selecione um produto...</option>';

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.quantity} ${product.unit})`;
            select.appendChild(option);
        });
    }

    /**
     * Atualiza dashboard
     */
    static updateDashboard() {
        const stats = Database.getStatistics();
        const expired = Database.getExpiredProducts();
        const expiring = Database.getExpiringProducts(15);

        // Atualiza cards de status
        this.elements.totalProducts.textContent = stats.totalProducts;
        this.elements.expiringProducts.textContent = expiring.length;
        this.elements.expiredProducts.textContent = expired.length;
        this.elements.missingProducts.textContent = stats.outOfStockCount;

        // Atualiza alertas
        this.updateAlertsSection();

        // Atualiza produtos próximos do vencimento
        if (expiring.length > 0) {
            this.elements.expiringSection.classList.remove('hidden');
            this.renderProductsList(expiring.slice(0, 3), this.elements.expiringList);
        } else {
            this.elements.expiringSection.classList.add('hidden');
        }

        // Atualiza produtos vencidos
        if (expired.length > 0) {
            this.elements.expiredSection.classList.remove('hidden');
            this.renderProductsList(expired.slice(0, 3), this.elements.expiredList);
        } else {
            this.elements.expiredSection.classList.add('hidden');
        }
    }

    /**
     * Atualiza seção de alertas
     */
    static updateAlertsSection() {
        const alerts = [];
        const expired = Database.getExpiredProducts();
        const expiring = Database.getExpiringProducts(7);

        // Alertas de produtos vencidos
        expired.slice(0, 3).forEach(product => {
            alerts.push({
                title: '🚫 Produto Vencido',
                message: `${product.name} está vencido e deve ser removido`,
                type: 'danger'
            });
        });

        // Alertas de vencimento próximo
        expiring.slice(0, 3).forEach(product => {
            const latest = product.validities?.[0];
            const days = Utils.daysUntilDate(latest);
            
            let title = '⏰ Próximo de Vencer';
            if (days === 0) title = '🔴 Vence Hoje';
            else if (days === 1) title = '🟠 Vence Amanhã';

            alerts.push({
                title: title,
                message: `${product.name} vence em ${days} dia(s) (${latest})`,
                type: 'warning'
            });
        });

        if (alerts.length > 0) {
            this.elements.alertsSection.classList.remove('hidden');
            this.elements.alertsContainer.innerHTML = alerts.map(alert => `
                <div class="alert ${alert.type}">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
            `).join('');
        } else {
            this.elements.alertsSection.classList.add('hidden');
        }
    }

    /**
     * Renderiza lista de produtos
     */
    static renderProductsList(products, container) {
        if (!container) return;

        container.innerHTML = products.map(product => {
            const latest = product.validities?.[0];
            const days = latest ? Utils.daysUntilDate(latest) : null;
            let validityClass = '';
            let validityText = 'Sem validade';

            if (latest) {
                if (days < 0) {
                    validityClass = 'expired';
                    validityText = `Vencido em ${latest}`;
                } else if (days === 0) {
                    validityClass = 'expiring';
                    validityText = `Vence hoje (${latest})`;
                } else if (days === 1) {
                    validityClass = 'expiring';
                    validityText = `Vence amanhã (${latest})`;
                } else {
                    validityClass = 'expiring';
                    validityText = `Vence em ${days} dias (${latest})`;
                }
            }

            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-details">
                            ${product.brand ? product.brand + ' • ' : ''}
                            ${product.quantity} ${product.unit}
                        </div>
                        <div class="product-validity ${validityClass}">${validityText}</div>
                    </div>
                    <div class="product-actions">
                        <button class="product-action-btn btn-consume" title="Consumir">✓</button>
                        <button class="product-action-btn btn-edit" title="Editar">✏️</button>
                        <button class="product-action-btn btn-delete" title="Deletar">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        // Adiciona event listeners
        container.querySelectorAll('.btn-consume').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.closest('.product-card').dataset.productId;
                App.consumeProduct(productId);
            });
        });

        container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.closest('.product-card').dataset.productId;
                const product = Database.getProduct(productId);
                UI.openProductModal(product);
            });
        });

        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.closest('.product-card').dataset.productId;
                App.deleteProduct(productId);
            });
        });
    }

    /**
     * Atualiza lista de estoque
     */
    static updateInventory() {
        const products = Database.getProducts();
        this.renderProductsList(products, this.elements.inventoryList);
    }

    /**
     * Atualiza lista de compras
     */
    static updateShoppingList() {
        const items = Database.getShoppingList('pending');
        
        if (items.length === 0) {
            this.elements.shoppingList.innerHTML = '<p style="text-align: center; color: var(--color-text-tertiary); padding: var(--spacing-lg);">Lista vazia</p>';
            return;
        }

        this.elements.shoppingList.innerHTML = items.map(item => `
            <div class="shopping-item">
                <input type="checkbox" class="shopping-checkbox" data-item-id="${item.id}">
                <div class="shopping-item-info">
                    <div class="shopping-item-name">${item.productName}</div>
                    <div class="shopping-item-category">${item.quantity} ${item.unit}</div>
                </div>
                <button class="shopping-item-remove" data-item-id="${item.id}">🗑️</button>
            </div>
        `).join('');

        // Event listeners
        this.elements.shoppingList.querySelectorAll('.shopping-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const itemId = e.target.dataset.itemId;
                Database.markShoppingItemAsBought(itemId);
                this.updateShoppingList();
                NotificationManager.showSuccess('Item marcado como comprado');
            });
        });

        this.elements.shoppingList.querySelectorAll('.shopping-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const index = Database.data.shoppingList.findIndex(i => i.id === itemId);
                if (index !== -1) {
                    Database.data.shoppingList.splice(index, 1);
                    this.updateShoppingList();
                    NotificationManager.showSuccess('Item removido da lista');
                }
            });
        });
    }

    /**
     * Atualiza histórico
     */
    static updateHistory() {
        const history = Database.getHistory();

        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<p style="text-align: center; color: var(--color-text-tertiary); padding: var(--spacing-lg);">Sem histórico</p>';
            return;
        }

        this.elements.historyList.innerHTML = history.map(item => {
            const historyType = Config.getHistoryType(item.type);
            return `
                <div class="history-item ${item.type}">
                    <div class="history-header">
                        <div>
                            <div class="history-product">${historyType?.icon || '•'} ${item.productName}</div>
                            <div class="history-details">
                                <span class="history-time">${item.date} ${item.time}</span>
                            </div>
                        </div>
                        <div class="history-type">${historyType?.label || item.type}</div>
                    </div>
                    <div class="history-details">
                        Quantidade: ${item.quantity} ${item.notes ? '| ' + item.notes : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Esconde splash screen
     */
    static hideSplashScreen() {
        if (this.elements.splashScreen) {
            this.elements.splashScreen.classList.add('hidden');
        }
    }

    /**
     * Carrega configurações na UI
     */
    static loadSettingsToUI() {
        const config = Storage.loadConfig();
        if (config) {
            this.elements.settingGithubUser.value = config.githubUser || '';
            this.elements.settingGithubRepo.value = config.githubRepo || '';
            this.elements.settingGithubToken.value = config.githubToken || '';
        }
    }
}
