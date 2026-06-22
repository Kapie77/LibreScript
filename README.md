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
| components | Componentes reutilizáveis. |
| pages | Páginas da aplicação. |
| types | Tipos TypeScript. |
| data | Dados de exemplo. |
| utils | Funções auxiliares reutilizáveis do sistema. Não possuem interface visual nem estado React. |

| Arquivo | Para que serve | Especificações | Local |
|-----|------|------|------|
| Toolbar.tsx | Barra de ferramentas do editor. | Botões: Cena, Ação, Personagem, Diálogo, Fade | src/components |
| ScriptBlock.tsx | Renderiza e edita um bloco do roteiro. | Exemplo: INT. CASA - NOITE | src/components |
| FileBar.tsx | Barra de gerenciamento de projeto. | Botões: Novo, Salvar, Abrir | src/components |
| EditorPage.tsx | Página principal do editor. | Responsável por: Exibir roteiro, Adicionar blocos, Editar blocos, Salvar projeto, Abrir projeto | src/pages |
| GuidePage.tsx | Página futura de ajuda. | Contém: INT., EXT., FADE IN, FADE OUT, CUT TO, etc. | src/pages |
| RepositoryPage.tsx | Página com informações do projeto. | Possivelmente: GitHub, Licença, Contribuição | src/pages |
| scripts.ts | Define os blocos do roteiro. | scene, action, character, dialogue, parenthetical, shot, transition | src/types |
| project.ts | Define um projeto completo. | title, author, blocks | src/types |
| sampleScript.ts | Roteiro inicial usado para testes. |  | src/data |
| HistoryPage.tsx | Exibe o histórico de alterações do projeto. | Mostra eventos como criação, exclusão, movimentação e abertura de projetos. Permite limpar o histórico. | src/pages |
| history.ts | Define a estrutura de uma entrada de histórico. | id, timestamp, action, details, snapshot | src/types |
| pdfExporter.ts | Exporta o projeto para PDF formatado. | Gera capa, formatação de roteiro, Courier, negrito, conversão automática para maiúsculas e paginação. | src/utils |
| Toolbar.tsx | Barra de ferramentas do editor. | Botões: Scene, Action, Character, Dialogue, Parenthetical, Shot e Transition. Shot e Transition possuem menus suspensos com opções rápidas | src/components |
| StatisticsPage.tsx | Exibe estatísticas do roteiro. | Quantidade de blocos, cenas, ações, personagens, diálogos, transições, shots, parentheticals, palavras, caracteres e ranking de personagens. | src/pages |
| SettingsPage.tsx | Página de configurações do LibreScript. | Permite alterar tema, idioma e ativar/desativar recursos do editor. | src/pages |
| theme.css | Define as variáveis globais dos temas. | Tema Dark e Light através de CSS Variables. | src |

# EXTENSÕES A SEREM INSTALADAS
* Biblioteca que cria os PDFs:
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

## Como iniciar o projeto no servidor
Digite no terminal do Visual Studio Code:
```bash
npm run dev
```
