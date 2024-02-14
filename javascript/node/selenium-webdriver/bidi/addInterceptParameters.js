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

const {UrlPattern} = require("./urlPattern");

class AddInterceptParameters {
  #phases = []
  #urlPatterns = []

  constructor(phases) {
    if (phases instanceof Array) {
      phases.forEach(phase => this.#phases.push(phase))
    } else {
      this.#phases.push(phases)
    }
  }

    urlPattern(pattern)
    {
      if (!pattern instanceof UrlPattern) {
        throw new Error(`Pattern must be an instance of UrlPattern. Received: '${pattern})'`)
      }
      this.#urlPatterns.push(Object.fromEntries(pattern.asMap()))
      return this
    }

    urlPatterns(patterns)
    {
      patterns.forEach(pattern => {
        if (!pattern instanceof UrlPattern) {
          throw new Error(`Pattern must be an instance of UrlPattern. Received:'${pattern}'`)
        }
        this.#urlPatterns.push(Object.fromEntries(pattern.asMap()))
      })
      return this
    }

    urlStringPattern(pattern)
    {
      if (!pattern instanceof String) {
        throw new Error(`Pattern must be an instance of String. Received:'${pattern}'`)
      }

      this.#urlPatterns.push({'type': 'string', 'pattern': pattern})
      return this
    }

    urlStringPatterns(patterns)
    {
      patterns.forEach(pattern => {
        if (!pattern instanceof String) {
          throw new Error(`Pattern must be an instance of String. Received:'${pattern}'`)
        }
        this.#urlPatterns.push({'type': 'string', 'pattern': pattern})
      })
      return this
    }


    asMap()
    {
      const map = new Map()
      map.set('phases', this.#phases)
      if (this.#urlPatterns.length > 0) {
        map.set('urlPatterns', this.#urlPatterns)
      }

      return map
    }
  }

  module.exports = {AddInterceptParameters}
