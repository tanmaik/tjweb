DROP TABLE IF EXISTS students;
CREATE TABLE students(id INT, s_name VARCHAR(100), home VARCHAR(100), PRIMARY KEY(id));
INSERT INTO students(id, s_name, home) VALUES (1, 'George', 'VA');
INSERT INTO students(id, s_name, home) VALUES (2, 'John', 'MA');
INSERT INTO students(id, s_name, home) VALUES (3, 'Thom', 'VA');
INSERT INTO students(id, s_name, home) VALUES (4, 'James', 'VA');