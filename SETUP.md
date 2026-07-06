# 📋 Guia Completo de Setup

Siga este guia passo a passo para configurar e usar a aplicação de Controle de Estoque.

---

## 🔑 Passo 1: Gerar Personal Access Token do GitHub

Um Personal Access Token é necessário para a aplicação sincronizar dados com seu repositório GitHub.

### Como Gerar:

1. **Faça login no GitHub:**
   - Acesse https://github.com/settings/profile
   - Clique em "Developer settings" (na barra lateral esquerda)

2. **Acesse Personal Access Tokens:**
   - Clique em "Personal access tokens"
   - Selecione "Tokens (classic)"

3. **Gere um novo token:**
   - Clique em "Generate new token"
   - Selecione "Generate new token (classic)"

4. **Configure o token:**
   ```
   Note: estoque-app
   Expiration: 90 days (ou conforme preferir)
   ```

5. **Selecione as permissões (Scopes):**
   - Marque: `repo` ✓
     (Isso permite acesso completo ao repositório)

6. **Gere e copie:**
   - Clique em "Generate token"
   - **COPIE O TOKEN IMEDIATAMENTE** (aparece apenas uma vez!)
   - Salve em um local seguro

**⚠️ IMPORTANTE:**
- Nunca compartilhe seu token
- Não o coloque no GitHub
- Se expor, gere um novo imediatamente

---

## 📁 Passo 2: Preparar o Repositório GitHub

### Opção A: Criar novo repositório

1. **Acesse GitHub:**
   - Vá para https://github.com/new

2. **Preencha os dados:**
   ```
   Repository name: estoque-app
   Description: Sistema de controle de estoque doméstico
   Visibility: Public (necessário para GitHub Pages)
   ☐ Initialize this repository with a README
   ```

3. **Crie o repositório**

### Opção B: Usar repositório existente

- Pode usar um repositório já existente
- Apenas renomeie a pasta para `estoque-app`

---

## 📤 Passo 3: Fazer Upload dos Arquivos

### Via Terminal (Recomendado):

```bash
# Clone ou acesse o repositório localmente
cd estoque-app

# Initialize git (se novo repositório)
git init

# Adicione todos os arquivos
git add .

# Crie o primeiro commit
git commit -m "Inicializar controle de estoque"

# Defina a branch main
git branch -M main

# Conecte ao repositório remoto (substitua USUARIO)
git remote add origin https://github.com/USUARIO/estoque-app.git

# Envie os arquivos
git push -u origin main
```

### Via GitHub Web:

1. **Acesse seu repositório**
2. **Upload files** (botão verde)
3. **Arraste os arquivos** ou selecione
4. **Commit changes**

---

## ⚙️ Passo 4: Ativar GitHub Pages

1. **Acesse Settings do repositório:**
   - Clique em "Settings"

2. **Vá para Pages:**
   - Na barra lateral, clique em "Pages"

3. **Configure:**
   ```
   Source: Deploy from a branch
   Branch: main
   Folder: / (root)
   ```

4. **Salve:**
   - Clique em "Save"
   - GitHub processará por alguns segundos
   - Verá a URL: `https://seu-usuario.github.io/estoque-app`

---

## 🎯 Passo 5: Primeiro Acesso à Aplicação

1. **Acesse a aplicação:**
   - Abra: `https://seu-usuario.github.io/estoque-app`

2. **Você verá o splash screen**
   - Aguarde o carregamento

3. **Aceite as permissões:**
   - Se solicitado para notificações: ✓ Permitir (opcional)

---

## ⚙️ Passo 6: Configurar a Aplicação

1. **Abra o Menu:**
   - Clique em ⚙️ (canto superior direito)
   - Selecione "Configurações"

2. **Preencha os dados:**
   ```
   Token GitHub: [COLE SEU TOKEN AQUI]
   Usuário GitHub: seu_usuario_aqui
   Repositório: estoque-app
   ```

3. **Teste a Conexão:**
   - Clique em "Testar Conexão"
   - Se tudo ok: ✓ Conectado como: seu_usuario

