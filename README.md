# LINGUAGEM
| Linguagem | Para que serve | 
|-----|------|
| TypeScript | Linguagem principal do projeto. |
| React | Biblioteca de interface. | Responsável por: Componentes, Atualização da tela, Estados (useState), Efeitos (useEffect)
| Vite | Ferramenta de desenvolvimento. | Responsável por: Criar projeto, Servidor local, Build de produção
| Node.js | Ambiente de execução usado para desenvolvimento. | Necessário para: npm, instalar pacotes, executar Vite
| npm | Gerenciador de pacotes. | Usado para instalar dependências.
| React Router | Sistema de navegação entre páginas. | Usado em: Editor, Guia, Repositório. Não faz parte do LibreScript final.

# ESPECIFICAÇÕES
| Pasta | Para que serve | 
|-----|------|
| components | Componentes reutilizáveis da interface. |
| pages | Páginas da aplicação. |
| types | Tipos TypeScript. |
| data | Dados de exemplo. |
| utils | Funções auxiliares reutilizáveis do sistema. Não possuem interface visual nem estado React. |
| layout | Sistema responsável pela paginação e medição do roteiro. Centraliza toda a lógica de layout utilizada pelo editor e pela exportação em PDF. |

| Arquivo | Para que serve | Especificações | Local |
|-----|------|------|------|
| Toolbar.tsx | Barra de ferramentas do editor. | Botões: Scene, Action, Character, Dialogue, Parenthetical, Shot e Transition. Shot e Transition possuem menus suspensos com opções rápidas | src/components |
| ScriptBlock.tsx | Renderiza e edita um bloco do roteiro. | Edição de conteúdo, exclusão, movimentação e suporte à busca. | src/components |
| EditorPage.tsx | Página principal do editor. | Responsável por: Exibir roteiro, Adicionar blocos, Editar blocos, Salvar projeto, Abrir projeto | src/pages |
| GuidePage.tsx | Página futura de ajuda. | Contém: INT., EXT., FADE IN, FADE OUT, CUT TO, etc. | src/pages |
| RepositoryPage.tsx | Página com informações do projeto. | Possivelmente: GitHub, Licença, Contribuição | src/pages |
| scripts.ts | Define os blocos do roteiro. | scene, action, character, dialogue, parenthetical, shot, transition | src/types |
| project.ts | Define um projeto completo. | title, author, blocks | src/types |
| sampleScript.ts | Roteiro inicial usado para testes. |  | src/data |
| HistoryPage.tsx | Exibe o histórico de alterações do projeto. | Mostra eventos como criação, exclusão, movimentação e abertura de projetos. Permite limpar o histórico. | src/pages |
| history.ts | Define a estrutura de uma entrada de histórico. | id, timestamp, action, details, snapshot | src/types |
| pdfExporter.ts | Exporta o projeto para PDF formatado. | Gera capa, formatação de roteiro, Courier, negrito, conversão automática para maiúsculas e paginação. | src/utils |
| StatisticsPage.tsx | Exibe estatísticas do roteiro. | Quantidade de blocos, cenas, ações, personagens, diálogos, transições, shots, parentheticals, palavras, caracteres e ranking de personagens. | src/pages |
| SettingsPage.tsx | Página de configurações do LibreScript. | Permite alterar tema, idioma e ativar/desativar recursos do editor. | src/pages |
| theme.css | Define as variáveis globais dos temas. | Tema Dark e Light através de CSS Variables. | src |
| StatusBar.tsx | Barra inferior fixa do editor. | Exibe páginas, palavras, caracteres e atalhos para Histórico e Estatísticas. | src/components |
| FileBar.tsx | Barra superior fixa do editor. | Menu Arquivo (Novo, Abrir, Salvar, Exportar PDF), Desfazer/Refazer, Busca de termos, Navegação entre resultados. | src/components |
| MeasuredBlock.tsx | Mede automaticamente a altura de cada bloco. | Utiliza ResizeObserver para informar mudanças de altura ao sistema de paginação. | src/components |
| Pagination.ts | Divide os blocos em páginas utilizando as alturas medidas no editor. |  | src/layout |
| Page.ts | Define as dimensões físicas da página (altura útil, largura e margens). |  | src/layout |
| scriptBlockLayout.ts | Centraliza as regras visuais dos blocos para o editor e para o PDF. |  | src/layout |
| LayoutManager.ts | Classe responsável por coordenar o sistema de layout. Preparada para futuras otimizações (cache, virtualização etc.). |  | src/layout |
| Measurements.ts | Armazena e gerencia as alturas medidas de cada bloco. |  | src/layout |
| types.ts | Tipos compartilhados pelo sistema de layout. |  | src/layout |

### DEPENDÊNCIAS
Instalar todas as dependências do projeto.

