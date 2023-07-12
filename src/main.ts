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
            const dropDownBtn: string = `<i class="fas fa-caret-down caret"></i>`;

            if (node.nodes != undefined && node.nodes.length > 0) {
                o += `<li xmlns="http://www.w3.org/1999/html"><span></span></spab>${dropDownBtn}${listRow}${generateList(node.nodes, selected_id)}</span></li>`
            } else {
                o += `<li><span>${listRow}</span></li>`
            }
        }

        return `${o}</ul>`
    }

    return `<form class="tree" id="intputForm">${generateList(nodes, id)}</form>`
}

function errorMessage(msg: string): string {
    return `<div class="alert">Error<div style="color:#000">${msg}</div>`;
}

export default async function Main(mountPoint: HTMLDivElement, builder: DiagramBuilder, route: string, data: object): Promise<void> {
    let d: Graph;
    try {
        d = new Graph(data);
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        mountPoint.innerHTML = errorMessage(err.message);
        return;
    }

    const id: string = route !== "" ? route : d.nodes[0].id();

    try {
        // @ts-ignore
        const svg = await builder.renderSVG(d.serialiseToPlantUML(id), mountPoint);

        mountPoint.innerHTML = `<div class="row">
    <div class="column left"><div id="input" class="ninotree custom-control custom-radio">${Input(d.nodes, id)}</div></div>
    <div class="column right"><div id="output">${svg}</div></div>
</div>`;
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        mountPoint.innerHTML = errorMessage(`Diagram rendering error. Node ID: ${id}\n${err.message}`);
        return;
    }

    // input selector to focus the diagram on specific node
    for (const elInput of mountPoint.getElementsByClassName("custom-control-input")) {
        elInput.addEventListener("click", async (e: Event): Promise<void> => {
            // @ts-ignore
            const id = e.target!.id
            try {
                const el = findFistDivElementByID(
                    mountPoint.getElementsByClassName("column right")[0]!, "output")!;

                // @ts-ignore
                el.innerHTML = await builder.renderSVG(d.serialiseToPlantUML(id), el);

                // @ts-ignore
            } catch (err: Error) {
                console.error(err.message);
                mountPoint.innerHTML = errorMessage(`Diagram rendering error. Node ID: ${id}\n${err.message}`);
            }
        })
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
}

export function findFistDivElementByID(mountPoint: Element, id: string): Element | undefined {
    for (const el of mountPoint.getElementsByTagName("div")) {
        if (el.id == id) {
            return el;
        }
    }
    return undefined;
}
