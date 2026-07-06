/**
 * github-api.js
 * Integração com GitHub REST API
 */

class GitHubAPI {
    static BASE_URL = 'https://api.github.com';
    static DB_FILE = 'database.json';

    /**
     * Obtém configurações
     */
    static getConfig() {
        return Storage.loadConfig();
    }

    /**
     * Testa conexão com GitHub
     */
    static async testConnection() {
        try {
            const config = this.getConfig();
            if (!config || !config.githubToken) {
                return { success: false, error: 'Configuração inválida' };
            }

            const response = await fetch(`${this.BASE_URL}/user`, {
                headers: {
                    'Authorization': `token ${config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, user: data.login };
            } else if (response.status === 401) {
                return { success: false, error: 'Token inválido ou expirado' };
            } else {
                return { success: false, error: `Erro: ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtém informações do repositório
     */
    static async getRepoInfo() {
        try {
            const config = this.getConfig();
            if (!config) throw new Error('Configuração não encontrada');

            const response = await fetch(
                `${this.BASE_URL}/repos/${config.githubUser}/${config.githubRepo}`,
                {
                    headers: {
                        'Authorization': `token ${config.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) throw new Error(`Repositório não encontrado: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter info do repositório:', error);
            throw error;
        }
    }

    /**
     * Obtém conteúdo do arquivo database.json
     */
    static async getDatabaseContent() {
        try {
            const config = this.getConfig();
            if (!config) throw new Error('Configuração não encontrada');

            const response = await fetch(
                `${this.BASE_URL}/repos/${config.githubUser}/${config.githubRepo}/contents/${this.DB_FILE}`,
                {
                    headers: {
                        'Authorization': `token ${config.githubToken}`,
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                }
            );

            if (response.status === 404) {
                return null; // Arquivo não existe
            }

            if (!response.ok) throw new Error(`Erro ao obter arquivo: ${response.status}`);
            
            const content = await response.text();
            return JSON.parse(content);
        } catch (error) {
            if (error.message.includes('404')) {
                return null;
            }
            console.error('Erro ao obter conteúdo do banco de dados:', error);
            throw error;
        }
    }

    /**
     * Obtém SHA do arquivo (necessário para atualizar)
     */
    static async getFileSha() {
        try {
            const config = this.getConfig();
            if (!config) throw new Error('Configuração não encontrada');

            const response = await fetch(
                `${this.BASE_URL}/repos/${config.githubUser}/${config.githubRepo}/contents/${this.DB_FILE}`,
                {
                    headers: {
                        'Authorization': `token ${config.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.status === 404) {
                console.log('Arquivo não existe no repositório');
                return null; // Arquivo não existe
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                console.error('Erro ao obter SHA:', response.status, error);
                throw new Error(`Erro ao obter SHA: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Se tem SHA, retorna
            if (data.sha) {
                console.log('SHA obtido:', data.sha);
                return data.sha;
            }
            
            // Se tem content (base64), calcula SHA do conteúdo
            if (data.content) {
                console.log('SHA não direto, calculando do conteúdo...');
                const sha = await this.calculateSha(data.content);
                console.log('SHA calculado:', sha);
                return sha;
            }
            
            console.error('Não conseguiu obter SHA:', data);
            throw new Error('SHA não retornado pela API');
        } catch (error) {
            if (error.message.includes('404')) {
                return null;
            }
            console.error('Erro ao obter SHA do arquivo:', error);
            throw error;
        }
    }

    /**
     * Calcula SHA1 do conteúdo base64
     */
    static async calculateSha(base64Content) {
        try {
            // Decodifica base64
            const binaryStr = atob(base64Content);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            
            // Calcula SHA1
            const hashBuffer = await crypto.subtle.digest('SHA-1', bytes);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const sha = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return sha;
        } catch (error) {
            console.error('Erro ao calcular SHA:', error);
            throw error;
        }
    }

    /**
     * Cria ou atualiza o arquivo database.json
     */
    static async updateDatabase(content, message = 'Atualizar estoque') {
        try {
            const config = this.getConfig();
            if (!config) throw new Error('Configuração não encontrada');

            const sha = await this.getFileSha();
            const encodedContent = btoa(JSON.stringify(content, null, 2));

            const payload = {
                message: message,
                content: encodedContent,
                branch: 'main'
            };

            if (sha) {
                payload.sha = sha;
            }

            const response = await fetch(
                `${this.BASE_URL}/repos/${config.githubUser}/${config.githubRepo}/contents/${this.DB_FILE}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${config.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao atualizar: ${error.message}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao atualizar banco de dados:', error);
            throw error;
        }
    }

    /**
     * Cria repositório (se não existir)
     */
    static async ensureRepositoryExists() {
        try {
            const config = this.getConfig();
            if (!config) throw new Error('Configuração não encontrada');

            // Tenta obter informações do repositório
            const repoResponse = await fetch(
                `${this.BASE_URL}/repos/${config.githubUser}/${config.githubRepo}`,
                {
                    headers: {
                        'Authorization': `token ${config.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (repoResponse.status === 404) {
                console.error('Repositório não encontrado. Crie em https://github.com/new');
                throw new Error('Repositório não encontrado');
            }

            if (!repoResponse.ok) {
                throw new Error(`Erro ao verificar repositório: ${repoResponse.status}`);
            }

            return true;
        } catch (error) {
            console.error('Erro ao verificar repositório:', error);
            throw error;
        }
    }

    /**
     * Cria arquivo database.json inicial
     */
    static async initializeDatabase() {
        try {
            const initialData = {
                config: {
                    version: '1.0.0',
                    createdAt: new Date().toISOString()
                },
                products: [],
                history: [],
                shoppingList: [],
                statistics: {
                    totalConsumed: 0,
                    lastUpdated: new Date().toISOString()
                }
            };

            await this.updateDatabase(
                initialData,
                'Inicializar banco de dados de estoque'
            );
            return true;
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
            throw error;
        }
    }

    /**
     * Sincroniza mudanças locais com GitHub
     */
    static async syncChanges(database, message = 'Sincronizar alterações') {
        try {
            // Garante que o repositório existe
            await this.ensureRepositoryExists();

            // Atualiza o banco de dados
            const result = await this.updateDatabase(database, message);
            
            return { success: true, result };
        } catch (error) {
            console.error('Erro ao sincronizar mudanças:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Faz pull do banco de dados do GitHub
     */
    static async pullDatabase() {
        try {
            const database = await this.getDatabaseContent();
            
            if (!database) {
                // Se não existe, cria um novo
                console.log('Banco de dados não encontrado. Criando...');
                await this.initializeDatabase();
                return this.getDatabaseContent();
            }

            return database;
        } catch (error) {
            console.error('Erro ao fazer pull do banco de dados:', error);
            throw error;
        }
    }

    /**
     * Commit automático (com nome do produto e tipo de operação)
     */
    static generateCommitMessage(operation, product = null, quantity = null) {
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        
        let message = `[${timestamp}] `;
        
        switch (operation) {
            case 'add':
                message += `Adicionar produto: ${product}`;
                break;
            case 'remove':
                message += `Remover produto: ${product}`;
                break;
            case 'consume':
                message += `Consumir ${quantity}x ${product}`;
                break;
            case 'edit':
                message += `Editar: ${product}`;
                break;
            case 'sync':
                message += 'Sincronização de dados';
                break;
            default:
                message += 'Atualizar estoque';
        }

        return message;
    }
}
