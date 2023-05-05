const puppeteer = require("puppeteer");
require("dotenv").config();

exports.keepAliveDatetify = async (req, res) => {
  // Define an array of page URLs to load
  const pageUrls = [
    "https://www.datetify.app/signup",
    "https://www.datetify.app/keepaliveworker",
    "https://www.datetify.app/auth/logout",
    "https://www.datetify.app/keepaliveworker/food?duration=30",
  ];

  const authenticatedPageUrls = [
    "https://www.datetify.app/event-types",
    "https://www.datetify.app/bookings/upcoming",
    "https://www.datetify.app/availability",
    "https://www.datetify.app/settings/my-account/profile",
    "https://www.datetify.app/event-types/31",
    "https://www.datetify.app/event-types/31?tabName=setup",
    "https://www.datetify.app/event-types/31?tabName=availability",
    "https://www.datetify.app/event-types/31?tabName=limits",
    "https://www.datetify.app/event-types/31?tabName=advanced",
    "https://www.datetify.app/event-types/31?tabName=recurring",
    "https://www.datetify.app/event-types/31?tabName=apps",
    "https://www.datetify.app/event-types/31?tabName=workflows",
    "https://www.datetify.app/event-types/31?tabName=webhooks",
  ];

  while (true) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-gpu",
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--ignore-certificate-errors",
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
      ],
    });

    try {
      const page = await browser.newPage();

      // Load each page URL using Puppeteer
      for (const pageUrl of pageUrls) {
        await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 0 });
        console.log("Visited " + pageUrl + ", waiting for 8 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 8000));
      }

      await page.goto("https://www.datetify.app/auth/login", {
        waitUntil: "networkidle0",
        timeout: 0,
      });

      // Fill in the username and password fields
      await page.type("#email", process.env.USERNAME);
      await page.type("#password", process.env.PASSWORD);
      console.log(`Loaded login page`);

      // Submit the login form
      await Promise.all([
        page.click("button[type='submit']"),
        page.waitForNavigation({ waitUntil: "networkidle0" }),
      ]);

      console.log("Logged in successfully");

      // Go through all the pages after login
      for (const pageUrl of authenticatedPageUrls) {
        await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 0 });
        console.log("Visited " + pageUrl + ", waiting for 8 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 8000));
      }
    } catch (error) {
      console.error(`Error loading page error`, error.message);
    }

    await browser.close();
    console.log("All pages loaded successfully, waiting 60s");
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }
};
