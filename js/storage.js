/**
 * storage.js
 * Gerenciamento de armazenamento local (localStorage)
 */

class Storage {
    /**
     * Prefixo para todas as chaves
     */
    static PREFIX = 'estoque_';

    /**
     * Chaves de configuração
     */
    static KEYS = {
        CONFIG: 'config',
        THEME: 'theme',
        SYNC_DATA: 'sync_data',
        PENDING_CHANGES: 'pending_changes'
    };

    /**
     * Salva configurações
     */
    static saveConfig(config) {
        try {
            const encrypted = {
                githubUser: config.githubUser,
                githubRepo: config.githubRepo,
                githubToken: Utils.simpleEncrypt(config.githubToken || ''),
                lastSync: config.lastSync || new Date().toISOString()
            };
            localStorage.setItem(
                `${this.PREFIX}${this.KEYS.CONFIG}`,
                JSON.stringify(encrypted)
            );
            return true;
        } catch (e) {
            console.error('Erro ao salvar configurações:', e);
            return false;
        }
    }

    /**
     * Carrega configurações
     */
    static loadConfig() {
        try {
            const data = localStorage.getItem(`${this.PREFIX}${this.KEYS.CONFIG}`);
            if (!data) return null;
            
            const config = JSON.parse(data);
            return {
                githubUser: config.githubUser || '',
                githubRepo: config.githubRepo || '',
                githubToken: Utils.simpleDecrypt(config.githubToken || ''),
                lastSync: config.lastSync || null
            };
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
            return null;
        }
    }

    /**
     * Verifica se configuração está completa
     */
    static isConfigValid() {
        const config = this.loadConfig();
        return config && 
               config.githubUser && 
               config.githubRepo && 
               config.githubToken &&
               Utils.isValidGitHubToken(config.githubToken);
    }

    /**
     * Limpa configurações
     */
    static clearConfig() {
        try {
            localStorage.removeItem(`${this.PREFIX}${this.KEYS.CONFIG}`);
            return true;
        } catch (e) {
            console.error('Erro ao limpar configurações:', e);
            return false;
        }
    }

    /**
     * Salva tema (light/dark)
     */
    static saveTheme(theme) {
        try {
            localStorage.setItem(`${this.PREFIX}${this.KEYS.THEME}`, theme);
            return true;
        } catch (e) {
            console.error('Erro ao salvar tema:', e);
            return false;
        }
    }

    /**
     * Carrega tema
     */
    static loadTheme() {
        try {
            return localStorage.getItem(`${this.PREFIX}${this.KEYS.THEME}`) || 'light';
        } catch (e) {
            return 'light';
        }
    }

    /**
     * Salva dados sincronizados
     */
    static saveSyncData(data) {
        try {
            localStorage.setItem(
                `${this.PREFIX}${this.KEYS.SYNC_DATA}`,
                JSON.stringify({
                    data: data,
                    timestamp: new Date().toISOString()
                })
            );
            return true;
        } catch (e) {
            console.error('Erro ao salvar dados sincronizados:', e);
            return false;
        }
    }

    /**
     * Carrega dados sincronizados
     */
    static loadSyncData() {
        try {
            const data = localStorage.getItem(`${this.PREFIX}${this.KEYS.SYNC_DATA}`);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            return parsed.data;
        } catch (e) {
            console.error('Erro ao carregar dados sincronizados:', e);
            return null;
        }
    }

    /**
     * Adiciona mudança pendente
     */
    static addPendingChange(change) {
        try {
            const pending = this.getPendingChanges() || [];
            pending.push({
                ...change,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(
                `${this.PREFIX}${this.KEYS.PENDING_CHANGES}`,
                JSON.stringify(pending)
            );
            return true;
        } catch (e) {
            console.error('Erro ao adicionar mudança pendente:', e);
            return false;
        }
    }

    /**
     * Obtém mudanças pendentes
     */
    static getPendingChanges() {
        try {
            const data = localStorage.getItem(`${this.PREFIX}${this.KEYS.PENDING_CHANGES}`);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Erro ao obter mudanças pendentes:', e);
            return [];
        }
    }

    /**
     * Limpa mudanças pendentes
     */
    static clearPendingChanges() {
        try {
            localStorage.removeItem(`${this.PREFIX}${this.KEYS.PENDING_CHANGES}`);
            return true;
        } catch (e) {
            console.error('Erro ao limpar mudanças pendentes:', e);
            return false;
        }
    }

    /**
     * Obtém espaço de armazenamento disponível
     */
    static getStorageInfo() {
        if (navigator.storage && navigator.storage.estimate) {
            return navigator.storage.estimate();
        }
        return null;
    }

    /**
     * Solicita armazenamento persistente
     */
    static async requestPersistentStorage() {
        if (navigator.storage && navigator.storage.persist) {
            try {
                const persistent = await navigator.storage.persist();
                return persistent;
            } catch (e) {
                console.error('Erro ao solicitar armazenamento persistente:', e);
                return false;
            }
        }
        return false;
    }

    /**
     * Limpa todo o armazenamento
     */
    static clearAll() {
        try {
            const keys = Object.values(this.KEYS);
            keys.forEach(key => {
                localStorage.removeItem(`${this.PREFIX}${key}`);
            });
            return true;
        } catch (e) {
            console.error('Erro ao limpar armazenamento:', e);
            return false;
        }
    }

    /**
     * Exporta dados do localStorage
     */
    static exportData() {
        try {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.PREFIX)) {
                    data[key] = localStorage.getItem(key);
                }
            }
            return data;
        } catch (e) {
            console.error('Erro ao exportar dados:', e);
            return {};
        }
    }

    /**
     * Importa dados para localStorage
     */
    static importData(data) {
        try {
            Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.setItem(key, value);
                }
            });
            return true;
        } catch (e) {
            console.error('Erro ao importar dados:', e);
            return false;
        }
    }
}
