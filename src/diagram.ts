import mermaid, {RenderResult} from "mermaid";

export declare interface DiagramBuilder {
    /**
     * Renders the diagram as SVG.
     *
     * @param definition(string): Diagram definition.
     * @param container(Element): DOM element to use for rendering.
     * @return Promise with the rendered diagram as SVG.
     * */
    renderSVG(definition: string, container?: Element): Promise<string>
}

export interface C4Renderer {
    render(id: string, text: string, container?: Element): Promise<RenderResult>
}

export class C4DiagramBuilderMermaid implements DiagramBuilder {
    private client?: C4Renderer = undefined;

    constructor(client?: C4Renderer) {
        if (client === undefined) {
            mermaid.initialize({
                theme: "default",
                dompurifyConfig: {
                    USE_PROFILES: {
                        svg: true,
                    },
                },
                startOnLoad: true,
                htmlLabels: true,
                c4: {
                    diagramMarginY: 0,
                }
            })
            this.client = mermaid;
        } else {
            this.client = client;
        }
    }

    async renderSVG(definition: string, container?: Element): Promise<string> {
        const prefix: string = "C4Container";
        definition = definition.trimStart()
        if (!definition.startsWith(prefix)) {
            definition = `${prefix}\n${definition}`
        }
        const {svg} = await this.client!.render("diagram", definition, container);
        return svg;
    }
}

