/**
 * database.js
 * Gerenciamento do banco de dados em memória
 */

class Database {
    static instance = null;
    static data = null;

    /**
     * Inicializa o banco de dados
     */
    static async initialize() {
        try {
            let dbData = null;

            // Tenta carregar do GitHub se configurado
            if (Storage.isConfigValid()) {
                dbData = await GitHubAPI.pullDatabase();
            }

            // Se GitHub vazio, cria banco vazio
            if (!dbData) {
                dbData = this.createEmptyDatabase();
            }

            this.data = dbData;
            return true;
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
            this.data = this.createEmptyDatabase();
            return false;
        }
    }

    /**
     * Cria um banco de dados vazio
     */
    static createEmptyDatabase() {
        return {
            config: {
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                lastSync: null
            },
            products: [],
            history: [],
            shoppingList: [],
            statistics: {
                totalConsumed: 0,
                lastUpdated: new Date().toISOString()
            }
        };
    }

    /**
     * Obtém todos os produtos
     */
    static getProducts() {
        return this.data?.products || [];
    }

    /**
     * Obtém um produto por ID
     */
    static getProduct(id) {
        return this.getProducts().find(p => p.id === id);
    }

    /**
     * Adiciona um novo produto
     */
    static addProduct(product) {
        if (!product.id) {
            product.id = Utils.generateId();
        }

        product.createdAt = new Date().toISOString();
        product.updatedAt = new Date().toISOString();

        this.data.products.push(product);
        this.addHistory('entrada', product.name, product.quantity);
        
        // Se quantidade é 0, adiciona à lista de compras
        if (product.quantity === 0) {
            this.addToShoppingList(product);
        }

        return product;
    }

    /**
     * Atualiza um produto
     */
    static updateProduct(id, updates) {
        const product = this.getProduct(id);
        if (!product) return null;

        const oldQuantity = product.quantity;
        Object.assign(product, updates);
        product.updatedAt = new Date().toISOString();

        // Se quantidade mudou, registra no histórico
        if (oldQuantity !== updates.quantity) {
            const diff = updates.quantity - oldQuantity;
            const type = diff > 0 ? 'entrada' : 'saída';
            this.addHistory(type, product.name, Math.abs(diff));
        }

        return product;
    }

    /**
     * Deleta um produto
     */
    static deleteProduct(id) {
        const index = this.data.products.findIndex(p => p.id === id);
        if (index === -1) return false;

        const product = this.data.products[index];
        this.addHistory('saída', product.name, product.quantity);
        
        // Remove da lista de compras se existir
        this.removeFromShoppingList(id);
        
        this.data.products.splice(index, 1);

        return true;
    }

    /**
     * Busca produtos por critério
     */
    static searchProducts(query, filters = {}) {
        let results = this.getProducts();

        // Filtro por texto
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(p => 
                p.name.toLowerCase().includes(lowerQuery) ||
                (p.brand && p.brand.toLowerCase().includes(lowerQuery)) ||
                (p.barcode && p.barcode.includes(query))
            );
        }

        // Filtro por categoria
        if (filters.category) {
            results = results.filter(p => p.category === filters.category);
        }

        // Filtro por local
        if (filters.location) {
            results = results.filter(p => p.location === filters.location);
        }

        // Filtro por status de validade
        if (filters.validity) {
            results = results.filter(p => {
                if (!p.validities || p.validities.length === 0) return true;
                const latestValidity = p.validities[p.validities.length - 1];
                
                switch (filters.validity) {
                    case 'expired':
                        return Utils.isExpired(latestValidity);
                    case 'expiring':
                        return Utils.isExpiring(latestValidity);
                    case 'valid':
                        return !Utils.isExpired(latestValidity) && !Utils.isExpiring(latestValidity);
                    default:
                        return true;
                }
            });
        }

