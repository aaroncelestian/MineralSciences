# Research Portfolio Website

A modern, responsive academic research portfolio website optimized for GitHub Pages. Features interactive data visualizations, clean design, and technical content presentation suitable for scientific publications.

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Visualizations**: Plotly-based graphs including time series, distributions, and correlation matrices
- **Professional Layout**: Sections for About, Research, Publications, Data Visualizations, and Contact
- **SEO Optimized**: Clean semantic HTML structure
- **Fast Loading**: Minimal dependencies, CDN-hosted libraries
- **Easy Customization**: Well-organized code with clear sections

## Quick Start

### 1. Create GitHub Repository

1. Create a new repository on GitHub (e.g., `username.github.io` or `research-portfolio`)
2. Clone the repository locally:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

### 2. Add Website Files

Copy these files to your repository:
- `index.html` - Main HTML structure
- `styles.css` - Styling and layout
- `script.js` - Interactive visualizations

### 3. Customize Content

#### Update Personal Information (`index.html`):

1. **Hero Section** (lines ~25-30):
   - Replace "Your Name" with your actual name
   - Update subtitle with your title/position
   - Modify the description to reflect your research

2. **About Section** (lines ~45-60):
   - Write your research background and interests
   - Update research interests list

3. **Research Projects** (lines ~70-110):
   - Add your actual projects
   - Include dates, funding sources, collaborators
   - Update technical tags to match your work

4. **Publications** (lines ~125-180):
   - Add your publications in chronological order
   - Include DOI links, PDF links, and data/code repositories
   - Update abstracts with your actual work

5. **Contact Information** (lines ~220-235):
   - Update email address
   - Add institution and office location
   - Update social media/academic profile links

#### Customize Visualizations (`script.js`):

Replace the synthetic data with your actual research data:

1. **Time Series Plot** (lines 10-90):
   - Replace `dates` and `values` arrays with your data
   - Update axis labels and titles
   - Adjust trend line calculations if needed

2. **Distribution Plot** (lines 92-145):
   - Replace category names with your experimental conditions
   - Update data arrays with your measurements
   - Modify box plot parameters as needed

3. **Correlation Heatmap** (lines 147-250):
   - Update variable names
   - Replace correlation matrix with your computed correlations
   - Adjust significance thresholds

#### Style Customization (`styles.css`):

Modify color scheme in CSS variables (lines 8-16):
```css
:root {
    --primary-color: #2c3e50;    /* Main dark color */
    --secondary-color: #3498db;   /* Accent color */
    --accent-color: #e74c3c;      /* Highlight color */
}
```

### 4. Deploy to GitHub Pages

#### Method 1: GitHub Settings (Recommended)

1. Commit and push your files:
   ```bash
   git add .
   git commit -m "Initial commit of research portfolio"
   git push origin main
   ```

2. Go to your repository on GitHub
3. Navigate to **Settings** → **Pages**
4. Under "Source", select branch `main` and folder `/ (root)`
5. Click **Save**
6. Your site will be published at `https://yourusername.github.io/repository-name/`

#### Method 2: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml` (automated deployment on every push):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5. Add Custom Domain (Optional)

1. Purchase a domain from a registrar
2. Add a `CNAME` file to your repository with your domain name:
   ```
   www.yourdomain.com
   ```
3. Configure DNS settings at your registrar:
   - Add a CNAME record pointing `www` to `yourusername.github.io`
   - Add A records for apex domain pointing to GitHub's IPs
4. Enable custom domain in GitHub Pages settings

## Updating Your Website

### Add New Publication

In `index.html`, add a new `<div class="publication">` block:

```html
<div class="publication">
    <h4>Your Name, Co-Authors (2024)</h4>
    <p class="pub-title">Title of your new paper</p>
    <p class="pub-venue"><em>Journal Name</em>, Volume(Issue), pp. xxx-xxx</p>
    <p class="pub-abstract">Your abstract here...</p>
    <div class="pub-links">
        <a href="https://doi.org/your-doi" class="btn-small">DOI</a>
        <a href="link-to-pdf.pdf" class="btn-small">PDF</a>
        <a href="https://github.com/your-code" class="btn-small">Data/Code</a>
    </div>
</div>
```

### Add New Visualization

1. Create a new div in the visualizations section:
   ```html
   <div class="viz-card">
       <h3>Your Plot Title</h3>
       <div id="yourPlotId"></div>
       <p class="viz-caption">Figure description...</p>
   </div>
   ```

2. Add JavaScript function in `script.js`:
   ```javascript
   function createYourPlot() {
       const trace = {
           x: yourXData,
           y: yourYData,
           type: 'scatter',
           mode: 'lines+markers'
       };
       
       const layout = {
           xaxis: { title: 'X Axis Label' },
           yaxis: { title: 'Y Axis Label' }
       };
       
       Plotly.newPlot('yourPlotId', [trace], layout);
   }
   ```

3. Call the function in the `DOMContentLoaded` event listener

## Technical Details

### Dependencies

- **Plotly.js**: Interactive graphing library (loaded from CDN)
- No build process required
- No package manager dependencies

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total page weight: ~50KB (excluding images)

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── script.js           # JavaScript for visualizations
├── README.md           # This file
└── CNAME              # (Optional) Custom domain configuration
```

## Customization Tips

1. **Images**: Add a `/images` folder for profile pictures, project images, etc.
2. **PDF Files**: Add a `/papers` folder for publication PDFs
3. **Data Files**: Add a `/data` folder for downloadable datasets
4. **Google Analytics**: Add tracking code to `index.html` if desired
5. **Favicon**: Add `<link rel="icon" href="favicon.ico">` to `<head>`

## Troubleshooting

### Site Not Showing Up
- Verify GitHub Pages is enabled in repository settings
- Check that `index.html` is in the root directory
- Wait 5-10 minutes after first deployment

### Visualizations Not Loading
- Check browser console for JavaScript errors
- Verify Plotly CDN is accessible
- Ensure plot div IDs match between HTML and JavaScript

### CSS Not Applying
- Clear browser cache
- Verify `styles.css` path in `index.html`
- Check for CSS syntax errors

## License

This template is free to use for academic and personal websites. No attribution required.

## Support

For issues or questions:
1. Check GitHub Pages documentation: https://docs.github.com/pages
2. Review Plotly.js documentation: https://plotly.com/javascript/
3. Validate HTML: https://validator.w3.org/

---

**Last Updated**: October 2024
