/**
 * Environment variable validation and access
 * Ensures required environment variables are present at startup
 */

interface EnvConfig {
  // Required
  databaseUrl: string;
  nextAuthSecret: string;
  nextAuthUrl: string;
  
  // Optional
  nodeEnv: 'development' | 'production' | 'test';
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  emailjsPublicKey?: string;
  emailjsServiceId?: string;
  emailjsTemplateId?: string;
  recaptchaSiteKey?: string;
  recaptchaSecretKey?: string;
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

export function validateEnv(): EnvConfig {
  const config: EnvConfig = {
    databaseUrl: getRequiredEnv('DATABASE_URL'),
    nextAuthSecret: getRequiredEnv('NEXTAUTH_SECRET'),
    nextAuthUrl: getRequiredEnv('NEXTAUTH_URL'),
    nodeEnv: (getOptionalEnv('NODE_ENV') || 'development') as EnvConfig['nodeEnv'],
    cloudinaryCloudName: getOptionalEnv('CLOUDINARY_CLOUD_NAME'),
    cloudinaryApiKey: getOptionalEnv('CLOUDINARY_API_KEY'),
    cloudinaryApiSecret: getOptionalEnv('CLOUDINARY_API_SECRET'),
    emailjsPublicKey: getOptionalEnv('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY'),
    emailjsServiceId: getOptionalEnv('NEXT_PUBLIC_EMAILJS_SERVICE_ID'),
    emailjsTemplateId: getOptionalEnv('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID'),
    recaptchaSiteKey: getOptionalEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY'),
    recaptchaSecretKey: getOptionalEnv('RECAPTCHA_SECRET_KEY'),
  };

  // Validate Cloudinary is configured if any Cloudinary env vars are set
  const cloudinaryVars = [
    config.cloudinaryCloudName,
    config.cloudinaryApiKey,
    config.cloudinaryApiSecret,
  ].filter(Boolean);
  
  if (cloudinaryVars.length > 0 && cloudinaryVars.length < 3) {
    throw new Error(
      'Cloudinary configuration incomplete. All three variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) must be set together.'
    );
  }

  return config;
}

/**
 * Get environment configuration
 * Validates and returns environment variables
 * In production, throws if required vars are missing
 * In development, warns but provides defaults for flexibility
 */
export function getEnv(): EnvConfig {
  try {
    return validateEnv();
  } catch (error) {
    // In production, fail fast if env vars are missing
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    
    // In development, warn but provide defaults
    console.warn('Environment validation warning:', error);
    console.warn('Using default values for development. Ensure all env vars are set for production.');
    
    // Create a minimal config for development
    return {
      databaseUrl: process.env.DATABASE_URL || '',
      nextAuthSecret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      nodeEnv: 'development',
    };
  }
}

// Export validated environment config
export const env = getEnv();

