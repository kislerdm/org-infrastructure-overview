import {describe, expect, it} from "vitest";
import {Graph} from "../src/graph";

describe("Graph initialisation", () => {
    it("shall succeed if the input has a single node", () => {
        const o = {
            nodes: [
                {id: "foo", type: "organisation"},
            ],
        }
        const g = new Graph(o);

        expect(JSON.stringify(g.nodes)).toBe(JSON.stringify(o.nodes))
        expect(g.links).toBe(undefined)
    })

    it("shall succeed if the input has two linked nodes", () => {
        const o = {
            nodes: [
                {id: "foo", type: "organisation"},
                {id: "bar", type: "organisation"}
            ],
            links: [
                {from: "foo", to: "bar"},
            ]
        }
        const g = new Graph(o);

        expect(JSON.stringify(g.nodes)).toBe(JSON.stringify(o.nodes));
        expect(JSON.stringify(g.links)).toBe(JSON.stringify(o.links));
    })

    it("shall fail if a node's id contains dots", () => {
        const o = {
            nodes: [
                {id: "foo", type: "organisation"},
                {
                    id: "bar", type: "organisation",
                    nodes: [{id: "baz.qux", type: "domain"}],
                },
            ],
            links: [
                {from: "foo", to: "bar"},
            ]
        }
        expect(() => {
            return new Graph(o);
        }).toThrow(Error("unexpected node id"))
    })

    it("shall fail if a node has wrong type", () => {
        const o = {
            nodes: [{id: "foo", type: "bar"}],
        }
        expect(() => {
            return new Graph(o);
        }).toThrowErrorMatchingSnapshot(`but got "bar"`)
    })

})
