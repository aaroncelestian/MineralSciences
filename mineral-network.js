// Mineral Discovery Network Visualization
// D3.js force-directed graph showing new mineral species discoveries

const minerals = [
  {id:"rowleyite",     name:"Rowleyite",        formula:"Na[Mn²⁺,Fe²⁺]₁₃[Mn³⁺,Fe³⁺]₂(AsO₄)₆(Cl,OH)₁₂·6H₂O", locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"arsenate",         year:2018, ref:"Am. Mineralogist",        note:"Type locality for the Rowley Mine; first described from a chlorine-rich secondary assemblage.",                       color:"#185FA5"},
  {id:"phoxite",       name:"Phoxite",           formula:"(NH₄)₂Mg₂(C₂O₄)(PO₃OH)₂(H₂O)₄",                     locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"phosphate/oxalate", year:2020, ref:"Mineral. Mag.",             note:"Rare mixed-anion mineral with both phosphate and oxalate groups; Rowley Mine secondary zone.",                      color:"#185FA5"},
  {id:"flagite",       name:"Flagite",           formula:"Cu₄Pb₂(SO₄)(TeO₃)₂(OH)₄·H₂O",                        locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"tellurite-sulfate", year:2021, ref:"Can. J. Mineral. Petrol.", note:"Copper-lead tellurite-sulfate from the oxidized zone; one of seven species described from this single locality.",     color:"#185FA5"},
  {id:"relianceite",   name:"Relianceite-(K)",   formula:"KNa₃(SO₄)₂·2H₂O",                                     locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"sulfate",           year:2019, ref:"Mineral. Mag.",             note:"Potassium sodium sulfate hydrate; part of the remarkable secondary mineral suite at Rowley Mine.",                  color:"#185FA5"},
  {id:"thebaite",      name:"Thebaite-(NH₄)",    formula:"(NH₄)Fe²⁺₃(SO₄)₂(OH)₃·3H₂O",                         locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"sulfate",           year:2022, ref:"Mineral. Mag.",             note:"Ammonium-dominant iron sulfate; jarosite supergroup member from Rowley Mine.",                                      color:"#185FA5"},
  {id:"dendoraite",    name:"Dendoraite-(NH₄)",  formula:"(NH₄)₄Mg(SO₄)₃·4H₂O",                                 locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"sulfate",           year:2023, ref:"Mineral. Mag.",             note:"Magnesium ammonium sulfate hydrate; seventh new species from the Rowley Mine type locality.",                      color:"#185FA5"},
  {id:"rowleyite2",    name:"Rowleyite",         formula:"Na[Mn²⁺,Fe²⁺]₁₃[Mn³⁺,Fe³⁺]₂(AsO₄)₆(Cl,OH)₁₂·6H₂O",  locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"arsenate",          year:2018, ref:"Am. Mineralogist",         note:"Named for the Rowley Mine type locality; arsenate from oxidized zone.",                                           color:"#185FA5"},
  {id:"svornostite",   name:"Svornostite-(NH₄)", formula:"(NH₄)₂Mg(UO₂)₂(SO₄)₄(H₂O)₈",                         locality:"Blue Lizard Mine, San Juan Co., Utah",        group:"utah",     class:"uranyl sulfate",    year:2025, ref:"Mineral. Mag. 89(5)",       note:"Establishes the svornostite mineral group; found in an active uranium mine in canyon country.",                    color:"#3B6D11"},
  {id:"jasonsmithite", name:"Jasonsmithite",     formula:"Pb₄(AsO₄)₂(SO₄)·2H₂O",                                locality:"Foote Lithium Co. Mine, Cleveland Co., NC",   group:"nc",       class:"arsenate-sulfate",  year:2020, ref:"Can. J. Mineral. Petrol.", note:"Lead arsenate sulfate hydrate from a lithium pegmatite; named for mineralogist Jason Smith.",                      color:"#BA7517"},
  {id:"barwoodite",    name:"Barwoodite",         formula:"Mn²⁺₂(SO₄)(OH)₂·H₂O",                                 locality:"Big Creek, Fresno Co., California",           group:"ca",       class:"sulfate",           year:2021, ref:"Mineral. Mag.",             note:"Manganese sulfate hydroxide hydrate from a California metamorphic manganese deposit.",                             color:"#D4537E"},
  {id:"cadvanite",     name:"Cadvanite",          formula:"Cd(VO₃)OH",                                            locality:"Burro Mine, San Miguel Co., Colorado",        group:"colorado", class:"vanadate",          year:2026, ref:"Can. J. Mineral. Petrol.", note:"Rare cadmium vanadate hydroxide from an oxidized polymetallic ore deposit in the Colorado Plateau.",                color:"#993C1D"},
  {id:"camanchacaite", name:"Camanchacaite",      formula:"Na₂Mg₃(SO₄)₄·6H₂O",                                   locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Named for the camanchaca coastal fog of the Atacama; hyperarid secondary sulfate.",                                color:"#0F6E56"},
  {id:"chinchorroite", name:"Chinchorroite",      formula:"NaCu₂(SO₄)(OH)·H₂O",                                  locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Sodium copper sulfate hydroxide from the Torrecillas Mine; one of six co-described Chilean species.",             color:"#0F6E56"},
  {id:"espadaite",     name:"Espadaite",          formula:"KMg(SO₄)(OH)·3H₂O",                                   locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Potassium magnesium sulfate hydroxide hydrate; Atacama hyperarid evaporite assemblage.",                          color:"#0F6E56"},
  {id:"magnesiofluckite",name:"Magnesioflükkite", formula:"CaMg(SO₄)F₂",                                          locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate-fluoride",  year:2019, ref:"Mineral. Mag. 83(5)",       note:"Magnesium analogue of flükkite; calcium magnesium sulfate fluoride from extreme desert.",                         color:"#0F6E56"},
  {id:"picaite",       name:"Picaite",            formula:"K₂Mg(SO₄)₂·2H₂O",                                     locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Named for the Pica oasis region of northern Chile; potassium magnesium sulfate dihydrate.",                      color:"#0F6E56"},
  {id:"riosecoite",    name:"Ríosecoite",         formula:"Na₄Mg(SO₄)₃·4H₂O",                                    locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Named for Río Seco (dry river); sodium magnesium sulfate from one of Earth's driest environments.",              color:"#0F6E56"},
  {id:"doubekite",     name:"Doubekite",          formula:"Cu(AsO₃OH)·2H₂O",                                      locality:"Běloves, Náchod, Czech Republic",             group:"czech",    class:"arsenate",          year:2024, ref:"Mineral. Mag.",             note:"Copper hydrogen arsenate dihydrate from an oxidized uranium-bearing deposit in Bohemia.",                         color:"#533AB7"},
];

const hubData = [
  {id:"hub_rowley",   label:"Rowley Mine, AZ", group:"rowley",   color:"#185FA5"},
  {id:"hub_chile",    label:"Torrecillas, Chile", group:"chile", color:"#0F6E56"},
  {id:"hub_utah",     label:"Blue Lizard, UT",   group:"utah",   color:"#3B6D11"},
  {id:"hub_colorado", label:"Colorado",          group:"colorado",color:"#993C1D"},
  {id:"hub_nc",       label:"North Carolina",    group:"nc",     color:"#BA7517"},
  {id:"hub_ca",       label:"California",        group:"ca",     color:"#D4537E"},
  {id:"hub_czech",    label:"Czech Republic",    group:"czech",  color:"#533AB7"},
];

// Initialize visualization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initMineralNetwork();
});

function initMineralNetwork() {
    const container = document.getElementById('mineral-network-container');
    if (!container) return;

    let activeFilter = 'all';

    // Create filter buttons
    const filterBar = document.createElement('div');
    filterBar.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem; justify-content: center;';
    
    const filters = [
        {id: 'all', label: 'All Localities'},
        {id: 'rowley', label: 'Rowley Mine, AZ'},
        {id: 'chile', label: 'Torrecillas, Chile'},
        {id: 'utah', label: 'Blue Lizard, UT'},
        {id: 'colorado', label: 'Colorado'},
        {id: 'nc', label: 'North Carolina'},
        {id: 'ca', label: 'California'},
        {id: 'czech', label: 'Czech Republic'}
    ];

    filters.forEach(f => {
        const btn = document.createElement('button');
        btn.textContent = f.label;
        btn.className = 'filter-btn';
        btn.dataset.filter = f.id;
        btn.onclick = () => setFilter(f.id);
        filterBar.appendChild(btn);
    });

    container.appendChild(filterBar);

    // Create SVG canvas
    const svgContainer = document.createElement('div');
    svgContainer.style.cssText = 'background: white; border-radius: 8px; box-shadow: 0 10px 30px rgba(2, 6, 23, 0.10); padding: 2rem; margin-bottom: 2rem;';
    container.appendChild(svgContainer);

    const width = svgContainer.clientWidth || 800;
    const height = 420;

    const svg = d3.select(svgContainer)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    // Create detail panel
    const detailPanel = document.createElement('div');
    detailPanel.id = 'mineral-detail';
    detailPanel.style.cssText = 'background: white; border-radius: 8px; box-shadow: 0 10px 30px rgba(2, 6, 23, 0.10); padding: 2rem; opacity: 0; transition: opacity 0.3s; display: none;';
    container.appendChild(detailPanel);

    function setFilter(filterId) {
        activeFilter = filterId;
        
        // Update button states
        filterBar.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.filter === filterId) {
                btn.classList.add('active');
                const hub = hubData.find(h => h.group === filterId);
                if (hub) {
                    btn.style.backgroundColor = hub.color;
                    btn.style.color = 'white';
                    btn.style.borderColor = hub.color;
                } else {
                    btn.style.backgroundColor = '#2a7d6b';
                    btn.style.color = 'white';
                    btn.style.borderColor = '#2a7d6b';
                }
            } else {
                btn.classList.remove('active');
                btn.style.backgroundColor = 'transparent';
                btn.style.color = '#0b1020';
                btn.style.borderColor = '#0b1020';
            }
        });

        updateNetwork();
    }

    function updateNetwork() {
        // Filter data
        const filteredMinerals = activeFilter === 'all' 
            ? minerals 
            : minerals.filter(m => m.group === activeFilter);
        
        const activeHubs = activeFilter === 'all'
            ? hubData
            : hubData.filter(h => h.group === activeFilter);

        // Build nodes and links
        const nodes = [...activeHubs, ...filteredMinerals];
        const links = filteredMinerals.map(m => ({
            source: `hub_${m.group}`,
            target: m.id
        }));

        // Clear SVG
        svg.selectAll('*').remove();

        // Create force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(80))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(20))
            .force('x', d3.forceX(width / 2).strength(0.05))
            .force('y', d3.forceY(height / 2).strength(0.05));

        // Draw links
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.5)
            .attr('stroke-width', 1);

        // Draw nodes
        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr('r', d => d.label ? 16 : 11)
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                if (!d.label) {
                    d3.select(this).attr('r', 15);
                }
            })
            .on('mouseout', function(event, d) {
                if (!d.label) {
                    d3.select(this).attr('r', 11);
                }
            })
            .on('click', function(event, d) {
                if (d.label) {
                    // Hub clicked - filter to that group
                    setFilter(d.group);
                } else {
                    // Mineral clicked - show detail
                    showDetail(d);
                }
            })
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Add labels
        const label = svg.append('g')
            .selectAll('text')
            .data(nodes)
            .join('text')
            .text(d => d.label || d.name.replace(/-(NH₄)|-(K)/g, ''))
            .attr('font-size', 9)
            .attr('text-anchor', 'middle')
            .attr('dy', d => d.label ? 30 : 25)
            .attr('fill', '#333')
            .style('pointer-events', 'none');

        // Update positions on tick
        simulation.on('tick', () => {
            // Boundary clamping
            nodes.forEach(d => {
                const r = d.label ? 16 : 11;
                d.x = Math.max(r + 5, Math.min(width - r - 5, d.x));
                d.y = Math.max(r + 30, Math.min(height - r - 5, d.y));
            });

            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
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
    }

    function showDetail(mineral) {
        const hub = hubData.find(h => h.group === mineral.group);
        detailPanel.innerHTML = `
            <h4 style="font-size: 18px; font-weight: 500; margin-bottom: 0.5rem; color: #0b1020;">${mineral.name}</h4>
            <p style="font-family: monospace; font-size: 12px; color: #666; margin-bottom: 1rem;">${mineral.formula}</p>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: ${hub.color}22; color: ${hub.color}; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 11px; font-weight: 500;">${mineral.class}</span>
                <span style="background: ${hub.color}22; color: ${hub.color}; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 11px; font-weight: 500;">${hub.label}</span>
            </div>
            <p style="font-size: 13px; line-height: 1.6; color: #333;">
                <strong>${mineral.locality}</strong> • ${mineral.ref} (${mineral.year})<br>
                ${mineral.note}
            </p>
        `;
        detailPanel.style.display = 'block';
        setTimeout(() => detailPanel.style.opacity = '1', 10);
    }

    // Initialize with all localities
    setFilter('all');
}
