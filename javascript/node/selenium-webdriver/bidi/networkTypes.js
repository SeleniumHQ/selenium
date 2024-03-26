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

const { NavigationInfo } = require('./browsingContextTypes')

const SameSite = {
  STRICT: 'strict',
  LAX: 'lax',
  NONE: 'none',

  findByName(name) {
    return (
      Object.values(this).find((type) => {
        return typeof type === 'string' && name.toLowerCase() === type.toLowerCase()
      }) || null
    )
  },
}

class BytesValue {
  static Type = {
    STRING: 'string',
    BASE64: 'base64',
  }

  constructor(type, value) {
    this._type = type
    this._value = value
  }

  get type() {
    return this._type
  }

  get value() {
    return this._value
  }

  asMap() {
    const map = new Map()
    map.set('type', this._type)
    map.set('value', this._value)
    return map
  }
}

class Header {
  constructor(name, value) {
    this._name = name
    if (!(value instanceof BytesValue)) {
      throw new Error(`Value must be an instance of BytesValue. Received:'${value}'`)
    }
    this._value = value
  }

  get name() {
    return this._name
  }

  get value() {
    return this._value
  }
}

class Cookie {
  constructor(name, value, domain, path, size, httpOnly, secure, sameSite, expires) {
    this._name = name
    this._value = value
    this._domain = domain
    this._path = path
    this._expires = expires
    this._size = size
    this._httpOnly = httpOnly
    this._secure = secure
    this._sameSite = sameSite
  }

  get name() {
    return this._name
  }

  get value() {
    return this._value
  }

  get domain() {
    return this._domain
  }

  get path() {
    return this._path
  }

  get expires() {
    return this._expires
  }

  get size() {
    return this._size
  }

  get httpOnly() {
    return this._httpOnly
  }

  get secure() {
    return this._secure
  }

  get sameSite() {
    return this._sameSite
  }
}

// No tests written for FetchTimingInfo. Must be updated after browsers implment it and corresponding WPT test are written.
class FetchTimingInfo {
  constructor(
    originTime,
    requestTime,
    redirectStart,
    redirectEnd,
    fetchStart,
    dnsStart,
    dnsEnd,
    connectStart,
    connectEnd,
    tlsStart,
    requestStart,
    responseStart,
    responseEnd,
  ) {
    this._originTime = originTime
    this._requestTime = requestTime
    this._redirectStart = redirectStart
    this._redirectEnd = redirectEnd
    this._fetchStart = fetchStart
    this._dnsStart = dnsStart
    this._dnsEnd = dnsEnd
    this._connectStart = connectStart
    this._connectEnd = connectEnd
    this._tlsStart = tlsStart
    this._requestStart = requestStart
    this._responseStart = responseStart
    this._responseEnd = responseEnd
  }

  get originTime() {
    return this._originTime
  }

  get requestTime() {
    return this._requestTime
  }

  get redirectStart() {
    return this._redirectStart
  }

  get redirectEnd() {
    return this._redirectEnd
  }

  get fetchStart() {
    return this._fetchStart
  }

  get dnsStart() {
    return this._dnsStart
  }

  get dnsEnd() {
    return this._dnsEnd
  }

  get connectStart() {
    return this._connectStart
  }

  get connectEnd() {
    return this._connectEnd
  }

  get tlsStart() {
    return this._tlsStart
  }

  get requestStart() {
    return this._requestStart
  }

  get responseStart() {
    return this._responseStart
  }

  get responseEnd() {
    return this._responseEnd
  }
}

class RequestData {
  constructor(request, url, method, headers, cookies, headersSize, bodySize, timings) {
    this._request = request
    this._url = url
    this._method = method
    this._headers = []
    headers.forEach((header) => {
      let name = header.name
      let value = 'value' in header ? header.value : null

      this._headers.push(new Header(name, new BytesValue(value.type, value.value)))
    })

    this._cookies = []
    cookies.forEach((cookie) => {
      let name = cookie.name
      let domain = cookie.domain
      let path = cookie.path
      let size = cookie.size
      let httpOnly = cookie.httpOnly
      let secure = cookie.secure
      let sameSite = cookie.sameSite
      let value = 'value' in cookie ? cookie.value : null
      let expires = 'expires' in cookie ? cookie.expires : null

      this._cookies.push(new Cookie(name, value, domain, path, size, httpOnly, secure, sameSite, expires))
    })
    this._headersSize = headersSize
    this._bodySize = bodySize
    this._timings = new FetchTimingInfo(
      timings.originTime,
      timings.requestTime,
      timings.redirectStart,
      timings.redirectEnd,
      timings.fetchStart,
      timings.dnsStart,
      timings.dnsEnd,
      timings.connectStart,
      timings.connectEnd,
      timings.tlsStart,
      timings.requestStart,
      timings.responseStart,
      timings.responseEnd,
    )
  }

