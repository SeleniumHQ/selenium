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

class ClipRectangle {
  clipType

  constructor(type) {
    this.clipType = type
  }

  get type() {
    return this.clipType
  }

  asMap() {}
}

class ElementClipRectangle extends ClipRectangle {
  #sharedId
  #handleId

  constructor(sharedId, handleId = undefined) {
    super('element')
    this.#sharedId = sharedId

    if (handleId !== undefined) {
      this.#handleId = handleId
    }
  }

  asMap() {
    const map = new Map()
    map.set('type', super.type)

    const sharedReference = new Map()
    sharedReference.set('sharedId', this.#sharedId)
    if (this.#handleId !== undefined) {
      sharedReference.set('handleId', this.#handleId)
    }

    map.set('element', Object.fromEntries(sharedReference))

    return map
  }
}

class BoxClipRectangle extends ClipRectangle {
  #x
  #y
  #width
  #height

  constructor(x, y, width, height) {
    super('box')
    this.#x = x
    this.#y = y
    this.#width = width
    this.#height = height
  }

  asMap() {
    const map = new Map()
    map.set('type', super.type)
    map.set('x', this.#x)
    map.set('y', this.#y)
    map.set('width', this.#width)
    map.set('height', this.#height)

    return map
  }
}

module.exports = { BoxClipRectangle, ElementClipRectangle }
