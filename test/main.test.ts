// @vitest-environment jsdom
import {beforeEach, describe, expect, it, test} from "vitest";
import {JSDOM} from "jsdom";
import Main, {findFistDivElementByID, Router} from "../src/main";
import {DiagramBuilder} from "../src/diagram";
import SetTemplatedComponents, {addInfoPopUp} from "../src/template";

describe.each([
    {url: "https://foobar.com/baz-qux/", want: ""},
    {url: "https://foobar.com/baz-qux/q=foo", want: "foo"},
    {url: "https://foobar.com/baz-qux/?q=foo", want: "foo"},
    {url: "https://foobar.com/baz-qux/?q=foo/bar", want: "foo/bar"},
])("Router.readNodeIDFromRoute for $url", function ({url, want}) {
    test(`returns ${want}`, () => {
        const location = new JSDOM("<main></main>", {url: url}).window.location;
        expect(new Router(location).readNodeIDFromRoute()).toStrictEqual(want);
    })
})

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
        const got = findFistDivElementByID(mountPoint, id);
        expect(wantDom).toEqual(got);
    })
})


class mockDiagramBuilder implements DiagramBuilder {
    err?: Error = undefined

    constructor(err?: Error) {
        this.err = err;
    }

    renderSVG(s: string): Promise<string> {
        if (this.err != undefined) {
            return Promise.reject(this.err);
        }
        return Promise.resolve(`<svg>${s}</svg>`);
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
            builder: new mockDiagramBuilder(),
            route: "",
        },
        want: SetTemplatedComponents(`<div class="row">
    <div class="column left"><label id="lab-input" for="input">Select node</label><div id="input" class="tree-panel"><div class="force-overflow"><form class="tree" id="intputForm"><ul><li><span class="fixed"></span><span class="custom-control-input" id="Foo" style="font-weight:bold;font-size:18px">Foo</span></li></ul></form></div></div></div>
    <div class="column right"><div id="output"><p id="diagram-title">Architecture diagram of the organisation "Foo"</p><svg>Component(Foo,"Foo","")\n</svg></div></div>
</div>`),
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
            builder: new mockDiagramBuilder(),
            route: "",
        },
        want: SetTemplatedComponents(`<div class="row">
    <div class="column left"><label id="lab-input" for="input">Select node</label><div id="input" class="tree-panel"><div class="force-overflow"><form class="tree" id="intputForm"><ul><li><span class="caret minimize"></span><span class="custom-control-input" id="Foo" style="font-weight:bold;font-size:18px">Foo</span><ul><li><span class="caret minimize"></span><span class="custom-control-input" id="Foo/Bar">Bar</span><ul><li><span class="fixed"></span><span class="custom-control-input" id="Foo/Bar/Baz">Baz</span></li></ul></li></ul></li></ul></form></div></div></div>
    <div class="column right"><div id="output"><p id="diagram-title">Architecture diagram of the organisation "Foo"</p><svg>Component(Foo,"Foo","")\n</svg></div></div>
</div>`),
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
            builder: new mockDiagramBuilder(),
            route: "",
        },
        want: SetTemplatedComponents(`<div class="alert">Error<div style="color:#000">Invalid value for key "name" on Node. Expected string but got undefined</div></div>`),
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
            builder: new mockDiagramBuilder(new Error("foo")),
            route: "",
        },
        want: SetTemplatedComponents(`<div class="alert">Error<div style="color:#000">Diagram rendering error. Node ID: Foo\nfoo</div></div>`),
    }
])("Main: $input.name", async function ({input, want}) {
    let mountPoint: HTMLDivElement;

    beforeEach(() => {
        mountPoint = new JSDOM(`<div id="app"></div>`, {url: window.location})
            .window.document.querySelector<Element>("#app")!;
    })

    test(`shall generate the html page ${want}`, async () => {
        await Main(mountPoint, input.builder, input.data);

        expect(mountPoint.innerHTML).toEqual(want);
    })
})

// TODO: fix the test:
// GIVEN
//  Correct logic
// WHEN
//  The radio button in the selector tree is clicked
// THEN
//  The diagram is redrawn
// describe("Main select node in the input panel", () => {
//     let doc: Document,
//         mountPoint: HTMLDivElement
//
//     beforeEach(() => {
//         doc = new JSDOM(`<div id="app"></div>`, {
//             url: window.location,
//             // runScripts: "dangerously",
//         }).window.document;
//         mountPoint = doc.querySelector<HTMLDivElement>("#app")!;
//     })
//
//     it("shall redraw diagram for the node Bar given two nodes, Foo and Bar with Foo default", async () => {
//         const input = {
//             data: {
//                 nodes: [
//                     {
//                         name: "Foo",
//                         type: "organisation",
//                     },
//                     {
//                         name: "Bar",
//                         type: "organisation",
//                     },
//                 ],
//             },
//             builder: new mockDiagramBuilder(),
//             route: "",
//         }
//         const want: string = `<div class="row">
//     <div class="column left"><div id="input" class="ninotree custom-control custom-radio"><form class="tree" id="intputForm"><ul><li><input class="custom-control-input" type="radio" name="tree" id="Foo" value="Foo"><label class="custom-control-label" for="Foo">Foo</label></li><li><input class="custom-control-input" type="radio" name="tree" id="Bar" value="Bar" checked=""><label class="custom-control-label" for="Bar">Bar</label></li></ul></form></div></div>
//     <div class="column right"><div id="output"><svg>Component(Bar,"Bar","")\n</svg></div></div>
// </div>`;
//
//         await Main(mountPoint, input.builder, input.route, input.data);
//
//         // @ts-ignore
//         for (const inputBtn of mountPoint.getElementsByClassName("custom-control-input")) {
//             if (inputBtn.id == "Bar") {
//                 inputBtn.dispatchEvent(new Event("click"));
//             }
//         }
//
//         expect(mountPoint.innerHTML).toEqual(want);
//     })
// })
