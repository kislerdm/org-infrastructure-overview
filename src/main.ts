import './style.css';
import Graph from './graph.ts';
import diagramRawDefinition from './data.json';
import {C4DiagramBuilderMermaid, DiagramBuilder} from "./diagram.ts";


function Main(root: HTMLDivElement, builder: DiagramBuilder, data: object): void {
    try {
        const d: Graph = new Graph(data);

        const diagramDefinition = d.serialiseToPlantUML("Foo.DepartmentA.DomainA.Team0.Service0.App1");

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

const root = document.querySelector<HTMLDivElement>('#app')!;
Main(root, new C4DiagramBuilderMermaid(root), diagramRawDefinition);
