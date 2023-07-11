import {C4DiagramBuilderMermaid} from "./diagram.ts";
import diagramRawDefinition from "./data.json";
import Main from "./main.ts";

function router(): string {
    const o = decodeURI(window.location.href.replace(window.location.origin, "").slice(1))
    if (o.endsWith("/")) {
        window.location.replace(window.location.toString().slice(0, -1));
        return o.slice(0, -1);
    }
    return o;
}

const root = document.querySelector<HTMLDivElement>('#app')!;
const diagramDiv = document.createElement("div");
root.appendChild(diagramDiv);

// TODO: replace test data
// const diagramRawDefinition = {
//     nodes: [
//         {
//             name: "Foo",
//             type: "organisation",
//         },
//     ],
// }

Main(root, new C4DiagramBuilderMermaid(), router(), diagramRawDefinition);
