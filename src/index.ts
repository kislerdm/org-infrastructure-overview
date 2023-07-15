import {C4DiagramBuilderMermaid} from "./diagram.ts";
import diagramRawDefinition from "./data.json";
import Main from "./main.ts";

const root = document.querySelector<HTMLDivElement>('#app')!;

Main(root, new C4DiagramBuilderMermaid(), diagramRawDefinition);
