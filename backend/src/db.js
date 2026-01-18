import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getDb() {
  const dbPath = process.env.DB_FILE || './data/app.db';
  const db = await open({
    filename: path.resolve(__dirname, '..', dbPath),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      region TEXT,
      imageUrl TEXT,
      country TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS newsletter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      destination TEXT,
      message TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await seedData(db);
  return db;
}

async function seedData(db) {
  const { count: destinationsCount } = await db.get('SELECT COUNT(*) as count FROM destinations');
  if (destinationsCount === 0) {
    await db.run(
      `INSERT INTO destinations (name, description, price, region, imageUrl, country) VALUES
        ('Paris, France', 'The City of Light offers iconic landmarks, world-class museums, and exquisite cuisine.', 1299, 'europe', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop', 'France'),
        ('New York, USA', 'Broadway shows, museums, and endless entertainment in the city that never sleeps.', 999, 'americas', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop', 'USA'),
        ('Tokyo, Japan', 'Blend of ancient traditions and cutting-edge modernity with incredible cuisine.', 1499, 'asia', 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=600&h=400&fit=crop', 'Japan'),
        ('Barcelona, Spain', 'Gaudí architecture, Mediterranean beaches, and vibrant food culture.', 1199, 'europe', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop', 'Spain'),
        ('Hawaii, USA', 'Tropical beaches, surfing, and volcanic landscapes with year-round perfect weather.', 1899, 'americas', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 'USA'),
        ('New Zealand', 'Fjords, geothermal wonders, and world-class adventure activities.', 1999, 'oceania', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', 'New Zealand')
      `
    );
  }

  const { count: testimonialsCount } = await db.get('SELECT COUNT(*) as count FROM testimonials');
  if (testimonialsCount === 0) {
    await db.run(
      `INSERT INTO testimonials (name, rating, comment) VALUES
        ('Sarah & Michael Johnson', 5, 'Honeymoon in Paris was magical! Every detail was perfect.'),
        ('David Chen', 5, 'Family trip to Tokyo was perfectly paced and stress-free.'),
        ('Emily Rodriguez', 5, 'Backpacking Europe was unforgettable thanks to the planning support.'),
        ('Amanda Wilson', 5, 'Beach Escape package was pure paradise from Bali to Maldives.')
      `
    );
  }
}
