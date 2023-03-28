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

const NonPrimitiveType = {
  ARRAY: 'array',
  DATE: 'date',
  MAP: 'map',
  OBJECT: 'object',
  REGULAR_EXPRESSION: 'regexp',
  SET: 'set',

  findByName: function (name) {
    let result = null
    Object.values(NonPrimitiveType).forEach(function (type) {
      if (name.toLowerCase() === type.toLowerCase()) {
        result = type
        return
      }
    })
    return result
  },
}

module.exports = NonPrimitiveType
