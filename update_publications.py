#!/usr/bin/env python3
import csv
from collections import defaultdict

# Parse the new CSV file
new_publications = []

with open('docs/citations-2.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        authors = row.get('Authors', '').strip().rstrip(';').strip()
        title = row.get('Title', '').strip()
        publication = row.get('Publication', '').strip()
        volume = row.get('Volume', '').strip()
        number = row.get('Number', '').strip()
        pages = row.get('Pages', '').strip()
        year = row.get('Year', '').strip()
        
        if year and title:
            new_publications.append({
                'authors': authors,
                'title': title,
                'publication': publication,
                'volume': volume,
                'number': number,
                'pages': pages,
                'year': year
            })

# Group by year
publications_by_year = defaultdict(list)
for pub in new_publications:
    year = pub['year']
    publications_by_year[year].append(pub)

# Sort years descending
sorted_years = sorted(publications_by_year.keys(), reverse=True)

# Generate HTML
html_output = []

for year in sorted_years:
    pubs = publications_by_year[year]
    html_output.append(f'<h3 style="color: var(--secondary-color); font-size: 1.2rem; margin-top: 2rem; margin-bottom: 1rem;">{year} ({len(pubs)} publication{"s" if len(pubs) > 1 else ""})</h3>\n')
    
    for pub in pubs:
        title = pub['title']
        authors = pub['authors']
        publication = pub['publication']
        volume = pub['volume']
        number = pub['number']
        pages = pub['pages']
        
        # Build journal info
        journal_info = publication
        if volume:
            journal_info += f', {volume}'
        if number:
            journal_info += f'({number})'
        if pages:
            journal_info += f', {pages}'
        
        html_output.append('<div class="cv-item">\n')
        html_output.append(f'    <p style="margin-bottom: 0.25rem;"><strong>{title}</strong></p>\n')
        
        if authors:
            html_output.append(f'    <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.25rem;">{authors}</p>\n')
        
        if journal_info:
            html_output.append(f'    <p style="font-size: 0.9rem; color: #666;"><em>{journal_info}</em></p>\n')
        
        html_output.append('</div>\n\n')

# Write to file
with open('new_publications.html', 'w', encoding='utf-8') as f:
    f.write(''.join(html_output))

print(f'Generated {len(new_publications)} new publications')
print(f'Years: {", ".join(sorted_years)}')
