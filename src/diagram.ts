import {GetNodeParentID, Graph, Link, Node, Type} from "./graph.ts";

function nodeToC4Diagram(node: Node, is_external: boolean = false): string {
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

    function nodeName(): string {
        if (node.name != undefined && node.name != "") {
            return node.name
        }
        return node.id!.split(".").slice(-1)[0];
    }

    const externalPrefix = is_external ? "_Ext" : "";
    const description = node.description !== undefined ? node.description : "";

    switch (node.type) {
        case Type.Application:
        case Type.Database:
        case Type.Queue:
            let tech = node.technology !== undefined ? node.technology : "";
            if (node.deployment != "") {
                if (tech != "") {
                    tech = `${tech}/${node.deployment}`;
                } else {
                    tech = node.deployment!;
                }
            }

            return `Container${containerSuffix(node.type)}${externalPrefix}(${node.id},"${nodeName()}","${tech}","${description}")`;
        case Type.Team:
        case Type.Organisation:
        case Type.Department:
        case Type.Domain:
            return `Component${externalPrefix}(${node.id},"${nodeName()}","${description}")`
        default:
            return `System${externalPrefix}(${node.id},"${nodeName()}","${description}")`
    }
}

function boundaryC4Diagram(node: Node): string {
    switch (node.type) {
        case Type.Domain:
        case Type.Team:
        case Type.Organisation:
        case Type.Department:
            return `Enterprise_Boundary(${node.id},"${node.name}")`
        case Type.Service:
            return `System_Boundary(${node.id},"${node.name}")`
        default:
            return ""
    }
}

function linkToC4Diagram(link: Link): string {
    const description = link.description !== undefined ? link.description : "";
    const technology = link.technology !== undefined ? link.technology : "";
    return `Rel(${link.from},${link.to},"${description}","${technology}")`
}

type nodeMap = {
    node: Node;
    is_external: boolean;
}

type nodesGroup = {
    [key: string]: nodeMap[];
}

/**
 * DefineC4DiagramPlantUML defines the C4 diagram using PlantUML DSL.
 *
 * @param graph (Graph): Graph object which contains definition of the relationship between elements.
 * @param node_id (string): Node id to focus the diagram on.
 * @return (string) Diagram definition.
 */
export function DefineC4DiagramPlantUML(graph: Graph, node_id: string): string {
    const n: Node | undefined = graph.getNodeByID(node_id);
    if (n === undefined) {
        throw Error("node not found")
    }

    const group: nodesGroup = {};
    group[GetNodeParentID(n)] = [{node: n, is_external: false}];

    const links = graph.getLinksByID(node_id);
    links.forEach(link => {
        let id: string = "";
        if (link.to !== n.id) {
            id = link.to;
        } else if (link.from !== n.id) {
            id = link.from;
        }

        if (id != "") {
            const nodeExt = graph.getNodeByID(id)!;
            const extNodeParent = GetNodeParentID(nodeExt);
            if (group[extNodeParent] === undefined) {
                group[extNodeParent] = [];
            }
            group[extNodeParent].push({node: nodeExt, is_external: true});
        }
    })

    let c4NodesDefinition = ""
    for (const [groupNodeID, groupNodes] of Object.entries(group)) {
        let nodesDefinition = groupNodes
            .map(node => nodeToC4Diagram(node.node, node.is_external))
            .join("\n");
        if (groupNodeID !== "") {
            const boundaryDefinition = boundaryC4Diagram(graph.getNodeByID(groupNodeID)!);
            if (boundaryDefinition != "") {
                nodesDefinition = `${boundaryDefinition}{\n${nodesDefinition}\n}`
            }
        }
        c4NodesDefinition += `${nodesDefinition}\n`;
    }

    const c4LinksDefinition = links.map((link) => linkToC4Diagram(link)).join("\n");

    return `${c4NodesDefinition}${c4LinksDefinition}`;
}
