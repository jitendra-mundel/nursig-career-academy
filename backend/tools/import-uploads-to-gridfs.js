#!/usr/bin/env node
/**
 * One-time importer: import all files from a directory into MongoDB GridFS.
 * Usage (locally):
 *   node backend/tools/import-uploads-to-gridfs.js /path/to/backup/uploads
 *
 * It will store each file in GridFS with its filename (so /uploads/<filename> URLs work).
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/yourdb';

async function importDir(dir) {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

  const files = fs.readdirSync(dir);
  for (const f of files) {
    const absolute = path.join(dir, f);
    const stat = fs.statSync(absolute);
    if (!stat.isFile()) continue;

    // Skip if already present in GridFS
    const existing = await db.collection('uploads.files').findOne({ filename: f });
    if (existing) {
      console.log('skip (exists):', f);
      continue;
    }

    console.log('importing:', f);
    const read = fs.createReadStream(absolute);
    const upload = bucket.openUploadStream(f, { metadata: { importedAt: new Date().toISOString() } });
    await new Promise((resolve, reject) => {
      read.pipe(upload).on('error', reject).on('finish', resolve);
    });
    console.log('imported:', f);
  }

  console.log('done');
  await mongoose.disconnect();
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node import-uploads-to-gridfs.js /path/to/uploads_backup');
  process.exit(1);
}
importDir(arg).catch((e) => {
  console.error(e);
  process.exit(2);
});
