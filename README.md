# ESPECIFICAÇÕES

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


| Página | Para que serve | 
|-----|------|
| components | Componentes reutilizáveis. |
| pages | Páginas da aplicação. |
| types | Tipos TypeScript. |
| data | Dados de exemplo. |
