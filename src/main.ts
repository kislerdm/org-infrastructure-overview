import './style.css';
import Graph, {Node} from './graph.ts';
import {DiagramBuilder} from "./diagram.ts";

const inputSelectedIdStyle: string = "font-weight:bold;font-size:18px";

function Input(nodes: Node[], id: string): string {
    function generateList(nodes: Node[], selected_id: string): string {
        if (nodes.length == 0) {
            return ""
        }

        let o: string = "<ul>";

        for (const node of nodes) {
            const checked: string = node.id() == selected_id ? `style=${inputSelectedIdStyle}` : "";
            const listRow: string =
                `<span class="custom-control-input" id="${node.id()}" ${checked}>${node.name}</span>`;
            const dropDownSelection: string = `<span class="caret minimize"></span>`;

            if (node.nodes != undefined && node.nodes.length > 0) {
                o += `<li>${dropDownSelection}${listRow}${generateList(node.nodes, selected_id)}</li>`
            } else {
                o += `<li><span class="fixed"></span>${listRow}</li>`
            }
        }

        return `${o}</ul>`
    }

    return `<form class="tree" id="intputForm">${generateList(nodes, id)}</form>`
}

function errorMessage(msg: string): string {
    return `<div class="alert">Error<div style="color:#000">${msg}</div>`;
}

export default async function Main(
    mountPoint: HTMLDivElement, builder: DiagramBuilder, route: string, data: object
): Promise<void> {
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
    <div class="column left"><div id="input" class="tree-panel"><div class="force-overflow">${Input(d.nodes, id)}</div></div></div>
    <div class="column right"><div id="output">${svg}</div></div>
</div>`;
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        mountPoint.innerHTML = errorMessage(`Diagram rendering error. Node ID: ${id}\n${err.message}`);
        return;
    }

    function resetDefaultStyleInputElement(id: string): void {
        for (const el of inputElements) {
            // @ts-ignore
            if (el.id === id) {
                el.setAttribute("style", "")
            }
        }
    }

    let prevSelectedId: string = id;

    // input selector to focus the diagram on specific node
    const inputElements = mountPoint
        .getElementsByClassName("custom-control-input");

    for (const elInput of inputElements) {
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

            resetDefaultStyleInputElement(prevSelectedId);
            // @ts-ignore
            elInput.setAttribute("style", inputSelectedIdStyle);
            prevSelectedId = id
        })
    }

    // register caret
    const carets = mountPoint.getElementsByClassName('caret');
    for (const caret of carets) {
        caret.addEventListener('click', () => {
            // @ts-ignore
            caret.parentElement.querySelector('ul').classList.toggle('collapsed');
            caret.classList.toggle('maximize');
            caret.classList.toggle('minimize');
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
