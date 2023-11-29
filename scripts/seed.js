/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { journals } = require('./seed-data');
const { MongoClient } = require('mongodb');

const userEmail = 'a_cassianoweber_gmail_com';

async function seedJournals() {
  const client = new MongoClient('mongodb://localhost:27017/trading-journal');
  client.connect();
  const db = await client.db(userEmail);

  journals.forEach(async (journal) => {
    console.log('Inserting journal:', journal);
    await db.collection('journals').insertOne(journal);
  });
}

(async () => {
  await seedJournals();
})();
