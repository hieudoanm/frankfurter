import { writeFileSync } from 'node:fs';

type FrankfurterData = {
  base: string;
  date: string;
  rates: Record<string, number>;
};

const getFrankfurter = async (): Promise<FrankfurterData> => {
  const url = 'https://api.frankfurter.dev/v1/latest';
  const response = await fetch(url);
  if (!response.ok) {
    return {
      base: 'EUR',
      date: new Date().toISOString().split('T').at(0) ?? '',
      rates: {},
    };
  }
  return response.json() as Promise<FrankfurterData>;
};

type CoinRankingData = {
  status: string;
  data: { coins: { symbol: string; price: string }[] };
};

const getCoinRanking = async (): Promise<FrankfurterData> => {
  const url = 'https://api.coinranking.com/v2/coins?limit=100';
  const response = await fetch(url);
  if (!response.ok) {
    return {
      base: 'USD',
      date: new Date().toISOString().split('T').at(0) ?? '',
      rates: {},
    };
  }
  const data = (await response.json()) as CoinRankingData;
  const rates: Record<string, number> = {};
  for (const coin of data.data.coins) {
    const { symbol, price } = coin;
    rates[symbol] = Number.parseFloat(price);
  }
  return {
    base: 'USD',
    date: new Date().toISOString().split('T').at(0) ?? '',
    rates,
  };
};

export const main = async () => {
  try {
    const frankfurter = await getFrankfurter();
    const {
      base: frankfurterBase,
      date,
      rates: frankfurterRates,
    } = frankfurter;
    const coinRanking = await getCoinRanking();
    const { base: coinRankingBase, rates: coinRankingRates } = coinRanking;
    const convertedCoinRankingRates: Record<string, number> = {};
    for (const rate in coinRankingRates) {
      const coinRankingRate: number = coinRankingRates[rate];
      const frankfurterRate: number = frankfurterRates[coinRankingBase];
      convertedCoinRankingRates[rate] = coinRankingRate * frankfurterRate;
    }
    const data = {
      base: frankfurterBase,
      date,
      rates: {
        [frankfurterBase]: 1,
        ...frankfurterRates,
        ...convertedCoinRankingRates,
      },
    };
    writeFileSync('./src/json/currency.json', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
};

main();
