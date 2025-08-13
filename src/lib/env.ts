/**
 * Environment variable validation
 * This runs at startup to ensure all required environment variables are present
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'BETTER_AUTH_SECRET',
  'ANTHROPIC_API_KEY',
] as const;

// Optional environment variables for reference
// const optionalEnvVars = [
//   'MONGODB_DB',
//   'GITHUB_CLIENT_ID', 
//   'GITHUB_CLIENT_SECRET',
//   'NEXT_PUBLIC_AUTH_URL',
// ] as const;

export function validateEnvironment() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional but recommended environment variables
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    warnings.push('GitHub OAuth not configured (GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET missing)');
  }

  if (!process.env.MONGODB_DB) {
    warnings.push('MONGODB_DB not set, using default database name');
  }

  // Validate BETTER_AUTH_SECRET strength
  const secret = process.env.BETTER_AUTH_SECRET;
  if (secret && secret.length < 32) {
    warnings.push('BETTER_AUTH_SECRET should be at least 32 characters long for security');
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Throw error for missing required variables
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n` +
      missing.map(envVar => `   - ${envVar}`).join('\n') +
      `\n\nPlease check your .env file or environment configuration.`
    );
  }

  console.log('✅ Environment validation passed');
}

// Run validation immediately when this module is imported
validateEnvironment();