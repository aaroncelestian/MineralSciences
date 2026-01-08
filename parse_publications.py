import csv
from collections import defaultdict

# Read the CSV file
publications_by_year = defaultdict(list)

with open('docs/citations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        year = row['Year'].strip() if row['Year'] else 'Unknown'
        if year and year != 'Unknown':
            publications_by_year[year].append(row)

# Sort years in descending order
sorted_years = sorted(publications_by_year.keys(), reverse=True)

# Generate HTML for publications section
html_output = []

for year in sorted_years:
    pubs = publications_by_year[year]
    html_output.append(f'<h3 style="color: var(--secondary-color); font-size: 1.2rem; margin-top: 2rem; margin-bottom: 1rem;">{year} ({len(pubs)} publications)</h3>\n')
    
    for pub in pubs:
        authors = pub['Authors'].strip().rstrip(';').strip()
        title = pub['Title'].strip()
        publication = pub['Publication'].strip()
        volume = pub['Volume'].strip()
        number = pub['Number'].strip()
        pages = pub['Pages'].strip()
        publisher = pub['Publisher'].strip()
        
        # Build citation
        html_output.append('<div class="cv-item">\n')
        html_output.append(f'    <p style="margin-bottom: 0.25rem;"><strong>{title}</strong></p>\n')
        html_output.append(f'    <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.25rem;">{authors}</p>\n')
        
        # Build journal info
        journal_info = publication
        if volume:
            journal_info += f', {volume}'
        if number:
            journal_info += f'({number})'
        if pages:
            journal_info += f', {pages}'
        
        html_output.append(f'    <p style="font-size: 0.9rem; color: #666;"><em>{journal_info}</em></p>\n')
        html_output.append('</div>\n\n')

# Write to file
with open('publications_section.html', 'w', encoding='utf-8') as f:
    f.write(''.join(html_output))

print(f"Generated HTML for {sum(len(pubs) for pubs in publications_by_year.values())} publications across {len(sorted_years)} years")
print(f"Output written to publications_section.html")
