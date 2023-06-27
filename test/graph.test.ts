import {describe, expect, it} from "@jest/globals";
import {Graph, Node, Type} from "../src/graph";

const example_graph = {
    nodes: [
        {
            id: "Foo", type: Type.Organisation, nodes: [
                {
                    id: "Foo.DepartmentA", type: Type.Department, nodes: [
                        {
                            id: "Foo.DepartmentA.DomainA", type: Type.Domain, nodes: [
                                {
                                    id: "Foo.DepartmentA.DomainA.Team0",
                                    type: Type.Team,
                                    description: "backend",
                                    nodes: [
                                        {
                                            id: "Foo.DepartmentA.DomainA.Team0.Service0", type: Type.Service, nodes: [
                                                {
                                                    id: "Foo.DepartmentA.DomainA.Team0.Service0.App1",
                                                    type: Type.Application,
                                                    technology: "Kotlin",
                                                    deployment: "AWS EKS"
                                                },
                                                {
                                                    id: "Foo.DepartmentA.DomainA.Team0.Service0.Database",
                                                    type: Type.Database,
                                                    technology: "AWS Aurora Postgres",
                                                },
                                                {
                                                    id: "Foo.DepartmentA.DomainA.Team0.Service0.Cache",
                                                    type: Type.Database,
                                                    technology: "AWS Elasticache Redis",
                                                },
                                            ]
                                        },
                                        {
                                            id: "Foo.DepartmentA.DomainA.Team0.Service1", type: Type.Application,
                                            technology: "Kotlin",
                                            description: "application to run batch jobs on database",
                                        },
                                    ]
                                },
                                {
                                    id: "Foo.DepartmentA.DomainA.Team1",
                                    type: Type.Team,
                                    description: "frontend",
                                    nodes: [
                                        {
                                            id: "Foo.DepartmentA.DomainA.Team1.Service2", type: Type.Application,
                                            technology: "JavaScript",
                                            deployment: "AWS EKS",
                                            description: "web application used by clients",
                                        },
                                    ]
                                }
                            ],
                        },
                        {
                            id: "Foo.DepartmentA.DomainB", type: Type.Domain, nodes: [
                                {
                                    id: "Foo.DepartmentA.DomainB.Team2",
                                    type: Type.Team,
                                    description: "analytics and reconciliation",
                                    nodes: [
                                        {
                                            id: "Foo.DepartmentA.DomainB.Team2.Service3", type: Type.Service, nodes: [
                                                {
                                                    id: "Foo.DepartmentA.DomainB.Team2.Service3.App",
                                                    type: Type.Application,
                                                    description: "analytics",
                                                    technology: "Python",
                                                    deployment: "AWS EKS",
                                                },
                                                {
                                                    id: "Foo.DepartmentA.DomainB.Team2.Service3.Database",
                                                    type: Type.Database,
                                                    technology: "S3 Bucket"
                                                },
                                            ]
                                        },
                                    ]
                                }
                            ]
                        }
                    ],
                },
                {
                    id: "Foo.DepartmentB", type: Type.Department, nodes: [
                        {
                            id: "Foo.DepartmentB.Team3",
                            type: Type.Team,
                            description: "streaming platform",
                            nodes: [
                                {
                                    id: "Foo.DepartmentB.Team3.Service4", type: Type.Service, nodes: [
                                        {
                                            id: "Foo.DepartmentB.Team3.Service4.App1",
                                            description: "Streaming Platform",
                                            type: Type.Queue,
                                            technology: "Kafka",
                                            deployment: "AWS MSK",
                                        },
                                        {
                                            id: "Foo.DepartmentB.Team3.Service4.App2",
                                            description: "Schema Registry",
                                            type: Type.Application,
                                            technology: "AWS Glue Schema Registry"
                                        },
                                    ]
                                },
                                {
                                    id: "Foo.DepartmentB.Team3.Service5", type: Type.Service, nodes: [
                                        {
                                            id: "Foo.DepartmentB.Team3.Service5.App1",
                                            description: "application to sync domain events data to datalake",
                                            type: Type.Application,
                                            technology: "Go",
                                            deployment: "AWS EKS",
                                        },
                                        {
                                            id: "Foo.DepartmentB.Team3.Service5.Database",
                                            description: "Datalake",
                                            type: Type.Database,
                                            technology: "S3 Bucket"
                                        },
                                    ]
                                },
                                {
                                    id: "Foo.DepartmentB.Team3.Service6",
                                    type: Type.Service,
                                    description: "Secrets manager",
                                    technology: "AWS Secretsmanager",
                                },
                            ]
                        },
                        {
                            id: "Foo.DepartmentB.Team4",
                            type: Type.Team,
                            description: "CIAM",
                            nodes: [
                                {
                                    id: "Foo.DepartmentB.Team4.Service7",
                                    type: Type.Service,
                                    description: "Mutates user's account",
                                    technology: "Go",
                                    deployment: "AWS EKS",
                                },
                                {
                                    id: "Foo.DepartmentB.Team4.Service8",
                                    type: Type.Service,
                                    description: "IAM",
                                    nodes: [
                                        {
                                            id: "Foo.DepartmentB.Team4.Service8.IAM",
                                            type: Type.Application,
                                            technology: "AWS Cognito",
                                        },
                                        {
                                            id: "Foo.DepartmentB.Team4.Service8.l0",
                                            description: "Trigger 1",
                                            type: Type.Application,
                                            technology: "Go",
                                            deployment: "AWS Lambda",
                                        },
                                        {
                                            id: "Foo.DepartmentB.Team4.Service8.l1",
                                            description: "Trigger 2",
                                            type: Type.Application,
                                            technology: "Go",
                                            deployment: "AWS Lambda",
                                        },
                                        {
                                            id: "Foo.DepartmentB.Team4.Service8.l2",
                                            description: "Trigger 3",
                                            type: Type.Application,
                                            technology: "Go",
                                            deployment: "AWS Lambda",
                                        },
                                    ]
                                },
                                {
                                    id: "Foo.DepartmentB.Team4.Service9",
                                    type: Type.Service,
                                    description: "Email notification service",
                                    technology: "AWS SES",
                                },
                            ]
                        }
                    ]
                },
            ],
        },
    ],
    links: [
        {from: "Foo.DepartmentA.DomainA.Team0", to: "Foo.DepartmentB.Team3"},
        {from: "Foo.DepartmentA.DomainA.Team0", to: "Foo.DepartmentB.Team4"},
        {from: "Foo.DepartmentA.DomainA.Team1", to: "Foo.DepartmentA.DomainA.Team0"},
        {from: "Foo.DepartmentA.DomainA.Team1", to: "Foo.DepartmentB.Team4"},
        {from: "Foo.DepartmentA.DomainB.Team2", to: "Foo.DepartmentB.Team3"},
        {from: "Foo.DepartmentB.Team4", to: "Foo.DepartmentB.Team3"},

        // Service0
        {
            from: "Foo.DepartmentA.DomainA.Team1.Service0",
            to: "Foo.DepartmentB.Team3.Service4",
            description: "Publishes and consumes domain events",
        },
        {
            from: "Foo.DepartmentA.DomainA.Team1.Service0",
            to: "Foo.DepartmentB.Team3.Service6",
            description: "Fetches authentication details",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team1.Service0",
            to: "Foo.DepartmentB.Team4.Service8",
            description: "Authenticates requests",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team0.Service0.App1",
            to: "Foo.DepartmentA.DomainA.Team0.Service0.Database",
            description: "Stores data",
            technology: "sync, TCP/Postgres protocol"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team0.Service0.App1",
            to: "Foo.DepartmentA.DomainA.Team0.Service0.Cache",
            description: "Caches responses",
            technology: "sync, TCP/Redis protocol"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team0.Service0.App1",
            to: "Foo.DepartmentB.Team3.Service4.App1",
            description: "Publishes and consumes domain events",
            technology: "sync, TCP/AVRO"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team0.Service0.App1",
            to: "Foo.DepartmentB.Team3.Service4.App2",
            description: "Fetches events schemas",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team0.Service0.App1",
            to: "Foo.DepartmentB.Team3.Service6",
            description: "Fetches authentication details",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team1.Service0.App1",
            to: "Foo.DepartmentB.Team4.Service8.IAM",
            description: "Authenticates requests",
            technology: "sync, HTTP/JSON"
        },

        // Service1
        {
            from: "Foo.DepartmentA.DomainA.Team1.Service1",
            to: "Foo.DepartmentA.DomainA.Team0.Service0.Database",
            description: "Performs bulk operations",
            technology: "sync, TCP/Postgres protocol"
        },

        // Service2
        {
            from: "Foo.DepartmentA.DomainA.Team1.Service2",
            to: "Foo.DepartmentA.DomainA.Team0.Service0",
            description: "Uses to process user's requests",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team1.Service2",
            to: "Foo.DepartmentA.DomainA.Team0.Service0.App1",
            description: "Uses to process user's requests",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team1.Service2",
            to: "Foo.DepartmentB.Team4.Service8.IAM",
            description: "Authenticates users",
            technology: "sync, HTTP/JSON"
        },

        // Service3
        {
            from: "Foo.DepartmentA.DomainB.Team2.Service3",
            to: "Foo.DepartmentB.Team3.Service4",
            description: "Publishes and consumes domain events"
        },
        {
            from: "Foo.DepartmentA.DomainB.Team2.Service3",
            to: "Foo.DepartmentB.Team3.Service6",
            description: "Fetches authentication details",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainB.Team2.Service3.App",
            to: "Foo.DepartmentB.Team3.Service5.Database",
            description: "Reads the data",
            technology: "sync, HTTP/parquet"
        },
        {
            from: "Foo.DepartmentA.DomainB.Team2.Service3.App",
            to: "Foo.DepartmentB.Team3.Service4.App1",
            description: "Publishes and consumes domain events",
            technology: "sync, TCP/AVRO"
        },
        {
            from: "Foo.DepartmentA.DomainB.Team2.Service3.App",
            to: "Foo.DepartmentB.Team3.Service4.App2",
            description: "Fetches events schemas",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainB.Team2.Service3.App",
            to: "Foo.DepartmentB.Team3.Service6",
            description: "Fetches authentication details",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainB.Team2.Service3.App",
            to: "Foo.DepartmentA.DomainB.Team2.Service3.Database",
            description: "Stores processed data",
            technology: "sync, TCP/Postgres protocol"
        },

        // Service5
        {
            from: "Foo.DepartmentB.Team3.Service5",
            to: "Foo.DepartmentB.Team3.Service4",
            description: "Consumes domain events"
        },
        {
            from: "Foo.DepartmentB.Team3.Service5",
            to: "Foo.DepartmentB.Team3.Service6",
            description: "Fetches authentication details",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentB.Team3.Service5.App1",
            to: "Foo.DepartmentB.Team3.Service4.App1",
            description: "Consumes domain events",
            technology: "sync, TCP/AVRO"
        },
        {
            from: "Foo.DepartmentB.Team3.Service5.App1",
            to: "Foo.DepartmentB.Team3.Service4.App2",
            description: "Fetches events schemas",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentB.Team3.Service5.App1",
            to: "Foo.DepartmentB.Team3.Service6",
            description: "Fetches authentication details",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentB.Team3.Service5.App1",
            to: "Foo.DepartmentB.Team3.Service5.Database",
            description: "Stores data",
            technology: "sync, HTTP/parquet"
        },

        // Service8
        {
            from: "Foo.DepartmentB.Team4.Service8",
            to: "Foo.DepartmentB.Team4.Service9",
            description: "Uses to send emails to users"
        },
        {
            from: "Foo.DepartmentB.Team4.Service8.IAM",
            to: "Foo.DepartmentB.Team4.Service8.l0",
            description: "Uses as trigger",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentB.Team4.Service8.IAM",
            to: "Foo.DepartmentB.Team4.Service8.l1",
            description: "Uses as trigger",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentB.Team4.Service8.IAM",
            to: "Foo.DepartmentB.Team4.Service8.l2",
            description: "Uses as trigger",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentB.Team4.Service8.l1",
            to: "Foo.DepartmentB.Team4.Service9",
            description: "Uses to send email to users"
        },
    ],
};

