import mermaid, {RenderResult} from "mermaid";

export declare interface DiagramBuilder {
    /**
     * Renders the diagram as SVG.
     *
     * @param definition(string): Diagram definition.
     * @return Promise with the rendered diagram as SVG.
     * */
    renderSVG(definition: string): Promise<string>
}

export interface C4Renderer {
    render(id: string, text: string, container?: Element): Promise<RenderResult>
}

export class C4DiagramBuilderMermaid {
    private readonly div_id: HTMLDivElement;
    private client: C4Renderer;

    constructor(div_id: HTMLDivElement, client: C4Renderer | undefined = undefined) {
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
            })
            this.client = mermaid;
        } else {
            this.client = client!;
        }
        this.div_id = div_id;
    }

    async renderSVG(definition: string): Promise<string> {
        const prefix: string = "C4Container";
        definition = definition.trimStart()
        if (!definition.startsWith(prefix)) {
            definition = `${prefix}\n${definition}`
        }
        const {svg} = await this.client.render("diagram", definition, this.div_id);
        return svg;
    }
}
