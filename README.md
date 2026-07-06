# 📦 Controle de Estoque Doméstico

Sistema PWA profissional para controle de estoque de alimentos com sincronização automática via GitHub Pages. Funciona perfeitamente em iPhone, Android e Desktop.

## ✨ Características

### 🎯 Funcionalidades Principais
- ✅ Cadastro completo de produtos com validações
- ✅ Controle individual de validade por unidade
- ✅ Sistema de alertas por proximidade de vencimento
- ✅ Lista de compras automática quando produto acaba
- ✅ Histórico detalhado de movimentações
- ✅ Busca e filtros avançados
- ✅ Modo claro e escuro

### 📱 PWA (Progressive Web App)
- ✅ Funciona offline completamente
- ✅ Instalável como app nativo
- ✅ Sincronização automática quando online
- ✅ Notificações push do navegador
- ✅ Cache inteligente de dados

### ☁️ Sincronização GitHub
- ✅ Armazenamento no GitHub (database.json)
- ✅ Sincronização bidirecional automática
- ✅ Histórico de commits automático
- ✅ Sem dependência de servidor

### 🎨 Design Moderno
- ✅ Interface inspirada em iOS
- ✅ Animações suaves
- ✅ Design responsivo (mobile-first)
- ✅ Acessibilidade garantida
- ✅ Tema claro e escuro

## 📋 Campos de Cada Produto

```
├── Nome (obrigatório)
├── Categoria (obrigatório)
│   ├── Geladeira
│   ├── Freezer
│   ├── Armário
│   ├── Despensa
│   ├── Bebidas
│   ├── Limpeza
│   ├── Higiene
│   └── Outros
├── Marca
├── Quantidade (obrigatório)
├── Unidade (obrigatório)
│   ├── Unidade
│   ├── Litro
│   ├── Mililitro
│   ├── Quilograma
│   ├── Grama
│   ├── Caixa
│   └── Dúzia
├── Local de Armazenamento (obrigatório)
├── Datas de Validade (individual por unidade)
├── Observações
├── Código de Barras
└── Foto (Base64)
```

## 🚀 Início Rápido

### 1. Pré-requisitos
- GitHub Account
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Internet para configuração inicial

### 2. Instalação

#### Opção A: Clonar o repositório
```bash
git clone https://github.com/seu-usuario/estoque-app.git
cd estoque-app
```

