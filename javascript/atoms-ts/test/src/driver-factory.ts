// @ts-ignore
import { Builder, WebDriver, Browser } from 'selenium-webdriver';
// @ts-ignore
import { runfiles } from '@bazel/runfiles';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Creates a WebDriver instance for the specified browser.
 * Uses SELENIUM_BROWSER environment variable to determine which browser to use.
 * Optionally uses SE_CHROMEDRIVER, SE_CHROME, SE_GECKODRIVER, SE_FIREFOX env vars
 * for pinned driver/browser binaries.
 */
export async function createDriver(): Promise<WebDriver> {
    const browserName = process.env.SELENIUM_BROWSER;

    if (!browserName) {
        throw new Error(
            'SELENIUM_BROWSER environment variable not set. Please specify: chrome, firefox, or safari'
        );
    }

    if (browserName.includes(',')) {
        throw new Error('SELENIUM_BROWSER must be a single browser, not a comma-separated list');
    }

    // Create a temporary home directory for the test session
    process.env['HOME'] = fs.mkdtempSync(path.join(os.tmpdir(), 'atoms-ts-test'));

    let builder = new Builder().disableEnvironmentOverrides();

    switch (browserName.toLowerCase()) {
        case 'chrome':
            return buildChromeDriver(builder);

        case 'firefox':
            return buildFirefoxDriver(builder);

        case 'safari':
            builder.forBrowser(Browser.SAFARI);
            return builder.build();

        default:
            throw new Error(`Unsupported browser: ${browserName}`);
    }
}

function buildChromeDriver(builder: any): WebDriver {
    builder.forBrowser(Browser.CHROME);

    const driverPath = process.env.SE_CHROMEDRIVER;
    const browserPath = process.env.SE_CHROME;

    if (driverPath) {
        const resolved = runfiles.resolve(driverPath);
        const serviceBuilder = new chrome.ServiceBuilder(resolved);
        serviceBuilder.enableVerboseLogging();
        builder.setChromeService(serviceBuilder);
    }

    if (browserPath) {
        const resolved = runfiles.resolve(browserPath);
        const options = new chrome.Options();
        options.setChromeBinaryPath(resolved);
        options.setAcceptInsecureCerts(true);
        options.addArguments(
            'disable-infobars',
            'disable-breakpad',
            'disable-dev-shm-usage',
            'no-sandbox'
        );
        builder.setChromeOptions(options);
    }

    return builder.build();
}

function buildFirefoxDriver(builder: any): WebDriver {
    builder.forBrowser(Browser.FIREFOX);

    const driverPath = process.env.SE_GECKODRIVER;
    const browserPath = process.env.SE_FIREFOX;

    if (driverPath) {
        const resolved = runfiles.resolve(driverPath);
        const serviceBuilder = new firefox.ServiceBuilder(resolved);
        serviceBuilder.enableVerboseLogging(true);
        builder.setFirefoxService(serviceBuilder);
    }

    if (browserPath) {
        const resolved = runfiles.resolve(browserPath);
        const options = new firefox.Options();
        options.setBinary(resolved);
        builder.setFirefoxOptions(options);
    }

    return builder.build();
}
