export default class Graph {
    readonly nodes: Node[]
    readonly links: Link[] = []

    constructor(v: object) {
        const raw: Graph = cast(v, r("Graph"));

        this.nodes = readRawNodes(raw.nodes, "");

        if (raw.links !== undefined) {
            for (const l of raw.links) {
                if (!isValidLinkNodeID(l.from)) {
                    throw new Error("unexpected link's 'from' id");
                }

                if (getNodeByID(this.nodes, l.from) === undefined) {
                    throw new Error("node with link's 'from' id not found");
                }

                if (!isValidLinkNodeID(l.to)) {
                    throw new Error("unexpected link's 'to' id");
                }

                if (getNodeByID(this.nodes, l.to) === undefined) {
                    throw new Error("node with link's 'to' id not found");
                }

                this.links.push(new link(l.from, l.to, l.description, l.technology))
            }
        }
    }

    /**
     * serialiseToPlantUML defines the C4 diagram using PlantUML DSL.
     *
     * @param zoom_node_id (string): Node id to focus the diagram on.
     * @return (string) Diagram definition.
     */
    serialiseToPlantUML(zoom_node_id: string): string {
        const n: Node | undefined = getNodeByID(this.nodes, zoom_node_id);
        if (n === undefined) {
            throw Error("node not found")
        }

        const group: nodesGroup = {};
        group[n.parentID()] = [{node: n, is_external: false}];

        const links: Link[] = []

        for (const link of this.links) {
            if (link.from == zoom_node_id || link.to == zoom_node_id) {
                links.push(link)
            }
        }

        links.forEach(link => {
            let id: string = "";
            if (link.to !== n.id()) {
                id = link.to;
            } else if (link.from !== n.id()) {
                id = link.from;
            }

            if (id != "") {
                const nodeExt = getNodeByID(this.nodes, id)!;
                const extNodeParent = nodeExt.parentID();
                if (group[extNodeParent] === undefined) {
                    group[extNodeParent] = [];
                }
                group[extNodeParent].push({node: nodeExt, is_external: true});
            }
        })

        let c4NodesDefinition = ""
        for (const [groupNodeID, groupNodes] of Object.entries(group)) {
            let nodesDefinition = groupNodes
                .map(node => node.node.serialiseToPlantUML(node.is_external))
                .join("\n");
            if (groupNodeID !== "") {
                const boundaryDefinition = boundaryC4Diagram(getNodeByID(this.nodes, groupNodeID)!);
                if (boundaryDefinition != "") {
                    nodesDefinition = `${boundaryDefinition}{\n${nodesDefinition}\n}`
                }
            }
            c4NodesDefinition += `${nodesDefinition}\n`;
        }

        const c4LinksDefinition = links.map((link) => link.serialiseToPlantUML()).join("\n");

        return `${c4NodesDefinition}${c4LinksDefinition}`;
    }
}

interface Node {
    /**
     * Human friendly node's name.
     */
    readonly name: string;
    /**
     * Node's type.
     */
    readonly type: Type;
    /**
     * Human friendly node's description.
     */
    readonly description?: string;
    /**
     * Application, or service technology.
     */
    readonly technology?: string;
    /**
     * Deployment environment for the application, or service.
     */
    readonly deployment?: string;
    /**
     * Node's children.
     */
    readonly nodes?: Node[];

    /**
     * Node's ID.
     */
    id(): string;

    /**
     * Node's parent.
     */
    parentID(): string;

    /**
     * Serialises using the PlantUML DSL.
     *
     * @param is_external (boolean): Defines if the node is an external system.
     * @return (string): PlantUML DSL definition of the Node's container.
     */
    serialiseToPlantUML(is_external: boolean): string;
}

const idPattern = RegExp("[\\s\.\,\!\?\/\\\\:\;\*\$\%\#\"\'\&\(\)\=]+");

class node {
    readonly name: string;
    readonly description: string = "";
    readonly type: Type;
    readonly technology: string = "";
    readonly deployment: string = "";

    private readonly _id: string;

    private readonly _parentID: string;

    nodes: Node[];

    constructor(name: string, type: Type, parentID: string = "", description: string = "", technology: string = "", deployment: string = "") {
        this.name = name;
        this._parentID = parentID;

        this._id = name.replace(idPattern, "")
        if (this._parentID != "") {
            this._id = `${this._parentID}.${this._id}`
        }

        this.type = type;
        this.description = description;
        this.technology = technology;
        this.deployment = deployment;
        this.nodes = [];
    }

    parentID(): string {
        return this._parentID;
    }

    id(): string {
        return this._id;
    }

    serialiseToPlantUML(is_external: boolean): string {
        function containerSuffix(type: Type) {
            switch (type) {
                case Type.Database:
                    return "Db"
                case Type.Queue:
                    return "Queue"
                default:
                    return ""
            }
        }

        const externalPrefix = is_external ? "_Ext" : "";

        switch (this.type) {
            case Type.Application:
            case Type.Database:
            case Type.Queue:
                let tech = this.technology;
                if (this.deployment != "") {
                    if (tech != "") {
                        tech = `${tech}/${this.deployment}`;
                    } else {
                        tech = this.deployment!;
                    }
                }
                return `Container${containerSuffix(this.type)}${externalPrefix}(${this._id},"${this.name}","${tech}","${this.description}")`;
            case Type.Team:
            case Type.Organisation:
            case Type.Department:
            case Type.Domain:
                return `Component${externalPrefix}(${this._id},"${this.name}","${this.description}")`
            default:
                return `System${externalPrefix}(${this._id},"${this.name}","${this.description}")`
        }
    }
}

