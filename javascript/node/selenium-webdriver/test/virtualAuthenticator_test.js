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

const assert = require('assert')
const virtualAuthenticatorCredential =
  require('../lib/virtual_authenticator').Credential
const virtualAuthenticatorOptions =
  require('../lib/virtual_authenticator').VirtualAuthenticatorOptions
const Protocol = require('../lib/virtual_authenticator').Protocol
const { ignore, suite } = require('../lib/test')
const { Browser } = require('../lib/capabilities')
const fileServer = require('../lib/test/fileserver')
const invalidArgumentError = require('../lib/error').InvalidArgumentError

const REGISTER_CREDENTIAL =
  'registerCredential().then(arguments[arguments.length - 1]);'
const GET_CREDENTIAL = `getCredential([{
                          "type": "public-key",
                          "id": Int8Array.from(arguments[0]),
                        }]).then(arguments[arguments.length - 1]);`

async function createRkEnabledU2fAuthenticator(driver) {
  let options
  options = new virtualAuthenticatorOptions()
  options.setProtocol(Protocol['U2F'])
  options.setHasResidentKey(true)
  await driver.addVirtualAuthenticator(options)
  return driver
}

async function createRkDisabledU2fAuthenticator(driver) {
  let options
  options = new virtualAuthenticatorOptions()
  options.setProtocol(Protocol['U2F'])
  options.setHasResidentKey(false)
  await driver.addVirtualAuthenticator(options)
  return driver
}

async function createRkEnabledCTAP2Authenticator(driver) {
  let options
  options = new virtualAuthenticatorOptions()
  options.setProtocol(Protocol['CTAP2'])
  options.setHasResidentKey(true)
  options.setHasUserVerification(true)
  options.setIsUserVerified(true)
  await driver.addVirtualAuthenticator(options)
  return driver
}

async function createRkDisabledCTAP2Authenticator(driver) {
  let options
  options = new virtualAuthenticatorOptions()
  options.setProtocol(Protocol['CTAP2'])
  options.setHasResidentKey(false)
  options.setHasUserVerification(true)
  options.setIsUserVerified(true)
  await driver.addVirtualAuthenticator(options)
  return driver
}

async function getAssertionFor(driver, credentialId) {
  return await driver.executeAsyncScript(GET_CREDENTIAL, credentialId)
}

function extractRawIdFrom(response) {
  return response.credential.rawId
}

function extractIdFrom(response) {
  return response.credential.id
}

/**
 * Checks if the two arrays are equal or not. Conditions to check are:
 * 1. If the length of both arrays is equal
 * 2. If all elements of array1 are present in array2
 * 3. If all elements of array2 are present in array1
 * @param array1 First array to be checked for equality
 * @param array2 Second array to be checked for equality
 * @returns true if equal, otherwise false.
 */
function arraysEqual(array1, array2) {
  return (
    array1.length == array2.length &&
    array1.every((item) => array2.includes(item)) &&
    array2.every((item) => array1.includes(item))
  )
}

/**
 * * * * * * TESTS * * * * *
 */

