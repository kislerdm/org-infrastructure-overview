import './style.css';
import Graph, {Node} from './graph.ts';
import diagramRawDefinition from './data.json';
import {C4DiagramBuilderMermaid, DiagramBuilder} from "./diagram.ts";

function Main(root: HTMLDivElement, builder: DiagramBuilder, route: string, data: object): void {
    let d: Graph;
    try {
        d = new Graph(data);
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        root.innerHTML = `<div class="alert">Error<div style="color:#000">${err.message}</div>`
    }

    // @ts-ignore
    const id = route !== "" ? route : d.nodes[0].id();

    function twoColsPage(nodes: Node[], svg: string) {
        return `<div class="row"><div class="column left"></div><div class="column right">${svg }</div></div>`;
    }

    // @ts-ignore
    builder.renderSVG(d.serialiseToPlantUML(id))
        .then(svg => {
            root.innerHTML = twoColsPage(d.nodes, svg);
        })
        .catch((err: Error) => {
            console.error(err.message);
            root.innerHTML = `<div class="alert">Error<div style="color:#000">Diagram rendering error</div>`
        });
}

function router(): string {
    const o = decodeURI(window.location.href.replace(window.location.origin, "").slice(1))
    if (o.endsWith("/")) {
        window.location.replace(window.location.toString().slice(0, -1));
        return o.slice(0, -1);
    }
    return o;
}

const root = document.querySelector<HTMLDivElement>('#app')!;

Main(root, new C4DiagramBuilderMermaid(root), router(), diagramRawDefinition);
