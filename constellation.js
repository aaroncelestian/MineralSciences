// Research Constellation - Interactive Octahedron Star Map
// Six research domains arranged as crystallographic octahedron projection

const researchNodes = [
    {
        id: 'astrobiology',
        label: 'Astrobiology',
        position: 'top',
        radius: 11,
        color: '#0369a1',
        glow: 'rgba(3,105,161,0.2)',
        title: 'The search for life in minerals',
        subtitle: 'Halite · Mars analogs · NASA/JPL · Western Australia',
        chips: [
            { text: 'NASA/JPL', color: '#0369a1' },
            { text: 'Mars mission instrumentation', color: '#6b7280' }
        ],
        body: 'If life ever existed on Mars, it left its record in minerals. Working with NASA/JPL in Mars analog environments — hypersaline lakes of Western Australia, Mojave evaporite systems — my research investigates how organic biomarkers and microbial cells are preserved within halite and sulfate matrices over geological timescales. The findings inform instrumentation design for future Mars surface missions and establish biosignature detection thresholds for ancient extraterrestrial materials.',
        tags: ['Astrobiology', 'Halite', 'Mars analogs', 'Biosignatures', 'Evaporites', 'Western Australia', 'NASA/JPL']
    },
    {
        id: 'remediation',
        label: 'Environmental remediation',
        position: 'bottom',
        radius: 11,
        color: '#2a7d6b',
        glow: 'rgba(42,125,107,0.2)',
        title: 'Minerals as remediation tools',
        subtitle: 'Zeolites · Lead · PAHs · Fukushima · La Brea',
        chips: [
            { text: 'Lead remediation — Los Angeles', color: '#6b7280' },
            { text: 'PAH degradation — La Brea', color: '#d97706' }
        ],
        body: 'Microporous minerals are nature\'s own filtration systems. My environmental work spans zeolite amendment of lead-contaminated residential soils in Los Angeles; photocatalytic degradation of polycyclic aromatic hydrocarbons at La Brea Tar Pits; and pharmaceutical compound sequestration from aqueous waste streams. The same crystal chemistry that drives the laboratory drives the field deployments.',
        tags: ['Zeolites', 'Lead remediation', 'PAH degradation', 'La Brea', 'Ion exchange', 'Photocatalysis', 'Los Angeles']
    },
    {
        id: 'nuclear',
        label: 'Nuclear waste capture',
        position: 'left',
        radius: 13,
        color: '#dc2626',
        glow: 'rgba(220,38,38,0.18)',
        title: 'Entombing Fukushima',
        subtitle: 'Sitinakite · Cesium · Radiostrontium · Double lever mechanism',
        chips: [
            { text: 'Fukushima Daiichi', color: '#dc2626' },
            { text: 'Radiocesium extraction', color: '#6b7280' }
        ],
        body: 'The double lever mechanism — a coupled two-site ion exchange geometry I identified in sitinakite — selectively captures cesium and strontium ions with extraordinary efficiency. Structurally analogous to the Nobel Prize-winning potassium ion channel, this geometry makes sitinakite-based materials practically indispensable for nuclear remediation. They are now deployed in the treatment of radioactive wastewater from the Fukushima Daiichi nuclear disaster, selectively extracting radiocesium at scale.',
        tags: ['Sitinakite', 'Ion exchange', 'Double lever mechanism', 'Fukushima', 'Radiocesium', 'Nuclear remediation', 'Crystal chemistry']
    },
    {
        id: 'pharma',
        label: 'Pharma-mineralogy',
        position: 'right',
        radius: 13,
        color: '#7c3aed',
        glow: 'rgba(124,58,237,0.18)',
        title: 'From crystal chemistry to hospital drug',
        subtitle: 'Lokelma · Hyperkalemia · FDA-approved · Sitinakite',
        chips: [
            { text: 'FDA-approved drug', color: '#0369a1' },
            { text: 'Hyperkalemia rescue treatment', color: '#059669' },
            { text: 'Long-term therapeutic', color: '#7c3aed' }
        ],
        body: 'The same double lever mechanism that captures nuclear waste also saves lives in emergency rooms. The ion selectivity principle I described in sitinakite underlies Lokelma (sodium zirconium cyclosilicate), an FDA-approved drug used as both an emergency rescue treatment for life-threatening hyperkalemia and as a long-term therapeutic for chronic kidney disease patients. A Nobel-recognized mechanism. A mineral. A hospital drug.',
        tags: ['PharmaMineralogy', 'Lokelma', 'Hyperkalemia', 'FDA', 'Ion selectivity', 'Sitinakite', 'Crystal chemistry']
    },
    {
        id: 'biomineralization',
        label: 'Biomineralization',
        position: 'lower-left',
        radius: 11,
        color: '#b45309',
        glow: 'rgba(180,83,9,0.18)',
        title: 'Bacteria inside kidney stones',
        subtitle: 'Calcium oxalate · Bacterial biofilms · PNAS 2026',
        chips: [
            { text: 'PNAS 2026', color: '#7c3aed' },
            { text: 'Clinical applications', color: '#059669' }
        ],
        body: 'Using high-resolution electron imaging and synchrotron XRD, my research demonstrated that bacterial biofilms are structurally intercalated within calcium oxalate kidney stone matrices — not surface contaminants but intrinsic architectural components. Published in PNAS (2026), these findings reframe kidney stone disease as partly microbial in origin, opening direct pathways to therapeutic intervention targeting the bacterial communities integral to stone formation.',
        tags: ['Biomineralization', 'Kidney stones', 'SEM', 'Synchrotron XRD', 'Bacterial biofilms', 'PNAS', 'Clinical translation']
    },
    {
        id: 'lithium',
        label: 'Sustainable lithium',
        position: 'lower-right',
        radius: 11,
        color: '#0f766e',
        glow: 'rgba(15,118,110,0.18)',
        title: 'Regenerative lithium extraction',
        subtitle: 'LMO · Geothermal brines · DOE · BrineWorks',
        chips: [
            { text: 'DOE grant DE-EE0009442', color: '#d97706' },
            { text: 'BrineWorks startup', color: '#6b7280' },
            { text: 'Provisional patent', color: '#059669' }
        ],
        body: 'We\'re not mining lithium — we\'re borrowing it. Using lithium manganese oxide intercalation and halophilic bacteria, my research extracts battery-grade Li₂CO₃ from geothermal brines, oil field wastewater, and desalination streams at near-zero energy cost. Funded by the U.S. Department of Energy and commercialized through BrineWorks, this approach addresses global lithium demand without the environmental cost of conventional hard-rock mining.',
        tags: ['Lithium extraction', 'LMO', 'Geothermal brines', 'DOE', 'BrineWorks', 'Halophiles', 'Critical materials']
    }
];

