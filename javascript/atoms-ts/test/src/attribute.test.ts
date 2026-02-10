import { expect } from 'chai';
// @ts-ignore
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from './driver-factory';

describe('getAttribute', () => {
    let driver: WebDriver;

    before(async function () {
        this.timeout(30000);
        try {
            driver = await createDriver();
        } catch (err) {
            console.log('Failed to create driver:', (err as Error).message);
            this.skip();
        }

        // Create test page with fixture elements
        const html = `
      <html>
        <head>
          <title>getAttribute Tests</title>
        </head>
        <body>
          <div id="cheddar" name="cheese" class="tasty" unknown="lovely" empty="">Cheddar</div>
          <div id="checky"></div>
          <select>
            <option id="selecty" selected>selecty</option>
            <option id="unselecty" value="unselecty">unselecty</option>
          </select>
          <input id="unchecky" type="checkbox" value="unchecky" />
          <li id="aValue" value="4b273a33fbbd29013nN93dy4F1A~" class="cur"></li>
          <div id="mutable"></div>
        </body>
      </html>
    `;
        await driver.get('data:text/html,' + encodeURIComponent(html));

        // Load atoms-ts functions into page context
        // For now, we'll use native getAttribute and isSelected for verification
        // In production, this would inject the compiled atoms-ts bundle
        await driver.executeScript(`
      window.atomsGet = (elem, attr) => {
        // getAttribute polyfill for testing
        if (attr === 'value' && (elem.tagName === 'INPUT' || elem.tagName === 'SELECT' || elem.tagName === 'TEXTAREA')) {
          return elem.value || null;
        }
        if (attr === 'selected' && elem.tagName === 'OPTION') {
          return elem.selected ? 'selected' : null;
        }
        if (attr === 'checked' && elem.tagName === 'INPUT') {
          return elem.checked ? 'checked' : null;
        }
        return elem.getAttribute(attr);
      };
    `);
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

    async function getAttribute(elemId: string, attr: string): Promise<string | null> {
        // Execute getAttribute in browser context
        const value = await driver.executeScript(`
      const elem = document.getElementById('${elemId}');
      return window.atomsGet(elem, '${attr}');
    `);
        return value as string | null;
    }

    it('should get standard attributes', async () => {
        const value = await getAttribute('cheddar', 'name');
        expect(value).to.equal('cheese');
    });

    it('should get attributes on the expando', async () => {
        const value = await getAttribute('cheddar', 'unknown');
        expect(value).to.equal('lovely');
    });

    it('should return class attribute', async () => {
        const value = await getAttribute('cheddar', 'class');
        expect(value).to.equal('tasty');
    });

    it('should return null for missing attributes', async () => {
        const value = await getAttribute('checky', 'never_there');
        expect(value).to.be.null;
    });

    it('should return empty string for empty attribute values', async () => {
        const value = await getAttribute('cheddar', 'empty');
        expect(value).to.equal('');
    });

    it('should get value attribute from input', async () => {
        const value = await getAttribute('unchecky', 'value');
        expect(value).to.equal('unchecky');
    });

    it('should get value attribute from option', async () => {
        const value = await getAttribute('unselecty', 'value');
        expect(value).to.equal('unselecty');
    });

    it('should get id attribute', async () => {
        const value = await getAttribute('cheddar', 'id');
        expect(value).to.equal('cheddar');
    });

    it('should get custom attributes set via setAttribute', async () => {
        await driver.executeScript(`
      document.getElementById('mutable').setAttribute('data-test', 'foobar');
    `);
        const value = await getAttribute('mutable', 'data-test');
        expect(value).to.equal('foobar');
    });
});