#### Opção B: Usar como template
1. Acesse [criar novo repositório](https://github.com/new)
2. Nomeie como `estoque-app`
3. Clone os arquivos do projeto

### 3. Hospedar no GitHub Pages

1. **Configure o repositório:**
   - Vá para Settings → Pages
   - Selecione "Deploy from a branch"
   - Branch: `main`, Folder: `/ (root)`

2. **Seu app estará em:**
   ```
   https://seu-usuario.github.io/estoque-app
   ```

### 4. Configurar Primeiro Acesso

1. **Criar um Personal Access Token:**
   - Acesse https://github.com/settings/tokens
   - Clique em "Generate new token"
   - Selecione escopos: `repo` (acesso completo ao repositório)
   - Copie o token (aparece apenas uma vez!)

2. **Na aplicação:**
   - Abra https://seu-usuario.github.io/estoque-app
   - Menu → Configurações
   - Preencha:
     - Token GitHub: cole seu token
     - Usuário GitHub: seu_usuario
     - Repositório: estoque-app
   - Clique "Testar Conexão"

## 📚 Como Usar

### Dashboard
- Visualiza resumo do estoque
- Mostra alertas de vencimento
- Atalhos rápidos para ações comuns

### Cadastro de Produtos
1. Clique no botão ➕ ou acesse Menu → Novo Produto
2. Preencha os dados obrigatórios (*)
3. Adicione datas de validade (uma por unidade)
4. Salve

**Exemplo:**
- Leite com 5 unidades:
  - Adicione 5 datas de validade diferentes
  - Ao consumir, a primeira validade é removida

### Consumir Produto
1. Dashboard → Ações Rápidas → ✅ Consumir
2. Selecione o produto
3. Defina quantidade
4. Confirme

### Lista de Compras
- Automática: quando produto chega a 0
- Manual: Menu → Lista de Compras
- Marque como comprado ou remova

### Sincronização
- Automática ao fazer qualquer ação
- Manual: Menu → Sincronizar
- Funciona offline: sincroniza quando conectar

## ⚙️ Configuração Avançada

### Backup e Restauração
```javascript
// Exportar
Menu → Exportar JSON

// Importar
Menu → Importar JSON
```

### Armazenamento Local
- Dados salvos em localStorage
- Sincronizados com GitHub
- Cache Service Worker para offline

### Notificações
- Solicita permissão na primeira utilização
- Alertas de vencimento próximo
- Alertas de produtos vencidos

## 📊 Estrutura do Database.json

```json
{
  "config": {
    "version": "1.0.0",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastSync": "2024-01-15T14:30:00.000Z"
  },
  "products": [
    {
      "id": "unique-id",
      "name": "Leite Integral",
      "category": "geladeira",
      "brand": "Marca X",
      "quantity": 2,
      "unit": "l",
      "location": "geladeira",
      "validities": ["15/02/2024", "20/02/2024"],
      "notes": "Observação opcional",
      "barcode": "1234567890",
      "photo": "data:image/jpeg;base64,...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  ],
  "history": [
    {
      "id": "unique-id",
      "type": "entrada|saída|correção",
      "productName": "Leite Integral",
      "quantity": 1,
      "notes": "Opcional",
      "timestamp": "2024-01-15T14:30:00.000Z",
      "date": "15/01/2024",
      "time": "14:30"
    }
  ],
  "shoppingList": [
    {
      "id": "unique-id",
      "productId": "product-id",
      "productName": "Leite",
      "category": "geladeira",
      "quantity": 2,
      "unit": "l",
      "completed": false,
      "addedAt": "2024-01-15T14:30:00.000Z"
    }
  ],
  "statistics": {
    "totalConsumed": 25,
    "lastUpdated": "2024-01-15T14:30:00.000Z"
  }
}
```

## 🔐 Segurança

### Token GitHub
- ✅ Armazenado criptografado localmente
- ✅ Nunca é enviado para servidores externos
- ✅ Apenas entre browser e GitHub
- ✅ Toda comunicação via HTTPS

### Dados
- ✅ Armazenamento local do navegador
- ✅ localStorage encriptado
- ✅ Sincronização apenas com seu repositório
- ✅ Total controle dos dados

## 📱 Instalação como App

### iPhone
1. Abra no Safari
2. Clique em Compartilhar
3. Selecione "Adicionar à Tela de Início"

### Android
1. Abra no Chrome
2. Clique no menu (⋮)
3. Selecione "Instalar app"

### Desktop
1. Abra no Chrome/Edge
2. Clique no ícone de instalação (canto superior direito)
3. Confirme

## 🐛 Troubleshooting

### Erro: "Token inválido"
- Verifique se copiou todo o token
- Token não pode ter espaços
- Crie um novo token se expirou

### Erro: "Repositório não encontrado"
- Verifique nome do usuário (case-sensitive)
- Verifique nome do repositório
- Garanta que o repositório é público

### Dados não sincronizam
- Verifique conexão internet
- Teste conexão: Menu → Configurações → Testar Conexão
- Sincronize manualmente: Menu → Sincronizar

### PWA não instala
- Use HTTPS (GitHub Pages usa automaticamente)
- Crie um usuário (PWA precisa de dados locais)
- Use navegador moderno

## 🎯 Futuros Recursos

- [ ] Leitor de código de barras com câmera
- [ ] API externa de produtos
- [ ] Compartilhamento de listas
- [ ] Estatísticas avançadas
- [ ] Alertas por SMS/Email
- [ ] Aplicativo mobile nativo
- [ ] Multi-usuário

## 📄 Estrutura de Arquivos

```
estoque-app/
├── index.html                 # Página principal
├── manifest.json             # PWA manifest
├── service-worker.js         # Service Worker
├── css/
│   ├── variables.css         # Variáveis de design
│   └── style.css            # Estilos completos
├── js/
│   ├── utils.js             # Funções utilitárias
│   ├── config.js            # Configurações
│   ├── storage.js           # localStorage
│   ├── github-api.js        # API GitHub
│   ├── database.js          # Banco de dados
│   ├── notifications.js     # Notificações
│   ├── ui.js                # Interface
│   └── app.js               # Lógica principal
├── assets/
│   ├── icons/               # Ícones PWA
│   └── images/              # Imagens
└── README.md                # Esta documentação
```

## 🤝 Contribuindo

Para contribuir:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: seu-email@exemplo.com
- 🐛 Issues: GitHub Issues
- 💬 Discussões: GitHub Discussions

## 📜 Licença

MIT License - Veja LICENSE.md para detalhes

## ❤️ Agradecimentos

- Desenvolvido com ❤️ para controle doméstico
- Inspirado em aplicativos modernos
- Tecnologias: HTML5, CSS3, JavaScript puro, PWA

---

**Desenvolvido com 🚀 e ☕**

*Última atualização: 2024-01-15*
