// 複習firebase DB連線
// 學習使用環境變數儲存機敏資料(利用dotenv)

const admin = require('firebase-admin');
require('dotenv').config();

// var serviceAccount = require("../nodeproject-c2763-firebase-adminsdk-8wpdw-0be9f73807");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://nodeproject-c2763-default-rtdb.firebaseio.com"
// });

// 將私密金鑰.json檔存入環境變數後，再從環境變數中讀出
// 注意private_key的原值有換行符號，但環境變數不會進行處理，故會造成private_key出錯，使用.replace()取代掉換行符號或是在環境變數中用""將字串包起來
admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    }),
    databaseURL: process.env.FIREBASE_DATABASEURL
});

const db = admin.database();

module.exports = db;