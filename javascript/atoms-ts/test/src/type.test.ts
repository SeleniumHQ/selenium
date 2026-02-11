import { expect } from 'chai';
// @ts-ignore
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from './driver-factory';

describe('type', () => {
    let driver: WebDriver;

    before(async function () {
        this.timeout(30000);
        try {
            driver = await createDriver();
        } catch (err) {
            console.log('Failed to create driver:', (err as Error).message);
            this.skip();
        }

        // Create test page with input elements
        const html = `
      <html>
        <head>
          <title>Type Tests</title>
        </head>
        <body>
          <input type="text" id="textbox" />
          <input type="password" id="password" />
          <input type="email" id="email" />
          <input type="search" id="search" />
          <textarea id="textarea"></textarea>
          <input type="text" id="inputCount" value="0" />
          <input type="text" id="textInputCount" value="0" />
          <div style="width:0px;height:0px;overflow:hidden;">
            <input type="text" id="hiddenInput" />
          </div>
          <input type="text" id="focused" />
          <input type="text" id="multiline" style="width:50px;" />
        </body>
      </html>
    `;
        await driver.get('data:text/html,' + encodeURIComponent(html));
    });

    after(async () => {
        if (driver) {
            try {
                await driver.quit();
            } catch (e) {
                // Ignore quit errors
            }
        }
    });

    async function getInputValue(elemId: string): Promise<string> {
        return await driver.executeScript(`
      return document.getElementById('${elemId}').value;
    `) as string;
    }

    async function clearInput(elemId: string): Promise<void> {
        await driver.executeScript(`
      document.getElementById('${elemId}').value = '';
    `);
    }

    async function typeInElement(elemId: string, text: string): Promise<void> {
        const elem = await driver.findElement({ id: elemId });
        await elem.click();
        await elem.sendKeys(text);
    }

    it('should type lowercase letters', async () => {
        await clearInput('textbox');
        await typeInElement('textbox', 'abcdefghijklmnopqrstuvwxyz');
        const value = await getInputValue('textbox');
        expect(value).to.equal('abcdefghijklmnopqrstuvwxyz');
    });

    it('should type uppercase letters', async () => {
        await clearInput('textbox');
        await typeInElement('textbox', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        const value = await getInputValue('textbox');
        expect(value).to.equal('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });

    it('should type numbers', async () => {
        await clearInput('textbox');
        await typeInElement('textbox', '1234567890');
        const value = await getInputValue('textbox');
        expect(value).to.equal('1234567890');
    });

    it('should type special characters', async () => {
        await clearInput('textbox');
        await typeInElement('textbox', '!@#$%^&*()_+-=[]{}|;:,.<>?');
        const value = await getInputValue('textbox');
        expect(value).to.equal('!@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should type into password field', async () => {
        await clearInput('password');
        await typeInElement('password', 'secretpassword123');
        const value = await getInputValue('password');
        expect(value).to.equal('secretpassword123');
    });

    it('should type into email field', async () => {
        await clearInput('email');
        await typeInElement('email', 'test@example.com');
        const value = await getInputValue('email');
        expect(value).to.equal('test@example.com');
    });

    it('should type into textarea', async () => {
        await clearInput('textarea');
        await typeInElement('textarea', 'This is a multiline\ntext area test');
        const value = await getInputValue('textarea');
        expect(value).to.equal('This is a multiline\ntext area test');
    });

    it('should handle repeated typing', async () => {
        await clearInput('textbox');
        const elem = await driver.findElement({ id: 'textbox' });
        await elem.click();
        await elem.sendKeys('hello');
        await elem.sendKeys('world');
        const value = await getInputValue('textbox');
        expect(value).to.equal('helloworld');
    });

    it('should type spaces', async () => {
        await clearInput('textbox');
        await typeInElement('textbox', 'hello world test');
        const value = await getInputValue('textbox');
        expect(value).to.equal('hello world test');
    });

    it('should handle chained text input', async () => {
        await clearInput('textbox');
        const elem = await driver.findElement({ id: 'textbox' });
        await elem.click();
        await elem.sendKeys('a');
        await elem.sendKeys('b');
        await elem.sendKeys('c');
        const value = await getInputValue('textbox');
        expect(value).to.equal('abc');
    });

    it('should clear and type new text', async () => {
        await clearInput('textbox');
        await typeInElement('textbox', 'first text');
        await clearInput('textbox');
        await typeInElement('textbox', 'second text');
        const value = await getInputValue('textbox');
        expect(value).to.equal('second text');
    });

    it('should type into hidden input', async () => {
        await clearInput('hiddenInput');
        await typeInElement('hiddenInput', 'hidden value');
        const value = await getInputValue('hiddenInput');
        expect(value).to.equal('hidden value');
    });
});
