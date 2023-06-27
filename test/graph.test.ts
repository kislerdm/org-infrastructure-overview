import {describe, expect, it} from "vitest";
import {Graph, Type} from "../src/graph";

describe("Graph", () => {
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
                    expect(g.nodes).toEqual([
                        {name: "foo", type: "organisation", id: "foo"},
                        {name: "bar", type: "organisation", id: "bar"}
                    ])
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
                            {name: "qux", type: "organisation"}
                        ],
                    }
                    const g = new Graph(input);
                    expect(g.nodes).toEqual([
                        {
                            name: "foo", type: "organisation", id: "foo", nodes: [
                                {
                                    name: "bar", type: "team", id: "foo.bar", nodes: [
                                        {name: "baz", type: "service", id: "foo.bar.baz"}
                                    ]
                                }
                            ]
                        },
                        {name: "qux", type: "organisation", id: "qux"},
                    ])
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
                                    nodes: [{name: "baz.qux", type: "domain"}],
                                },
                            ],
                            links: [
                                {from: ".foo", to: "bar"},
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
                                {from: "baz..qux", to: "bar"},
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
                                {from: "foo.", to: "bar"},
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
                            {from: "foo.bar.baz1", to: "qux"},
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
                            {from: "foo.bar.baz", to: "quxx"},
                        ]
                    }
                    expect(() => {
                        new Graph(input)
                    }).toThrow("node with link's 'to' id not found")
                })
            })
        })
    })

    describe("getLinksByID", () => {
        it("shall not find links", () => {
            const input = new Graph({
                nodes: [
                    {name: "foo", type: Type.Team},
                    {name: "bar", type: Type.Team}
                ],
                links: [
                    {from: "foo", to: "bar"},
                ]
            });

            expect(input.getLinksByID("qux")).toStrictEqual([]);
        })

        it("shall yield the array of tree links", () => {
            const input = new Graph({
                nodes: [
                    {
                        name: "foo", type: Type.Team, nodes: [
                            {
                                name: "s0", type: Type.Service, nodes: [
                                    {name: "a0", type: Type.Application},
                                    {name: "a1", type: Type.Application}
                                ]
                            },
                            {
                                name: "a2", type: Type.Application
                            }
                        ]
                    },
                    {
                        name: "bar", type: Type.Team, nodes: [
                            {
                                name: "s0", type: Type.Service, nodes: [
                                    {name: "a0", type: Type.Application},
                                ]
                            }
                        ]
                    },
                ],
                links: [
                    {from: "foo.s0.a0", to: "foo.s0.a1"},
                    {from: "foo.s0.a0", to: "foo.a2"},
                    {from: "bar.s0.a0", to: "foo.s0.a0"},
                    {from: "bar.s0.a0", to: "foo.a2"},
                ]
            });

            expect(input.getLinksByID("foo.s0.a0").length).toEqual(3);
        })
    })
})
