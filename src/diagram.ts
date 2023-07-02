import mermaid from "mermaid";

export declare interface DiagramBuilder {
    /**
     * Renders the diagram as SVG.
     *
     * @param definition(string): Diagram definition.
     * @return Promise with the rendered diagram as SVG.
     * */
    renderSVG(definition: string): Promise<string>
}

export class C4DiagramBuilderMermaid {
    private readonly div_id: HTMLDivElement;

    constructor(div_id: HTMLDivElement) {
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
        this.div_id = div_id;
    }

    async renderSVG(definition: string): Promise<string> {
        const prefix = "C4Container";
        definition = definition.trimStart()
        if (!definition.startsWith(prefix)) {
            definition = `${prefix}\n${definition}`
        }
        const {svg} = await mermaid.render("diagram", definition, this.div_id);
        return svg;
    }
}