function initConstellation() {
    const container = document.getElementById('constellation-container');
    if (!container) return;

    // Detect mobile
    const isMobile = window.innerWidth <= 768;
    
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = 580;
    const cx = width / 2;
    const cy = 280;
    const R = 200;
    const Req = 190;

    // Rotate equatorial plane 30 degrees counterclockwise
    const angle = -30 * Math.PI / 180; // -30 degrees in radians
    const cos30 = Math.cos(angle);
    const sin30 = Math.sin(angle);
    
    // Original positions before rotation
    const leftX = -Req, leftY = 5; // Nuclear
    const lowerLeftX = -105, lowerLeftY = -80; // Bio
    const lowerRightX = 105, lowerRightY = 0; // Sustain
    const rightX = Req - 60, rightY = 95; // Pharma - fixed position

    // Calculate positions (with rotation applied to equatorial nodes)
    const positions = {
        top: { x: cx, y: cy - R },
        bottom: { x: cx, y: cy + R },
        left: { 
            x: cx + (leftX * cos30 - leftY * sin30), 
            y: cy + (leftX * sin30 + leftY * cos30) 
        },
        right: { 
            x: cx + (rightX * cos30 - rightY * sin30), 
            y: cy + (rightX * sin30 + rightY * cos30) 
        },
        'lower-left': { 
            x: cx + (lowerLeftX * cos30 - lowerLeftY * sin30), 
            y: cy + (lowerLeftX * sin30 + lowerLeftY * cos30) 
        },
        'lower-right': { 
            x: cx + (lowerRightX * cos30 - lowerRightY * sin30), 
            y: cy + (lowerRightX * sin30 + lowerRightY * cos30) 
        },
        center: { x: cx, y: cy }
    };

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.background = 'transparent';

    // Background rect to give constellation its own sky
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', width);
    bgRect.setAttribute('height', height);
    bgRect.setAttribute('fill', '#0b1020');
    bgRect.setAttribute('rx', '16');
    svg.appendChild(bgRect);

    // Background constellation art - Orion (bottom-left)
    const orionStars = [
        {x: 80, y: 420}, {x: 95, y: 380}, {x: 110, y: 450}, 
        {x: 125, y: 410}, {x: 140, y: 440}, {x: 155, y: 470}, {x: 170, y: 500}
    ];
    const orionLines = [
        [0,1], [1,3], [3,4], [4,5], [5,6], [2,3], [3,5]
    ];
    orionStars.forEach(star => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', star.x);
        dot.setAttribute('cy', star.y);
        dot.setAttribute('r', '1');
        dot.setAttribute('fill', '#e2e8f0');
        dot.setAttribute('opacity', '0.12');
        svg.appendChild(dot);
    });
    orionLines.forEach(([i, j]) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', orionStars[i].x);
        line.setAttribute('y1', orionStars[i].y);
        line.setAttribute('x2', orionStars[j].x);
        line.setAttribute('y2', orionStars[j].y);
        line.setAttribute('stroke', '#e2e8f0');
        line.setAttribute('stroke-width', '0.5');
        line.setAttribute('opacity', '0.10');
        svg.appendChild(line);
    });

    // Background constellation art - Cassiopeia (top-right)
    const cassiopeiaStars = [
        {x: width - 160, y: 60}, {x: width - 130, y: 80}, {x: width - 100, y: 70}, {x: width - 70, y: 90}, {x: width - 40, y: 75}
    ];
    const cassiopeiaLines = [[0,1], [1,2], [2,3], [3,4]];
    cassiopeiaStars.forEach(star => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', star.x);
        dot.setAttribute('cy', star.y);
        dot.setAttribute('r', '1');
        dot.setAttribute('fill', '#e2e8f0');
        dot.setAttribute('opacity', '0.12');
        svg.appendChild(dot);
    });
    cassiopeiaLines.forEach(([i, j]) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cassiopeiaStars[i].x);
        line.setAttribute('y1', cassiopeiaStars[i].y);
        line.setAttribute('x2', cassiopeiaStars[j].x);
        line.setAttribute('y2', cassiopeiaStars[j].y);
        line.setAttribute('stroke', '#e2e8f0');
        line.setAttribute('stroke-width', '0.5');
        line.setAttribute('opacity', '0.10');
        svg.appendChild(line);
    });

    // Additional Ursa Major (bottom-right)
    const ursaMajor2Stars = [
        {x: width - 200, y: 450}, {x: width - 170, y: 445}, {x: width - 140, y: 455}, {x: width - 110, y: 460},
        {x: width - 95, y: 480}, {x: width - 85, y: 505}, {x: width - 100, y: 525}
    ];
    const ursaMajor2Lines = [[0,1], [1,2], [2,3], [3,4], [4,5], [5,6]];
    ursaMajor2Stars.forEach(star => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', star.x);
        dot.setAttribute('cy', star.y);
        dot.setAttribute('r', '1');
        dot.setAttribute('fill', '#e2e8f0');
        dot.setAttribute('opacity', '0.12');
        svg.appendChild(dot);
    });
    ursaMajor2Lines.forEach(([i, j]) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', ursaMajor2Stars[i].x);
        line.setAttribute('y1', ursaMajor2Stars[i].y);
        line.setAttribute('x2', ursaMajor2Stars[j].x);
        line.setAttribute('y2', ursaMajor2Stars[j].y);
        line.setAttribute('stroke', '#e2e8f0');
        line.setAttribute('stroke-width', '0.5');
        line.setAttribute('opacity', '0.10');
        svg.appendChild(line);
    });

    // Additional Orion (top-center-right)
    const orion2Stars = [
        {x: width * 0.65, y: 100}, {x: width * 0.67, y: 70}, {x: width * 0.69, y: 120}, 
        {x: width * 0.71, y: 90}, {x: width * 0.73, y: 115}, {x: width * 0.75, y: 140}, {x: width * 0.77, y: 165}
    ];
    const orion2Lines = [
        [0,1], [1,3], [3,4], [4,5], [5,6], [2,3], [3,5]
    ];
    orion2Stars.forEach(star => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', star.x);
        dot.setAttribute('cy', star.y);
        dot.setAttribute('r', '1');
        dot.setAttribute('fill', '#e2e8f0');
        dot.setAttribute('opacity', '0.12');
        svg.appendChild(dot);
    });
    orion2Lines.forEach(([i, j]) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', orion2Stars[i].x);
        line.setAttribute('y1', orion2Stars[i].y);
        line.setAttribute('x2', orion2Stars[j].x);
        line.setAttribute('y2', orion2Stars[j].y);
        line.setAttribute('stroke', '#e2e8f0');
        line.setAttribute('stroke-width', '0.5');
        line.setAttribute('opacity', '0.10');
        svg.appendChild(line);
    });

    // Background constellation art - Ursa Major / Big Dipper (top-left)
    const ursaMajorStars = [
        {x: 40, y: 80}, {x: 70, y: 75}, {x: 100, y: 85}, {x: 130, y: 90},
        {x: 145, y: 110}, {x: 155, y: 135}, {x: 140, y: 155}
    ];
    const ursaMajorLines = [[0,1], [1,2], [2,3], [3,4], [4,5], [5,6]];
    ursaMajorStars.forEach(star => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', star.x);
        dot.setAttribute('cy', star.y);
        dot.setAttribute('r', '1');
        dot.setAttribute('fill', '#e2e8f0');
        dot.setAttribute('opacity', '0.12');
        svg.appendChild(dot);
    });
    ursaMajorLines.forEach(([i, j]) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', ursaMajorStars[i].x);
        line.setAttribute('y1', ursaMajorStars[i].y);
        line.setAttribute('x2', ursaMajorStars[j].x);
        line.setAttribute('y2', ursaMajorStars[j].y);
        line.setAttribute('stroke', '#e2e8f0');
        line.setAttribute('stroke-width', '0.5');
        line.setAttribute('opacity', '0.10');
        svg.appendChild(line);
    });

    // Seeded random for star field
    function seededRandom(seed) {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Background star field (random dots)
    for (let i = 0; i < 120; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        star.setAttribute('cx', seededRandom(i * 7) * width);
        star.setAttribute('cy', seededRandom(i * 11) * height);
        // Mix sizes: 60% small, 30% medium, 10% large
        let radius;
        if (i % 10 === 0) radius = 1.5;
        else if (i % 3 === 0) radius = 1;
        else radius = 0.6;
        star.setAttribute('r', radius);
        star.setAttribute('fill', '#ffffff');
        star.setAttribute('opacity', 0.15 + seededRandom(i * 13) * 0.3);
        svg.appendChild(star);
    }

    // Radial lines from center to all six outer nodes
    researchNodes.forEach(node => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', positions.center.x);
        line.setAttribute('y1', positions.center.y);
        line.setAttribute('x2', positions[node.position].x);
        line.setAttribute('y2', positions[node.position].y);
        line.setAttribute('stroke', '#334155');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', '0.6');
        svg.appendChild(line);
    });

    // Center node (clickable)
    const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    centerGroup.style.cursor = 'pointer';
    centerGroup.dataset.nodeId = 'center';

    // Center glow (hidden by default)
    const centerHalo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerHalo.setAttribute('cx', positions.center.x);
    centerHalo.setAttribute('cy', positions.center.y);
    centerHalo.setAttribute('r', '21');
    centerHalo.setAttribute('fill', 'rgba(156, 163, 175, 0.15)');
    centerHalo.setAttribute('opacity', '0');
    centerHalo.classList.add('center-halo');
    centerGroup.appendChild(centerHalo);

    const centerNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerNode.setAttribute('cx', positions.center.x);
    centerNode.setAttribute('cy', positions.center.y);
    centerNode.setAttribute('r', '6');
    centerNode.setAttribute('fill', '#9ca3af');
    centerNode.setAttribute('opacity', '0.4');
    centerGroup.appendChild(centerNode);

    // Center node interactivity
    centerGroup.addEventListener('mouseenter', () => {
        centerHalo.setAttribute('opacity', '1');
    });

    centerGroup.addEventListener('mouseleave', () => {
        if (!centerGroup.classList.contains('active')) {
            centerHalo.setAttribute('opacity', '0');
        }
    });

    centerGroup.addEventListener('click', () => {
        // Remove active from all nodes
        svg.querySelectorAll('g[data-node-id]').forEach(g => {
            g.classList.remove('active');
            const h = g.querySelector('.node-halo, .center-halo');
            if (h) h.setAttribute('opacity', '0');
        });

        // Set active
        centerGroup.classList.add('active');
        centerHalo.setAttribute('opacity', '1');

        // Show center panel
        showCenterPanel();
    });

    svg.appendChild(centerGroup);

    // Research nodes
    researchNodes.forEach(node => {
        const pos = positions[node.position];
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.style.cursor = 'pointer';
        group.dataset.nodeId = node.id;

        // Glow halo (hidden by default)
        const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        halo.setAttribute('cx', pos.x);
        halo.setAttribute('cy', pos.y);
        halo.setAttribute('r', node.radius + 9);
        halo.setAttribute('fill', node.glow);
        halo.setAttribute('opacity', '0');
        halo.classList.add('node-halo');
        group.appendChild(halo);

        // Node circle (larger on mobile)
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        const mobileRadius = isMobile ? (node.radius === 11 ? 14 : node.radius === 13 ? 16 : node.radius) : node.radius;
        circle.setAttribute('r', mobileRadius);
        circle.setAttribute('fill', node.color);
        circle.classList.add('node-circle');
        group.appendChild(circle);

        // Label positioning (further from nodes)
        let labelY = pos.y;
        let labelX = pos.x;
        let anchor = 'middle';
        
        if (node.position === 'top') {
            labelY -= node.radius + 14;
        } else if (node.position === 'bottom') {
            labelY += node.radius + 20;
        } else if (node.position === 'left') {
            labelX -= node.radius + 16;
            labelY += 4;
            anchor = 'end';
        } else if (node.position === 'right') {
            labelX += node.radius + 16;
            labelY += 4;
            anchor = 'start';
        } else if (node.position === 'lower-left') {
            labelX -= node.radius + 12;
            labelY = pos.y + 4; // Align with star vertically
            anchor = 'end';
        } else if (node.position === 'lower-right') {
            labelX += node.radius + 12;
            labelY = pos.y + 4; // Align with star vertically
            anchor = 'start';
        }

        // Only add labels on desktop
        if (!isMobile) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', labelX);
            label.setAttribute('y', labelY);
            label.setAttribute('text-anchor', anchor);
            label.setAttribute('font-size', '12.5');
            label.setAttribute('font-weight', '500');
            label.setAttribute('fill', node.color);
            label.textContent = node.label;
            group.appendChild(label);
        }

        // Interactivity
        group.addEventListener('mouseenter', () => {
            halo.setAttribute('opacity', '1');
            circle.setAttribute('r', mobileRadius + 2);
        });

        group.addEventListener('mouseleave', () => {
            if (!group.classList.contains('active')) {
                halo.setAttribute('opacity', '0');
                circle.setAttribute('r', node.radius);
            }
        });

        group.addEventListener('click', () => {
            // Remove active from all
            svg.querySelectorAll('g[data-node-id]').forEach(g => {
                g.classList.remove('active');
                const h = g.querySelector('.node-halo');
                const c = g.querySelector('.node-circle');
                const n = researchNodes.find(rn => rn.id === g.dataset.nodeId);
                if (h && c && n) {
                    h.setAttribute('opacity', '0');
                    c.setAttribute('r', n.radius);
                }
            });

            // Set active
            group.classList.add('active');
            halo.setAttribute('opacity', '1');
            circle.setAttribute('r', node.radius + 3);

            // Show detail panel
            showDetailPanel(node);
        });

        svg.appendChild(group);
    });

    // Call-to-action text (desktop only)
    if (!isMobile) {
        const ctaText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ctaText.setAttribute('x', cx);
        ctaText.setAttribute('y', height - 20);
        ctaText.setAttribute('text-anchor', 'middle');
        ctaText.setAttribute('font-size', '13');
        ctaText.setAttribute('font-weight', '400');
        ctaText.setAttribute('fill', '#94a3b8');
        ctaText.textContent = 'click on any star in the constellation to read its story';
        svg.appendChild(ctaText);
    }

    container.appendChild(svg);

    // Auto-click nuclear node on load
    setTimeout(() => {
        const nuclearNode = svg.querySelector('g[data-node-id="nuclear"]');
        if (nuclearNode) nuclearNode.click();
    }, 100);
}

