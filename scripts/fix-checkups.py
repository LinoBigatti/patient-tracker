import sqlite3
import sys

def main(db):
    connection = sqlite3.connect(db)
    cursor = connection.cursor()

    res = cursor.execute("SELECT max(cnt) AS max FROM (SELECT count(Checkups.patient) AS cnt FROM Checkups GROUP BY Checkups.patient)")
    max_checkups = res.fetchone()[0]

    print("Fixing records for the following patients:")
    print("=======")
    for i in range(1, max_checkups):
        res = cursor.execute(f"SELECT patient FROM Checkups WHERE checkup_n = {i} EXCEPT SELECT patient FROM Checkups WHERE checkup_n = {i - 1}")

        vals = [v[0] for v in res.fetchall()]
        print(i - 1)
        print(vals)

        res = cursor.execute(f"UPDATE Checkups SET checkup_n = checkup_n - 1 WHERE checkup_n > {i - 1} AND patient IN (SELECT patient FROM Checkups WHERE checkup_n = {i} EXCEPT SELECT patient FROM Checkups WHERE checkup_n = {i - 1})")

        print("=======")

    connection.commit()
    print("Done.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("ERROR: Incorrect usage")
        print("Usage: python3 fix-checkups.py [db_file_name]")
        exit()
    
    db = sys.argv[1]
    
    main(db)