/**
 * Node's type.
 */
enum Type {
    Organisation = "organisation",
    Department = "department",
    Domain = "domain",
    Team = "team",
    Service = "service",
    Application = "application",
    Database = "database",
    Queue = "queue",
}

/**
 * Connection between two Nodes, i.e. graph's edge.
 */
interface Link {
    /**
     * Edge start's Node id.
     */
    readonly from: string;
    /**
     * Edge end's Node id.
     */
    readonly to: string;
    /**
     * Human friendly description of the link between two Nodes.
     */
    readonly description?: string;
    /**
     * Interface technology and protocol, e.g. HTTP/JSON.
     */
    readonly technology?: string;

    /**
     * Serialises using the PlantUML DSL.
     *
     * @return (string): PlantUML DSL definition of the Nodes' relation.
     */
    serialiseToPlantUML(): string;
}

class link {
    readonly from: string;
    readonly to: string;
    readonly description: string = "";
    readonly technology: string = "";

    constructor(from: string, to: string, description: string = "", technology: string = "") {
        this.from = from;
        this.to = to;
        if (description != undefined) {
            this.description = description;
        }
        if (technology != undefined) {
            this.technology = technology;
        }
    }

    serialiseToPlantUML(): string {
        return `Rel(${this.from},${this.to},"${this.description}","${this.technology}")`
    }
}

const isValidNodeIDRegexp = /^([a-zA-Z0-9]+|([a-zA-Z0-9]+\.[a-zA-Z0-9]+)+)$/i;

function isValidLinkNodeID(id: string) {
    return isValidNodeIDRegexp.test(id)
}

function getNodeByID(nodes: Node[], id: string, root_id: string = ""): Node | undefined {
    let id_flag = id.replace(root_id, "");
    if (id_flag.startsWith(".")) {
        id_flag = id_flag.slice(1);
    }
    id_flag = id_flag.split(".")[0];

    if (root_id !== "") {
        id_flag = `${root_id}.${id_flag}`
    }

    const n = nodes.find(n => n.id() === id_flag);
    if (id_flag === id) {
        return n
    }
    return getNodeByID(n!.nodes!, id, id_flag)
}

function readRawNodes(nodes: Node[], parent_id: string): Node[] {
    const output: Node[] = []
    nodes.forEach(n => {
        const nn = new node(n.name, n.type, parent_id, n.description, n.technology, n.deployment);
        if (n.nodes !== undefined) {
            nn.nodes = readRawNodes(n.nodes, nn.id())
        }
        output.push(nn);
    })
    return output;
}

function boundaryC4Diagram(node: Node): string {
    switch (node.type) {
        case Type.Domain:
        case Type.Team:
        case Type.Organisation:
        case Type.Department:
            return `Enterprise_Boundary(${node.id()},"${node.name}")`
        case Type.Service:
            return `System_Boundary(${node.id()},"${node.name}")`
        default:
            return ""
    }
}

type nodeMap = {
    node: Node;
    is_external: boolean;
}

type nodesGroup = {
    [key: string]: nodeMap[];
}

/**
 * GENERATED by https://app.quicktype.io/
 * */
function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => {
                return prettyTypeName(a);
            }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = {key: p.js, typ: p.typ});
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {
            }
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => {
            return l(a);
        }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function l(typ: any) {
    return {literal: typ};
}

function a(typ: any) {
    return {arrayItems: typ};
}

function u(...typs: any[]) {
    return {unionMembers: typs};
}

function o(props: any[], additional: any) {
    return {props, additional};
}

function r(name: string) {
    return {ref: name};
}

const typeMap: any = {
    "Graph": o([
        {json: "links", js: "links", typ: u(undefined, a(r("Link")))},
        {json: "nodes", js: "nodes", typ: a(r("Node"))},
    ], "any"),
    "Link": o([
        {json: "from", js: "from", typ: ""},
        {json: "to", js: "to", typ: ""},
        {json: "description", js: "description", typ: u(undefined, "")},
        {json: "technology", js: "technology", typ: u(undefined, "")},
    ], "any"),
    "Node": o([
        {json: "name", js: "name", typ: ""},
        {json: "type", js: "type", typ: r("Type")},
        {json: "deployment", js: "deployment", typ: u(undefined, "")},
        {json: "description", js: "description", typ: u(undefined, "")},
        {json: "technology", js: "technology", typ: u(undefined, "")},
        {json: "nodes", js: "nodes", typ: u(undefined, a(r("Node")))},
    ], "any"),
    "Type": [
        "application",
        "database",
        "department",
        "domain",
        "organisation",
        "queue",
        "service",
        "team",
    ],
};
