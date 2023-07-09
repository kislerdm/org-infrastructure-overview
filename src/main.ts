import './style.css';
import Graph, {Node} from './graph.ts';
import {DiagramBuilder} from "./diagram.ts";


function Input(id: string, nodes: Node[]): string {
    return `<form class="tree" id="intputForm"><ul><li><input class="custom-control-input" type="radio" checked="" name="tree" id="Foo" value="Foo"><label class="custom-control-label" for="Foo">Foo</label></li></ul></form>`
}

export default async function Main(mountPoint: HTMLDivElement, builder: DiagramBuilder, route: string, data: object): Promise<void> {
    let d: Graph;
    try {
        d = new Graph(data);
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        mountPoint.innerHTML = `<div class="alert">Error<div style="color:#000">${err.message}</div>`
        return;
    }

    let id: string = "";
    try {
        id = route !== "" ? route : d.nodes[0].id();
        // @ts-ignore
        const diagramDefinition = d.serialiseToPlantUML(id);
        // @ts-ignore
        const svg = await builder.renderSVG(diagramDefinition);

        mountPoint.innerHTML = `<div class="row">
    <div class="column left"><div id="input" class="ninotree custom-control custom-radio">${Input(id, d.nodes)}</div></div>
    <div class="column right"><div id="output">${svg}</div></div>
</div>`;
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        mountPoint.innerHTML = `<div class="alert">Error<div style="color:#000">Diagram rendering error. Node ID: ${id}\n${err.message}</div>`;
        return;
    }

    // const output = findDivElementByID(mountPoint.getElementsByClassName("form")[0]!, "inputForm")!;
    // output.addEventListener("click", (e) => {
    //     const el = e.srcElement;
    //     // @ts-ignore
    //     if (el.classList.contains("custom-control-input")) {
    //         // @ts-ignore
    //         console.log(el.id);
    //     }
    // });
}

export function findFistAppeadDivElementByID(mountPoint: Element, id: string): HTMLElement | undefined {
    for (const el of mountPoint.getElementsByTagName("div")) {
        if (el.id == id) {
            return el;
        }
    }
    return undefined;
}
