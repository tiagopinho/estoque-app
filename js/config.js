/**
 * config.js
 * Configurações da aplicação
 */

class Config {
    static CATEGORIES = [
        { id: 'geladeira', name: 'Geladeira', icon: '🧊' },
        { id: 'freezer', name: 'Freezer', icon: '❄️' },
        { id: 'armario', name: 'Armário', icon: '🗄️' },
        { id: 'despensa', name: 'Despensa', icon: '🛒' },
        { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
        { id: 'limpeza', name: 'Limpeza', icon: '🧹' },
        { id: 'higiene', name: 'Higiene', icon: '🧼' },
        { id: 'outros', name: 'Outros', icon: '📦' }
    ];

    static LOCATIONS = [
        { id: 'geladeira', name: 'Geladeira', icon: '🧊' },
        { id: 'freezer', name: 'Freezer', icon: '❄️' },
        { id: 'armario', name: 'Armário', icon: '🗄️' },
        { id: 'despensa', name: 'Despensa', icon: '🛒' },
        { id: 'mesa', name: 'Mesa', icon: '🍽️' },
        { id: 'outro', name: 'Outro', icon: '📍' }
    ];

    static UNITS = [
        { value: 'un', label: 'Unidade' },
        { value: 'l', label: 'Litro' },
        { value: 'ml', label: 'Mililitro' },
        { value: 'kg', label: 'Quilograma' },
        { value: 'g', label: 'Grama' },
        { value: 'caixa', label: 'Caixa' },
        { value: 'dúzia', label: 'Dúzia' }
    ];

    static HISTORY_TYPES = [
        { value: 'entrada', label: 'Entrada', icon: '➕' },
        { value: 'saída', label: 'Saída', icon: '➖' },
        { value: 'correção', label: 'Correção', icon: '✏️' }
    ];

    static ALERT_LEVELS = {
        EXPIRED: 'expired',
        EXPIRING_TODAY: 'expiring-today',
        EXPIRING_TOMORROW: 'expiring-tomorrow',
        EXPIRING_WEEK: 'expiring-week',
        EXPIRING_FORTNIGHT: 'expiring-fortnight',
        WARNING: 'warning'
    };

    static ALERT_MESSAGES = {
        'expired': {
            title: '🚫 Vencido',
            color: 'danger'
        },
        'expiring-today': {
            title: '⚠️ Vence hoje',
            color: 'danger'
        },
        'expiring-tomorrow': {
            title: '⚠️ Vence amanhã',
            color: 'warning'
        },
        'expiring-week': {
            title: '⏰ Vence em 7 dias',
            color: 'warning'
        },
        'expiring-fortnight': {
            title: '⏰ Vence em 15 dias',
            color: 'info'
        }
    };

    /**
     * Obtém categoria por ID
     */
    static getCategory(id) {
        return this.CATEGORIES.find(c => c.id === id);
    }

    /**
     * Obtém local por ID
     */
    static getLocation(id) {
        return this.LOCATIONS.find(l => l.id === id);
    }

    /**
     * Obtém unidade por valor
     */
    static getUnit(value) {
        return this.UNITS.find(u => u.value === value);
    }

    /**
     * Obtém tipo de histórico por valor
     */
    static getHistoryType(value) {
        return this.HISTORY_TYPES.find(t => t.value === value);
    }
}
