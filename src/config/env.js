import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 7800,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey123',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};
