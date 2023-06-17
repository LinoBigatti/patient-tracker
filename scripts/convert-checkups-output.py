import sys
import csv
import sqlite3

main_table = "Checkups"

fields = {
    "pain": ["dolor"],
    "humor": ["humor"],
    "appetite": ["apetito"],
    "fatigue": ["cansancio"],
    "depression": ["depresion"],
    "anxiety": ["ansiedad"],
    "insomnia": ["dificultad para dormir"],
    "sleepiness": ["somnolencia", "sonmolencia"],
    "date": ["fecha"],
    "patient": ["paciente"],
    "checkup_n": ["tiempo"],
    "observations": ["observaciones"],
    "adverse_effects": ["efectos adversos"],
    "dosage": ["dosis"],
    "freq": ["frecuencia"],
}

string_fields = [
    "date",
    "observations",
    "adverse_effects",
]

def main(filename, db):
    connection = sqlite3.connect(db)
    cursor = connection.cursor()

    with open(filename, "r") as f:
        reader = csv.DictReader(f, delimiter="\t")

        for row in reader:
            values = []
            for field, possibilities in fields.items():
                found = False
                for p in possibilities:
                    v = row[p]

                    if v and v != "ND":
                        if field in string_fields:
                            values.append(v)
                        else:
                            values.append(int(float(v)))
                        
                        found = True
                        break
                
                if not found:
                    values.append("")


            placeholder = ("?, " * len(fields.keys())).rstrip(", ")

            cursor.execute(f"INSERT INTO {main_table} ({', '.join(fields.keys())}) VALUES ({placeholder})", values)

    connection.commit()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("ERROR: Incorrect usage")
        print("Usage: python3 convert-checkups-output.py [file_name] [db_file_name]")
        exit()
    
    filename = sys.argv[1]
    db = sys.argv[2]
    
    main(filename, db)
