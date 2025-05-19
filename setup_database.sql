-- Create tables
CREATE TABLE IF NOT EXISTS game (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS house_elements (
    id SERIAL PRIMARY KEY,
    house_element_name VARCHAR(255),
    gama_id INTEGER NOT NULL,
    FOREIGN KEY (gama_id) REFERENCES game(id)
);

CREATE TABLE IF NOT EXISTS level_1 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    house_elements_id INTEGER NOT NULL,
    FOREIGN KEY (house_elements_id) REFERENCES house_elements(id)
);

CREATE TABLE IF NOT EXISTS level_2 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    level_1_id INTEGER NOT NULL,
    FOREIGN KEY (level_1_id) REFERENCES level_1(id)
);

CREATE TABLE IF NOT EXISTS level_3 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    level_2_id INTEGER NOT NULL,
    FOREIGN KEY (level_2_id) REFERENCES level_2(id)
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255),
    name VARCHAR(255),
    level_3_id INTEGER NOT NULL,
    depth INTEGER,
    mp INTEGER,
    price INTEGER,
    FOREIGN KEY (level_3_id) REFERENCES level_3(id)
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a temporary table to import CSV data
CREATE TEMPORARY TABLE temp_import (
    gama VARCHAR(255),
    house_element VARCHAR(255),
    level1 VARCHAR(255),
    level2 VARCHAR(255),
    level3 VARCHAR(255),
    product_name VARCHAR(255),
    depth INTEGER,
    mp INTEGER,
    price INTEGER
);

-- Copy data from CSV file
-- Note: You'll need to adjust the COPY command based on your specific CSV structure
COPY temp_import(gama, house_element, level1, level2, level3, product_name, depth, mp, price)
FROM '/path/to/DB_retete.csv'
WITH (FORMAT csv, DELIMITER ';', HEADER true, ENCODING 'UTF8');

-- Insert data into the actual tables
INSERT INTO game (name)
SELECT DISTINCT gama FROM temp_import
WHERE gama IS NOT NULL;

INSERT INTO house_elements (house_element_name, gama_id)
SELECT DISTINCT t.house_element, g.id
FROM temp_import t
JOIN game g ON g.name = t.gama
WHERE t.house_element IS NOT NULL;

INSERT INTO level_1 (name, house_elements_id)
SELECT DISTINCT t.level1, h.id
FROM temp_import t
JOIN house_elements h ON h.house_element_name = t.house_element
WHERE t.level1 IS NOT NULL;

INSERT INTO level_2 (name, level_1_id)
SELECT DISTINCT t.level2, l1.id
FROM temp_import t
JOIN level_1 l1 ON l1.name = t.level1
WHERE t.level2 IS NOT NULL;

INSERT INTO level_3 (name, level_2_id)
SELECT DISTINCT t.level3, l2.id
FROM temp_import t
JOIN level_2 l2 ON l2.name = t.level2
WHERE t.level3 IS NOT NULL;

INSERT INTO products (name, level_3_id, depth, mp, price)
SELECT t.product_name, l3.id, t.depth, t.mp, t.price
FROM temp_import t
JOIN level_3 l3 ON l3.name = t.level3
WHERE t.product_name IS NOT NULL;

-- Drop temporary table
DROP TABLE temp_import;
