import {Graph, Link, Node, Type} from "./graph.ts";

function nodeToC4Diagram(node: Node): string {
    function containerSuffix(type: Type.Application | Type.Database | Type.Queue) {
        switch (type) {
            case Type.Database:
                return "Db"
            case Type.Queue:
                return "Queue"
            default:
                return ""
        }
    }

    function nodeName(node: Node): string {
        if (node.name != undefined && node.name != "") {
            return node.name
        }
        return node.id!.split(".").slice(-1)[0];
    }

    switch (node.type) {
        case Type.Application:
        case Type.Database:
        case Type.Queue:
            let tech = node.technology;
            if (node.deployment != undefined && node.deployment != "") {
                if (tech != undefined && tech != "") {
                    tech = `${tech}/${node.deployment}`;
                } else {
                    tech = node.deployment;
                }
            }
            return `Container${containerSuffix(node.type)}(${node.id},"${nodeName}","${tech}","${node.description}")`;
        default:
            return `System(${node.id},"${nodeName}","${node.description}")`
    }
}

function linkToC4Diagram(link: Link): string {
    return `Rel(${link.from},${link.to},"${link.description}","${link.technology}")`
}

export function DefineC4Diagram(graph: Graph, node_id: string): string {
    const n = graph.getNodeByID(node_id);
    if (n === undefined) {
        throw Error("node not found")
    }

    let o = "C4Context";

    const links = graph.getLinksByID(node_id);

    const c4Links = links.map((link) => linkToC4Diagram(link)).join("\n");

    const selectedNodeC4 = nodeToC4Diagram(n);

    return o;
}