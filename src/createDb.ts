export const content = `
CREATE TABLE Doctors (
	id integer PRIMARY KEY,
	name string,
	surname string
);

CREATE TABLE Patients (
	id integer PRIMARY KEY,
	name string,
	surname string,
	dni integer,
	clinic_history integer,
	dead boolean,
	gender integer,
	age integer,
	diagnostic string,
	diagnostic_classification integer,
	base_treatment string,
	concentration integer,
	weight float,
	height integer,
	bmi float,
	bilirrubin string,
	max_blood_pressure integer,
	min_blood_pressure integer,
	creatinin float,
	tsh float,
	extra_studies string,
	observations string,
	doctor integer
);

CREATE TABLE Checkups (
	checkup_n integer,
	patient integer,
	date date,
	dosage integer,
	freq integer,
	pain integer,
	humor integer,
	appetite integer,
	fatigue integer,
	depression integer,
	anxiety integer,
	insomnia integer,
	sleepiness integer,
	adverse_effects string,
	observations string
);

CREATE TABLE GenderOptions (
	id integer PRIMARY KEY,
	gender string
);
INSERT INTO GenderOptions (gender) VALUES ("femenino");
INSERT INTO GenderOptions (gender) VALUES ("masculino");
INSERT INTO GenderOptions (gender) VALUES ("otro");

CREATE TABLE ClassificationOptions (
	id integer PRIMARY KEY,
	classification string
);
INSERT INTO ClassificationOptions (classification) VALUES ("dolor neuropatico");
INSERT INTO ClassificationOptions (classification) VALUES ("dolor musculoesqueletico");
INSERT INTO ClassificationOptions (classification) VALUES ("dolor oncologico");

CREATE TABLE ConcentrationOptions (
	id integer PRIMARY KEY,
	concentration string
);
INSERT INTO ConcentrationOptions (concentration) VALUES ("4:2");
INSERT INTO ConcentrationOptions (concentration) VALUES ("5:2");
`
