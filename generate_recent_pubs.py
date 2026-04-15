#!/usr/bin/env python3
"""
Parse citations-3.ris and generate HTML for Recent Publications section
"""

publications = []
current_pub = {}

with open('docs/citations-3.ris', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        
        if line.startswith('TY  -'):
            if current_pub:
                publications.append(current_pub)
            current_pub = {'authors': []}
        elif line.startswith('T1  -'):
            current_pub['title'] = line[6:].strip()
        elif line.startswith('A1  -'):
            current_pub['authors'].append(line[6:].strip())
        elif line.startswith('JO  -'):
            current_pub['journal'] = line[6:].strip()
        elif line.startswith('VL  -'):
            current_pub['volume'] = line[6:].strip()
        elif line.startswith('IS  -'):
            current_pub['issue'] = line[6:].strip()
        elif line.startswith('SP  -'):
            current_pub['start_page'] = line[6:].strip()
        elif line.startswith('EP  -'):
            current_pub['end_page'] = line[6:].strip()
        elif line.startswith('Y1  -'):
            current_pub['year'] = line[6:].strip()
        elif line.startswith('ER  -'):
            if current_pub:
                publications.append(current_pub)
                current_pub = {'authors': []}

# Add last publication if exists
if current_pub and current_pub.get('title'):
    publications.append(current_pub)

# Filter out publications without titles
publications = [p for p in publications if p.get('title')]

# Generate HTML
html_output = []

for pub in publications:
    title = pub.get('title', 'Untitled')
    authors = pub.get('authors', [])
    journal = pub.get('journal', '')
    volume = pub.get('volume', '')
    issue = pub.get('issue', '')
    start_page = pub.get('start_page', '')
    end_page = pub.get('end_page', '')
    year = pub.get('year', '')
    
    # Format authors - show first 3, then et al. if more
    if len(authors) > 3:
        author_str = ', '.join(authors[:3]) + ', et al.'
    else:
        author_str = ', '.join(authors)
    
    # Build venue string
    venue_parts = []
    if journal:
        venue_parts.append(journal)
    if volume:
        vol_str = f'{volume}'
        if issue:
            vol_str += f'({issue})'
        venue_parts.append(vol_str)
    if start_page and end_page:
        venue_parts.append(f'{start_page}-{end_page}')
    elif start_page:
        venue_parts.append(start_page)
    if year:
        venue_parts.append(year)
    
    venue = ', '.join(venue_parts) if venue_parts else ''
    
    # Generate HTML
    html_output.append('        <div class="publication">\n')
    html_output.append(f'            <p class="pub-title">{title}</p>\n')
    if author_str:
        html_output.append(f'            <p class="pub-abstract">{author_str}</p>\n')
    if venue:
        html_output.append(f'            <p class="pub-venue"><em>{venue}</em></p>\n')
    html_output.append('        </div>\n')

# Write to file
with open('recent_publications.html', 'w', encoding='utf-8') as f:
    f.write(''.join(html_output))

print(f'✅ Generated HTML for {len(publications)} publications')
print('📄 Output saved to: recent_publications.html')
print('\nCopy the contents and paste into index.html at line 151 (inside the recent-pubs div)')
