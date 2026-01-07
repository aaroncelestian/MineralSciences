// Interactive Data Visualizations using Plotly

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    createTimeSeriesPlot();
    createDistributionPlot();
    createHeatmapPlot();
});

// Time Series Plot
function createTimeSeriesPlot() {
    // Generate sample time series data
    const dates = [];
    const values = [];
    const errors = [];
    
    const startDate = new Date('2020-01-01');
    for (let i = 0; i < 48; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);
        dates.push(date.toISOString().split('T')[0]);
        
        // Generate synthetic data with trend and noise
        const trend = 50 + i * 0.8;
        const seasonal = 10 * Math.sin(i * Math.PI / 6);
        const noise = (Math.random() - 0.5) * 8;
        values.push(trend + seasonal + noise);
        errors.push(3 + Math.random() * 2);
    }
    
    // Create trace with error bars
    const trace = {
        x: dates,
        y: values,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Observations',
        line: {
            color: '#3498db',
            width: 2
        },
        marker: {
            size: 6,
            color: '#3498db'
        },
        error_y: {
            type: 'data',
            array: errors,
            visible: true,
            color: '#95a5a6'
        }
    };
    
    // Calculate and add trend line
    const n = values.length;
    const xIndices = Array.from({length: n}, (_, i) => i);
    const sumX = xIndices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = xIndices.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = xIndices.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const trendValues = xIndices.map(x => slope * x + intercept);
    
    const trendTrace = {
        x: dates,
        y: trendValues,
        type: 'scatter',
        mode: 'lines',
        name: 'Trend',
        line: {
            color: '#e74c3c',
            width: 2,
            dash: 'dash'
        }
    };
    
    const layout = {
        title: '',
        xaxis: {
            title: 'Time Period',
            showgrid: true,
            gridcolor: '#e0e0e0'
        },
        yaxis: {
            title: 'Measured Variable (units)',
            showgrid: true,
            gridcolor: '#e0e0e0'
        },
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        font: {
            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            size: 12,
            color: '#333'
        },
        hovermode: 'closest',
        showlegend: true,
        legend: {
            x: 0.02,
            y: 0.98,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: '#e0e0e0',
            borderwidth: 1
        }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    Plotly.newPlot('timeSeriesPlot', [trace, trendTrace], layout, config);
}

// Distribution Box Plot
function createDistributionPlot() {
    // Generate sample data for multiple categories
    const categories = ['Control', 'Treatment A', 'Treatment B', 'Treatment C'];
    const traces = [];
    
    categories.forEach((category, idx) => {
        const data = [];
        const mean = 50 + idx * 10;
        const stdDev = 8 + idx * 2;
        
        // Generate normally distributed data
        for (let i = 0; i < 100; i++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            data.push(mean + z0 * stdDev);
        }
        
        const trace = {
            y: data,
            type: 'box',
            name: category,
            boxmean: 'sd',
            marker: {
                color: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c'][idx]
            }
        };
        
        traces.push(trace);
    });
    
    const layout = {
        title: '',
        yaxis: {
            title: 'Response Variable (units)',
            showgrid: true,
            gridcolor: '#e0e0e0'
        },
        xaxis: {
            title: 'Experimental Condition'
        },
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        font: {
            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            size: 12,
            color: '#333'
        },
        showlegend: false
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    Plotly.newPlot('distributionPlot', traces, layout, config);
}

// Correlation Heatmap
function createHeatmapPlot() {
    // Variable names
    const variables = [
        'Variable 1',
        'Variable 2',
        'Variable 3',
        'Variable 4',
        'Variable 5',
        'Variable 6'
    ];
    
    // Generate correlation matrix
    const n = variables.length;
    const correlationMatrix = [];
    
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                row.push(1.0);
            } else if (i < j) {
                // Generate correlation value between -0.8 and 0.8
                const corr = (Math.random() - 0.5) * 1.6;
                row.push(parseFloat(corr.toFixed(2)));
            } else {
                // Mirror the upper triangle
                row.push(correlationMatrix[j][i]);
            }
        }
        correlationMatrix.push(row);
    }
    
    // Create annotations for correlation values
    const annotations = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const value = correlationMatrix[i][j];
            const significant = Math.abs(value) > 0.3 ? '*' : '';
            annotations.push({
                x: variables[j],
                y: variables[i],
                text: value.toFixed(2) + significant,
                font: {
                    size: 11,
                    color: Math.abs(value) > 0.5 ? 'white' : 'black'
                },
                showarrow: false
            });
        }
    }
    
    const trace = {
        z: correlationMatrix,
        x: variables,
        y: variables,
        type: 'heatmap',
        colorscale: [
            [0, '#3498db'],
            [0.5, '#ffffff'],
            [1, '#e74c3c']
        ],
        zmid: 0,
        colorbar: {
            title: 'Correlation<br>Coefficient',
            titleside: 'right',
            tickmode: 'linear',
            tick0: -1,
            dtick: 0.5
        }
    };
    
    const layout = {
        title: '',
        annotations: annotations,
        xaxis: {
            side: 'bottom',
            tickangle: -45
        },
        yaxis: {
            side: 'left',
            autorange: 'reversed'
        },
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        font: {
            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            size: 12,
            color: '#333'
        },
        width: 700,
        height: 600
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    Plotly.newPlot('heatmapPlot', [trace], layout, config);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Toggle collapsible sections
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const button = event.currentTarget;
    const icon = button.querySelector('.toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '−';
        button.classList.add('active');
    } else {
        content.style.display = 'none';
        icon.textContent = '+';
        button.classList.remove('active');
    }
}
<<<<<<< HEAD

// Render publications from JSON
async function renderPublications() {
    try {
        const resp = await fetch('./publications.json');
        if (!resp.ok) throw new Error('Failed to fetch publications.json');
        const data = await resp.json();
        const works = data.works || [];

        // Recent: first 10
        const recent = works.slice(0, 10);
        const recentEl = document.getElementById('recent-pubs');
        recentEl.innerHTML = recent.map(pub => renderPub(pub)).join('');
    } catch (e) {
        console.warn('Could not load publications:', e);
        // Optionally show a fallback message
        document.getElementById('recent-pubs').innerHTML = '<p class="pub-venue">Publications could not be loaded. Ensure publications.json is present.</p>';
    }
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function renderPub(pub) {
    const { title, journal, year, url, authors } = pub;
    const cleanTitle = stripHtml(title);
    const venue = journal && year ? `${journal}, ${year}` : year || journal || '';
    const link = url ? `<a href="${url}" target="_blank" class="btn-small">View</a>` : '';
    return `
        <div class="publication">
            <p class="pub-title">${cleanTitle}</p>
            ${venue ? `<p class="pub-venue"><em>${venue}</em></p>` : ''}
            ${authors ? `<p class="pub-abstract">${authors}</p>` : ''}
            ${link ? `<div class="pub-links">${link}</div>` : ''}
        </div>
    `;
}

// Load publications on page load
document.addEventListener('DOMContentLoaded', () => {
    renderPublications();
    createTimeSeriesPlot();
    createDistributionPlot();
    createHeatmapPlot();
    initScrollAnimations();
});

// Entrance animations on scroll
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Animate child cards after section appears
                const cards = entry.target.querySelectorAll('.project-card, .publication, .video-card');
                cards.forEach((card, i) => {
                    setTimeout(() => card.classList.add('visible'), i * 80);
                });
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    // Observe all sections except those already visible
    document.querySelectorAll('.section:not(.visible)').forEach(section => observer.observe(section));
}
=======
>>>>>>> parent of 05bcb43 (pages updates)
