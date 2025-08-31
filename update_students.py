import os
import json

# Set your base extract path
extract_path = r"C:\Users\mukil1707\OneDrive\Desktop"

# Path to the data.json file
data_json_path = os.path.join(extract_path, "Smart Campus Management System", "data", "data.json")

# Load current data.json content (if exists)
with open(data_json_path, "r") as f:
    try:
        data_json = json.load(f)
    except json.JSONDecodeError:
        data_json = {}

# Ensure student list exists
if "students" not in data_json:
    data_json["students"] = []

# Add/Update given students
students_to_add = [
    {"id": "192421085", "name": "joshva", "department": "B.tech IT", "attendance": []},
    {"id": "192421275", "name": "naren", "department": "B.tech IT", "attendance": []}
]

# Update or insert students
for new_student in students_to_add:
    existing = next((s for s in data_json["students"] if s["id"] == new_student["id"]), None)
    if existing:
        existing.update(new_student)
    else:
        data_json["students"].append(new_student)

# Save back to data.json
with open(data_json_path, "w") as f:
    json.dump(data_json, f, indent=4)

print(data_json["students"][:5])  # Show first few students after update