4. **Salve:**
   - Clique em "Salvar Configurações"

**Pronto! ✅**

---

## 📝 Como Usar Diariamente

### Adicionar um Produto

1. **Clique no botão ➕** ou acesse:
   - Menu → Novo Produto

2. **Preencha os dados:**
   ```
   Nome: Leite Integral *
   Categoria: Geladeira *
   Marca: Marca X
   Quantidade: 3 *
   Unidade: Litro *
   Local: Geladeira *
   ```

3. **Adicione valididades:**
   - Clique "+ Adicionar Validade"
   - Para cada unidade, adicione uma data:
     ```
     01/02/2024
     05/02/2024
     10/02/2024
     ```

4. **Salve o Produto**

### Consumir um Produto

**Opção 1: Rápida**
- Dashboard → Ações Rápidas → ✅ Consumir
- Selecione o produto
- Confirme

**Opção 2: No Estoque**
- Menu → Estoque
- Clique no produto
- Clique em ✓ (consumir)

**Resultado:**
- Quantidade diminui em 1
- Primeira data de validade é removida
- Se chegar a 0, adiciona à lista de compras
- Registra no histórico

### Gerenciar Lista de Compras

1. **Acesse:**
   - Menu → Lista de Compras

2. **Marque como comprado:**
   - ☑️ Clique na checkbox

3. **Remova da lista:**
   - 🗑️ Clique no lixo

### Consultar Histórico

1. **Acesse:**
   - Menu → Histórico

2. **Filtre por:**
   - Data: Selecione período
   - Tipo: Entrada, Saída, Correção

### Dashboard

**Mostra em tempo real:**
- 📦 Total de produtos
- ⏰ Próximos de vencer
- 🚫 Produtos vencidos
- ❌ Produtos em falta

**Alertas:**
- ⚠️ Produtos vencidos
- 🔴 Vence hoje
- 🟠 Vence amanhã

---

## 🌙 Funcionalidades Extras

### Mudar Tema

- Menu → Clique no botão 🌙 (canto superior direito)
- Alterna entre claro e escuro

### Buscar Produtos

- Clique em 🔍 (canto superior direito)
- Digite o nome
- Filtre por categoria ou local

### Exportar Dados

- Menu → Exportar JSON
- Salva um arquivo com todos os dados
- Use para backup

### Importar Dados

- Menu → Importar JSON
- Selecione um arquivo exportado
- Restaura os dados

### Sincronizar

- Menu → Sincronizar
- Sincroniza manualmente com GitHub
- Normalmente acontece automaticamente

---

## 📱 Instalar como App

### No iPhone (iOS)

1. **Abra em Safari:**
   - https://seu-usuario.github.io/estoque-app

2. **Clique em Compartilhar:**
   - 📤 Ícone no canto inferior

3. **Selecione:**
   - "Adicionar à Tela de Início"

4. **Nomeie (opcional):**
   - Digite: "Estoque" (ou seu nome)

5. **Adicione:**
   - Clique em "Adicionar"

**Pronto!** O app aparecerá na tela inicial como um app nativo.

### No Android

1. **Abra em Chrome:**
   - https://seu-usuario.github.io/estoque-app

2. **Clique no menu (⋮):**
   - Canto superior direito

3. **Selecione:**
   - "Instalar app"

4. **Confirme:**
   - Clique em "Instalar"

**Pronto!** O app será instalado e acessível no drawer de aplicativos.

### No Desktop

1. **Abra em Chrome/Edge:**
   - https://seu-usuario.github.io/estoque-app

2. **Clique no ícone de instalação:**
   - Canto superior direito (casa com seta)

3. **Confirme:**
   - Clique em "Instalar"

**Pronto!** O app abrirá em modo tela cheia.

---

## 🔄 Como Funciona a Sincronização

### Automática (Padrão)

- ✅ Cada ação sincroniza com GitHub
- ✅ Commit automático com descrição
- ✅ Funciona quando conectado

