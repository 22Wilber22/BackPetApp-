"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestoreDb = exports.adminAuth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const env_1 = require("./env");
const initializeFirebase = () => {
    if (firebase_admin_1.default.apps.length > 0) {
        return firebase_admin_1.default.app();
    }
    if (env_1.env.FIREBASE_PROJECT_ID && env_1.env.FIREBASE_CLIENT_EMAIL && env_1.env.FIREBASE_PRIVATE_KEY) {
        const credential = firebase_admin_1.default.credential.cert({
            projectId: env_1.env.FIREBASE_PROJECT_ID,
            clientEmail: env_1.env.FIREBASE_CLIENT_EMAIL,
            privateKey: env_1.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        });
        return firebase_admin_1.default.initializeApp({ credential, projectId: env_1.env.FIREBASE_PROJECT_ID });
    }
    return firebase_admin_1.default.initializeApp();
};
const app = initializeFirebase();
exports.adminAuth = app.auth();
const db = env_1.env.FIREBASE_DATABASE_ID
    ? (0, firestore_1.getFirestore)(app, env_1.env.FIREBASE_DATABASE_ID)
    : (0, firestore_1.getFirestore)(app);
db.settings({ ignoreUndefinedProperties: true });
exports.firestoreDb = db;
