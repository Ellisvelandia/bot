const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// Helper Functions
async function smart_click_with_pause(page, selector, pause = 500) {
    try {
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.evaluate((s) => document.querySelector(s).click(), selector);
        await new Promise(r => setTimeout(r, pause));
        console.log(`Successfully clicked: ${selector}`);
    } catch (error) {
        console.error(`Failed to click ${selector}:`, error.message);
        throw error;
    }
}

async function smartType(page, selector, value, pause = 500) {
    try {
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.type(selector, value);
        await new Promise(r => setTimeout(r, pause));
        console.log(`Successfully typed into: ${selector}`);
    } catch (error) {
        console.error(`Failed to type into ${selector}:`, error.message);
        throw error;
    }
}

// Existing waitForSelectorForever function
async function waitForSelectorForever(page, selector, failCount = 0) {
    if (failCount >= 3){
        throw new Error(`Could not find selector "${selector}" after 3 attempts`);
    }
    try {
        await page.waitForSelector(selector);
        console.log(`Selector ${selector} found on the page.`);
        return;
    } catch (error) {
        console.log(`Selector ${selector} not found yet. Waiting...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await waitForSelectorForever(page, selector, failCount + 1); 
    }
}

// Configuration for the recorder
const config = {
    followNewTab: true,
    fps: 30,
    videoFrame: {
        width: 1920,
        height: 1080
    },
    aspectRatio: '16:9'
};

async function runTest() {
    try {
        const browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });
        const page = await browser.newPage();
        const recorder = new PuppeteerScreenRecorder(page, config);

        console.log('Starting recording...');
        await recorder.start('./test-recording.mp4');

        // Test sequence using helper functions
        await page.goto('https://www.google.com');
        
        // Test smartType
        await smartType(page, 'input[name="q"]', 'Puppeteer Testing', 500);
        
        // Test smart_click_with_pause (clicking search button)
        await smart_click_with_pause(page, 'input[name="btnK"]', 1000);
        
        // Test waitForSelectorForever
        await waitForSelectorForever(page, '#search');
        
        // Additional interaction example
        await page.evaluate(() => {
            window.scrollBy(0, 500);
            return new Promise(resolve => setTimeout(resolve, 1000));
        });

        console.log('Stopping recording...');
        await recorder.stop();
        await browser.close();
        console.log('Test completed successfully!');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
runTest().then(() => {
    console.log('Script finished');
}).catch(console.error);