### Offline

- ✓ Continua funcionando normalmente
- ✓ Dados salvos localmente
- ✓ Sincroniza assim que conectar

### Manual

- Menu → Sincronizar
- Útil se houver problemas

**Estrutura dos commits:**
```
[14:30:23] Adicionar produto: Leite Integral
[15:45:12] Consumir 1x Pão Francês
[16:20:01] Sincronização de dados
```

---

## ⚠️ Dicas Importantes

### Segurança

- ✓ Nunca compartilhe seu Token
- ✓ Guarde seu Token em local seguro
- ✓ Se expor acidentalmente, gere um novo imediatamente
- ✓ A aplicação nunca envia seu Token para servidores
- ✓ Tudo fica entre seu browser e GitHub

### Performance

- ✓ Funciona offline sem problemas
- ✓ Cache automático reduz uso de dados
- ✓ LocalStorage limita a ~5MB
- ✓ Para histórico muito longo, exporte periodicamente

### Backup

- ✓ Sempre está salvo no GitHub (database.json)
- ✓ Exporte regularmente: Menu → Exportar JSON
- ✓ Guarde backups em local seguro
- ✓ Pode restaurar via: Menu → Importar JSON

### Notificações

- ✓ Solicita permissão na primeira vez
- ✓ Pode habilitar/desabilitar nas configurações do navegador
- ✓ Avisa sobre produtos próximos de vencer
- ✓ Avisa sobre produtos vencidos

---

## 🆘 Troubleshooting

### "GitHub Pages não funciona"

**Solução:**
1. Verifique se o repositório é **público**
2. Verifique se está em: Settings → Pages
3. Aguarde 5-10 minutos na primeira vez
4. Limpe cache do navegador (Ctrl+Shift+Del)

### "Erro ao conectar GitHub"

**Solução:**
1. Verifique o Token (não pode ter espaços)
2. Verifique Usuário (case-sensitive)
3. Verifique Repositório (case-sensitive)
4. Gere um novo Token se expirou
5. Clique "Testar Conexão"

### "Dados não sincronizam"

**Solução:**
1. Verifique conexão de internet
2. Verifique GitHub Pages está ativo
3. Tente sincronizar manualmente: Menu → Sincronizar
4. Verifique erro no console (F12)

### "PWA não instala"

**Solução:**
1. Verifique se é HTTPS (GitHub Pages é automático)
2. Use navegador moderno (Chrome, Firefox, Safari, Edge)
3. Crie um usuário (PWA precisa de dados)
4. Tente adicionar um produto primeiro
5. Aguarde 30 segundos

### "Notificações não funcionam"

**Solução:**
1. Verifique se permitiu na primeira vez
2. Verifique permissões do navegador
3. Abra DevTools (F12) e cheque console
4. No Chrome: Settings → Privacy → Notifications

---

## 📊 Estrutura do Banco de Dados

O arquivo `database.json` é criado automaticamente no seu repositório:

```
seu-usuario/estoque-app/
├── database.json  ← Sincronizado automaticamente
└── ...
```

Exemplo de conteúdo:
```json
{
  "config": {...},
  "products": [
    {
      "id": "123456",
      "name": "Leite",
      "quantity": 2,
      "validities": ["15/02/2024", "20/02/2024"],
      ...
    }
  ],
  "history": [...],
  "shoppingList": [...],
  "statistics": {...}
}
```

---

## 🎓 Recursos Adicionais

- **GitHub Docs:** https://docs.github.com
- **MDN Web Docs:** https://developer.mozilla.org
- **PWA Info:** https://web.dev/progressive-web-apps/

---

## 📞 Suporte e Dúvidas

Se tiver problemas:

1. **Consulte o README.md**
2. **Verifique console (F12)**
3. **Teste conexão GitHub**
4. **Limpe cache e recarregue**
5. **Tente outro navegador**

---

**Pronto para usar! 🚀**

Aproveite seu novo sistema de controle de estoque!

*Última atualização: 2024-01-15*
