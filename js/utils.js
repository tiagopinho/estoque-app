/**
 * utils.js
 * Funções utilitárias gerais
 */

class Utils {
    /**
     * Formata data para o padrão brasileiro
     */
    static formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return `${day}/${month}/${year}`;
    }

    /**
     * Converte data do formato DD/MM/YYYY para Date
     */
    static parseDate(dateStr) {
        if (!dateStr) return null;
        
        // Suporta ambos os formatos: DD/MM/YYYY e YYYY-MM-DD
        let day, month, year;
        
        if (dateStr.includes('-')) {
            // Formato ISO: YYYY-MM-DD
            [year, month, day] = dateStr.split('-');
        } else {
            // Formato brasileiro: DD/MM/YYYY
            [day, month, year] = dateStr.split('/');
        }
        
        return new Date(year, month - 1, day);
    }

    /**
     * Formata data e hora
     */
    static formatDateTime(date) {
        const d = new Date(date);
        const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${this.formatDate(d)} ${time}`;
    }

    /**
     * Calcula dias até a data
     */
    static daysUntilDate(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const targetDate = this.parseDate(dateStr);
        if (!targetDate) return null;
        
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    /**
     * Verifica se data está vencida
     */
    static isExpired(dateStr) {
        return this.daysUntilDate(dateStr) < 0;
    }

    /**
     * Verifica se data está próxima do vencimento (15 dias)
     */
    static isExpiring(dateStr) {
        const days = this.daysUntilDate(dateStr);
        return days >= 0 && days <= 15;
    }

    /**
     * Gera ID único
     */
    static generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Criptografa string simples (NOT SECURE - apenas para ofuscar)
     */
    static simpleEncrypt(str) {
        return btoa(str);
    }

    /**
     * Descriptografa string simples
     */
    static simpleDecrypt(str) {
        try {
            return atob(str);
        } catch (e) {
            return str;
        }
    }

    /**
     * Clona objeto profundamente
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Aguarda por X milissegundos
     */
    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Debounce de função
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle de função
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Valida email
     */
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Valida token GitHub
     */
    static isValidGitHubToken(token) {
        return token && token.length > 20;
    }

    /**
     * Formata bytes para tamanho legível
     */
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Remove acentos de string
     */
    static removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Busca fuzzy em array
     */
    static fuzzySearch(query, items, keyExtractor) {
        const lowerQuery = query.toLowerCase();
        
        return items.filter(item => {
            const text = keyExtractor(item).toLowerCase();
            let queryIdx = 0;
            
            for (let i = 0; i < text.length; i++) {
                if (text[i] === lowerQuery[queryIdx]) {
                    queryIdx++;
                    if (queryIdx === lowerQuery.length) return true;
                }
            }
            return false;
        });
    }

    /**
     * Converte para slug
     */
    static toSlug(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Capitaliza string
     */
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Obtém valor do query string
     */
    static getQueryParam(param) {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get(param);
    }

    /**
     * Copia texto para clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Erro ao copiar:', err);
            return false;
        }
    }

    /**
     * Detecta se está online
     */
    static isOnline() {
        return navigator.onLine;
    }

    /**
     * Formata número como moeda
     */
    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Obtém mês em português
     */
    static getMonthName(date) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[new Date(date).getMonth()];
    }

    /**
     * Obtém dia da semana em português
     */
    static getDayName(date) {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[new Date(date).getDay()];
    }
}
