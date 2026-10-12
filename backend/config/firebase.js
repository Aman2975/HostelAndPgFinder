const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'hostel-pg-finder-c5dc3';
const API_KEY = 'AIzaSyCB05z1imjlie5UNxJps9-f-fzWZQWSEe4';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const altServiceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let db;
let adminInstance = null;

if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID
    });
    adminInstance = admin;
    db = admin.firestore();
    console.log('🔥 Firebase Admin initialized with serviceAccountKey.json');
} else if (fs.existsSync(altServiceAccountPath)) {
    const serviceAccount = require(altServiceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID
    });
    adminInstance = admin;
    db = admin.firestore();
    console.log('🔥 Firebase Admin initialized with config/serviceAccountKey.json');
} else {
    console.log('🔥 Initializing Firestore REST API client (No serviceAccountKey.json needed)');

    function toFirestoreValue(val) {
        if (val === null || val === undefined) return { nullValue: null };
        if (typeof val === 'boolean') return { booleanValue: val };
        if (typeof val === 'number') {
            return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
        }
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                return { arrayValue: { values: val.map(toFirestoreValue) } };
            }
            const fields = {};
            for (const [k, v] of Object.entries(val)) {
                fields[k] = toFirestoreValue(v);
            }
            return { mapValue: { fields } };
        }
        return { stringValue: String(val) };
    }

    function fromFirestoreValue(field) {
        if (!field) return null;
        if ('stringValue' in field) return field.stringValue;
        if ('integerValue' in field) return Number(field.integerValue);
        if ('doubleValue' in field) return Number(field.doubleValue);
        if ('booleanValue' in field) return field.booleanValue;
        if ('timestampValue' in field) return field.timestampValue;
        if ('nullValue' in field) return null;
        if ('mapValue' in field) {
            const obj = {};
            const fields = field.mapValue.fields || {};
            for (const [k, v] of Object.entries(fields)) {
                obj[k] = fromFirestoreValue(v);
            }
            return obj;
        }
        if ('arrayValue' in field) {
            const values = field.arrayValue.values || [];
            return values.map(fromFirestoreValue);
        }
        return null;
    }

    function fromFirestoreDoc(doc) {
        if (!doc || !doc.name) {
            return { exists: false, data: () => null, id: null };
        }
        const id = doc.name.split('/').pop();
        const fields = doc.fields || {};
        const data = {};
        for (const [k, v] of Object.entries(fields)) {
            data[k] = fromFirestoreValue(v);
        }
        return {
            id,
            data: () => data,
            exists: true
        };
    }

    db = {
        collection: (collectionName) => {
            return {
                get: async () => {
                    const url = `${BASE_URL}/${collectionName}?key=${API_KEY}`;
                    const res = await fetch(url);
                    if (!res.ok) {
                        if (res.status === 404) return { empty: true, size: 0, forEach: () => {} };
                        const errText = await res.text();
                        throw new Error(`Firestore GET ${collectionName} error (${res.status}): ${errText}`);
                    }
                    const body = await res.json();
                    const rawDocs = body.documents || [];
                    const docs = rawDocs.map(fromFirestoreDoc);
                    return {
                        empty: docs.length === 0,
                        size: docs.length,
                        docs,
                        forEach: (cb) => docs.forEach(cb)
                    };
                },
                add: async (data) => {
                    const url = `${BASE_URL}/${collectionName}?key=${API_KEY}`;
                    const fields = {};
                    for (const [k, v] of Object.entries(data)) {
                        fields[k] = toFirestoreValue(v);
                    }
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fields })
                    });
                    if (!res.ok) {
                        const errText = await res.text();
                        throw new Error(`Firestore ADD ${collectionName} error (${res.status}): ${errText}`);
                    }
                    const body = await res.json();
                    const doc = fromFirestoreDoc(body);
                    return { id: doc.id };
                },
                doc: (documentId) => {
                    const docUrl = `${BASE_URL}/${collectionName}/${documentId}?key=${API_KEY}`;
                    return {
                        get: async () => {
                            const res = await fetch(docUrl);
                            if (res.status === 404) {
                                return { exists: false, data: () => null, id: documentId };
                            }
                            if (!res.ok) {
                                const errText = await res.text();
                                throw new Error(`Firestore GET doc ${documentId} error (${res.status}): ${errText}`);
                            }
                            const body = await res.json();
                            return fromFirestoreDoc(body);
                        },
                        set: async (data, options = {}) => {
                            const fields = {};
                            for (const [k, v] of Object.entries(data)) {
                                fields[k] = toFirestoreValue(v);
                            }
                            const res = await fetch(docUrl, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fields })
                            });
                            if (!res.ok) {
                                const errText = await res.text();
                                throw new Error(`Firestore SET doc ${documentId} error (${res.status}): ${errText}`);
                            }
                            return true;
                        },
                        update: async (data) => {
                            // Get current document first to merge
                            const getRes = await fetch(docUrl);
                            let currentFields = {};
                            if (getRes.ok) {
                                const currentBody = await getRes.json();
                                currentFields = currentBody.fields || {};
                            }

                            for (const [k, v] of Object.entries(data)) {
                                currentFields[k] = toFirestoreValue(v);
                            }

                            const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
                            const patchUrl = `${docUrl}&${updateMask}`;

                            const res = await fetch(patchUrl, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fields: currentFields })
                            });
                            if (!res.ok) {
                                const errText = await res.text();
                                throw new Error(`Firestore UPDATE doc ${documentId} error (${res.status}): ${errText}`);
                            }
                            return true;
                        },
                        delete: async () => {
                            const res = await fetch(docUrl, { method: 'DELETE' });
                            if (!res.ok && res.status !== 404) {
                                const errText = await res.text();
                                throw new Error(`Firestore DELETE doc ${documentId} error (${res.status}): ${errText}`);
                            }
                            return true;
                        }
                    };
                }
            };
        }
    };
}

module.exports = {
    admin: adminInstance,
    db
};
