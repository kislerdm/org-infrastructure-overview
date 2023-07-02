import './style.css';
import Graph from './graph.ts';
import diagramRawDefinition from './data.json';
import {C4DiagramBuilderMermaid, DiagramBuilder} from "./diagram.ts";


function Main(root: HTMLDivElement, builder: DiagramBuilder, route: string, data: object): void {
    let id = route;
    try {
        const d: Graph = new Graph(data);
        if (id === "") {
            id = d.nodes[0].id();
        }

        const diagramDefinition = d.serialiseToPlantUML(id);

        builder.renderSVG(diagramDefinition)
            .then(svg => {
                root.innerHTML = svg;
            })
            .catch((err: Error) => {
                console.error(err.message);
                root.innerHTML = `<div class="alert">Error<div style="color:#000">Diagram rendering error</div>`
            });

        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        root.innerHTML = `<div class="alert">Error<div style="color:#000">${err.message}</div>`
    }
}

function router(): string {
    const o = decodeURI(window.location.href.replace(window.location.origin, "").slice(1))
    if (o.endsWith("/")) {
        window.location.replace(window.location.toString().slice(0,-1));
        return o.slice(0,-1);
    }
    return o;
}

const root = document.querySelector<HTMLDivElement>('#app')!;

Main(root, new C4DiagramBuilderMermaid(root), router(), diagramRawDefinition);
