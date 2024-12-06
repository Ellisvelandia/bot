const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const locateChrome = require("chrome-location");
const { executablePath } = require("puppeteer");

let url_16 = "https://www.apple.com/shop/buy-iphone/iphone-16";

async function getPage() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: locateChrome,
  });
  let page = await browser.newPage();

  // Capture console log from browser
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  return page;
}

async function start() {
  let page = await getPage();
  await page.goto(url_16);
  await addToCart(page);
  await shipping(page);
  await payment(page);
}

start();

async function addToCart(page) {
  await smart_click_with_pause(
    page,
    "input[data-autom='dimensionScreensize6_1inch']",
    950
  );
  await smart_click_with_pause(
    page,
    "input[data-autom='dimensionColorteal']",
    800
  );
  await smart_click_with_pause(
    page,
    "input[data-autom='dimensionCapacity128gb']",
    800
  );
  await smart_click_with_pause(
    page,
    "input[data-autom='choose-noTradeIn']",
    700
  );
  await smart_click_with_pause(
    page,
    "input[data-autom='purchaseGroupOptionfullprice']",
    750
  );
  await smart_click_with_pause(
    page,
    "input[data-autom='carrierModelUNLOCKED/US']",
    700
  );
  await smart_click_with_pause(
    page,
    "input[data-autom='applecareplus_58_noapplecare']",
    700
  );
  await smart_click_with_pause(page, "button[data-autom='add-to-cart']", 700);
  await smart_click_with_pause(page, "button[data-autom='proceed']", 700);
  await smart_click_with_pause(page, "button[data-autom='checkout']", 700);
  await smart_click_with_pause(
    page,
    "button[data-autom='guest-checkout-btn']",
    1000
  );
  await smart_click_with_pause(
    page,
    "button[data-autom='fulfillment-continue-button']",
    5000
  );
}

async function shipping(page) {
  await smartType(
    page,
    "input[data-autom='form-field-firstName']",
    shippingDetails.firstName,
    500
  );
  await smartType(
    page,
    "input[data-autom='form-field-lastName']",
    shippingDetails.Lastname,
    500
  );
  await smartType(
    page,
    "input[data-autom='form-field-street']",
    shippingDetails.StreetAddress,
    500
  );

  if (shippingDetails.Apt) {
    // Only fill Apt field if not null
    await smartType(
      page,
      "input[data-autom='form-field-street2']",
      shippingDetails.Apt,
      500
    );
  }

  await smartType(
    page,
    "input[data-autom='form-field-postalCode']",
    shippingDetails.zip,
    500
  );
  await smartType(
    page,
    "input[data-autom='form-field-emailAddress']",
    shippingDetails.email,
    500
  );
  await smartType(
    page,
    "input[data-autom='form-field-fullDaytimePhone']",
    shippingDetails.phone,
    500
  );

  // Click the continue button at the bottom of the shipping form
  await page.click("#rs-checkout-continue-button-bottom");
}

async function payment(page) {
  // CREDIT CARD DETAILS
  let cards = new Map();
  cards.set(0, {
    type: "Visa",
    number: "4539599499307422",
    expData: "07/25",
    cvv: "250",
  });
  let card1 = cards.get(0);

  // FILL PAYMENT
  try {
    console.log("Filling payment");
    await page.waitForTimeout(3000);
    await page.click("span[class='form-label-small']");

    await page.waitForSelector(
      "input[id='checkout.billing.billingOptions.selectedBillingOptions.creditCard.cardInputs.cardInput-0.cardNumber']"
    );
    await page.type(
      "input[id='checkout.billing.billingOptions.selectedBillingOptions.creditCard.cardInputs.cardInput-0.cardNumber']",
      card1.number
    );
    await page.waitForTimeout(500);
    await page.type(
      "input[id='checkout.billing.billingOptions.selectedBillingOptions.creditCard.cardInputs.cardInput-0.expiration']",
      card1.expData
    );
    await page.waitForTimeout(500);
    await page.type(
      "input[id='checkout.billing.billingOptions.selectedBillingOptions.creditCard.cardInputs.cardInput-0.securityCode']",
      card1.cvv
    );
    await page.waitForTimeout(750);
  } catch (ex) {
    console.log("Primary click() failed");
    await page.evaluate(() =>
      document.getElementsByClassName("form-label-small")[0].click()
    );
  }

  // Attempt to click the Place Order button
  try {
    await page.click("#rs-checkout-continue-button-bottom");
    console.log("Waiting to place order...");
    await page.waitForTimeout(10000);
    console.log("Placing Order...");

    // Place Order Button
    await page.click("button[id='rs-checkout-continue-button-bottom']");
  } catch (ex) {
    try {
      console.log("Trying form button...");
      await page.evaluate(() =>
        document.getElementsByClassName("form-button")[0].click()
      );
    } catch (ex1) {
      try {
        console.log("Trying XPath...");
        let el = await page.$x('//*[@id="rs-checkout-continue-button-bottom"]');
        await el[0].click();
      } catch (ex2) {
        console.log("None of the click attempts worked!");
      }
    }
  }
}

// Helper functions

async function smart_click_with_pause(page, selector, pause) {
  await page.waitForSelector(selector, { timeout: 10000 }); // Increased timeout
  await page.evaluate((s) => document.querySelector(s).click(), selector);
  await new Promise((r) => setTimeout(r, pause));
}

async function smartType(page, selector, value, pause) {
  await page.waitForSelector(selector, { timeout: 10000 }); // Wait for the selector to appear
  await page.type(selector, value); // Use Puppeteer's type method to simulate real typing
  await new Promise((r) => setTimeout(r, pause)); // Add a pause if needed
}

// Shipping and payment details

const shippingDetails = {
  firstName: "Jeff",
  Lastname: "Johnson",
  StreetAddress: "change address",
  Apt: null,
  zip: "",
  city: "change city",
  country: "United States",
  email: "testemail@gmail.com",
  phone: "(444)444-4444",
};
