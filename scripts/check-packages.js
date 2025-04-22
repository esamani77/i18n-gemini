// This script checks if the required packages are installed
const fs = require("fs")
const path = require("path")

try {
  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), "node_modules")
  if (!fs.existsSync(nodeModulesPath)) {
    console.error("node_modules directory not found. Please run npm install or yarn install.")
    process.exit(1)
  }

  // Check for @vercel/analytics
  const analyticsPath = path.join(nodeModulesPath, "@vercel", "analytics")
  if (!fs.existsSync(analyticsPath)) {
    console.error("@vercel/analytics package not found. Please run npm install @vercel/analytics.")
    process.exit(1)
  }

  // Check for @vercel/speed-insights
  const speedInsightsPath = path.join(nodeModulesPath, "@vercel", "speed-insights")
  if (!fs.existsSync(speedInsightsPath)) {
    console.error("@vercel/speed-insights package not found. Please run npm install @vercel/speed-insights.")
    process.exit(1)
  }

  console.log("All required packages are installed.")
} catch (error) {
  console.error("Error checking packages:", error)
  process.exit(1)
}
