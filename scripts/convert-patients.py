import csv
import sqlite3
import sys
from unidecode import unidecode

cutoff = 111
main_table = "Patients"

standard_fields = {
    "id": 1,
    "name": 3,
    "surname": 2,
    "dni": 4,
    "observations": 8,
}

unique_fields = {
    "diagnostic_classification": (5, "ClassificationOptions"),
    "concentration": (6, "ConcentrationOptions"),
    "doctor": (7, "Doctors"),
}

def clean_str(s: str) -> str:
    if s:
        return unidecode(s).lstrip().rstrip().lower()
    
    return ""

def main(filename, db):
    connection = sqlite3.connect(db)
    cursor = connection.cursor()

    with open(filename, "r") as f:
        reader = csv.reader(f)
        
        fields = list(standard_fields.keys()) + list(unique_fields.keys())

        i = -1
        for row in reader:
            i += 1
            if i == 0 or i == cutoff:
                continue
            
            values = []

            for key in standard_fields.keys():
                column = standard_fields[key]
                value = row[column]
                
                values.append(value)
            
            for key in unique_fields.keys():
                column, table = unique_fields[key]
                value = row[column]

                key = key.replace("diagnostic_", "")
                
                res = None
                if key != "doctor":
                    res = cursor.execute(f"SELECT id FROM {table} WHERE {key} = '{clean_str(value)}'")
                else:
                    res = cursor.execute(f"SELECT id FROM {table} WHERE name = '{value.split(' ', 1)[1]}' AND surname = '{value.split(' ', 1)[0]}'")

                query = res.fetchone()

                if query is None:
                    # Add new unique value
                    if key != "doctor":
                        cursor.execute(f"INSERT INTO {table} ({key}) VALUES ('{clean_str(value)}')")
                    else:
                        cursor.execute(f"INSERT INTO {table} (surname, name) VALUES (?, ?)", value.split(" ", 1))

                    connection.commit()

                    if key != "doctor":
                        res = cursor.execute(f"SELECT id FROM {table} WHERE {key} = '{clean_str(value)}'")
                    else:
                        res = cursor.execute(f"SELECT id FROM {table} WHERE name = '{value.split(' ', 1)[1]}' AND surname = '{value.split(' ', 1)[0]}'")

                    query = res.fetchone()

                values.append(query[0])
            
            placeholder = ("?, " * len(fields)).rstrip(", ")

            cursor.execute(f"INSERT INTO {main_table} ({', '.join(fields)}) VALUES ({placeholder})", values)

    connection.commit()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("ERROR: Incorrect usage")
        print("Usage: python3 convert-patients.py [file_name] [db_file_name]")
        exit()
    
    filename = sys.argv[1]
    db = sys.argv[2]
    
    main(filename, db)
