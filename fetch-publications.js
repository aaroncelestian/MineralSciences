#!/usr/bin/env node

/**
 * Fetch publications from ORCID for the last 4 years and write publications.json
 * Usage: node fetch-publications.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ORCID = '0000-0003-0775-6380';
const OUTPUT_FILE = path.join(__dirname, 'publications.json');
const FOUR_YEARS_AGO = new Date();
FOUR_YEARS_AGO.setFullYear(FOUR_YEARS_AGO.getFullYear() - 4);

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function stripHtml(html) {
    // Decode HTML entities and remove tags
    return html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseXML(text) {
  // Minimal XML parser for ORCID activities:works response
  const works = [];
  const groupRegex = /<activities:group[^>]*>[\s\S]*?<\/activities:group>/g;
  let match;
  while ((match = groupRegex.exec(text)) !== null) {
    const block = match[0];
    const doiMatch = block.match(/<common:external-id-value>(10\.[^<]+)<\/common:external-id-value>/);
    const doi = doiMatch ? doiMatch[1].trim() : '';
    // Title is nested: work:title > common:title
    const titleMatch = block.match(/<work:title[^>]*>\s*<common:title[^>]*>([^<]+)<\/common:title>\s*<\/work:title>/);
    const journalMatch = block.match(/<work:journal-title[^>]*>([^<]+)<\/work:journal-title>/);
    const yearMatch = block.match(/<common:year[^>]*>(\d{4})<\/common:year>/);
    const monthMatch = block.match(/<common:month[^>]*>(\d{1,2})<\/common:month>/);
    const dayMatch = block.match(/<common:day[^>]*>(\d{1,2})<\/common:day>/);
    const authors = [];
    const authorRegex = /<work:contributor[^>]*>[\s\S]*?<\/work:contributor>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(block)) !== null) {
      const nameMatch = authorMatch[0].match(/<common:credit-name[^>]*>([^<]+)<\/common:credit-name>/);
      if (nameMatch) authors.push(nameMatch[1]);
    }
    const title = titleMatch ? stripHtml(titleMatch[1].trim()) : '';
    const journal = journalMatch ? stripHtml(journalMatch[1].trim()) : '';
    const year = yearMatch ? yearMatch[1] : '';
    const month = monthMatch ? monthMatch[1] : '';
    const day = dayMatch ? dayMatch[1] : '';
    if (title) {
      works.push({ title, journal, year, month, day, doi, authors: authors.join(', ') });
    }
  }
  return works;
}

async function fetchWorks() {
  const worksUrl = `https://pub.orcid.org/v3.0/${ORCID}/works`;
  const xml = await fetchText(worksUrl);
  const works = parseXML(xml);
  const filtered = works.filter(item => {
    if (!item.year) return false;
    const year = parseInt(item.year);
    const month = parseInt(item.month) || 1;
    const day = parseInt(item.day) || 1;
    const pub = new Date(year, month - 1, day);
    return pub >= FOUR_YEARS_AGO;
  }).map(item => {
    const url = item.doi ? `https://doi.org/${item.doi}` : '';
    return { ...item, url };
  }).sort((a, b) => {
    const ay = parseInt(a.year) || 0;
    const by = parseInt(b.year) || 0;
    return by - ay;
  });
  return filtered;
}

async function main() {
  try {
    const works = await fetchWorks();
    const payload = {
      updated: new Date().toISOString(),
      works,
    };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`✅ Wrote ${works.length} works to ${OUTPUT_FILE}`);
  } catch (e) {
    console.error('❌ Failed to fetch publications:', e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
