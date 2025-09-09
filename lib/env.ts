// Environment variables configuration
export const env = {
  YAHOO_CLIENT_ID: process.env.YAHOO_CLIENT_ID,
  YAHOO_CLIENT_SECRET: process.env.YAHOO_CLIENT_SECRET,
  YAHOO_REDIRECT_URI: process.env.YAHOO_REDIRECT_URI || "http://localhost:3000/api/auth/yahoo",

  // Email configuration (for future use)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Scheduling (for future use)
  CRON_SECRET: process.env.CRON_SECRET,
} as const

// Validate required environment variables
export function validateEnv() {
  const required = ["YAHOO_CLIENT_ID", "YAHOO_CLIENT_SECRET"] as const
  const missing = required.filter((key) => !env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  // Validate email configuration if any email env vars are set
  const emailVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const
  const setEmailVars = emailVars.filter((key) => env[key])

  if (setEmailVars.length > 0 && setEmailVars.length < emailVars.length) {
    const missingEmailVars = emailVars.filter((key) => !env[key])
    console.warn(`Partial email configuration detected. Missing: ${missingEmailVars.join(", ")}`)
  }
}
