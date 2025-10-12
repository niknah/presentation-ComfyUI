import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_URL;

// Database Name
const dbName = 'nuxt_login';
let client = null;
let theDbs = {};

export default class DBClient {
  async exec(collections, func) {
    // Use connect method to connect to the server
//    let opened = false;
    try {
      if (!client) {
        client = new MongoClient(url);
        await client.connect();
        console.log('Connected successfully to server');
//        opened = true;
      }
      this.db = theDbs[dbName];
      if (!this.db) {
        this.db = theDbs[dbName] = client.db(dbName);
      }
      const cols = {};
      for(const collection of collections) {
        cols[collection] = this.db.collection(collection);
      }
      // the following code examples can be pasted here...
      return await func(cols);
    } finally {
//      if (opened) {
//        await client.close();
//      }
    }
  }
}


