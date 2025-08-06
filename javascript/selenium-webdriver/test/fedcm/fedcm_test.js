// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

'use strict'

const assert = require('node:assert')
const { Browser } = require('selenium-webdriver')
const { ignore, Pages, suite } = require('../../lib/test')
const { By } = require('selenium-webdriver/index')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env.builder().build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    // Failing due to - https://issues.chromium.org/u/0/issues/425801332, enable when Chrome 140 is released
    ignore(env.browsers(Browser.CHROME, Browser.EDGE)).describe('Federated Credential Management Test', function () {
      it('credential management dialog should appear', async function () {
        await driver.get(Pages.fedcm)

        let triggerButton = await driver.findElement(By.id('triggerButton'))
        await triggerButton.click()

        let dialog

        await driver.wait(
          async () => {
            try {
              dialog = await driver.getFederalCredentialManagementDialog()
              return (await dialog.type()) === 'AccountChooser'
            } catch (error) {
              return false
            }
          },
          10000,
          'Expected dialog type to be "AccountChooser"',
          2000,
        )

        assert.equal(await dialog.type(), 'AccountChooser')
        let title = await dialog.title()
        assert.equal(title.includes('Sign in to'), true)
      })

      it('can dismiss dialog', async function () {
        await driver.get(Pages.fedcm)

        let triggerButton = await driver.findElement(By.id('triggerButton'))
        await triggerButton.click()

        let dialog = await driver.getFederalCredentialManagementDialog()

        await driver.wait(
          async () => {
            try {
              return (await dialog.type()) === 'AccountChooser'
            } catch (error) {
              return false
            }
          },
          10000,
          'Expected dialog type to be "AccountChooser"',
          2000,
        )

        assert.equal(await dialog.type(), 'AccountChooser')
        let title = await dialog.title()
        assert.equal(title.includes('Sign in to'), true)

        await dialog.dismiss()

        try {
          await dialog.type()
          assert.fail('Above command should throw error')
        } catch (error) {
          assert.equal(error.message.includes('no such alert'), true)
        }
      })

      it('can select account', async function () {
        await driver.get(Pages.fedcm)

        let triggerButton = await driver.findElement(By.id('triggerButton'))
        await triggerButton.click()

        let dialog = await driver.getFederalCredentialManagementDialog()

        await driver.wait(
          async () => {
            try {
              return (await dialog.type()) === 'AccountChooser'
            } catch (error) {
              return false
            }
          },
          10000,
          'Expected dialog type to be "AccountChooser"',
          2000,
        )

        assert.equal(await dialog.type(), 'AccountChooser')
        let title = await dialog.title()
        assert.equal(title.includes('Sign in to'), true)

        await dialog.selectAccount(1)
      })

      it('can get account list', async function () {
        await driver.get(Pages.fedcm)

        let triggerButton = await driver.findElement(By.id('triggerButton'))
        await triggerButton.click()

        let dialog = await driver.getFederalCredentialManagementDialog()

        await driver.wait(
          async () => {
            try {
              return (await dialog.type()) === 'AccountChooser'
            } catch (error) {
              return false
            }
          },
          10000,
          'Expected dialog type to be "AccountChooser"',
          2000,
        )

        assert.equal(await dialog.type(), 'AccountChooser')
        let title = await dialog.title()
        assert.equal(title.includes('Sign in to'), true)

        const accounts = await dialog.accounts()

        assert.equal(accounts.length, 2)

        const account1 = accounts[0]
        const account2 = accounts[1]

        assert.strictEqual(account1.name, 'John Doe')
        assert.strictEqual(account1.email, 'john_doe@idp.example')
        assert.strictEqual(account1.accountId, '1234')
        assert.strictEqual(account1.givenName, 'John')
        assert(account1.idpConfigUrl.includes('/fedcm/config.json'), true)
        assert.strictEqual(account1.pictureUrl, 'https://idp.example/profile/123')
        assert.strictEqual(account1.loginState, 'SignUp')
        assert.strictEqual(account1.termsOfServiceUrl, 'https://rp.example/terms_of_service.html')
        assert.strictEqual(account1.privacyPolicyUrl, 'https://rp.example/privacy_policy.html')

        assert.strictEqual(account2.name, 'Aisha Ahmad')
        assert.strictEqual(account2.email, 'aisha@idp.example')
        assert.strictEqual(account2.accountId, '5678')
        assert.strictEqual(account2.givenName, 'Aisha')
        assert(account2.idpConfigUrl.includes('/fedcm/config.json'), true)
        assert.strictEqual(account2.pictureUrl, 'https://idp.example/profile/567')
        assert.strictEqual(account2.loginState, 'SignUp')
        assert.strictEqual(account2.termsOfServiceUrl, 'https://rp.example/terms_of_service.html')
        assert.strictEqual(account2.privacyPolicyUrl, 'https://rp.example/privacy_policy.html')
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.EDGE] },
)
