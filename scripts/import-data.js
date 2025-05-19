const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

const prisma = new PrismaClient();

// Funcție pentru a converti string-ul numeric cu virgulă în număr
function parseNumericValue(value) {
  if (!value || value.trim() === '-') return null;
  return parseFloat(value.trim().replace(',', '.'));
}

async function findOrCreateGame(name) {
  let game = await prisma.game.findUnique({ where: { name } });
  if (!game) {
    game = await prisma.game.create({ data: { name } });
  }
  return game;
}

async function findOrCreateHouseElement(name, gamaId) {
  let houseElement = await prisma.houseElement.findFirst({
    where: {
      house_element_name: name,
      gama_id: gamaId
    }
  });
  if (!houseElement) {
    houseElement = await prisma.houseElement.create({
      data: {
        house_element_name: name,
        gama_id: gamaId
      }
    });
  }
  return houseElement;
}

async function findOrCreateLevel1(name, houseElementId) {
  let level1 = await prisma.level1.findFirst({
    where: {
      name,
      house_elements_id: houseElementId
    }
  });
  if (!level1) {
    level1 = await prisma.level1.create({
      data: {
        name,
        house_elements_id: houseElementId
      }
    });
  }
  return level1;
}

async function findOrCreateLevel2(name, level1Id) {
  let level2 = await prisma.level2.findFirst({
    where: {
      name,
      level_1_id: level1Id
    }
  });
  if (!level2) {
    level2 = await prisma.level2.create({
      data: {
        name,
        level_1_id: level1Id
      }
    });
  }
  return level2;
}

async function findOrCreateLevel3(name, level2Id) {
  let level3 = await prisma.level3.findFirst({
    where: {
      name,
      level_2_id: level2Id
    }
  });
  if (!level3) {
    level3 = await prisma.level3.create({
      data: {
        name,
        level_2_id: level2Id
      }
    });
  }
  return level3;
}

async function importData() {
  try {
    console.log('Starting data import...');
    const csvFilePath = path.join(__dirname, '..', 'DB_retete.csv');
    console.log('Reading CSV file:', csvFilePath);
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    console.log('Parsing CSV content...');
    const records = await new Promise((resolve, reject) => {
      parse(fileContent, {
        delimiter: ';',
        skip_empty_lines: true,
        from_line: 2,
        relax_quotes: true,
        rtrim: true,
        ltrim: true,
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    console.log(`Found ${records.length} records to process`);
    let processedRecords = 0;

    for (const record of records) {
      // Primele 5 coloane sunt pentru ierarhie
      const [gamaName, houseElementName, level1Name, level2Name, level3Name] = record;

      // Următoarele coloane sunt pentru produs
      const category = record[5] || null;  // ex: "45x100 C"
      const depth = parseNumericValue(record[6]);  // ex: "100,00"
      const mp = parseNumericValue(record[7]);     // ex: "1,00"
      const productName = record[8] || null;  // ex: "Structură lemn C24 45x100 mm"
      const price = parseNumericValue(record[9]) || 0;  // dacă nu există valoare, punem 0

      if (!gamaName || !houseElementName || !level1Name || !level2Name || !level3Name) {
        console.log('Skipping incomplete record');
        continue;
      }

      try {
        // Folosim funcțiile helper pentru a crea sau găsi entitățile
        const game = await findOrCreateGame(gamaName);
        const houseElement = await findOrCreateHouseElement(houseElementName, game.id);
        const level1 = await findOrCreateLevel1(level1Name, houseElement.id);
        const level2 = await findOrCreateLevel2(level2Name, level1.id);
        const level3 = await findOrCreateLevel3(level3Name, level2.id);

        // 6. Creează Product dacă există numele produsului
        if (productName && productName.trim()) {
          await prisma.product.create({
            data: {
              name: productName ? productName.trim() : null,
              category: category ? category.trim() : null,
              depth: depth,
              mp: mp,
              price: price,
              level_3_id: level3.id
            }
          });
          console.log(`Created new product: ${productName}`);
        }

        processedRecords++;
        if (processedRecords % 10 === 0) {
          console.log(`Processed ${processedRecords} records...`);
        }
      } catch (error) {
        console.error(`Error processing record:`, error);
        console.error('Record data:', record);
        continue;
      }
    }

    console.log('Import completed successfully!');
    console.log(`Total records processed: ${processedRecords}`);
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Rulăm funcția de import
importData()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });