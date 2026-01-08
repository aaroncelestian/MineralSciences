#!/usr/bin/env python3
import re
from collections import defaultdict

# Parse RIS file
publications = []
current_pub = {}

with open('docs/citations.ris', 'r', encoding='utf-8') as f:
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
        elif line.startswith('PB  -'):
            current_pub['publisher'] = line[6:].strip()
        elif line.startswith('ER  -'):
            if current_pub:
                publications.append(current_pub)
                current_pub = {'authors': []}

# Add last publication if exists
if current_pub and current_pub.get('title'):
    publications.append(current_pub)

# Group by year
publications_by_year = defaultdict(list)
for pub in publications:
    year = pub.get('year', 'Unknown')
    if year and year != 'Unknown':
        publications_by_year[year].append(pub)

# Sort years descending
sorted_years = sorted(publications_by_year.keys(), reverse=True)

# Generate HTML
html_output = []
total_pubs = 0

for year in sorted_years:
    pubs = publications_by_year[year]
    total_pubs += len(pubs)
    html_output.append(f'<h3 style="color: var(--secondary-color); font-size: 1.2rem; margin-top: 2rem; margin-bottom: 1rem;">{year} ({len(pubs)} publication{"s" if len(pubs) > 1 else ""})</h3>\n')
    
    for pub in pubs:
        title = pub.get('title', 'Untitled')
        authors = pub.get('authors', [])
        journal = pub.get('journal', '')
        volume = pub.get('volume', '')
        issue = pub.get('issue', '')
        start_page = pub.get('start_page', '')
        end_page = pub.get('end_page', '')
        
        # Format authors
        if len(authors) > 10:
            author_str = ', '.join(authors[:10]) + ', et al.'
        else:
            author_str = ', '.join(authors)
        
        # Build citation
        html_output.append('<div class="cv-item">\n')
        html_output.append(f'    <p style="margin-bottom: 0.25rem;"><strong>{title}</strong></p>\n')
        
        if author_str:
            html_output.append(f'    <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.25rem;">{author_str}</p>\n')
        
        # Build journal info
        journal_info = journal
        if volume:
            journal_info += f', {volume}'
        if issue:
            journal_info += f'({issue})'
        if start_page and end_page:
            journal_info += f', {start_page}-{end_page}'
        elif start_page:
            journal_info += f', {start_page}'
        
        if journal_info:
            html_output.append(f'    <p style="font-size: 0.9rem; color: #666;"><em>{journal_info}</em></p>\n')
        
        html_output.append('</div>\n\n')

# Write to file
with open('publications_section_with_authors.html', 'w', encoding='utf-8') as f:
    f.write(''.join(html_output))

print(f'Generated {total_pubs} publications across {len(sorted_years)} years with full author information')
