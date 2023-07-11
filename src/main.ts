import './style.css';
import Graph, {Node} from './graph.ts';
import {DiagramBuilder} from "./diagram.ts";


function Input(nodes: Node[], id: string): string {
    function generateList(nodes: Node[], selected_id: string): string {
        if (nodes.length == 0) {
            return ""
        }

        let o: string = "<ul>";

        for (const node of nodes) {
            const checked: string = node.id() == selected_id ? "checked" : "";
            const listRow: string = `<input class="custom-control-input" type="radio" name="tree" id="${node.id()}" value="${node.id()}" ${checked}><label class="custom-control-label" for="${node.id()}">${node.name}</label>`;
            const dropDownBtn: string = `<i class="caret fas fa-caret-down"></i>`;

            if (node.nodes != undefined && node.nodes.length > 0) {
                o += `<li>${dropDownBtn}${listRow}${generateList(node.nodes, selected_id)}</li>`
            } else {
                o += `<li>${listRow}</li>`
            }
        }

        return `${o}</ul>`
    }

    return `<form class="tree" id="intputForm">${generateList(nodes, id)}</form>`
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

    let id: string = route !== "" ? route : d.nodes[0].id();
    try {
        // @ts-ignore
        const diagramDefinition = d.serialiseToPlantUML(id);
        // @ts-ignore
        const svg = await builder.renderSVG(diagramDefinition);

        mountPoint.innerHTML = `<div class="row">
    <div class="column left"><div id="input" class="ninotree custom-control custom-radio">${Input(d.nodes, id)}</div></div>
    <div class="column right"><div id="output">${svg}</div></div>
</div>`;
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        mountPoint.innerHTML = `<div class="alert">Error<div style="color:#000">Diagram rendering error. Node ID: ${id}\n${err.message}</div>`;
        return;
    }

    // register caret
    const carets = mountPoint.getElementsByClassName('caret');
    for (const caret of carets) {
        caret.addEventListener('click', () => {
            // @ts-ignore
            caret.parentElement.querySelector('ul').classList.toggle('collapsed');
            caret.classList.toggle('fa-caret-right');
            caret.classList.toggle('fa-caret-down');
        });
    }

    const tree = mountPoint.getElementsByClassName("tree")[0]!;
    tree.addEventListener("click", async (e: Event): Promise<void> => {
            const srcElement = e.srcElement!;

            // @ts-ignore
            if (srcElement.classList.contains("custom-control-input")) {
                try {
                    const el = findFistDivElementByID(
                        mountPoint.getElementsByClassName("column right")[0]!, "output")!;

                    // @ts-ignore
                    el.innerHTML = await builder.renderSVG(d.serialiseToPlantUML(srcElement.id), el);

                    // @ts-ignore
                } catch (err: Error) {
                    console.error(err.message);
                    mountPoint.innerHTML = `<div class="alert">Error<div style="color:#000">Diagram rendering error. Node ID: ${id}\n${err.message}</div>`;
                }
            }
        }
    );
}

export function findFistDivElementByID(mountPoint: Element, id: string): Element | undefined {
    for (const el of mountPoint.getElementsByTagName("div")) {
        if (el.id == id) {
            return el;
        }
    }
    return undefined;
}
