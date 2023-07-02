import {describe, expect, it} from "vitest";
import Graph from "../src/graph";
// @ts-ignore
import example_graph from "../src/data.json";

describe("new Graph", () => {
    describe("initialisation", () => {
        describe("Happy path", () => {
            it("if the input has a single node", () => {
                const input = {
                    nodes: [
                        {name: "foo", type: "organisation"},
                    ],
                }
                const g = new Graph(input);

                expect(g.nodes).toMatchObject(input.nodes);
                expect(g.links).toStrictEqual([]);
            })

            it("if the input has two linked nodes", () => {
                const input = {
                    nodes: [
                        {name: "foo", type: "organisation"},
                        {name: "bar", type: "organisation"}
                    ],
                    links: [
                        {from: "foo", to: "bar"},
                    ]
                }
                const g = new Graph(input);

                expect(g.nodes).toMatchObject(input.nodes);
                expect(g.links).toMatchObject(input.links);
            })

            describe("id definition", () => {
                it("if root nodes provided only", () => {
                    const input = {
                        nodes: [
                            {name: "foo", type: "organisation"},
                            {name: "bar", type: "organisation"}
                        ],
                    }
                    const g = new Graph(input);

                    expect(g.nodes.length).toStrictEqual(2)
                    expect(g.links.length).toStrictEqual(0)

                    expect(g.nodes[0].name).toStrictEqual("foo")
                    expect(g.nodes[0].type).toStrictEqual("organisation")
                    expect(g.nodes[0].id()).toStrictEqual("foo")
                    expect(g.nodes[0].parentID()).toStrictEqual("")

                    expect(g.nodes[1].name).toStrictEqual("bar")
                    expect(g.nodes[1].type).toStrictEqual("organisation")
                    expect(g.nodes[1].id()).toStrictEqual("bar")
                    expect(g.nodes[1].parentID()).toStrictEqual("")
                })

                it("if nested nodes provided", () => {
                    const input = {
                        nodes: [
                            {
                                name: "foo", type: "organisation", nodes: [
                                    {
                                        name: "bar", type: "department", nodes: [
                                            {name: "baz", type: "service"}
                                        ]
                                    }
                                ]
                            },
                            {name: "qux", type: "organisation"}
                        ],
                    }

                    const g = new Graph(input);

                    expect(g.nodes.length).toStrictEqual(2)
                    expect(g.links.length).toStrictEqual(0)

                    expect(g.nodes[0].nodes.length).toStrictEqual(1)
                    expect(g.nodes[0].nodes[0].nodes.length).toStrictEqual(1)

                    expect(g.nodes[0].name).toStrictEqual("foo")
                    expect(g.nodes[0].type).toStrictEqual("organisation")
                    expect(g.nodes[0].id()).toStrictEqual("foo")
                    expect(g.nodes[0].parentID()).toStrictEqual("")

                    expect(g.nodes[1].name).toStrictEqual("qux")
                    expect(g.nodes[1].type).toStrictEqual("organisation")
                    expect(g.nodes[1].id()).toStrictEqual("qux")
                    expect(g.nodes[1].parentID()).toStrictEqual("")

                    expect(g.nodes[0].nodes[0].name).toStrictEqual("bar")
                    expect(g.nodes[0].nodes[0].type).toStrictEqual("department")
                    expect(g.nodes[0].nodes[0].id()).toStrictEqual("foo/bar")
                    expect(g.nodes[0].nodes[0].parentID()).toStrictEqual("foo")

                    expect(g.nodes[0].nodes[0].nodes[0].name).toStrictEqual("baz")
                    expect(g.nodes[0].nodes[0].nodes[0].type).toStrictEqual("service")
                    expect(g.nodes[0].nodes[0].nodes[0].id()).toStrictEqual("foo/bar/baz")
                    expect(g.nodes[0].nodes[0].nodes[0].parentID()).toStrictEqual("foo/bar")
                })
            })
        })

        describe("Unhappy path", () => {
            describe("Faulty link's definition", () => {
                const tests = [
                    {
                        name: "if a link's from id starts with a dot",
                        input: {
                            nodes: [
                                {name: "foo", type: "organisation"},
                                {
                                    name: "bar", type: "organisation",
                                    nodes: [{name: "baz/qux", type: "domain"}],
                                },
                            ],
                            links: [
                                {from: "/foo", to: "bar"},
                            ]
                        },
                        wantErr: "unexpected link's 'from' id",
                    },
                    {
                        name: "if a link's from id has two consecutive dots",
                        input: {
                            nodes: [
                                {name: "foo", type: "organisation"},
                                {
                                    name: "bar", type: "organisation",
                                    nodes: [{name: "baz.qux", type: "domain"}],
                                },
                            ],
                            links: [
                                {from: "baz//qux", to: "bar"},
                            ]
                        },
                        wantErr: "unexpected link's 'from' id",
                    },
                    {
                        name: "if a link's from id ends with a dot",
                        input: {
                            nodes: [
                                {name: "foo", type: "organisation"},
                                {
                                    name: "bar", type: "organisation",
                                    nodes: [{name: "baz.qux", type: "domain"}],
                                },
                            ],
                            links: [
                                {from: "foo/", to: "bar"},
                            ]
                        },
                        wantErr: "unexpected link's 'from' id",
                    },
                    {
                        name: "if a link's to id starts with a dot",
                        input: {
                            nodes: [
                                {name: "foo", type: "organisation"},
                                {
                                    name: "bar", type: "organisation",
                                    nodes: [{name: "baz.qux", type: "domain"}],
                                },
                            ],
                            links: [
                                {from: "foo", to: ".bar"},
                            ]
                        },
                        wantErr: "unexpected link's 'to' id",
                    },
                    {
                        name: "if a link's to id has two consecutive dots",
                        input: {
                            nodes: [
                                {name: "foo", type: "organisation"},
                                {
                                    name: "bar", type: "organisation",
                                    nodes: [{name: "baz.qux", type: "domain"}],
                                },
                            ],
                            links: [
                                {from: "foo", to: "baz..qux"},
                            ]
                        },
                        wantErr: "unexpected link's 'to' id",
                    },
                    {
                        name: "if a link's to id ends with a dot",
                        input: {
                            nodes: [
                                {name: "foo", type: "organisation"},
                                {
                                    name: "bar", type: "organisation",
                                    nodes: [{name: "baz.qux", type: "domain"}],
                                },
                            ],
                            links: [
                                {from: "foo", to: "bar."},
                            ]
                        },
                        wantErr: "unexpected link's 'to' id",
                    },
                ]

                for (const test of tests) {
                    it(test.name, () => {
                        expect(() => {
                            return new Graph(test.input);
                        }).toThrow(Error(test.wantErr))
                    })
                }
            })
            describe("No 'from' node found for a given link", () => {
                it("if root nodes provided only", () => {
                    const input = {
                        nodes: [
                            {name: "foo", type: "organisation"},
                            {name: "bar", type: "organisation"}
                        ],
                        links: [
                            {from: "qux", to: "foo"},
                        ]
                    }
                    expect(() => {
                        new Graph(input)
                    }).toThrow("node with link's 'from' id not found")
                })

                it("if nested nodes provided", () => {
                    const input = {
                        nodes: [
                            {
                                name: "foo", type: "organisation", nodes: [
                                    {
                                        name: "bar", type: "team", nodes: [
                                            {name: "baz", type: "service"}
                                        ]
                                    }
                                ]
                            },
                            {name: "qux", type: "organisation", namespace: ""},
                        ],
                        links: [
                            {from: "foo/bar/baz1", to: "qux"},
                        ]
                    }
                    expect(() => {
                        new Graph(input)
                    }).toThrow("node with link's 'from' id not found")
                })
            })
            describe("No 'to' node found for a given link", () => {
                it("if root nodes provided only", () => {
                    const input = {
                        nodes: [
                            {name: "foo", type: "organisation"},
                            {name: "bar", type: "organisation"}
                        ],
                        links: [
                            {from: "foo", to: "qux"},
                        ]
                    }
                    expect(() => {
                        new Graph(input)
                    }).toThrow("node with link's 'to' id not found")
                })

                it("if nested nodes provided", () => {
                    const input = {
                        nodes: [
                            {
                                name: "foo", type: "organisation", nodes: [
                                    {
                                        name: "bar", type: "team", nodes: [
                                            {name: "baz", type: "service"}
                                        ]
                                    }
                                ]
                            },
                            {name: "qux", type: "organisation", namespace: ""},
                        ],
                        links: [
                            {from: "foo/bar/baz", to: "quxx"},
                        ]
                    }
                    expect(() => {
                        new Graph(input)
                    }).toThrow("node with link's 'to' id not found")
                })
            })
        })
    })
})

