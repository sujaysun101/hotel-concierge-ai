import { chromium } from "playwright"

const base = process.env.BASE_URL || "http://127.0.0.1:3000"

async function shot(path: string, url: string, ready: string) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForSelector(ready, { timeout: 20000 })
  await page.screenshot({ path, type: "png" })
  await browser.close()
}

await shot("public/portfolio-screenshot.png", `${base}/demo`, '[data-screen="desk"]')
await shot("public/portfolio-screenshot-landing.png", `${base}/`, '[data-screen="landing"]')
console.log("Wrote portfolio screenshots.")
