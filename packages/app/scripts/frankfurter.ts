import { writeFileSync } from 'node:fs';

export const main = async () => {
  try {
    const url = 'https://api.frankfurter.dev/v1/latest';
    const response = await fetch(url);
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    writeFileSync('./src/json/frankfurter.json', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
};

main();
