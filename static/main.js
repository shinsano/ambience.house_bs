document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navbar links
    document.querySelectorAll('.navbar-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // D3.js Mindmap Initialization with Expanding Nodes, Collision, and Improved Layout
    const width = document.querySelector('.mindmap-container').clientWidth;
    const height = 600;

    const svg = d3.select('.mindmap-svg')
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom()
            .scaleExtent([0.5, 3])
            .on("zoom", function (event) {
                g.attr("transform", event.transform);
            })
        );

    const g = svg.append("g");

    const initialNodes = [
        { id: 'card1_1', label: "An energy score to compare with peers, track progress, and get improvement recommendations.", expanded: false, x: width / 5, y: height / 2 },
        { id: 'card2_1', label: "A proof of home performance for energy codes compliance or tax incentives.", expanded: false, x: (2 * width) / 5, y: height / 2 },
        { id: 'card3_1', label: "A full checkup: duct test, combustion test, and a blower door test to measure the air leak.", expanded: false, x: (3 * width) / 5, y: height / 2 },
        { id: 'card4_1', label: "To explore my options for rooftop solar panels.", expanded: false, x: (4 * width) / 5, y: height / 2 }
    ];

    const expandedNodes = {
        'card1_1': [
            { id: 'card1_2', label: "I want to further capture the spots where the energy escapes in some rooms during night.", expanded: false }
        ],
        'card1_2': [
            { id: 'card1_2_YES', label: "Let's combine Home Energy Score and 4D-ThermoScan\nAsk Ambience GPT...", expanded: false },
            { id: 'card1_2_NO', label: "Get the Home Energy Score done and see what's next\nAsk Ambience GPT...", expanded: false }
        ],
        'card2_1': [
            { id: 'card2_2', label: "You likely need a HERS Audit and Rating\nfor Title 24 compliance.\nAsk Ambience GPT...", expanded: false }
        ],
        'card3_1': [
            { id: 'card3_2', label: "I think I need to adjust my HVAC load to ensure the comfort for each room.", expanded: false }
        ],
        'card3_2': [
            { id: 'card3_2_YES', label: "Consider an HVAC specialist to perform a Manual J/D analysis.\nAsk Ambience GPT...", expanded: false },
            { id: 'card3_2_NO', label: "We can help!\nAsk Ambience GPT...", expanded: false }
        ],
        'card4_1': [
            { id: 'card4_2', label: "You may benefit from an ASHRAE Level II or III audit.\nAsk Ambience GPT...", expanded: false }
        ]
    };

    const nodes = [...initialNodes];
    const links = [];

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(250))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(140)); // Prevent nodes from overlapping

    function update() {
        const linkSelection = g.selectAll("line").data(links, d => `${d.source.id}-${d.target.id}`);
        linkSelection.enter()
            .append("line")
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .merge(linkSelection);

        const nodeSelection = g.selectAll("g.node").data(nodes, d => d.id);
        const nodeEnter = nodeSelection.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x - 127}, ${d.y - 75})`)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", expandNode);

        nodeEnter.append("rect")
            .attr("width", 254)
            .attr("height", 150)
            .attr("rx", 20)
            .attr("ry", 20)
            .attr("fill", "#007bff")
            .attr("stroke", "#333")
            .attr("stroke-width", 2);

        nodeEnter.append("foreignObject")
            .attr("width", 220)
            .attr("height", 120)
            .attr("x", 17)
            .attr("y", 15)
            .append("xhtml:div")
            .attr("class", "description-text")
            .style("width", "220px")
            .style("height", "auto")
            .style("overflow", "hidden")
            .style("white-space", "pre-wrap")
            .style("color", "white")
            .style("font-family", "Dongle")
            .style("font-size", "20px")
            .html(d => d.label);

        nodeSelection.merge(nodeEnter);
    }

    function expandNode(event, d) {
        if (d.expanded || !expandedNodes[d.id]) return;
        d.expanded = true;
        nodes.push(...expandedNodes[d.id]);
        expandedNodes[d.id].forEach(newNode => {
            links.push({ source: d, target: newNode });
        });
        update();
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();
    }

    update();
});
