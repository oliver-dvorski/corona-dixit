const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

const serviceAccount = require('./service-account.json');

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccount);
adminConfig.storageBucket = 'corona-dixit.appspot.com';
const app = admin.initializeApp(adminConfig);

const storage = new Storage({
  keyFilename: './service-account.json',
});

exports.admin = app;
exports.storage = storage;