suite(function (env) {
  /**
   * A pkcs#8 encoded encrypted RSA private key as a base64url string.
   */
  const BASE64_ENCODED_PK = `MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbBOu5Lhs4vpowbCnmCyLUpIE7JM9sm9QXzye2G+jr+Kr
    MsinWohEce47BFPJlTaDzHSvOW2eeunBO89ZcvvVc8RLz4qyQ8rO98xS1jtgqi1NcBPETDrtzthODu/gd0sjB2Tk3TLuBGV
    oPXt54a+Oo4JbBJ6h3s0+5eAfGplCbSNq6hN3Jh9YOTw5ZA6GCEy5l8zBaOgjXytd2v2OdSVoEDNiNQRkjJd2rmS2oi9AyQ
    FR3B7BrPSiDlCcITZFOWgLF5C31Wp/PSHwQhlnh7/6YhnE2y9tzsUvzx0wJXrBADW13+oMxrneDK3WGbxTNYgIi1PvSqXlq
    GjHtCK+R2QkXAgMBAAECggEAVc6bu7VAnP6v0gDOeX4razv4FX/adCao9ZsHZ+WPX8PQxtmWYqykH5CY4TSfsuizAgyPuQ0
    +j4Vjssr9VODLqFoanspT6YXsvaKanncUYbasNgUJnfnLnw3an2XpU2XdmXTNYckCPRX9nsAAURWT3/n9ljc/XYY22ecYxM
    8sDWnHu2uKZ1B7M3X60bQYL5T/lVXkKdD6xgSNLeP4AkRx0H4egaop68hoW8FIwmDPVWYVAvo8etzWCtibRXz5FcNld9MgD
    /Ai7ycKy4Q1KhX5GBFI79MVVaHkSQfxPHpr7/XcmpQOEAr+BMPon4s4vnKqAGdGB3j/E3d/+4F2swykoQKBgQD8hCsp6FIQ
    5umJlk9/j/nGsMl85LgLaNVYpWlPRKPc54YNumtvj5vx1BG+zMbT7qIE3nmUPTCHP7qb5ERZG4CdMCS6S64/qzZEqijLCqe
    pwj6j4fV5SyPWEcpxf6ehNdmcfgzVB3Wolfwh1ydhx/96L1jHJcTKchdJJzlfTvq8wwKBgQDeCnKws1t5GapfE1rmC/h4ol
    L2qZTth9oQmbrXYohVnoqNFslDa43ePZwL9Jmd9kYb0axOTNMmyrP0NTj41uCfgDS0cJnNTc63ojKjegxHIyYDKRZNVUR/d
    xAYB/vPfBYZUS7M89pO6LLsHhzS3qpu3/hppo/Uc/AM/r8PSflNHQKBgDnWgBh6OQncChPUlOLv9FMZPR1ZOfqLCYrjYEqi
    uzGm6iKM13zXFO4AGAxu1P/IAd5BovFcTpg79Z8tWqZaUUwvscnl+cRlj+mMXAmdqCeO8VASOmqM1ml667axeZDIR867ZG8
    K5V029Wg+4qtX5uFypNAAi6GfHkxIKrD04yOHAoGACdh4wXESi0oiDdkz3KOHPwIjn6BhZC7z8mx+pnJODU3cYukxv3WTct
    lUhAsyjJiQ/0bK1yX87ulqFVgO0Knmh+wNajrb9wiONAJTMICG7tiWJOm7fW5cfTJwWkBwYADmkfTRmHDvqzQSSvoC2S7aa
    9QulbC3C/qgGFNrcWgcT9kCgYAZTa1P9bFCDU7hJc2mHwJwAW7/FQKEJg8SL33KINpLwcR8fqaYOdAHWWz636osVEqosRrH
    zJOGpf9x2RSWzQJ+dq8+6fACgfFZOVpN644+sAHfNPAI/gnNKU5OfUv+eav8fBnzlf1A3y3GIkyMyzFN3DE7e0n/lyqxE4H
    BYGpI8g==`

  const browsers = (...args) => env.browsers(...args)
  let driver

  beforeEach(async function () {
    driver = await env.builder().build()
    await driver.get(
      fileServer.Pages.virtualAuthenticator.replace('127.0.0.1', 'localhost')
    )
    assert.strictEqual(await driver.getTitle(), 'Virtual Authenticator Tests')
  })

  afterEach(async function () {
    if (driver.virtualAuthenticatorId() != null) {
      await driver.removeVirtualAuthenticator()
    }
    await driver.quit()
  })

  describe('VirtualAuthenticator Test Suit 2', function () {
    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test create authenticator',
      async function () {
        /**
         * Register a credential on the Virtual Authenticator.
         */
        driver = await createRkDisabledU2fAuthenticator(driver)
        assert((await driver.virtualAuthenticatorId()) != null)

        let response = await driver.executeAsyncScript(REGISTER_CREDENTIAL)
        assert(response['status'] === 'OK')

        /**
         * Attempt to use the credential to get an assertion.
         */
        response = await getAssertionFor(driver, extractRawIdFrom(response))
        assert(response['status'] === 'OK')
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test remove authenticator',
      async function () {
        let options = new virtualAuthenticatorOptions()
        await driver.addVirtualAuthenticator(options)
        assert((await driver.virtualAuthenticatorId()) != null)

        await driver.removeVirtualAuthenticator()
        assert((await driver.virtualAuthenticatorId()) == null)
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test add non-resident credential',
      async function () {
        /**
         * Add a non-resident credential using the testing API.
         */
        driver = await createRkDisabledCTAP2Authenticator(driver)
        let credential =
          virtualAuthenticatorCredential.createNonResidentCredential(
            new Uint8Array([1, 2, 3, 4]),
            'localhost',
            Buffer.from(BASE64_ENCODED_PK, 'base64').toString('binary'),
            0
          )
        await driver.addCredential(credential)

        /**
         * Attempt to use the credential to generate an assertion.
         */
        let response = await getAssertionFor(driver, [1, 2, 3, 4])
        assert(response['status'] === 'OK')
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test add non-resident credential when authenticator uses U2F protocol',
      async function () {
        /**
         * Add a non-resident credential using the testing API.
         */
        driver = await createRkDisabledU2fAuthenticator(driver)

        /**
         * A pkcs#8 encoded unencrypted EC256 private key as a base64url string.
         */
        const base64EncodedPK =
          'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q' +
          'hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU' +
          'RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB'

        let credential =
          virtualAuthenticatorCredential.createNonResidentCredential(
            new Uint8Array([1, 2, 3, 4]),
            'localhost',
            Buffer.from(base64EncodedPK, 'base64').toString('binary'),
            0
          )
        await driver.addCredential(credential)

        /**
         * Attempt to use the credential to generate an assertion.
         */
        let response = await getAssertionFor(driver, [1, 2, 3, 4])
        assert(response['status'] === 'OK')
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test add resident credential',
      async function () {
        /**
         * Add a resident credential using the testing API.
         */
        driver = await createRkEnabledCTAP2Authenticator(driver)

        let credential =
          virtualAuthenticatorCredential.createResidentCredential(
            new Uint8Array([1, 2, 3, 4]),
            'localhost',
            new Uint8Array([1]),
            Buffer.from(BASE64_ENCODED_PK, 'base64').toString('binary'),
            0
          )
        await driver.addCredential(credential)

        /**
         * Attempt to use the credential to generate an assertion. Notice we use an
         * empty allowCredentials array.
         */
        let response = await driver.executeAsyncScript(
          'getCredential([]).then(arguments[arguments.length - 1]);'
        )
        assert(response['status'] === 'OK')
        assert(response.attestation.userHandle.includes(1))
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test add resident credential not supported when authenticator uses U2F protocol',
      async function () {
        /**
         * Add a resident credential using the testing API.
         */
        driver = await createRkEnabledU2fAuthenticator(driver)

        /**
         * A pkcs#8 encoded unencrypted EC256 private key as a base64url string.
         */
        const base64EncodedPK =
          'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q' +
          'hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU' +
          'RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB'

        let credential =
          virtualAuthenticatorCredential.createResidentCredential(
            new Uint8Array([1, 2, 3, 4]),
            'localhost',
            new Uint8Array([1]),
            Buffer.from(base64EncodedPK, 'base64').toString('binary'),
            0
          )

        /**
         * Throws InvalidArgumentError
         */
        try {
          await driver.addCredential(credential)
        } catch (e) {
          if (e instanceof invalidArgumentError) {
            assert(true)
          } else {
            assert(false)
          }
        }
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test get credentials',
      async function () {
        /**
         * Create an authenticator and add two credentials.
         */
        driver = await createRkEnabledCTAP2Authenticator(driver)

        /**
         * Register a resident credential.
         */
        let response1 = await driver.executeAsyncScript(
          'registerCredential({authenticatorSelection: {requireResidentKey: true}})' +
            ' .then(arguments[arguments.length - 1]);'
        )
        assert(response1['status'] === 'OK')

        /**
         * Register a non resident credential.
         */
        let response2 = await driver.executeAsyncScript(REGISTER_CREDENTIAL)
        assert(response2['status'] === 'OK')

        let credential1Id = extractRawIdFrom(response1)
        let credential2Id = extractRawIdFrom(response2)

        assert.notDeepStrictEqual(credential1Id.sort(), credential2Id.sort())

        /**
         * Retrieve the two credentials.
         */
        let credentials = await driver.getCredentials()
        assert.equal(credentials.length, 2)

        let credential1 = null
        let credential2 = null

        credentials.forEach(function (credential) {
          if (arraysEqual(credential.id(), credential1Id)) {
            credential1 = credential
          } else if (arraysEqual(credential.id(), credential2Id)) {
            credential2 = credential
          } else {
            assert.fail(new Error('Unrecognized credential id'))
          }
        })

        assert.equal(credential1.isResidentCredential(), true)
        assert.notEqual(credential1.privateKey(), null)
        assert.equal(credential1.rpId(), 'localhost')
        assert.deepStrictEqual(
          credential1.userHandle().sort(),
          new Uint8Array([1]).sort()
        )
        assert.equal(credential1.signCount(), 1)

        assert.equal(credential2.isResidentCredential(), false)
        assert.notEqual(credential2.privateKey(), null)
        /**
         * Non-resident keys do not store raw RP IDs or user handles.
         */
        assert.equal(credential2.rpId(), null)
        assert.equal(credential2.userHandle(), null)
        assert.equal(credential2.signCount(), 1)
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test remove credential by rawID',
      async function () {
        driver = await createRkDisabledU2fAuthenticator(driver)

        /**
         * Register credential.
         */
        let response = await driver.executeAsyncScript(REGISTER_CREDENTIAL)
        assert(response['status'] === 'OK')

        /**
         * Remove a credential by its ID as an array of bytes.
         */
        let rawId = extractRawIdFrom(response)
        await driver.removeCredential(rawId)

        /**
         * Trying to get an assertion should fail.
         */
        response = await getAssertionFor(driver, rawId)
        assert(response['status'].startsWith('NotAllowedError'))
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test remove credential by base64url Id',
      async function () {
        driver = await createRkDisabledU2fAuthenticator(driver)

        /**
         * Register credential.
         */
        let response = await driver.executeAsyncScript(REGISTER_CREDENTIAL)
        assert(response['status'] === 'OK')

        let rawId = extractRawIdFrom(response)
        let credentialId = extractIdFrom(response)

        /**
         * Remove a credential by its base64url ID.
         */
        await driver.removeCredential(credentialId)

        /**
         * Trying to get an assertion should fail.
         */
        response = await getAssertionFor(driver, rawId)
        assert(response['status'].startsWith('NotAllowedError'))
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test remove all credentials',
      async function () {
        driver = await createRkDisabledU2fAuthenticator(driver)

        /**
         * Register two credentials.
         */
        let response1 = await driver.executeAsyncScript(REGISTER_CREDENTIAL)
        assert(response1['status'] === 'OK')
        let rawId1 = extractRawIdFrom(response1)

        let response2 = await driver.executeAsyncScript(REGISTER_CREDENTIAL)
        assert(response2['status'] === 'OK')
        let rawId2 = extractRawIdFrom(response2)

        /**
         * Remove all credentials.
         */
        await driver.removeAllCredentials()

        /**
         * Trying to get an assertion allowing for any of both should fail.
         */
        let response = await driver.executeAsyncScript(
          'getCredential([{' +
            '  "type": "public-key",' +
            '  "id": Int8Array.from(arguments[0]),' +
            '}, {' +
            '  "type": "public-key",' +
            '  "id": Int8Array.from(arguments[1]),' +
            '}]).then(arguments[arguments.length - 1]);',
          rawId1,
          rawId2
        )
        assert(response['status'].startsWith('NotAllowedError'))
      }
    )

    ignore(browsers(Browser.SAFARI, Browser.FIREFOX)).it(
      'should test set user verified',
      async function () {
        driver = await createRkEnabledCTAP2Authenticator(driver)

        /**
         * Register a credential requiring UV.
         */
        let response = await driver.executeAsyncScript(
          "registerCredential({authenticatorSelection: {userVerification: 'required'}})" +
            '  .then(arguments[arguments.length - 1]);'
        )
        assert(response['status'] === 'OK')
        let rawId = extractRawIdFrom(response)

        /**
         * Getting an assertion requiring user verification should succeed.
         */
        response = await driver.executeAsyncScript(GET_CREDENTIAL, rawId)
        assert(response['status'] === 'OK')

        /**
         * Disable user verification.
         */
        await driver.setUserVerified(false)

        /**
         * Getting an assertion requiring user verification should fail.
         */
        response = await driver.executeAsyncScript(GET_CREDENTIAL, rawId)
        assert(response['status'].startsWith('NotAllowedError'))
      }
    )
  })
})
