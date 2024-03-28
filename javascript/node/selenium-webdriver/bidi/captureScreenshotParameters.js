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

const { BoxClipRectangle, ElementClipRectangle } = require('./clipRectangle')
const Origin = {
  VIEWPORT: 'viewport',
  DOCUMENT: 'document',
}

class CaptureScreenshotParameters {
  #map = new Map()

  origin(origin) {
    if (origin !== Origin.VIEWPORT && origin !== Origin.DOCUMENT) {
      throw new Error(`Origin must be one of ${Object.values(Origin)}. Received:'${origin}'`)
    }
    this.#map.set('origin', origin)
    return this
  }

  imageFormat(type, quality = undefined) {
    if (typeof type !== 'string') {
      throw new Error(`Type must be an instance of String. Received:'${type}'`)
    }

    this.#map.set('type', type)

    if (quality !== undefined) {
      if (typeof quality !== 'number') {
        throw new Error(`Quality must be a number. Received:'${quality}'`)
      }
      this.#map.set('quality', quality)
    }
    return this
  }

  clipRectangle(clipRectangle) {
    if (!(clipRectangle instanceof BoxClipRectangle || clipRectangle instanceof ElementClipRectangle)) {
      throw new Error(`ClipRectangle must be an instance of ClipRectangle. Received:'${clipRectangle}'`)
    }
    this.#map.set('clip', Object.fromEntries(clipRectangle.asMap()))
    return this
  }

  asMap() {
    return this.#map
  }
}

module.exports = { CaptureScreenshotParameters, Origin }