describe("Graph.serialiseToPlantUML", () => {
    const g = new Graph(example_graph);

    it("shall yield the diagram centered on Team0 with three links", () => {
        expect(g.serialiseToPlantUML("Foo/DepartmentA/DomainA/Team0")).toEqual(`Enterprise_Boundary(Foo/DepartmentA/DomainA,"DomainA"){
Component(Foo/DepartmentA/DomainA/Team0,"Team0","backend")
Component_Ext(Foo/DepartmentA/DomainA/Team1,"Team1","frontend")
}
Enterprise_Boundary(Foo/DepartmentB,"DepartmentB"){
Component_Ext(Foo/DepartmentB/Team3,"Team3","streaming platform")
Component_Ext(Foo/DepartmentB/Team4,"Team4","CIAM")
}
Rel(Foo/DepartmentA/DomainA/Team0,Foo/DepartmentB/Team3,"","")
Rel(Foo/DepartmentA/DomainA/Team0,Foo/DepartmentB/Team4,"","")
Rel(Foo/DepartmentA/DomainA/Team1,Foo/DepartmentA/DomainA/Team0,"","")`)
    })

    it("shall yield the diagram centered on WebApplication two links", () => {
        expect(g.serialiseToPlantUML("Foo/DepartmentA/DomainA/Team1/Service2")).toEqual(`Enterprise_Boundary(Foo/DepartmentA/DomainA/Team1,"Team1"){
Container(Foo/DepartmentA/DomainA/Team1/Service2,"Service2","JavaScript/AWS EKS","web application used by clients")
}
Enterprise_Boundary(Foo/DepartmentA/DomainA/Team0,"Team0"){
System_Ext(Foo/DepartmentA/DomainA/Team0/Service0,"Service0","")
}
Enterprise_Boundary(Foo/DepartmentB/Team4,"Team4"){
System_Ext(Foo/DepartmentB/Team4/Service8,"Service8","IAM")
}
Rel(Foo/DepartmentA/DomainA/Team1/Service2,Foo/DepartmentA/DomainA/Team0/Service0,"Uses to process user's requests","sync, HTTP/JSON")
Rel(Foo/DepartmentA/DomainA/Team1/Service2,Foo/DepartmentB/Team4/Service8,"Authenticates users","sync, HTTP/JSON")`)
    })
})
