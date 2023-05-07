export const content = `
CREATE TABLE Doctors (
	id integer,
	name string
);

CREATE TABLE Patients (
	id integer,
	doctor_id integer,
	name string
);

CREATE TABLE Checkups (
	checkup_n integer,
	patient_id integer,
	pain integer,
	insomnia integer
);
`