        return results;
    }

    /**
     * Registra consumo de produto
     */
    static consumeProduct(id, quantity = 1) {
        const product = this.getProduct(id);
        if (!product) return null;

        // Remove vencimento mais próximo
        if (product.validities && product.validities.length > 0) {
            product.validities.splice(0, 1);
        }

        product.quantity = Math.max(0, product.quantity - quantity);
        product.updatedAt = new Date().toISOString();

        this.addHistory('saída', product.name, quantity);

        // Se ficou zerado, adiciona à lista de compras
        if (product.quantity === 0) {
            this.addToShoppingList(product);
        } else {
            this.removeFromShoppingList(id);
        }

        return product;
    }

    /**
     * Retorna ao estoque
     */
    static returnProduct(id, quantity = 1, validity = null) {
        const product = this.getProduct(id);
        if (!product) return null;

        product.quantity += quantity;
        
        if (validity) {
            if (!product.validities) product.validities = [];
            product.validities.push(validity);
            product.validities.sort();
        }

        product.updatedAt = new Date().toISOString();
        this.addHistory('entrada', product.name, quantity);
        
        // Remove da lista de compras
        this.removeFromShoppingList(id);

        return product;
    }

    /**
     * Obtém produtos próximos do vencimento
     */
    static getExpiringProducts(days = 15) {
        return this.getProducts().filter(product => {
            if (!product.validities || product.validities.length === 0) return false;
            
            const latestValidity = product.validities[0];
            const daysLeft = Utils.daysUntilDate(latestValidity);
            
            return daysLeft >= 0 && daysLeft <= days;
        });
    }

    /**
     * Obtém produtos vencidos
     */
    static getExpiredProducts() {
        return this.getProducts().filter(product => {
            if (!product.validities || product.validities.length === 0) return false;
            
            const latestValidity = product.validities[0];
            return Utils.isExpired(latestValidity);
        });
    }

    /**
     * Obtém produtos sem estoque
     */
    static getOutOfStockProducts() {
        return this.getProducts().filter(p => p.quantity === 0);
    }

    /**
     * Adiciona à lista de compras
     */
    static addToShoppingList(product) {
        const exists = this.data.shoppingList.find(item => item.productId === product.id);
        
        if (!exists) {
            this.data.shoppingList.push({
                id: Utils.generateId(),
                productId: product.id,
                productName: product.name,
                category: product.category,
                quantity: 1,
                unit: product.unit,
                completed: false,
                addedAt: new Date().toISOString()
            });
        }

        return true;
    }

    /**
     * Remove da lista de compras
     */
    static removeFromShoppingList(productId) {
        const index = this.data.shoppingList.findIndex(item => item.productId === productId);
        if (index === -1) return false;

        this.data.shoppingList.splice(index, 1);
        return true;
    }

    /**
     * Marca como comprado
     */
    static markShoppingItemAsBought(shoppingItemId) {
        const item = this.data.shoppingList.find(i => i.id === shoppingItemId);
        if (!item) return null;

        item.completed = true;
        item.completedAt = new Date().toISOString();

        return item;
    }

    /**
     * Obtém lista de compras
     */
    static getShoppingList(filter = 'pending') {
        let list = this.data.shoppingList || [];

        if (filter === 'pending') {
            list = list.filter(item => !item.completed);
        } else if (filter === 'completed') {
            list = list.filter(item => item.completed);
        }

        return list;
    }

    /**
     * Adiciona ao histórico
     */
    static addHistory(type, productName, quantity, notes = '') {
        this.data.history.push({
            id: Utils.generateId(),
            type: type,
            productName: productName,
            quantity: quantity,
            notes: notes,
            timestamp: new Date().toISOString(),
            date: Utils.formatDate(new Date()),
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });

        // Limita histórico aos últimos 1000 registros
        if (this.data.history.length > 1000) {
            this.data.history = this.data.history.slice(-1000);
        }

        // Atualiza estatísticas
        if (type === 'saída') {
            this.data.statistics.totalConsumed = 
                (this.data.statistics.totalConsumed || 0) + quantity;
        }
    }

    /**
     * Obtém histórico
     */
    static getHistory(filters = {}) {
        let history = this.data.history || [];

        if (filters.type) {
            history = history.filter(h => h.type === filters.type);
        }

        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
            const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
            
            history = history.filter(h => {
                const itemDate = new Date(h.timestamp).setHours(0, 0, 0, 0);
                return itemDate >= start && itemDate <= end;
            });
        }

        // Ordena por data descrescente
        return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Sincroniza com GitHub
     */
    static async syncWithGitHub(message = null) {
        try {
            if (!Storage.isConfigValid()) {
                return { success: false, error: 'Configuração inválida' };
            }

            this.data.config.lastSync = new Date().toISOString();
            
            const commitMessage = message || 
                GitHubAPI.generateCommitMessage('sync');

            const result = await GitHubAPI.syncChanges(this.data, commitMessage);
            
            return result;
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Exporta dados como JSON
     */
    static exportAsJSON() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * Importa dados de JSON
     */
    static importFromJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            
            // Validação básica
            if (!imported.products || !Array.isArray(imported.products)) {
                throw new Error('Formato inválido: falta campo "products"');
            }

            this.data = imported;
            return true;
        } catch (error) {
            console.error('Erro ao importar JSON:', error);
            return false;
        }
    }

    /**
     * Obtém estatísticas
     */
    static getStatistics() {
        const products = this.getProducts();
        const expired = this.getExpiredProducts();
        const expiring = this.getExpiringProducts();
        const outOfStock = this.getOutOfStockProducts();

        return {
            totalProducts: products.length,
            totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
            expiredCount: expired.length,
            expiringCount: expiring.length,
            outOfStockCount: outOfStock.length,
            totalConsumed: this.data.statistics.totalConsumed || 0,
            shoppingListCount: this.data.shoppingList.length,
            historyCount: this.data.history.length
        };
    }
}
