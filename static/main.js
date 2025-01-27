document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navbar links
    document.querySelectorAll('.navbar-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // D3.js Mindmap Initialization with Original Functionality
    const width = document.querySelector('.mindmap-container').clientWidth;
    const height = 600;

    const svg = d3.select('.mindmap-svg')
        .attr('width', width)
        .attr('height', height);

    const data = {
        nodes: [
            { id: 'node1', label: 'Energy Score' },
            { id: 'node2', label: 'HERS Audit' },
            { id: 'node3', label: 'Solar Panels' },
            { id: 'node4', label: 'Efficiency Upgrades' }
        ],
        links: [
            { source: 'node1', target: 'node2' },
            { source: 'node2', target: 'node3' },
            { source: 'node2', target: 'node4' }
        ]
    };

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(200))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke", "#333")
        .attr("stroke-width", 2);

    const node = svg.append("g")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("r", 20)
        .attr("fill", "#007bff")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title").text(d => d.label);

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
});
