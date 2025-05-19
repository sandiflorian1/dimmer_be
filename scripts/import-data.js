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
        from_line: 4, // Skip header lines
        relax_quotes: true, // Permite ghilimele în câmpuri
        rtrim: true, // Elimină spațiile de la sfârșitul câmpurilor
        ltrim: true, // Elimină spațiile de la începutul câmpurilor
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
          where: { 
            name: gama 
          },
          update: {},
          create: { 
            name: gama 
          }
        });
        
        processedRecords++;
        if (processedRecords % 100 === 0) {
          console.log(`Processed ${processedRecords} records...`);
        }
      } catch (error) {
        console.error(`Error processing record with gama ${gama}:`, error);
        continue;
      }

      if (!houseElement) {
        console.log('Skipping record with no houseElement');
        continue;
      }

      try {
        // Create or find HouseElement
        console.log(`Processing houseElement: ${houseElement} for game: ${gama}`);
        const houseElementRecord = await prisma.houseElement.create({
          data: {
            houseElementName: houseElement,
            game: {
              connect: {
                id: game.id
              }
            }
          }
        });

        // Process Level1 if exists
        if (level1) {
          console.log(`Processing level1: ${level1}`);
          const level1Record = await prisma.level1.create({
            data: {
              name: level1,
              houseElement: {
                connect: {
                  id: houseElementRecord.id
                }
              }
            }
          });

          // Process Level2 if exists
          if (level2) {
            console.log(`Processing level2: ${level2}`);
            const level2Record = await prisma.level2.create({
              data: {
                name: level2,
                level1: {
                  connect: {
                    id: level1Record.id
                  }
                }
              }
            });

            // Process Level3 if exists
            if (level3) {
              console.log(`Processing level3: ${level3}`);
              const level3Record = await prisma.level3.create({
                data: {
                  name: level3,
                  level2: {
                    connect: {
                      id: level2Record.id
                    }
                  }
                }
              });

              // Process Product if exists
              if (productName) {
                console.log(`Processing product: ${productName}`);
                await prisma.product.create({
                  data: {
                    name: productName,
                    depth: depth ? parseInt(depth.trim()) : null,
                    mp: mp ? parseInt(mp.trim()) : null,
                    price: price ? parseInt(price.trim()) : null,
                    level3: {
                      connect: {
                        id: level3Record.id
                      }
                    }
                  }
                });
              }
            }
          }
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
