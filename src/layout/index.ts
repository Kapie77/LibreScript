// index.ts
// src/layout/editor

// só reexporta.

/*
===========================================================
Ponto central de exportação do módulo layout.

Seu objetivo é permitir importar tudo usando apenas:

import { ... } from "../../layout";

sem precisar conhecer onde cada arquivo está.

Quando novos arquivos de layout forem adicionados,
eles devem ser exportados aqui.

===========================================================
*/
export * from "./BlockLayout";
export * from "./templates/ScriptBlockTemplates";