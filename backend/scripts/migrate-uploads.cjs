#!/usr/bin/env node
/**
 * One-time migration: re-upload local /uploads/* files to Cloudinary and
 * update the database image URLs so uploads survive future deploys.
 *
 * Usage (run inside the backend container, e.g. Railway shell — cwd is /app):
 *   npm run migrate:uploads
 *   # or:  node scripts/migrate-uploads.cjs
 *
 * Requires CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET to be present in the
 * environment (not "placeholder"). Run it BEFORE your next deploy wipes the
 * local uploads folder, or copy the folder back first.
 *
 * No build step / no ts-node needed — runs with plain Node (CommonJS).
 */
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const { readFileSync, existsSync, createReadStream } = require('fs');
const { join } = require('path');

const loadEnv = (path) => {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
};

loadEnv(join(process.cwd(), '.env'));

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
if (!cloudName || cloudName === 'placeholder') {
  console.error(
    'ERROR: Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ' +
      'and CLOUDINARY_API_SECRET as env vars first.',
  );
  process.exit(1);
}
cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDir = join(process.cwd(), 'uploads');
const prisma = new PrismaClient();

const isLocalUpload = (url) => !!url && /^\/uploads\/[^/]+$/.test(url);
const isCloudUrl = (url) => !!url && /^https:\/\/(res\.)?cloudinary\.com\//.test(url);

const uploadFile = (filename) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'nutrizaria',
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 800, crop: 'limit' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );
    createReadStream(join(uploadDir, filename)).pipe(stream);
  });

async function main() {
  console.log('Cloudinary:', cloudName);
  console.log('Uploads dir:', uploadDir, 'exists:', existsSync(uploadDir));

  const cache = new Map();
  let migrated = 0;
  let missing = 0;

  const toCloud = async (ref) => {
    if (!ref) return null;
    if (cache.has(ref)) return cache.get(ref);
    if (isCloudUrl(ref)) return ref;
    if (!isLocalUpload(ref)) return ref;

    const filename = ref.replace('/uploads/', '');
    const filepath = join(uploadDir, filename);
    if (!existsSync(filepath)) {
      console.warn('  ! local file missing for', ref);
      missing++;
      return null;
    }
    const cloudUrl = await uploadFile(filename);
    cache.set(ref, cloudUrl);
    migrated++;
    return cloudUrl;
  };

  // ---- Products (image + images[]) ----
  const products = await prisma.product.findMany({
    select: { id: true, image: true, images: true },
  });
  for (const p of products) {
    const nextImage = await toCloud(p.image);
    const nextImages = [];
    for (const img of p.images || []) {
      const u = await toCloud(img);
      if (u) nextImages.push(u);
    }
    const changed =
      nextImage !== p.image || JSON.stringify(nextImages) !== JSON.stringify(p.images);
    if (changed) {
      await prisma.product.update({
        where: { id: p.id },
        data: { image: nextImage ?? p.image, images: nextImages },
      });
    }
  }

  // ---- ProductVariants (image) ----
  const variants = await prisma.productVariant.findMany({
    select: { id: true, image: true },
  });
  for (const v of variants) {
    const nextImage = await toCloud(v.image);
    if (nextImage !== v.image) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { image: nextImage ?? v.image },
      });
    }
  }

  // ---- Categories (image) ----
  const categories = await prisma.category.findMany({
    select: { id: true, image: true },
  });
  for (const c of categories) {
    const nextImage = await toCloud(c.image);
    if (nextImage !== c.image) {
      await prisma.category.update({
        where: { id: c.id },
        data: { image: nextImage ?? c.image },
      });
    }
  }

  // ---- BlogPosts (image) ----
  const posts = await prisma.blogPost.findMany({
    select: { id: true, image: true },
  });
  for (const b of posts) {
    const nextImage = await toCloud(b.image);
    if (nextImage !== b.image) {
      await prisma.blogPost.update({
        where: { id: b.id },
        data: { image: nextImage ?? b.image },
      });
    }
  }

  console.log(`\nDone. Uploaded ${migrated} file(s) to Cloudinary.`);
  if (missing) console.log(`${missing} reference(s) had no local file and were left unchanged.`);
  console.log('Now safe to redeploy — images live on Cloudinary, not local disk.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
