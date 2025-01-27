document.addEventListener('DOMContentLoaded', () => {
    const energyButton = document.getElementById('energyButton');
    const comfortButton = document.getElementById('comfortButton');
    // const energySection = document.getElementById('energy');
    const stickyHeader = document.getElementById("sticky-header");
    const showHeaderPosition = window.innerHeight;

    const energySection = document.getElementById("energy");
    const landingSection = document.getElementById("landing");

    if (energySection) {
        energySection.addEventListener("scroll", () => {
            console.log("Energy section scrolled");
        });
    }

    if (landingSection) {
        landingSection.addEventListener("scroll", () => {
            console.log("Landing section scrolled");
        });
    }

    // if (!stickyHeader) {
    //     console.error("Sticky header element not found");
    //     return;
    // }

    // const toggleHeaderVisibility = () => {
    //     const showHeaderPosition = energySection.offsetTop - stickyHeader.offsetHeight;
    //     if (document.body.scrollTop > showHeaderPosition || document.documentElement.scrollTop > showHeaderPosition) {
    //         stickyHeader.classList.add("visible");
    //         console.log("Header visible");
    //     } else {
    //         stickyHeader.classList.remove("visible");
    //         console.log("Header hidden");
    //     }
    // };

    // document.body.addEventListener("scroll", toggleHeaderVisibility);
    // document.documentElement.addEventListener("scroll", toggleHeaderVisibility);

    if (energyButton && energySection) {
        energyButton.addEventListener('click', () => {
            energySection.scrollIntoView({ behavior: 'smooth' });
            setTimeout(toggleHeaderVisibility, 500); // Adjust timeout as needed
        });
    }

    if (comfortButton && energySection) {
        comfortButton.addEventListener('click', () => {
            energySection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const mouseContainer = document.querySelector('.mouse-container');

    // Hide mouse container after 10 seconds
    if (mouseContainer) {
        setTimeout(() => {
            mouseContainer.style.display = 'none';
        }, 10000);
    }

    // Add event listeners for buttons to show chat UI
    if (energyButton) {
        energyButton.addEventListener('click', () => {
            document.getElementById('chatUI').style.display = 'block';
        });
    }

    if (comfortButton) {
        comfortButton.addEventListener('click', () => {
            document.getElementById('chatUI').style.display = 'block';
        });
    }
});

// Add window scroll listener
window.addEventListener("scroll", () => {
    console.log("Window scrolled:", window.scrollY);
});

// document.body.addEventListener("scroll", () => {
//     console.log("Body scrolled");
// });

// Initialize SVG and Simulation
const width = window.innerWidth,
    height = window.innerHeight,
    nodeWidth = 254,
    nodeHeight = 150,
    gap = 15;

// Centralized configuration for node dimensions and gap
const nodeConfig = {
    width: 254,
    height: 150,
    gap: 15,
    textWidth: 220,
    textPaddingX: 20, // Padding for text alignment inside the node
    textPaddingY: 30 // Padding for vertical alignment
};

// D3 Visualization
const svg = d3.select(".mindmap-svg")
    .attr("width", "100%")
    .attr("height", "100%");

// Add the SVG Group
const svgGroup = svg.append("g");

const data = {
    nodes: [
        { id: "card1_1", hasChild: false },
        { id: "card2_1", hasChild: false },
        { id: "card3_1", hasChild: false },
        { id: "card4_1", hasChild: false }
    ],
    links: []
};

const initialTexts = {
    card1_1: "An energy score to compare with peers, track progress, and get improvement recommendations.",
    card2_1: "A proof of home performance for energy codes complianceor tax incentives.",
    card3_1: "A full checkup: duct test, combustion test, and a blower door test to measure the airleak.",
    card4_1: "To explore my options for rooftop solar panels.",
    card1_2: "I want to further capture the spots where the energy escapes in some rooms during night.",
    card1_2_YES: "Let's combine Home Energy Score and 4D-ThermoScan <br>Ask Ambience GPT...",
    card1_2_NO: "Get the Home Enrgy Score done and see what's next <br>Ask Ambience GPT...",
    card2_2: "You likely need a HERS Audit and Rating for Title 24 compliance. <br>Ask Ambience GPT...",
    card3_2: "I think I need to adjust my HVAC load to ensure the comfort for each room.",
    card3_2_YES: "Consider an HVAC specialist to perform a Manual J/D analysis. <br>Ask Ambience GPT...",
    card3_2_NO: "We can help! <br>Ask Ambience GPT...",
    card4_2: "You may benefit from an ASHRAE Level II or III audit. <br>Ask Ambience GPT..."
};

// Ensure valid data structure
['nodes', 'links'].forEach(key => {
    if (!Array.isArray(data[key])) {
        console.error(`Invalid or missing data.${key}. Initializing as an empty array.`);
        data[key] = [];
    }
});

// Define startY at a higher scope so it's accessible in handleNodeClick
const startY = 200; // Adjust this value as needed

// Check if the device is a small mobile device
const isSmallMobile = window.innerWidth < 480;

// Set initial positions for nodes
if (isSmallMobile) {
    // 2x2 layout for small mobile devices
    const startX = (1200 - (2 * nodeWidth + gap)) / 2; // Center the two columns

    data.nodes.forEach((node, i) => {
        const row = Math.floor(i / 2); // Determine row (0 or 1)
        const col = i % 2; // Determine column (0 or 1)
        node.x = startX + col * (nodeWidth + gap);
        node.y = startY + row * (nodeHeight + gap);
    });
} else {
    // Single row layout for larger screens
    const startX = (1200 - (data.nodes.length * nodeWidth + (data.nodes.length - 1) * gap)) / 2;

    data.nodes.forEach((node, i) => {
        node.x = startX + i * (nodeWidth + gap);
        node.y = startY; // Align all nodes in a single row
    });
}

// Determine the appropriate center force based on screen size
const isMobile = window.innerWidth <= 768;
const centerXFactor = isMobile ? 1.9 : 2.6; // 85% scale for mobile, 270% for desktop
const centerYFactor = isMobile ? 8 : 8; // 800% scale for mobile, 800% for desktop

// Configure simulation forces
const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links)
        .id(d => d.id)
        .distance(d => {
            if (
                (d.source.id === "card1_2" && ["card1_2_YES", "card1_2_NO"].includes(d.target.id)) ||
                (d.source.id === "card3_2" && ["card3_2_YES", "card3_2_NO"].includes(d.target.id))
            ) {
                return 300; // Specific link distances
            }
            return 400; // Default link distance
        }))
    .force("x", d3.forceX()
        .x(d => {
            if (["card1_2_YES", "card1_2_NO", "card3_2_YES", "card3_2_NO"].includes(d.id)) {
                return d.x; // Fix X position for specific nodes
            }
            return width / 2; // Default X position
        })
        .x(d => d.x).strength(0.1))
    .force("charge", d3.forceManyBody().strength(-100)) // Repel nodes
    .force("center", d3.forceCenter(window.innerWidth / centerXFactor, window.innerHeight / centerYFactor)) // Adjust center based on screen size
    .force("collision", d3.forceCollide().radius(nodeWidth / 2 + gap)) // Prevent overlap
    .force("y", d3.forceY().y(d => d.y).strength(0.1)); // Fine-tune Y positioning

    
// Create links group
let link = svgGroup.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links);