  get request() {
    return this._request
  }

  get url() {
    return this._url
  }

  get method() {
    return this._method
  }

  get headers() {
    return this._headers
  }

  get cookies() {
    return this._cookies
  }

  get headersSize() {
    return this._headersSize
  }

  get bodySize() {
    return this._bodySize
  }

  get timings() {
    return this._timings
  }
}

class BaseParameters {
  constructor(id, navigation, redirectCount, request, timestamp) {
    this._id = id
    this._navigation =
      navigation != null
        ? new NavigationInfo(navigation.context, navigation.navigation, navigation.timestamp, navigation.url)
        : null
    this._redirectCount = redirectCount
    this._request = new RequestData(
      request.request,
      request.url,
      request.method,
      request.headers,
      request.cookies,
      request.headersSize,
      request.bodySize,
      request.timings,
    )
    this._timestamp = timestamp
  }

  get id() {
    return this._id
  }

  get navigation() {
    return this._navigation
  }

  get redirectCount() {
    return this._redirectCount
  }

  get request() {
    return this._request
  }

  get timestamp() {
    return this._timestamp
  }
}

class Initiator {
  constructor(type, columnNumber, lineNumber, stackTrace, request) {
    this._type = type
    this._columnNumber = columnNumber
    this._lineNumber = lineNumber
    this._stackTrace = stackTrace
    this._request = request
  }

  get type() {
    return this._type
  }

  get columnNumber() {
    return this._columnNumber
  }

  get lineNumber() {
    return this._lineNumber
  }

  get stackTrace() {
    return this._stackTrace
  }

  get request() {
    return this._request
  }
}

class BeforeRequestSent extends BaseParameters {
  constructor(id, navigation, redirectCount, request, timestamp, initiator) {
    super(id, navigation, redirectCount, request, timestamp)
    this._initiator = new Initiator(
      initiator.type,
      initiator.columnNumber,
      initiator.lineNumber,
      initiator.stackTrace,
      initiator.request,
    )
  }

  get initiator() {
    return this._initiator
  }
}

class FetchError extends BaseParameters {
  constructor(id, navigation, redirectCount, request, timestamp, errorText) {
    super(id, navigation, redirectCount, request, timestamp)
    this._errorText = errorText
  }

  get errorText() {
    return this._errorText
  }
}

class ResponseData {
  constructor(
    url,
    protocol,
    status,
    statusText,
    fromCache,
    headers,
    mimeType,
    bytesReceived,
    headersSize,
    bodySize,
    content,
  ) {
    this._url = url
    this._protocol = protocol
    this._status = status
    this._statusText = statusText
    this._fromCache = fromCache
    this._headers = headers
    this._mimeType = mimeType
    this._bytesReceived = bytesReceived
    this._headersSize = headersSize
    this._bodySize = bodySize
    this._content = content
  }

  get url() {
    return this._url
  }

  get protocol() {
    return this._protocol
  }

  get status() {
    return this._status
  }

  get statusText() {
    return this._statusText
  }

  get fromCache() {
    return this._fromCache
  }

  get headers() {
    return this._headers
  }

  get mimeType() {
    return this._mimeType
  }

  get bytesReceived() {
    return this._bytesReceived
  }

  get headerSize() {
    return this._headersSize
  }

  get bodySize() {
    return this._bodySize
  }

  get content() {
    return this._content
  }
}

class ResponseStarted extends BaseParameters {
  constructor(id, navigation, redirectCount, request, timestamp, response) {
    super(id, navigation, redirectCount, request, timestamp)
    this._response = new ResponseData(
      response.url,
      response.protocol,
      response.status,
      response.statusText,
      response.fromCache,
      response.headers,
      response.mimeType,
      response.bytesReceived,
      response.headerSize,
      response.bodySize,
      response.content,
    )
  }

  get response() {
    return this._response
  }
}

module.exports = { Header, BytesValue, Cookie, SameSite, BeforeRequestSent, ResponseStarted, FetchError }
