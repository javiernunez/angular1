import { Readable, pipeline } from 'stream';
import fs from 'fs';
import path from 'path';
import { EOL } from 'os';

// Helper function to generate a unique id
function generateUniqueId(index) {
  return `product-${index}`;
}

// Helper function to generate a random name
function generateRandomName() {
  const adjectives = ['Amazing', 'Incredible', 'Fantastic', 'Awesome', 'Premium', 'Luxury', 'Elegant', 'Vibrant', 'Dynamic', 'Superb'];
  const nouns = ['Gadget', 'Device', 'Tool', 'Accessory', 'Item', 'Product', 'Gear', 'Machine', 'Apparatus', 'Instrument'];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adjective} ${noun}`;
}

// Helper function to create a product with a unique id, random name, and price
function createProduct(index) {
  return {
    id: generateUniqueId(index),
    name: generateRandomName(),
    price: +(Math.random() * 100).toFixed(2)
  };
}

function* iterateTo(limit) {
  for (let index = 1; index <= limit; index++) {
    yield index;
  }
}

function numberWithThousandSeparator(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function logProgress(index, logLimit, startLoop) {
  console.log(`Created ${numberWithThousandSeparator(index)} records for huge JSON. (${numberWithThousandSeparator(logLimit)} in ${(Date.now() - startLoop) / 1000} seconds.)`);
}

function generateTransactions(limit) {
  return async function* (source) {
    const logLimit = 100_000;
    let startTime = Date.now();
    for await (const index of source) {
      if (index === 1) {
        yield Buffer.from(`[${EOL}`);
      }
      if (index % logLimit === 0) {
        logProgress(index, logLimit, startTime);
        startTime = Date.now();
      }
      yield Buffer.from(JSON.stringify(createProduct(index), null, 2) + (index === limit ? `${EOL}]` : `,${EOL}`));
    }
  };
}

function onFinish(limit, startTime) {
  return (error) => {
    if (error) {
      console.error(`Error generating JSON file: ${error.toString()}`);
    } else {
      console.log(`Generated ${numberWithThousandSeparator(limit)} records for huge JSON in ${(Date.now() - startTime) / 1000} seconds.`);
    }
  };
}

async function main() {
  const [_node, _module, filePath] = process.argv;
  const outputPath = path.resolve(filePath);
  if (fs.existsSync(outputPath)) {
    await fs.promises.unlink(outputPath);
  }
  const limit = 200_000;
  const startTime = Date.now();
  pipeline(
    Readable.from(iterateTo(limit)),
    generateTransactions(limit),
    fs.createWriteStream(outputPath),
    onFinish(limit, startTime)
  );
}

try {
  main();
} catch (error) {
  console.error(error.toString());
  console.error('Error generating JSON.');
}
