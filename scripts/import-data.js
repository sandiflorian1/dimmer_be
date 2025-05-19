const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

const prisma = new PrismaClient();

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
        from_line: 2, // Skip header line
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
      const [gama, houseElement, level1, level2, level3, productName, depth, mp, price] = record;

      if (!gama) {
        console.log('Skipping record with no gama');
        continue;
      }

      try {
        // Create or find Game
        console.log(`Processing game: ${gama}`);
        const game = await prisma.game.upsert({
          where: { name: gama },
          update: {},
          create: { name: gama }
        });

        if (!houseElement) {
          console.log('Skipping record with no houseElement');
          continue;
        }

        // Create or find HouseElement
        console.log(`Processing houseElement: ${houseElement} for game: ${gama}`);
        const houseElementRecord = await prisma.houseElement.upsert({
          where: {
            AND: [
              { gama_id: game.id },
              { house_element_name: houseElement }
            ]
          },
          update: {},
          create: {
            house_element_name: houseElement,
            gama_id: game.id
          }
        });

        if (!level1) {
          console.log('Skipping record with no level1');
          continue;
        }

        // Create or find Level1
        console.log(`Processing level1: ${level1}`);
        const level1Record = await prisma.level1.upsert({
          where: {
            AND: [
              { house_elements_id: houseElementRecord.id },
              { name: level1 }
            ]
          },
          update: {},
          create: {
            name: level1,
            house_elements_id: houseElementRecord.id
          }
        });

        if (!level2) {
          console.log('Skipping record with no level2');
          continue;
        }

        // Create or find Level2
        console.log(`Processing level2: ${level2}`);
        const level2Record = await prisma.level2.upsert({
          where: {
            AND: [
              { level_1_id: level1Record.id },
              { name: level2 }
            ]
          },
          update: {},
          create: {
            name: level2,
            level_1_id: level1Record.id
          }
        });

        if (!level3) {
          console.log('Skipping record with no level3');
          continue;
        }

        // Create or find Level3
        console.log(`Processing level3: ${level3}`);
        const level3Record = await prisma.level3.upsert({
          where: {
            AND: [
              { level_2_id: level2Record.id },
              { name: level3 }
            ]
          },
          update: {},
          create: {
            name: level3,
            level_2_id: level2Record.id
          }
        });

        if (productName) {
          // Create Product
          console.log(`Processing product: ${productName}`);
          await prisma.product.create({
            data: {
              name: productName,
              depth: depth ? parseFloat(depth.replace(',', '.')) : null,
              mp: mp ? parseFloat(mp.replace(',', '.')) : null,
              price: price ? parseFloat(price.replace(',', '.')) : null,
              level_3_id: level3Record.id
            }
          });
        }

        processedRecords++;
        if (processedRecords % 100 === 0) {
          console.log(`Processed ${processedRecords} records...`);
        }
      } catch (error) {
        console.error(`Error processing record:`, error);
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