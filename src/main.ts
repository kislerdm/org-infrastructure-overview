import './style.css';
import {Graph, GroupedNodes} from './graph.ts';

function Output(): string {
    return ""
}

function Input(data: Graph): string {
    if (data.listGroupedNodes() == undefined) {
        return `<div class="alert">Faulty data</dev>`
    }
    return `<h1>Hi!</h1>`
}

const data: Graph = {
    nodes: [],
    links: [],
    defineC4Diagram(composite_id: string, zoomLevel: string): string {
        return "";
    },
    listGroupedNodes(): GroupedNodes {
        return undefined;
    },
};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `${Input(data)}${Output()}`
