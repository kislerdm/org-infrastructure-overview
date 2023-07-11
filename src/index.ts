import {C4DiagramBuilderMermaid} from "./diagram.ts";
import diagramRawDefinition from "./data.json";
import Main from "./main.ts";

function router(): string {
    const o = decodeURI(window.location.href.replace(window.location.origin, "").slice(1))
    if (o.endsWith("/")) {
        window.location.replace(window.location.toString().slice(0, -1));
        return o.slice(0, -1);
    }
    return o;
}

const root = document.querySelector<HTMLDivElement>('#app')!;

Main(root, new C4DiagramBuilderMermaid(), router(), diagramRawDefinition);
