import "./style.css";
import Main from "./main.ts";
import diagramRawDefinition from "./data.json";
import {C4DiagramBuilderMermaid} from "./diagram.ts";

const root = document.querySelector<HTMLDivElement>('#app')!;

Main(root, new C4DiagramBuilderMermaid(), diagramRawDefinition);