Exportação de PDF:
```bash
npm install jspdf
```

* Vite
```bash
npm create vite@latest .
```
```bash
npm install
```
Em "Select a framework" desce e selecione "React". No "Select a variant" escolha "TypeScript".

# COMO INSTALAR O TAURI E OUTRAS DEPENDÊNCIAS
No Windows, o Tauri exige: Rust, Microsoft C++ Build Tools, WebView2.
O WebView2 normalmente já está instalado no Windows 10/11, e o Tauri o utiliza para renderizar a interface do aplicativo.
Como nosso frontend já é React + Vite, Node/npm você já tem.

## Instalar o Rust
No PowerShell, você pode usar o winget, que é o método indicado na documentação do Tauri:

```winget install --id Rustlang.Rustup```

Se aparecer uma pergunta de confirmação, aceite.

Durante a instalação, se aparecer a escolha do toolchain, queremos MSVC, normalmente:

```x86_64-pc-windows-msvc```

Esse é o importante para o nosso Windows 64-bit.

## Instalar o Microsoft C++ Build Tools
Vamos instalar pelo site oficial da Microsoft:
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

Na instalação, procure a carga de trabalho:

Desenvolvimento para desktop com C++
(em inglês, Desktop development with C++)

Marque essa opção.

Dentro dela, deixe selecionados os componentes recomendados. O importante é termos:

- MSVC — C++ build tools
- Windows 10/11 SDK
- ferramentas CMake

O Tauri lista o Desktop development with C++ como requisito para desenvolvimento no Windows.

## Instalar Tauri CLI
```cd C:\Users\User\LibreScript```
```npm install --save-dev @tauri-apps/cli@latest```

Ver se isntalou digite:
```npx tauri --version```

Se aparecer algo como abaixo tá instalado:
tauri-cli 2.11.4

## Inicializar o Tauri no LibreScript
Agora vamos fazer o Tauri entrar no projeto React/Vite que já existe, sem recriar o LibreScript.
Na mesma pasta, rode:
```npx tauri init```
Ele vai fazer algumas perguntas no terminal. Não responda aleatoriamente, porque precisamos configurar corretamente para o nosso Vite.

**Configuração que você deve fazer:**
- What is your app name? · LibreScript
- What should the window title be? · LibreScript
- Where are your web assets (HTML/CSS/JS) located, relative to the "<current dir>/src-tauri/tauri.conf.json" file that will be created? › ../build
(Aqui não deixe ../build. Como nosso projeto é Vite, a pasta de saída padrão é dist. Digite ../)
- What is the url of your dev server? › http://localhost:5173/ (coloque o IP que o vscode passa pra ti)
- What is your frontend dev command? › npm run dev
- What is your frontend build command? › npm run build

## Configurando os arquivos
1. O identificador ainda está como padrão:
```"identifier": "com.tauri.dev"```
Vamos trocar para algo próprio do LibreScript, por exemplo:
```"identifier": "com.librescript.app"```
No **tauri.conf.json**, na pasta "src-tauri", altere somente essa linha.
Depois salve.

2. Abra o **package.json** do LibreScript e procure:
"scripts": {

Provavelmente está parecido com:

```bash
    "scripts": {
      "dev": "vite",
      "build": "tsc -b && vite build",
      ...
    }
```

Adicione esta linha dentro de "scripts":

```"tauri": "tauri"```

Por exemplo:
```bash
    "scripts": {
      "dev": "vite",
      "build": "tsc -b && vite build",
      "tauri": "tauri"
    }
```

3. Instalar API JS do Tauri
```cd C:\Users\User\LibreScript```
```npm install @tauri-apps/api```

4. Instalar outras dependencias
```npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-fs```

```npm run tauri add dialog```

```npm run tauri add fs```

5. Mude o arquivo ```src-tauri/capabilities/default.json``` para isso:
```bash
{
    "$schema": "../gen/schemas/desktop-schema.json",
    "identifier": "default",
    "description": "enables the default permissions",
    "windows": [
        "main"
    ],

    "permissions": [
        "core:default",
        "dialog:default",
        "fs:allow-read-text-file",
        "fs:allow-write-text-file",
        "fs:allow-write-file",
        "core:window:allow-set-title"
    ]
}
```

6. Precisamos apenas garantir que os pacotes JavaScript correspondentes também estejam instalados agora:
```bash
npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-fs
```
Se eles já estiverem instalados, o npm simplesmente vai manter as versões existentes.

## Como iniciar o projeto no servidor
**[Navegador]**
Digite no terminal do Visual Studio Code:
```bash
npm run dev
```

**[App Desktop]**
Digite no Power Shell:
```bash
cd + caminho da pasta libre script
```
```bash
npm run tauri dev
```
