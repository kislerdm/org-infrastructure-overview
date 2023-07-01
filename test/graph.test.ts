import {describe, expect, it} from "vitest";
import Graph from "../src/graph";

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
                    expect(g.nodes[0].nodes[0].id()).toStrictEqual("foo.bar")
                    expect(g.nodes[0].nodes[0].parentID()).toStrictEqual("foo")

                    expect(g.nodes[0].nodes[0].nodes[0].name).toStrictEqual("baz")
                    expect(g.nodes[0].nodes[0].nodes[0].type).toStrictEqual("service")
                    expect(g.nodes[0].nodes[0].nodes[0].id()).toStrictEqual("foo.bar.baz")
                    expect(g.nodes[0].nodes[0].nodes[0].parentID()).toStrictEqual("foo.bar")
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
})

const example_graph = {
    nodes: [
        {
            name: "Foo", type: "organisation", nodes: [
                {
                    name: "DepartmentA", type: "department", nodes: [
                        {
                            name: "DomainA", type: "domain", nodes: [
                                {
                                    name: "Team0",
                                    type: "team",
                                    description: "backend",
                                    nodes: [
                                        {
                                            name: "Service0", type: "service", nodes: [
                                                {
                                                    name: "App1",
                                                    type: "application",
                                                    technology: "Kotlin",
                                                    deployment: "AWS EKS"
                                                },
                                                {
                                                    name: "Database",
                                                    type: "database",
                                                    technology: "AWS Aurora Postgres",
                                                },
                                                {
                                                    name: "Cache",
                                                    type: "database",
                                                    technology: "AWS Elasticache Redis",
                                                },
                                            ]
                                        },
                                        {
                                            name: "Service1", type: "application",
                                            technology: "Kotlin",
                                            description: "application to run batch jobs on database",
                                        },
                                    ]
                                },
                                {
                                    name: "Team1",
                                    type: "team",
                                    description: "frontend",
                                    nodes: [
                                        {
                                            name: "Service2", type: "application",
                                            technology: "JavaScript",
                                            deployment: "AWS EKS",
                                            description: "web application used by clients",
                                        },
                                    ]
                                }
                            ],
                        },
                        {
                            name: "DomainB", type: "domain", nodes: [
                                {
                                    name: "Team2",
                                    type: "team",
                                    description: "analytics and reconciliation",
                                    nodes: [
                                        {
                                            name: "Service3", type: "service", nodes: [
                                                {
                                                    name: "App",
                                                    type: "application",
                                                    description: "analytics",
                                                    technology: "Python",
                                                    deployment: "AWS EKS",
                                                },
                                                {
                                                    name: "Database",
                                                    type: "database",
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
                    name: "DepartmentB", type: "department", nodes: [
                        {
                            name: "Team3",
                            type: "team",
                            description: "streaming platform",
                            nodes: [
                                {
                                    name: "Service4", type: "service", nodes: [
                                        {
                                            name: "App1",
                                            description: "Streaming Platform",
                                            type: "queue",
                                            technology: "Kafka",
                                            deployment: "AWS MSK",
                                        },
                                        {
                                            name: "App2",
                                            description: "Schema Registry",
                                            type: "application",
                                            technology: "AWS Glue Schema Registry"
                                        },
                                    ]
                                },
                                {
                                    name: "Service5", type: "service", nodes: [
                                        {
                                            name: "App1",
                                            description: "application to sync domain events data to datalake",
                                            type: "application",
                                            technology: "Go",
                                            deployment: "AWS EKS",
                                        },
                                        {
                                            name: "Database",
                                            description: "Datalake",
                                            type: "database",
                                            technology: "S3 Bucket"
                                        },
                                    ]
                                },
                                {
                                    name: "Service6",
                                    type: "service",
                                    description: "Secrets manager",
                                    technology: "AWS Secretsmanager",
                                },
                            ]
                        },
                        {
                            name: "Team4",
                            type: "team",
                            description: "CIAM",
                            nodes: [
                                {
                                    name: "Service7",
                                    type: "service",
                                    description: "Mutates user's account",
                                    technology: "Go",
                                    deployment: "AWS EKS",
                                },
                                {
                                    name: "Service8",
                                    type: "service",
                                    description: "IAM",
                                    nodes: [
                                        {
                                            name: "IAM",
                                            type: "application",
                                            technology: "AWS Cognito",
                                        },
                                        {
                                            name: "l0",
                                            description: "Trigger 1",
                                            type: "application",
                                            technology: "Go",
                                            deployment: "AWS Lambda",
                                        },
                                        {
                                            name: "l1",
                                            description: "Trigger 2",
                                            type: "application",
                                            technology: "Go",
                                            deployment: "AWS Lambda",
                                        },
                                        {
                                            name: "l2",
                                            description: "Trigger 3",
                                            type: "application",
                                            technology: "Go",
                                            deployment: "AWS Lambda",
                                        },
                                    ]
                                },
                                {
                                    name: "Service9",
                                    type: "service",
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
            from: "Foo.DepartmentA.DomainA.Team0.Service0",
            to: "Foo.DepartmentB.Team3.Service4",
            description: "Publishes and consumes domain events",
        },
        {
            from: "Foo.DepartmentA.DomainA.Team0.Service0",
            to: "Foo.DepartmentB.Team3.Service6",
            description: "Fetches authentication details",
            technology: "sync, HTTP/JSON"
        },
        {
            from: "Foo.DepartmentA.DomainA.Team0.Service0",
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
            from: "Foo.DepartmentA.DomainA.Team0.Service0.App1",
            to: "Foo.DepartmentB.Team4.Service8.IAM",
            description: "Authenticates requests",
            technology: "sync, HTTP/JSON"
        },

        // Service1
        {
            from: "Foo.DepartmentA.DomainA.Team0.Service1",
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
            to: "Foo.DepartmentB.Team4.Service8",
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

describe("Graph.serialiseToPlantUML", () => {
    const g = new Graph(example_graph);

    it("shall yield the diagram centered on Team0 with three links", () => {
        expect(g.serialiseToPlantUML("Foo.DepartmentA.DomainA.Team0")).toEqual(`Enterprise_Boundary(Foo.DepartmentA.DomainA,"DomainA"){
Component(Foo.DepartmentA.DomainA.Team0,"Team0","backend")
Component_Ext(Foo.DepartmentA.DomainA.Team1,"Team1","frontend")
}
Enterprise_Boundary(Foo.DepartmentB,"DepartmentB"){
Component_Ext(Foo.DepartmentB.Team3,"Team3","streaming platform")
Component_Ext(Foo.DepartmentB.Team4,"Team4","CIAM")
}
Rel(Foo.DepartmentA.DomainA.Team0,Foo.DepartmentB.Team3,"","")
Rel(Foo.DepartmentA.DomainA.Team0,Foo.DepartmentB.Team4,"","")
Rel(Foo.DepartmentA.DomainA.Team1,Foo.DepartmentA.DomainA.Team0,"","")`)
    })

    it("shall yield the diagram centered on WebApplication two links", () => {
        expect(g.serialiseToPlantUML("Foo.DepartmentA.DomainA.Team1.Service2")).toEqual(`Enterprise_Boundary(Foo.DepartmentA.DomainA.Team1,"Team1"){
Container(Foo.DepartmentA.DomainA.Team1.Service2,"Service2","JavaScript/AWS EKS","web application used by clients")
}
Enterprise_Boundary(Foo.DepartmentA.DomainA.Team0,"Team0"){
System_Ext(Foo.DepartmentA.DomainA.Team0.Service0,"Service0","")
}
Enterprise_Boundary(Foo.DepartmentB.Team4,"Team4"){
System_Ext(Foo.DepartmentB.Team4.Service8,"Service8","IAM")
}
Rel(Foo.DepartmentA.DomainA.Team1.Service2,Foo.DepartmentA.DomainA.Team0.Service0,"Uses to process user's requests","sync, HTTP/JSON")
Rel(Foo.DepartmentA.DomainA.Team1.Service2,Foo.DepartmentB.Team4.Service8,"Authenticates users","sync, HTTP/JSON")`)
    })
})
