import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getAuthDatabaseSync } from "@/lib/mongodb";

// Validate required environment variables
if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('Missing required environment variable: BETTER_AUTH_SECRET');
}

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error('Missing required GitHub OAuth environment variables: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
}

export const auth = betterAuth({
    database: mongodbAdapter(getAuthDatabaseSync()),
    emailAndPassword: {
        enabled: true, 
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
    },
    secret: process.env.BETTER_AUTH_SECRET,
});