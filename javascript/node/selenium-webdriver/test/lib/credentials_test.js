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
  require('../../lib/virtual_authenticator').Credential

describe('Credentials', function () {
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

  const data = {
    _id: new Uint8Array([1, 2, 3, 4]),
    rpId: 'localhost',
    userHandle: new Uint8Array([1]),
    privateKey: Buffer.from(BASE64_ENCODED_PK, 'base64').toString('binary'),
    signCount: 0,
  }

  it('can testRkEnabledCredential', function () {
    const { _id, rpId, userHandle, privateKey, signCount } = data
    const credential =
      new virtualAuthenticatorCredential().createResidentCredential(
        _id,
        rpId,
        userHandle,
        privateKey,
        signCount
      )

    let testCredentialId = new Uint8Array([1, 2, 3, 4])

    /**
     * Checking if credential.id() matches with testCredentialId. Both values are
     * arrays so we check if the lengths of both are equal and if one array has
     * all its elements in the other array and vice-versa.
     */
    assert.equal(
      credential.id().length == testCredentialId.length &&
        credential.id().every((item) => testCredentialId.includes(item)) &&
        testCredentialId.every((item) => credential.id().includes(item)),
      true
    )
    if (credential.isResidentCredential() == true) {
      assert(true)
    } else {
      assert(false)
    }
    assert.equal(credential.rpId(), 'localhost')

    let testUserHandle = new Uint8Array([1])

    /**
     * Checking if credential.userHandle() matches with testUserHandle. Both values are
     * arrays so we check if the lengths of both are equal and if one array has
     * all its elements in the other array and vice-versa.
     */
    assert.equal(
      credential.userHandle().length == testUserHandle.length &&
        credential
          .userHandle()
          .every((item) => testUserHandle.includes(item)) &&
        testUserHandle.every((item) => credential.userHandle().includes(item)),
      true
    )
    assert.equal(
      credential.privateKey(),
      Buffer.from(BASE64_ENCODED_PK, 'base64url').toString('binary')
    )
    assert.equal(credential.signCount(), 0)
  })

  it('can testRkDisabledCredential', function () {
    const { _id, rpId, userHandle, privateKey, signCount } = data
    const credential =
      new virtualAuthenticatorCredential().createNonResidentCredential(
        _id,
        rpId,
        privateKey,
        signCount
      )

    let testCredentialId = new Uint8Array([1, 2, 3, 4])

    /**
     * Checking if credential.id() matches with testCredentialId. Both values are
     * arrays so we check if the lengths of both are equal and if one array has
     * all its elements in the other array and vice-versa.
     */
    assert.equal(
      credential.id().length == testCredentialId.length &&
        credential.id().every((item) => testCredentialId.includes(item)) &&
        testCredentialId.every((item) => credential.id().includes(item)),
      true
    )

    if (credential.isResidentCredential() == false) {
      assert(true)
    } else {
      assert(false)
    }

    if (credential.userHandle() == null) {
      assert(true)
    } else {
      assert(false)
    }
  })

  it('can testToDict', function () {
    const { _id, rpId, userHandle, privateKey, signCount } = data
    const credential =
      new virtualAuthenticatorCredential().createResidentCredential(
        _id,
        rpId,
        userHandle,
        privateKey,
        signCount
      )

    let credential_dict = credential.toDict()
    assert.equal(
      credential_dict['credentialId'],
      Buffer.from(new Uint8Array([1, 2, 3, 4])).toString('base64url')
    )

    if (credential_dict['isResidentCredential'] == true) {
      assert(true)
    } else {
      assert(false)
    }

    assert.equal(credential_dict['rpId'], 'localhost')
    assert.equal(
      credential_dict['userHandle'],
      Buffer.from(new Uint8Array([1])).toString('base64url')
    )
    assert.equal(
      credential_dict['privateKey'],
      Buffer.from(privateKey, 'binary').toString('base64url')
    )
    assert.equal(credential_dict['signCount'], 0)
  })

  it('can testFromDict', function () {
    let credential_data = {
      credentialId: Buffer.from(new Uint8Array([1, 2, 3, 4])).toString(
        'base64url'
      ),
      isResidentCredential: true,
      rpId: 'localhost',
      userHandle: Buffer.from(new Uint8Array([1])).toString('base64url'),
      privateKey: BASE64_ENCODED_PK,
      signCount: 0,
    }

    let credential = new virtualAuthenticatorCredential().fromDict(
      credential_data
    )
    let testCredentialId = new Uint8Array([1, 2, 3, 4])
    assert.equal(
      credential.id().length == testCredentialId.length &&
        credential.id().every((item) => testCredentialId.includes(item)) &&
        testCredentialId.every((item) => credential.id().includes(item)),
      true
    )

    if (credential.isResidentCredential() == true) {
      assert(true)
    } else {
      assert(false)
    }

    assert.equal(credential.rpId(), 'localhost')

    let testUserHandle = new Uint8Array([1])

    /**
     * Checking if credential.userHandle() matches with testUserHandle. Both values are
     * arrays so we check if the lengths of both are equal and if one array has
     * all its elements in the other array and vice-versa.
     */
    assert.equal(
      credential.userHandle().length == testUserHandle.length &&
        credential
          .userHandle()
          .every((item) => testUserHandle.includes(item)) &&
        testUserHandle.every((item) => credential.userHandle().includes(item)),
      true
    )

    assert.equal(
      credential.privateKey(),
      Buffer.from(BASE64_ENCODED_PK, 'base64url').toString('binary')
    )
    assert.equal(credential.signCount(), 0)
  })
})
