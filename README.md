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

| Arquivo | Para que serve | Especificações | Local |
|-----|------|------|------|
| Toolbar.tsx | Barra de ferramentas do editor. | Botões: Cena, Ação, Personagem, Diálogo, Fade | src/components |
| ScriptBlock.tsx | Renderiza e edita um bloco do roteiro. | Exemplo: INT. CASA - NOITE | src/components |
| FileBar.tsx | Barra de gerenciamento de projeto. | Botões: Novo, Salvar, Abrir | src/components |
| EditorPage.tsx | Página principal do editor. | Responsável por: Exibir roteiro, Adicionar blocos, Editar blocos, Salvar projeto, Abrir projeto | src/pages |
| GuidePage.tsx | Página futura de ajuda. | Contém: INT., EXT., FADE IN, FADE OUT, CUT TO, etc. | src/pages |
| RepositoryPage.tsx | Página com informações do projeto. | Possivelmente: GitHub, Licença, Contribuição | src/pages |
| scripts.ts | Define os blocos do roteiro. | scene, action, character, dialogue, transition | src/types |
| project.ts | Define um projeto completo. | title, author, blocks | src/types |
| sampleScript.ts | Roteiro inicial usado para testes. |  | src/data |