function showDetailPanel(node) {
    const panel = document.getElementById('constellation-detail-panel');
    if (!panel) return;

    panel.style.opacity = '0';
    
    setTimeout(() => {
        panel.innerHTML = `
            <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--primary-color);">${node.title}</h3>
            <p style="font-size: 0.95rem; font-style: italic; color: var(--muted-text); margin-bottom: 1rem;">${node.subtitle}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                ${node.chips.map(chip => `
                    <span style="background: ${chip.color}15; color: ${chip.color}; padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; border: 1px solid ${chip.color}35;">${chip.text}</span>
                `).join('')}
            </div>
            <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-color); margin-bottom: 1.5rem;">${node.body}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${node.tags.map(tag => `
                    <span style="background: rgba(42, 125, 107, 0.1); color: #0d5c4a; padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.86rem; font-weight: 600; border: 1px solid rgba(42, 125, 107, 0.22);">${tag}</span>
                `).join('')}
            </div>
        `;
        
        panel.style.opacity = '1';
    }, 50);
}

function showCenterPanel() {
    const panel = document.getElementById('constellation-detail-panel');
    if (!panel) return;

    panel.style.opacity = '0';
    
    setTimeout(() => {
        panel.innerHTML = `
            <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--primary-color);">Minerals remember</h3>
            <p style="font-size: 0.95rem; font-style: italic; color: var(--muted-text); margin-bottom: 1.5rem;">The thread connecting every research program</p>
            <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-color); margin-bottom: 1rem;">
                Every mineral is a record. A crystal grown in a hypersaline lake records the chemistry of the water that made it — and whether anything was alive in that water. A kidney stone records the bacteria that helped build it. A microporous titanium silicate records a molecular geometry that evolution independently discovered in cell membranes. Brine minerals record the lithium that ancient oceans deposited over geological time.
            </p>
            <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-color); margin-bottom: 2rem;">
                My research is the act of reading those records — and deciding what to do with what they say. The six research programs represented in this constellation are not separate pursuits. They are the same question asked of different minerals, in different environments, at different scales. What did this crystal remember? And what can we learn from it?
            </p>
            <a href="https://aaroncelestian.substack.com/p/we-tortured-salt-water-with-x-rays" target="_blank" class="btn-small" style="display: inline-block; text-decoration: none;">
                Read: "We Tortured Salt Water With X-Rays" →
            </a>
        `;
        
        panel.style.opacity = '1';
    }, 50);
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConstellation);
} else {
    initConstellation();
}
