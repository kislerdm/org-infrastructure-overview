import Graph, {getNodeByID, Node} from "./graph.ts";
import {DiagramBuilder} from "./diagram.ts";
import SetTemplatedComponents, {addInfoPopUp} from "./template.ts";


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

export class Router {
    private readonly history: History
    private readonly location: Location;
    private readonly base: string;

    private token: string = "q";

    constructor(location: Location) {
        this.location = location;
        this.history = window.history;
        this.base = this.removeTrailingCharacters(this.split()[0]);
    }

    updateRouteToNode(nodeID: string) {
        this.history.pushState({}, "", `${this.base}?${this.token}=${nodeID}`)
    }

    readNodeIDFromRoute(): string {
        const spl = this.split();
        if (spl.length < 2) {
            return "";
        }
        return spl[1];
    }

    private split(): string[] {
        return this.location.href.split(`${this.token}=`);
    }

    private removeTrailingCharacters(s: string): string {
        const lastChar = s.slice(-1);
        if (lastChar != "?" && lastChar != "/") {
            return s;
        }
        return this.removeTrailingCharacters(s.slice(0, -1));
    }
}

function isMobileDevice(): boolean {
    return window.screen.availWidth <= 1600
}

function addTitle(node: Node | undefined): string {
    if (node === undefined) {
        return "";
    }
    return `<p id="diagram-title">Architecture diagram of the ${node.type} "${node.name}"</p>`
}

export default async function Main(mountPoint: HTMLDivElement, builder: DiagramBuilder, data: object): Promise<void> {
    let d: Graph;
    try {
        d = new Graph(data);
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        mountPoint.innerHTML = errorMessage(err.message);
        mountPoint.innerHTML = SetTemplatedComponents(mountPoint.innerHTML);
        addInfoPopUp(mountPoint)
        return;
    }

    const router = new Router(window.location);
    const route = router.readNodeIDFromRoute();
    const id: string = route !== "" ? route : d.nodes[0].id();

    router.updateRouteToNode(id);
    try {
        // @ts-ignore
        const svg = await builder.renderSVG(d.serialiseToPlantUML(id), mountPoint);

        mountPoint.innerHTML = `<div class="row">
    <div class="column left"><label id="lab-input" for="input">Select node</label><div id="input" class="tree-panel"><div class="force-overflow">${Input(d.nodes, id)}</div></div></div>
    <div class="column right"><div id="output">${addTitle(getNodeByID(d.nodes, id))}${svg}</div></div>
</div>`;
        mountPoint.innerHTML = SetTemplatedComponents(mountPoint.innerHTML);
        addInfoPopUp(mountPoint)
        // @ts-ignore
    } catch (err: Error) {
        console.error(err.message);
        mountPoint.innerHTML = errorMessage(`Diagram rendering error. Node ID: ${id}\n${err.message}`);
        mountPoint.innerHTML = SetTemplatedComponents(mountPoint.innerHTML);
        addInfoPopUp(mountPoint)
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

    const inputPanel = mountPoint.getElementsByClassName("column left")[0]!;

    function showInputPanel() {
        inputPanel.setAttribute("style", "height:70vh");
        const inputTree = inputPanel.getElementsByClassName("tree-panel")[0]!;
        inputTree.setAttribute("style", "width:100%")
    }

    function hideInputPanel() {
        inputPanel.setAttribute("style", `height:6vh`);
        const inputTree = inputPanel.getElementsByClassName("tree-panel")[0]!;
        inputTree.setAttribute("style", "width:0")
    }

    for (const elInput of inputElements) {
        elInput.addEventListener("click", async (e: Event): Promise<void> => {
            // @ts-ignore
            const id = e.target!.id
            try {
                router.updateRouteToNode(id)

                const el = findFistDivElementByID(
                    mountPoint.getElementsByClassName("column right")[0]!, "output")!;

                // @ts-ignore
                const svg = await builder.renderSVG(d.serialiseToPlantUML(id), el);
                el.innerHTML = `${addTitle(getNodeByID(d.nodes, id))}${svg}`

                // @ts-ignore
            } catch (err: Error) {
                console.error(err.message);
                mountPoint.innerHTML = errorMessage(`Diagram rendering error. Node ID: ${id}\n${err.message}`);
                mountPoint.innerHTML = SetTemplatedComponents(mountPoint.innerHTML);
                addInfoPopUp(mountPoint)
            }

            resetDefaultStyleInputElement(prevSelectedId);
            // @ts-ignore
            elInput.setAttribute("style", inputSelectedIdStyle);
            prevSelectedId = id

            if (isMobileDevice()) {
                hideInputPanel();
                isClickedSelectorLabel = false;
            }
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

    const selectorLabel = mountPoint.getElementsByTagName("label")[0]!;
    let isClickedSelectorLabel: boolean = false;
    selectorLabel.addEventListener("click", () => {
        if (isMobileDevice()) {
            if (isClickedSelectorLabel) {
                hideInputPanel()
                isClickedSelectorLabel = false;
            } else {
                showInputPanel();
                isClickedSelectorLabel = true;
            }
        }
    })
}

export function findFistDivElementByID(mountPoint: Element, id: string): Element | undefined {
    for (const el of mountPoint.getElementsByTagName("div")) {
        if (el.id == id) {
            return el;
        }
    }
    return undefined;
}
