/**
 * app.js
 * Aplicação principal - Controle de Estoque
 */

class App {
    static lastSyncTime = 0;
    static MIN_SYNC_INTERVAL = 5000; // Mínimo 5 segundos entre syncs automáticos

    static async initialize() {
        console.log('Inicializando aplicação...');

        try {
            // Inicializa UI
            UI.initializeDOM();

            // Configura tema
            const theme = Storage.loadTheme();
            UI.setTheme(theme);

            // Inicializa banco de dados
            await Database.initialize();

            // Carrega configurações na UI
            UI.loadSettingsToUI();

            // Registra eventos
            this.registerEventListeners();

            // Solicita permissão para notificações
            NotificationManager.requestPermission().catch(() => {});

            // Atualiza dashboard
            UI.updateDashboard();

            // Esconde splash screen
            UI.hideSplashScreen();

            // NÃO sincroniza automaticamente na inicialização
            // O usuário pode clicar no botão de sync manualmente se necessário

            console.log('Aplicação inicializada com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            NotificationManager.showError('Erro ao inicializar aplicação');
        }
    }

    /**
     * Registra listeners de eventos
     */
    static registerEventListeners() {
        // Header
        UI.elements.btnTheme.addEventListener('click', () => this.toggleTheme());
        UI.elements.btnMenu.addEventListener('click', () => UI.toggleMenu());
        UI.elements.btnSearch.addEventListener('click', () => UI.toggleSearch());
        UI.elements.btnCloseMenu.addEventListener('click', () => UI.closeMenu());
        UI.elements.menuOverlay.addEventListener('click', () => UI.closeMenu());

        // Menu items
        UI.elements.menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.dataset.view;
                if (view) {
                    UI.switchView(view);
                }
            });
        });

        // Quick actions
        UI.elements.btnNewProduct.addEventListener('click', () => UI.openProductModal());
        UI.elements.btnAddProduct.addEventListener('click', () => UI.openProductModal());
        UI.elements.fabMenu.addEventListener('click', () => UI.openProductModal());
        UI.elements.btnScanBarcode.addEventListener('click', () => this.startBarcodeScanner());
        UI.elements.btnShopping.addEventListener('click', () => UI.switchView('shopping-list'));
        UI.elements.btnConsumption.addEventListener('click', () => UI.openConsumptionModal());

        // Product modal
        UI.elements.btnCloseModal.addEventListener('click', () => UI.closeProductModal());
        UI.elements.btnCancelForm.addEventListener('click', () => UI.closeProductModal());
        UI.elements.productForm.addEventListener('submit', (e) => this.saveProduct(e));

        // Adicionar validade
        document.getElementById('btn-add-validity')?.addEventListener('click', (e) => {
            e.preventDefault();
            const item = document.createElement('div');
            item.className = 'validity-item';
            item.innerHTML = `
                <input type="date" class="form-input validity-date">
                <button type="button" class="btn-remove-validity">🗑️</button>
            `;
            item.querySelector('.btn-remove-validity').addEventListener('click', (e) => {
                e.preventDefault();
                item.remove();
            });
            document.getElementById('validity-items').appendChild(item);
        });

        // Foto
        const photoInput = UI.elements.productForm.elements.photo;
        if (photoInput) {
            photoInput.addEventListener('change', (e) => this.handlePhotoChange(e));
        }

        // Consumo modal
        UI.elements.btnCloseConsumption.addEventListener('click', () => UI.closeConsumptionModal());
        UI.elements.consumptionForm.addEventListener('submit', (e) => this.registerConsumption(e));

        // Busca
        UI.elements.searchInput.addEventListener('input', () => this.performSearch());
        UI.elements.filterCategory.addEventListener('change', () => this.performSearch());
        UI.elements.filterLocation.addEventListener('change', () => this.performSearch());

        // Configurações
        UI.elements.btnSaveSettings.addEventListener('click', () => this.saveSettings());
        UI.elements.btnTestConnection.addEventListener('click', () => this.testConnection());
        
        // Botão para limpar dados locais (se existir)
        const btnClearData = document.getElementById('btn-clear-data');
        if (btnClearData) {
            btnClearData.addEventListener('click', () => this.clearLocalData());
        }

        // Histórico
        UI.elements.filterDateStart.addEventListener('change', () => this.updateHistoryView());
        UI.elements.filterDateEnd.addEventListener('change', () => this.updateHistoryView());
        UI.elements.filterHistoryType.addEventListener('change', () => this.updateHistoryView());

        // Menu extras
        UI.elements.btnExport.addEventListener('click', () => this.exportDatabase());
        UI.elements.btnImport.addEventListener('click', () => this.importDatabase());
        UI.elements.btnSync.addEventListener('click', () => this.syncWithGitHub());

        // Eventos de conexão
        window.addEventListener('online', () => {
            NotificationManager.showSuccess('Conexão restaurada');
            if (Storage.isConfigValid()) {
                this.syncWithGitHub();
            }
        });

        window.addEventListener('offline', () => {
            NotificationManager.showWarning('Sem conexão com a internet');
        });

        // Service Worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'SYNC_REQUESTED') {
                    this.syncWithGitHub();
                }
            });
        }
    }

    /**
     * Alterna tema
     */
    static toggleTheme() {
        const currentTheme = Storage.loadTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        UI.setTheme(newTheme);
        NotificationManager.showInfo(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`);
    }

    /**
     * Salva produto
     */
    static async saveProduct(e) {
        e.preventDefault();

        try {
            const formData = new FormData(UI.elements.productForm);
            
            // Coleta valididades
            const validitiesInput = [];
            document.querySelectorAll('.validity-date').forEach(input => {
                if (input.value) validitiesInput.push(input.value);
            });

            // Replica valididades para cada unidade (FIFO - consumo da mais próxima)
            const quantity = parseInt(formData.get('quantity'));
            const validities = [];
            if (validitiesInput.length > 0 && quantity > 0) {
                // Se tem 1 validade para N unidades, replica
                if (validitiesInput.length === 1) {
                    for (let i = 0; i < quantity; i++) {
                        validities.push(validitiesInput[0]);
                    }
                } else {
                    // Se tem múltiplas valididades, usa como está
                    validities.push(...validitiesInput);
                }
            }

            // Foto
            let photo = null;
            const photoFile = formData.get('photo');
            if (photoFile && photoFile.size > 0) {
                photo = await this.fileToBase64(photoFile);
            }

            const product = {
                id: UI.elements.productForm.dataset.productId || null,
                name: formData.get('name'),
                category: formData.get('category'),
                brand: formData.get('brand'),
                quantity: quantity,
                unit: formData.get('unit'),
                location: formData.get('location'),
                validities: validities,
                notes: formData.get('notes'),
                barcode: formData.get('barcode'),
                photo: photo
            };

            // Validação
            if (!product.name || product.quantity === undefined || product.quantity === null) {
                NotificationManager.showError('Nome e Quantidade são obrigatórios');
                return;
            }

            if (product.id) {
                // Atualizar
                const existing = Database.getProduct(product.id);
                Database.updateProduct(product.id, product);
            } else {
                // Novo
                Database.addProduct(product);
            }

            UI.closeProductModal();
            UI.updateDashboard();
            UI.updateInventory();
            UI.updateShoppingList();

            NotificationManager.showSuccess('Produto salvo com sucesso');

            // Sincroniza se configurado (não aguarda)
            if (Storage.isConfigValid()) {
                this.syncWithGitHubThrottled('add', product.name);
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            NotificationManager.showError('Erro ao salvar produto');
        }
    }

    /**
     * Consome produto
     */
    static async consumeProduct(productId) {
        try {
            const product = Database.getProduct(productId);
            if (!product) return;

            if (product.quantity <= 0) {
                NotificationManager.showWarning('Produto sem estoque');
                return;
            }

            Database.consumeProduct(productId);
            
            UI.updateDashboard();
            UI.updateInventory();
            UI.updateShoppingList();

            NotificationManager.showSuccess(`${product.name} consumido`);

            // Sincroniza (não aguarda)
            if (Storage.isConfigValid()) {
                this.syncWithGitHubThrottled('consume', product.name, 1);
            }
        } catch (error) {
            console.error('Erro ao consumir produto:', error);
            NotificationManager.showError('Erro ao consumir produto');
        }
    }

    /**
     * Deleta produto
     */
    static async deleteProduct(productId) {
        const confirmed = await NotificationManager.confirm(
            'Deseja realmente deletar este produto?',
            'Confirmação'
        );

        if (!confirmed) return;

        try {
            const product = Database.getProduct(productId);
            Database.deleteProduct(productId);

            UI.updateDashboard();
            UI.updateInventory();
            UI.updateShoppingList();

            NotificationManager.showSuccess('Produto deletado');

            // Sincroniza (não aguarda)
            if (Storage.isConfigValid()) {
                this.syncWithGitHubThrottled('remove', product.name);
            }
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            NotificationManager.showError('Erro ao deletar produto');
        }
    }

    /**
     * Registra consumo
     */
    static async registerConsumption(e) {
        e.preventDefault();

        try {
            const productId = UI.elements.consumptionProduct.value;
            const quantityInput = document.getElementById('consumption-quantity');
            const quantity = parseInt(quantityInput.value);

            if (!productId || quantity <= 0) {
                NotificationManager.showError('Dados inválidos');
                return;
            }

            for (let i = 0; i < quantity; i++) {
                this.consumeProduct(productId);
            }

            UI.closeConsumptionModal();
            NotificationManager.showSuccess(`${quantity} unidade(s) consumida(s)`);
        } catch (error) {
            console.error('Erro ao registrar consumo:', error);
            NotificationManager.showError('Erro ao registrar consumo');
        }
    }

    /**
     * Inicia leitor de código de barras
     */
    static async startBarcodeScanner() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                NotificationManager.showError('Navegador não suporta câmera');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            NotificationManager.showInfo('Funcionalidade de leitor de código em desenvolvimento');
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            NotificationManager.showError('Permissão de câmera negada');
        }
    }

    /**
     * Alterna foto para base64
     */
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Processa mudança de foto
     */
    static handlePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const preview = document.getElementById('photo-preview');
        const reader = new FileReader();

        reader.onload = (event) => {
            preview.innerHTML = `<img src="${event.target.result}" alt="Foto">`;
        };

        reader.readAsDataURL(file);
    }

    /**
     * Realiza busca
     */
    static performSearch() {
        const query = UI.elements.searchInput.value;
        const filters = {
            category: UI.elements.filterCategory.value,
            location: UI.elements.filterLocation.value
        };

        const results = Database.searchProducts(query, filters);
        UI.renderProductsList(results, UI.elements.inventoryList);
    }

    /**
     * Atualiza visualização de histórico
     */
    static updateHistoryView() {
        const filters = {
            type: UI.elements.filterHistoryType.value,
            startDate: UI.elements.filterDateStart.value,
            endDate: UI.elements.filterDateEnd.value
        };

        UI.updateHistory();
    }

    /**
     * Salva configurações
     */
    static saveSettings() {
        try {
            const config = {
                githubUser: UI.elements.settingGithubUser.value,
                githubRepo: UI.elements.settingGithubRepo.value,
                githubToken: UI.elements.settingGithubToken.value
            };

            if (!config.githubUser || !config.githubRepo || !config.githubToken) {
                NotificationManager.showError('Preencha todos os campos');
                return;
            }

            if (!Utils.isValidGitHubToken(config.githubToken)) {
                NotificationManager.showWarning('Token pode ser inválido (muito curto)');
            }

            Storage.saveConfig(config);
            NotificationManager.showSuccess('Configurações salvas');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            NotificationManager.showError('Erro ao salvar configurações');
        }
    }

    /**
     * Testa conexão com GitHub
     */
    static async testConnection() {
        try {
            UI.elements.btnTestConnection.disabled = true;
            UI.elements.btnTestConnection.textContent = 'Testando...';

            const result = await GitHubAPI.testConnection();

            UI.elements.btnTestConnection.disabled = false;
            UI.elements.btnTestConnection.textContent = 'Testar Conexão';

            if (result.success) {
                NotificationManager.showSuccess(`Conectado como: ${result.user}`);
            } else {
                NotificationManager.showError(`Erro: ${result.error}`);
            }
        } catch (error) {
            UI.elements.btnTestConnection.disabled = false;
            UI.elements.btnTestConnection.textContent = 'Testar Conexão';
            NotificationManager.showError('Erro ao testar conexão');
        }
    }

    /**
     * Limpa todos os dados locais
     */
    static async clearLocalData() {
        const confirmed = await NotificationManager.confirm(
            'Isso vai deletar TODOS os dados locais do navegador. Tem certeza?',
            'Limpar dados locais'
        );

        if (!confirmed) return;

        try {
            // Limpa localStorage
            localStorage.clear();
            
            // Limpa sessionStorage
            sessionStorage.clear();
            
            // Limpa service worker cache
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
            }

            NotificationManager.showSuccess('Dados locais limpos! Recarregando...');
            
            // Recarrega após 1 segundo
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            NotificationManager.showError('Erro ao limpar dados');
        }
    }

    /**
     * Sincroniza com GitHub com throttle (máximo a cada 5 segundos)
     */
    static async syncWithGitHubThrottled(operation = null, productName = null, quantity = null) {
        const now = Date.now();
        if (now - this.lastSyncTime < this.MIN_SYNC_INTERVAL) {
            console.log('⏱️ Sync ainda em cooldown, aguardando...');
            return;
        }
        this.lastSyncTime = now;
        return this.syncWithGitHub(operation, productName, quantity);
    }

    /**
     * Sincroniza com GitHub
     */
    static async syncWithGitHub(operation = null, productName = null, quantity = null) {
        try {
            if (!Storage.isConfigValid()) {
                NotificationManager.showWarning('Configure GitHub primeiro');
                return;
            }

            if (!Utils.isOnline()) {
                NotificationManager.showWarning('Sem conexão com a internet');
                return;
            }

            const message = GitHubAPI.generateCommitMessage(
                operation || 'sync',
                productName,
                quantity
            );

            const result = await Database.syncWithGitHub(message);

            if (result.success) {
                NotificationManager.showSuccess('Sincronizado com sucesso');
                NotificationManager.notifySync(true);
            } else {
                NotificationManager.showError(`Erro: ${result.error}`);
                NotificationManager.notifySync(false);
            }
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            NotificationManager.showError('Erro ao sincronizar');
        }
    }

    /**
     * Exporta banco de dados
     */
    static exportDatabase() {
        try {
            const json = Database.exportAsJSON();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `estoque-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            NotificationManager.showSuccess('Arquivo exportado');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            NotificationManager.showError('Erro ao exportar');
        }
    }

    /**
     * Importa banco de dados
     */
    static importDatabase() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        if (Database.importFromJSON(event.target.result)) {
                            UI.updateDashboard();
                            UI.updateInventory();
                            UI.updateShoppingList();
                            NotificationManager.showSuccess('Dados importados com sucesso');
                        } else {
                            NotificationManager.showError('Erro ao importar arquivo');
                        }
                    } catch (error) {
                        NotificationManager.showError('Arquivo inválido');
                    }
                };
                reader.readAsText(file);
            });

            input.click();
        } catch (error) {
            console.error('Erro ao importar:', error);
            NotificationManager.showError('Erro ao importar');
        }
    }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
    App.initialize();
});
