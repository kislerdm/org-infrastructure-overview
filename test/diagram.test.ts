import {describe, expect, it} from "vitest";
import {JSDOM} from 'jsdom';
import {C4DiagramBuilderMermaid, C4Renderer} from "../src/diagram";
import {RenderResult} from "mermaid";

class mockC4Render implements C4Renderer {
    private readonly svg: string | undefined = undefined;
    private readonly err: Error | undefined = undefined;

    constructor(svg: string | undefined, err: Error | undefined = undefined) {
        this.svg = svg;
        this.err = err;
    }

    render(id: string, text: string, container?: Element): Promise<RenderResult> {
        if (this.err != undefined) {
            return Promise.reject(this.err);
        }
        return Promise.resolve({svg: this.svg});
    }
}

describe("C4DiagramBuilderMermaid", () => {
    it("shall generate svg of a single container", async () => {
        const root = new JSDOM(`<div id="app"></div>`).window.document.querySelector<HTMLDivElement>("#app")!;
        const builder = new C4DiagramBuilderMermaid(root, new mockC4Render("<svg>foo</svg>"));
        const svg = await builder.renderSVG(`Container(foo,"Foo")`);
        expect(svg).toMatch("<svg>");
    })
})
