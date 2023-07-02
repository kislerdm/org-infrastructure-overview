import {describe, expect, it} from "vitest";
import {JSDOM} from 'jsdom';
import {C4DiagramBuilderMermaid} from "../src/diagram";

describe("C4DiagramBuilderMermaid", () => {
    it("shall generate svg of a single container", () => {
        const root = new JSDOM(`<main></main>`).window.document.querySelector<HTMLDivElement>('main')!;
        new C4DiagramBuilderMermaid(root)
            .renderSVG(`Container(foo,"Foo")`)
            .then(svg => {
                root.innerHTML = svg;
            })
        expect(root.getElementsByTagName("svg").length).toBe(1);
    })
})
