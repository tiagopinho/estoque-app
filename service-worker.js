/**
 * Service Worker para Controle de Estoque
 * Implementa funcionalidade offline e cache
 */

const CACHE_NAME = 'estoque-app-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/variables.css',
    './css/style.css',
    './js/utils.js',
    './js/config.js',
    './js/storage.js',
    './js/github-api.js',
    './js/database.js',
    './js/notifications.js',
    './js/ui.js',
    './js/app.js'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(ASSETS_TO_CACHE)
                    .catch(err => {
                        console.warn('Alguns arquivos não puderam ser cacheados:', err);
                        // Adiciona apenas os que conseguir
                        return Promise.all(
                            ASSETS_TO_CACHE.map(url => 
                                cache.add(url).catch(() => console.warn(`Falha ao cachear: ${url}`))
                            )
                        );
                    });
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deletando cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requisições para chrome extensions
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // Estratégia: Network First para API GitHub, Cache First para assets
    if (url.origin === 'https://api.github.com') {
        // Network first para API GitHub
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        // Cache a resposta bem-sucedida
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Retorna do cache se offline
                    return caches.match(request)
                        .then(response => response || 
                            new Response(
                                JSON.stringify({ error: 'Sem conexão com a internet' }),
                                { status: 503, statusText: 'Service Unavailable' }
                            )
                        );
                })
        );
    } else {
        // Cache first para assets locais
        event.respondWith(
            caches.match(request)
                .then(response => response || fetch(request))
                .catch(() => {
                    // Fallback para página offline
                    return caches.match('./index.html');
                })
        );
    }
});

// Sincronização em background
self.addEventListener('sync', event => {
    console.log('Background Sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Notifica o cliente para sincronizar
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_REQUESTED',
                        tag: event.tag
                    });
                });
            })
        );
    }
});

// Notificações Push
self.addEventListener('push', event => {
    console.log('Push notification recebida');
    
    if (!event.data) {
        return;
    }

    const data = event.data.json();
    const options = {
        body: data.body || 'Nova notificação',
        icon: './assets/icons/icon-192.png',
        badge: './assets/icons/icon-192.png',
        tag: data.tag || 'notification',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Controle de Estoque', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
    console.log('Notificação clicada:', event.notification.tag);
    
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                // Procura cliente aberto
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Abre nova janela se não encontrar
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Mensagens do cliente
self.addEventListener('message', event => {
    console.log('Mensagem recebida no Service Worker:', event.data);
    
    if (event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});
