const journals = [
  {
    name: 'SP500',
    description: 'INDEXSP: .INX',
    currency: 'USD',
    startDate: new Date('2023-01-19T00:00:00.000Z'),
    startBalance: 10000,
    balance: {
      current: 12678.89,
    },
  },
  {
    name: 'AMEX1',
    description: 'Amsterdam journal',
    currency: 'EUR',
    startDate: new Date('2023-03-01T00:00:00.000Z'),
    startBalance: 9568.23,
    balance: {
      current: -1234.56,
    },
  },
  {
    name: 'WINW21',
    description: 'Bovespa journal',
    currency: 'BRL',
    startDate: new Date('2023-02-28T00:00:00.000Z'),
    startBalance: 9568.23,
    balance: {
      current: 7891.45,
    },
  },
  {
    name: 'NASDAQ',
    description: 'Nasdaq journal',
    currency: 'USD',
    startDate: new Date('2023-02-28T00:00:00.000Z'),
    startBalance: 9568.23,
    balance: {
      current: 7891.45,
    },
  },
  {
    name: 'NYSE USD',
    description: 'Journal NYSE',
    currency: 'USD',
    startDate: new Date('2022-02-05T00:00:00.000Z'),
    startBalance: 1000,
    balance: {
      current: -456.23,
    },
  },
  {
    name: 'FOREX',
    description: 'Journal FOREX',
    currency: 'EUR',
    startDate: new Date('2022-05-12T00:00:00.000Z'),
    startBalance: 9568.23,
    balance: {
      current: -0.45,
    },
  },
  {
    name: 'Crude',
    description: 'Journal Trade US Crude',
    currency: 'USD',
    startDate: new Date('2022-01-01T00:00:00.000Z'),
    startBalance: 1000,
    balance: {
      current: 7891.45,
    },
  },
  {
    name: 'Crypto BR',
    description: 'Journal Crypto BR',
    currency: 'BRL',
    startDate: new Date('2022-01-01T00:00:00.000Z'),
    startBalance: 55.23,
    balance: {
      current: 0,
    },
  },
  {
    name: 'Crypto USD',
    description: 'Journal Crypto USD',
    currency: 'USD',
    startDate: new Date('2022-01-01T00:00:00.000Z'),
    startBalance: 100,
    balance: {
      current: 200,
    },
  },
  {
    name: 'Sample 6',
    description: 'Sample journal',
    currency: 'BRL',
    startDate: new Date('2022-01-28T00:00:00.000Z'),
    startBalance: 1.23,
    balance: {
      current: 7891.45,
    },
  },
  {
    name: 'UK100',
    description: 'Indice UK100',
    currency: 'EUR',
    startDate: new Date('2022-03-01T00:00:00.000Z'),
    startBalance: 0.23,
    balance: {
      current: 7891.45,
    },
  },
  {
    name: 'DE40 EUR',
    currency: 'EUR',
    startDate: new Date('2022-01-15T00:00:00.000Z'),
    startBalance: 9568.23,
    balance: {
      current: -7891.45,
    },
  },
];

// eslint-disable-next-line no-undef
module.exports = {
  journals,
};