describe("Graph initialisation", () => {
    describe("Successful", () => {
        it("if the input has a single node", () => {
            const o = {
                nodes: [
                    {id: "foo", type: "organisation"},
                ],
            }
            const g = new Graph(o);

            expect(JSON.stringify(g.nodes)).toBe(JSON.stringify(o.nodes))
            expect(g.links).toStrictEqual([]);
        })

        it("if the input has two linked nodes", () => {
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

        it("if successful graph is parsed", () => {
            expect(() => {new Graph(example_graph)}).not.toThrow()
        })
    })

    describe("Failed because of the node's definition", () => {
        const tests = [
            {
                name: "if a node's id starts with a dot",
                input: {
                    nodes: [
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: ".baz.qux", type: "domain"}],
                        },
                    ],
                    links: [
                        {from: "foo", to: "bar"},
                    ]
                },
                wantErr: "unexpected node id",
            },
            {
                name: "if a node's id two consecutive dots",
                input: {
                    nodes: [
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: "baz..qux", type: "domain"}],
                        },
                    ],
                    links: [
                        {from: "foo", to: "bar"},
                    ]
                },
                wantErr: "unexpected node id",
            },
            {
                name: "if a node's id ends with a dot",
                input: {
                    nodes: [
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: "baz.qux.", type: "domain"}],
                        },
                    ],
                    links: [
                        {from: "foo", to: "bar"},
                    ]
                },
                wantErr: "unexpected node id",
            }
        ]

        for (const test of tests) {
            it(test.name, () => {
                expect(() => {
                    return new Graph(test.input);
                }).toThrow(Error(test.wantErr))
            })
        }
    })

    describe("Failed because of the link's definition", () => {
        const tests = [
            {
                name: "if a link's from id starts with a dot",
                input: {
                    nodes: [
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: "baz.qux", type: "domain"}],
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
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: "baz.qux", type: "domain"}],
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
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: "baz.qux", type: "domain"}],
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
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: "baz.qux", type: "domain"}],
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
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: "baz.qux", type: "domain"}],
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
                        {id: "foo", type: "organisation"},
                        {
                            id: "bar", type: "organisation",
                            nodes: [{id: "baz.qux", type: "domain"}],
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
})