// Define non-clickable nodes
const stopNodes = new Set([
    "card1_2_YES", "card1_2_NO", "card2_2",
    "card3_2_YES", "card3_2_NO", "card4_2"
]);

// Create nodes group
let nodes = svgGroup.selectAll("g.node")
    .data(data.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x}, ${d.y - 75})`)
    .on("click", function (event, d) {
        if (!stopNodes.has(d.id) && !d.clicked) {
            const parts = d.id.split('_');
            const newNodeId = `${parts[0]}_${parseInt(parts[1]) + 1}`;

            if (["card1_2", "card3_2"].includes(d.id)) {
                // Create 'YES' and 'NO' child nodes
                const yesNode = { id: `${parts[0]}_${parts[1]}_YES`, x: d.x - nodeWidth - gap, y: d.y + nodeHeight + gap * 2, hasChild: false };
                const noNode = { id: `${parts[0]}_${parts[1]}_NO`, x: d.x + nodeWidth + gap, y: d.y + nodeHeight + gap * 2, hasChild: false };
                data.nodes.push(yesNode, noNode);
            } else {
                // Create a single child node
                const newNode = { id: newNodeId, x: d.x, y: d.y + nodeHeight + gap, hasChild: false };
                data.nodes.push(newNode);
                data.links.push({ source: d, target: newNode });
            }

            d.hasChild = true;
            d.clicked = true; // Mark as clicked
            update(); // Refresh visualization
        }
    })
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

// Add rectangles to nodes
nodes.append("rect")
    .attr("width", nodeConfig.width)
    .attr("height", nodeConfig.height)
    .attr("fill", "white")
    .style("opacity", 1)
    .attr("rx", 20)
    .attr("ry", 20);

// Add text content to nodes
nodes.append("foreignObject")
    .attr("x", (nodeWidth - 220) / 2)
    .attr("y", (nodeHeight - 120) / 2)
    .attr("width", 220)
    .attr("height", nodeHeight + 10)
    .append("xhtml:div")
    .attr("class", "description-text")
    .style("width", "200px")
    .style("height", "auto")
    .style("overflow", "hidden")
    .style("white-space", "pre-wrap") // Allow line breaks
    .html(d => (initialTexts[d.id] || d.text || "Default text for new cards.").replace(/\n/g, '<br>'));

// Add titles for hover tooltips
nodes.append("title").text(d => d.id);

// Update positions during simulation ticks
simulation.on("tick", () => {
    link.attr("x1", d => d.source.x + nodeWidth / 2)
        .attr("y1", d => d.source.y + nodeHeight)
        .attr("x2", d => d.target.x + nodeWidth / 2)
        .attr("y2", d => d.target.y);

    nodes.attr("transform", d => `translate(${d.x}, ${d.y})`);

    // Update link label positions for a limited number of links
    svgGroup.selectAll(".link-label")
        .data(data.links.slice(0, 10)) // Only update the first 10 links for debugging
        .attr("x", d => (d.source.x + d.target.x) / 2 + 130)
        .attr("y", d => (d.source.y + d.target.y) / 2 + 70); // Adjust this value
});


function update() {
    // Update links
    link = link.data(data.links, d => `${d.source.id}-${d.target.id}`);
    link.exit().remove();
    link = link.enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", "#333366")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)")
        .merge(link);

    // Update link labels
    const linkLabels = svgGroup.selectAll(".link-label")
        .data(data.links, d => `${d.source.id}-${d.target.id}`);
    linkLabels.exit().remove();
    linkLabels.enter()
        .append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-family", "dongle")
        .style("color", "#333366")
        .text(d => d.label)
        .merge(linkLabels);
    

    // Update nodes
    nodes = nodes.data(data.nodes, d => d.id);
    nodes.exit().remove();

    const nodeEnter = nodes.enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", handleNodeClick);

    // Add rectangles to nodes
    nodeEnter.append("rect")
        .attr("width", nodeConfig.width)
        .attr("height", nodeConfig.height)
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("fill", d => getNodeColor(d))
        .style("opacity", 1);

    // Add text content to nodes
    nodeEnter.append("foreignObject")
        .attr("x", (nodeWidth - 220) / 2)
        .attr("y", (nodeHeight - 120) / 2)
        .attr("width", 220)
        .attr("height", nodeHeight - 20)
        .append("xhtml:div")
        .attr("class", "description-text")
        .style("width", "200px")
        .style("height", "auto")
        .style("overflow", "hidden")
        .style("white-space", "pre-wrap")
        .style("color", d => (['card2_2', 'card4_2', 'card3_2_YES'].includes(d.id) ? '#FFFFFF' : '#333366'))
        .html(d => (initialTexts[d.id] || d.text || "Default text for new cards.").replace(/\n/g, '<br>'));

    nodeEnter.append("title").text(d => d.id);

    nodes = nodeEnter.merge(nodes);

    // Update simulation with new data
    simulation.nodes(data.nodes);
    simulation.force("link").links(data.links);
    simulation.alpha(1).restart();
}

// Function to determine node color
function getNodeColor(d) {
    const blueNodes = ['card2_2', 'card4_2', 'card3_2_YES'];
    const yellowNodes = ['card1_2_YES', 'card1_2_NO', 'card3_2_NO'];

    if (blueNodes.includes(d.id)) {
        return '#333366';
    } else if (yellowNodes.includes(d.id)) {
        return '#CCCC33';
    }
    return 'white'; // Default color
}

// Modify the handleNodeClick function to show chat UI for specific nodes
function handleNodeClick(event, d) {
    // Log the ID of the clicked node
    console.log(`Node clicked: ${d.id}`);

    // Check if the node is a stop node
    if (stopNodes.has(d.id)) {
        console.log(`Stop node clicked: ${d.id}`); // Log the stop node click
        const chatUI = document.getElementById('chatUI');
        chatUI.style.display = 'block';
        chatUI.scrollIntoView({ behavior: 'smooth' });
        return; // Exit the function after handling the stop node
    }

    // Check if the node has already been clicked
    if (d.clicked) {
        return; // Exit the function if it's already clicked
    }

    const parts = d.id.split('_');
    const newNodeId = `${parts[0]}_${parseInt(parts[1]) + 1}`;

    // Determine expansion direction based on initial row
    const isTopRow = d.y < startY + nodeHeight; // Check if node is in the top row

    if (["card1_2", "card3_2"].includes(d.id)) {
        const yesNode = {
            id: `${parts[0]}_${parts[1]}_YES`,
            x: d.x - nodeWidth - gap,
            y: d.y + nodeHeight + gap, // Expand downwards
            hasChild: false
        };
        const noNode = {
            id: `${parts[0]}_${parts[1]}_NO`,
            x: d.x + nodeWidth + gap,
            y: d.y + nodeHeight + gap, // Expand downwards
            hasChild: false
        };
        data.nodes.push(yesNode, noNode);
        data.links.push({ source: d, target: yesNode, label: "YES" }, { source: d, target: noNode, label: "NO" });

        // Do not add grandchildren nodes here to prevent great-grandchildren
    } else {
        const newNode = {
            id: newNodeId,
            x: d.x,
            y: d.y + nodeHeight + gap, // Expand downwards
            hasChild: false
        };
        data.nodes.push(newNode);
        data.links.push({ source: d, target: newNode });
    }

    d.hasChild = true;
    d.clicked = true;
    update();
}

// Drag functionality for nodes
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

function applyTextStyles(selection) {
    selection.style("font-size", "24px")
        .style("font-family", "dongle")
        .style("color", "#333366");
}

// Define arrow marker for links
svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#333366")
    .attr("marker-end", "url(#arrow)");


// Zoom and pan functionality
const initialScaleFactor = isMobile ? 1.8 : 1; // 60% scale for mobile, 100% for desktop

const zoom = d3.zoom()
    .scaleExtent([0.5, 5]) // Set zoom limits
    .on('zoom', event => svgGroup.attr('transform', event.transform));

// Apply zoom and pan to the SVG
svg.call(zoom)
    .on("dblclick.zoom", null) // Disable double-click zoom if needed
    .call(zoom.transform, d3.zoomIdentity.scale(initialScaleFactor)); // Set initial scale

// Function to dynamically scale SVG elements
function updateSVG() {
    const referenceElement = document.querySelector('.mindmap-container');
    if (!referenceElement) {
        console.warn("Reference element not found.");
        return;
    }

    const referenceWidth = parseFloat(window.getComputedStyle(referenceElement).width);
    const isMobile = window.innerWidth < 768;

    // Calculate node dimensions based on screen size
    const nodeWidth = Math.min(referenceWidth * (isMobile ? 0.6 : 0.3), 254); // 60% scale for mobile, 30% for desktop, max width 254
    const nodeHeight = 150; // Fixed height for nodes

    console.log('Calculated Reference Width:', referenceWidth);
    console.log('Node Width:', nodeWidth);
    console.log('Node Height:', nodeHeight);

    // Update node dimensions
    d3.selectAll('.node')
        .select('rect')
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('y', 0); // Align top of the screen

    // Apply scaling to the SVG group
    svgGroup.attr("transform", `scale(${initialScaleFactor})`);
    console.log('Updated SVG scaling:', initialScaleFactor);
}

// Call the function to update scaling
updateSVG();

// Optionally, listen for window resize events to reapply scaling
window.addEventListener('resize', updateSVG);

// Add the askGPT function
async function askGPT() {
    let query = document.getElementById('query').value;
    let responseElement = document.getElementById('response');
    let loadingElement = document.getElementById('loading');

    responseElement.innerText = "";
    loadingElement.style.display = "block";

    try {
        let response = await fetch('https://ambience-gpt.onrender.com/ask', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ question: query }),
            mode: "cors", // ✅ Explicitly enabling CORS
            credentials: "include" // ✅ Ensures cookies & headers are handled correctly
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        loadingElement.style.display = "none";
        responseElement.innerText = data.answer;
    } catch (error) {
        console.error("Fetch error:", error);
        loadingElement.style.display = "none";
        responseElement.innerText = "Error: Unable to get a response.";
    }
}


