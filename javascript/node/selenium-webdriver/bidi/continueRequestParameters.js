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

const { BytesValue, Header } = require('./networkTypes')

class ContinueRequestParameters {
  #map = new Map()

  constructor(request) {
    this.#map.set('request', request)
  }

  body(value) {
    if (!(value instanceof BytesValue)) {
      throw new Error(`Value must be an instance of BytesValue. Received: '${value})'`)
    }
    this.#map.set('body', Object.fromEntries(value.asMap()))
    return this
  }

  cookies(cookieHeaders) {
    const cookies = []
    cookieHeaders.forEach((header) => {
      if (!(header instanceof Header)) {
        throw new Error(`CookieHeader must be an instance of Header. Received:'${header}'`)
      }
      cookies.push(Object.fromEntries(header.asMap()))
    })

    this.#map.set('cookies', cookies)
    return this
  }

  headers(headers) {
    const headerList = []
    headers.forEach((header) => {
      if (!(header instanceof Header)) {
        throw new Error(`Header value must be an instance of Header. Received:'${header}'`)
      }
      headerList.push(Object.fromEntries(header.asMap()))
    })

    this.#map.set('headers', headerList)
    return this
  }

  method(method) {
    if (typeof method !== 'string') {
      throw new Error(`Http method must be a string. Received: '${method})'`)
    }
    this.#map.set('method', method)
    return this
  }

  url(url) {
    if (typeof url !== 'string') {
      throw new Error(`Url must be a string. Received:'${url}'`)
    }

    this.#map.set('url', url)
    return this
  }

  asMap() {
    return this.#map
  }
}

module.exports = { ContinueRequestParameters }