describe("getNodeByID for root nodes", () => {
    describe("simple root node ID", () => {
        const g = new Graph({
            nodes: [
                {
                    id: "foo", type: Type.Organisation, nodes: [
                        {
                            id: "foo.bar", type: Type.Department, nodes: [
                                {id: "foo.bar.qux", type: Type.Team},
                            ],
                        },
                        {id: "foo.quxx", type: Type.Department},
                    ]
                },
                {
                    id: "foo1", type: Type.Organisation, nodes: [
                        {
                            id: "foo1.bar", type: Type.Department, nodes: [
                                {id: "foo1.bar.qux", type: Type.Team},
                            ],
                        },
                        {id: "foo1.quxx", type: Type.Department},
                    ]
                },
            ]
        })

        it("shell return the node given a graph of depth 3", () => {
            const want: Node = new Graph({nodes: [{id: "foo.bar.qux", type: Type.Team}]}).nodes[0];
            expect(g.getNodeByID("foo.bar.qux")).toStrictEqual(want);
        })

        it("shell return the node of depth 1 given a graph of depth 3", () => {
            const want: Node = new Graph({
                nodes: [{
                    id: "foo1.bar", type: Type.Department, nodes: [
                        {id: "foo1.bar.qux", type: Type.Team},
                    ],
                }]
            }).nodes[0];
            expect(g.getNodeByID("foo1.bar")).toStrictEqual(want);
        })

        it("shell return the deepest node given a graph of depth 3", () => {
            const want: Node = new Graph({nodes: [{id: "foo1.bar.qux", type: Type.Team}]}).nodes[0];
            expect(g.getNodeByID("foo1.bar.qux")).toStrictEqual(want);
        })

        it("shell yield undefined", () => {
            const want: Node | undefined = undefined;
            expect(g.getNodeByID("a")).toStrictEqual(want);
        })
    })
})

describe("Graph.defineC4Diagram", () => {
    const g = new Graph(example_graph);

    it("shall yield the diagram of centered on Team0 with three links", () => {
        expect(g.defineC4Diagram("Foo.DepartmentA.DomainA.Team0")).toBe(`C4Context
Enterprise_Boundary(Foo.DepartmentA.DomainA, "DomainA") {
Component(Foo.DepartmentA.Team0, "Team0")
Component(Foo.DepartmentA.Team1, "Team1")
}
Enterprise_Boundary(Foo.DepartmentB, "DepartmentB") {
Component_Ext(Foo.DepartmentB.Team3, "Team3")
Component_Ext(Foo.DepartmentB.Team4, "Team4")
}
Rel(Foo.DepartmentA.DomainA.Team0,Foo.DepartmentB.Team3)
Rel(Foo.DepartmentA.DomainA.Team0,Foo.DepartmentB.Team3)
Rel(Foo.DepartmentA.DomainA.Team1,Foo.DepartmentA.DomainA.Team0)
`)
    })
})