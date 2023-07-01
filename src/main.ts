import './style.css';
import Graph from './graph.ts';

function Output(): string {
    return ""
}

function Input(data: Graph): string {
    if (data.nodes.length == 0) {
        return `<div class="alert">Faulty data</dev>`
    }
    return `<h1>Hi!</h1>`
}

const data: Graph = {
    nodes: [],
    links: [],
    serialiseToPlantUML(_: string): string {
        return "";
    },
};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `${Input(data)}${Output()}`
