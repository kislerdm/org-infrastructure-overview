// @vitest-environment jsdom
import {beforeEach, describe, expect, test} from "vitest";
import {JSDOM} from "jsdom";
import Main, {findFistAppeadDivElementByID} from "../src/main";
import {DiagramBuilder} from "../src/diagram";


describe.each([
    {
        id: "baz",
        dom: `<main><div id="foo"><div id="bar"><div id="baz"></div></div></div></main>`,
        want: `<div id="baz"></div>`
    },
    {
        id: "qux",
        dom: `<main><div id="foo"><div id="bar"><div id="baz"></div></div></div></main>`,
        want: undefined,
    },
    {
        id: "foo",
        dom: `<main><div id="foo"><div id="foo"></div></div></main>`,
        want: `<div id="foo"><div id="foo"></div></div>`,
    },
])("findFistAppeadDivElementByID with id $id in $dom", function ({id, dom, want}) {
    let mountPoint: Element,
        wantDom: HTMLDivElement | undefined = undefined;

    beforeEach(() => {
        mountPoint = new JSDOM(dom, {url: window.location}).window.document.querySelector<Element>("main")!;
        if (want != undefined) {
            wantDom = new JSDOM(want, {url: window.location}).window.document.querySelector<Element>(`#${id}`)!;
        }
    })

    test(`returns ${want}`, () => {
        // @ts-ignore
        const got = findFistAppeadDivElementByID(mountPoint, id);
        expect(wantDom).toEqual(got);
    })
})


class mockDiagramBuilder implements DiagramBuilder {
    err: Error | undefined
    svg: string | undefined

    constructor(svg: string | undefined, err: Error | undefined) {
        this.svg = svg;
        this.err = err;
    }

    renderSVG(s: string): Promise<string> {
        if (this.err != undefined) {
            return Promise.reject(this.err);
        }
        return Promise.resolve(this.svg);
    }
}

describe.each([
    {
        input: {
            name: "happy path - single node",
            data: {
                nodes: [
                    {
                        name: "Foo",
                        type: "organisation",
                    },
                ],
            },
            builder: new mockDiagramBuilder(`<svg>Foo</svg>`, undefined),
            route: "",
        },
        want: `<div class="row">
    <div class="column left"><div id="input" class="ninotree custom-control custom-radio"><form class="tree" id="intputForm"><ul><li><input class="custom-control-input" type="radio" name="tree" id="Foo" value="Foo" checked=""><label class="custom-control-label" for="Foo">Foo</label></li></ul></form></div></div>
    <div class="column right"><div id="output"><svg>Foo</svg></div></div>
</div>`,
    },
    {
        input: {
            name: "happy path - node with a children which has a child",
            data: {
                nodes: [
                    {
                        name: "Foo",
                        type: "organisation",
                        nodes: [
                            {
                                name: "Bar",
                                type: "department",
                                nodes: [
                                    {
                                        name: "Baz",
                                        type: "team",
                                    }
                                ]
                            }
                        ]
                    },
                ],
            },
            builder: new mockDiagramBuilder(`<svg>Foo</svg>`, undefined),
            route: "",
        },
        want: `<div class="row">
    <div class="column left"><div id="input" class="ninotree custom-control custom-radio"><form class="tree" id="intputForm"><ul><li><i class="caret fas fa-caret-down"></i><input class="custom-control-input" type="radio" name="tree" id="Foo" value="Foo" checked=""><label class="custom-control-label" for="Foo">Foo</label><ul><li><i class="caret fas fa-caret-down"></i><input class="custom-control-input" type="radio" name="tree" id="Foo/Bar" value="Foo/Bar"><label class="custom-control-label" for="Foo/Bar">Bar</label><ul><li><input class="custom-control-input" type="radio" name="tree" id="Foo/Bar/Baz" value="Foo/Bar/Baz"><label class="custom-control-label" for="Foo/Bar/Baz">Baz</label></li></ul></li></ul></li></ul></form></div></div>
    <div class="column right"><div id="output"><svg>Foo</svg></div></div>
</div>`,
    },
    {
        input: {
            name: "unhappy path - corrupt graph",
            data: {
                nodes: [
                    {
                        type: "organisation",
                    },
                ],
            },
            builder: new mockDiagramBuilder(`<svg>Foo</svg>`, undefined),
            route: "",
        },
        want: `<div class="alert">Error<div style="color:#000">Invalid value for key "name" on Node. Expected string but got undefined</div></div>`,
    },
    {
        input: {
            name: "unhappy path - rendering error",
            data: {
                nodes: [
                    {
                        name: "Foo",
                        type: "organisation",
                    },
                ],
            },
            builder: new mockDiagramBuilder(undefined, new Error("foo")),
            route: "",
        },
        want: `<div class="alert">Error<div style="color:#000">Diagram rendering error. Node ID: Foo\nfoo</div></div>`,
    }
])("Main: $input.name", async function ({input, want}) {
    let mountPoint: HTMLDivElement;

    beforeEach(() => {
        mountPoint = new JSDOM(`<div id="app"></div>`, {url: window.location})
            .window.document.querySelector<Element>("#app")!;
    })

    test(`shall generate the html page ${want}`, async () => {
        await Main(mountPoint, input.builder, input.route, input.data);
        expect(mountPoint.innerHTML).toEqual(want);
    })
})
