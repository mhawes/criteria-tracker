import csv
import json

def parse_csv_to_json(csv_file_path):
    with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        sections = []
        current_section = None
        current_learning_outcome = None
        current_criteria = []

        for row in reader:
            # Skip empty rows
            if not any(row):
                continue

            # Detect new unit/section
            if row[0].startswith('Unit'):
                if current_section:
                    current_section['criteria'] = current_criteria
                    sections.append(current_section)
                current_section = {
                    'id': row[0].split()[1].replace(',', ''),
                    'learningOutcome': row[1].strip(),
                    'criteria': []
                }
                current_criteria = []
                continue

            # Detect learning outcome
            if row[0].startswith('LEARNING OUTCOME'):
                current_learning_outcome = row[1].strip()
                continue

            # Detect assessment criteria header
            if row[0].startswith('Assessment criteria'):
                continue

            # Detect criteria row
            if row[0]:
                # Split the id and title from the first cell
                parts = row[0].split(' ', 1)
                criteria_id = parts[0].strip().replace('"', '')
                title = parts[1].strip().replace('"', '') if len(parts) > 1 else ''
                guidance = []
                if len(row) > 1 and row[1]:
                    guidance = [g.strip() for g in row[1].split('\n') if g.strip()]
                current_criteria.append({
                    'id': criteria_id,
                    'title': title,
                    'guidance': guidance,
                    'claims': []
                })

        # Add last section
        if current_section:
            current_section['criteria'] = current_criteria
            sections.append(current_section)

        # Build final JSON structure
        result = {
            "courseTitle": "",
            "courseCode": "",
            "courseYear": "",
            "sections": sections
        }
        return result

# Usage:
json_data = parse_csv_to_json('public\Level4-criteria.csv')
with open('output.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2)
