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
const net = require('../../net')

describe('net.splitHostAndPort', function () {
  it('hostname with no port', function () {
    assert.deepStrictEqual(net.splitHostAndPort('www.example.com'), {
      host: 'www.example.com',
      port: null,
    })
  })

  it('hostname with port', function () {
    assert.deepStrictEqual(net.splitHostAndPort('www.example.com:80'), {
      host: 'www.example.com',
      port: 80,
    })
  })

  it('IPv4 with no port', function () {
    assert.deepStrictEqual(net.splitHostAndPort('127.0.0.1'), {
      host: '127.0.0.1',
      port: null,
    })
  })

  it('IPv4 with port', function () {
    assert.deepStrictEqual(net.splitHostAndPort('127.0.0.1:1234'), {
      host: '127.0.0.1',
      port: 1234,
    })
  })

  it('IPv6 with no port', function () {
    assert.deepStrictEqual(
      net.splitHostAndPort('1234:0:1000:5768:1234:5678:90'),
      {
        host: '1234:0:1000:5768:1234:5678:90',
        port: null,
      }
    )
  })

  it('IPv6 with port', function () {
    assert.deepStrictEqual(
      net.splitHostAndPort('[1234:0:1000:5768:1234:5678:90]:1234'),
      { host: '1234:0:1000:5768:1234:5678:90', port: 1234 }
    )
  })
})
