/**
 * notifications.js
 * Sistema de notificações do browser e toast
 */

class NotificationManager {
    /**
     * Solicita permissão para notificações
     */
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Navegador não suporta notificações');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.error('Erro ao solicitar permissão:', error);
                return false;
            }
        }

        return false;
    }

    /**
     * Verifica se tem permissão
     */
    static hasPermission() {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    /**
     * Envia notificação
     */
    static async sendNotification(title, options = {}) {
        if (!this.hasPermission()) {
            return false;
        }

        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Envia pelo Service Worker
                navigator.serviceWorker.controller.postMessage({
                    type: 'SEND_NOTIFICATION',
                    title: title,
                    options: options
                });
            } else {
                // Notificação direta
                new Notification(title, {
                    icon: './assets/icons/icon-192.png',
                    badge: './assets/icons/icon-192.png',
                    ...options
                });
            }
            return true;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            return false;
        }
    }

    /**
     * Notifica sobre produto vencido
     */
    static notifyExpiredProduct(product) {
        if (!this.hasPermission()) return;

        const latestValidity = product.validities?.[0];
        const days = latestValidity ? Utils.daysUntilDate(latestValidity) : null;

        let title = '🚫 Produto Vencido';
        let body = `${product.name} está vencido!`;

        if (days === 0) {
            title = '⚠️ Vence Hoje';
            body = `${product.name} vence hoje (${latestValidity})`;
        } else if (days === 1) {
            title = '⚠️ Vence Amanhã';
            body = `${product.name} vence amanhã (${latestValidity})`;
        } else if (days <= 7) {
            title = '⏰ Vence em Breve';
            body = `${product.name} vence em ${days} dias (${latestValidity})`;
        }

        this.sendNotification(title, {
            body: body,
            tag: `product-${product.id}`,
            requireInteraction: days <= 0
        });
    }

    /**
     * Notifica sincronização
     */
    static notifySync(success = true) {
        if (!this.hasPermission()) return;

        const title = success ? '✅ Sincronizado' : '❌ Erro na Sincronização';
        const body = success ? 
            'Dados sincronizados com sucesso' : 
            'Erro ao sincronizar com GitHub';

        this.sendNotification(title, { body });
    }

    /**
     * Notifica novo produto adicionado
     */
    static notifyProductAdded(productName) {
        if (!this.hasPermission()) return;

        this.sendNotification('➕ Produto Adicionado', {
            body: `${productName} foi adicionado ao estoque`
        });
    }

    /**
     * Mostra toast na tela
     */
    static showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'fadeOut 300ms ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Mostra toast de sucesso
     */
    static showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Mostra toast de erro
     */
    static showError(message) {
        this.showToast(message, 'error', 5000);
    }

    /**
     * Mostra toast de aviso
     */
    static showWarning(message) {
        this.showToast(message, 'warning', 4000);
    }

    /**
     * Mostra toast de informação
     */
    static showInfo(message) {
        this.showToast(message, 'info');
    }

    /**
     * Verifica alertas de validade
     */
    static checkValidityAlerts() {
        const expired = Database.getExpiredProducts();
        const expiring = Database.getExpiringProducts(7);

        if (expired.length > 0) {
            expired.forEach(product => {
                this.notifyExpiredProduct(product);
            });
        }

        if (expiring.length > 0 && this.hasPermission()) {
            const soon = expiring.filter(p => {
                const latest = p.validities?.[0];
                const days = Utils.daysUntilDate(latest);
                return days <= 3;
            });

            soon.forEach(product => {
                this.notifyExpiredProduct(product);
            });
        }
    }

    /**
     * Mostra confirmação
     */
    static async confirm(message, title = 'Confirmação') {
        return new Promise(resolve => {
            const confirmed = window.confirm(`${title}\n\n${message}`);
            resolve(confirmed);
        });
    }

    /**
     * Mostra alerta
     */
    static alert(message, title = 'Alerta') {
        window.alert(`${title}\n\n${message}`);
    }
}
