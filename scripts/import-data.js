const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  try {
    const csvFilePath = path.join(__dirname, '..', 'DB_retete.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    const records = await new Promise((resolve, reject) => {
      parse(fileContent, {
        delimiter: ';',
        skip_empty_lines: true,
        from_line: 4, // Skip header lines
        relax_quotes: true, // Permite ghilimele în câmpuri
        rtrim: true, // Elimină spațiile de la sfârșitul câmpurilor
        ltrim: true, // Elimină spațiile de la începutul câmpurilor
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    for (const record of records) {
      const [gama, houseElement, level1, level2, level3, productName, depth, mp, price] = record;

      if (!gama) continue;

      // Create or find Game
      const game = await prisma.game.upsert({
        where: { name: gama },
        update: {},
        create: { name: gama }
      });

      if (!houseElement) continue;

      // Create or find HouseElement
      const houseElementRecord = await prisma.houseElement.upsert({
        where: { 
          gamaId_houseElementName: {
            gamaId: game.id,
            houseElementName: houseElement
          }
        },
        update: {},
        create: {
          houseElementName: houseElement,
          gamaId: game.id
        }
      });

      if (!level1) continue;

      // Create or find Level1
      const level1Record = await prisma.level1.upsert({
        where: {
          houseElementsId_name: {
            houseElementsId: houseElementRecord.id,
            name: level1
          }
        },
        update: {},
        create: {
          name: level1,
          houseElementsId: houseElementRecord.id
        }
      });

      if (!level2) continue;

      // Create or find Level2
      const level2Record = await prisma.level2.upsert({
        where: {
          level1Id_name: {
            level1Id: level1Record.id,
            name: level2
          }
        },
        update: {},
        create: {
          name: level2,
          level1Id: level1Record.id
        }
      });

      if (!level3) continue;

      // Create or find Level3
      const level3Record = await prisma.level3.upsert({
        where: {
          level2Id_name: {
            level2Id: level2Record.id,
            name: level3
          }
        },
        update: {},
        create: {
          name: level3,
          level2Id: level2Record.id
        }
      });

      if (!productName) continue;

      // Create Product
      await prisma.product.create({
        data: {
          name: productName,
          level3Id: level3Record.id,
          depth: depth ? parseInt(depth) : null,
          mp: mp ? parseInt(mp) : null,
          price: price ? parseInt(price) : null
        }
      });
    }

    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
