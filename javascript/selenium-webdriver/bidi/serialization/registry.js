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

// Shared type registry: every generated type registers itself here by its
// exact schema name (e.g. 'network.InterceptPhase'), so a field whose type is
// a `ref` can look up what the referenced type actually is — without every
// domain file needing to import every other domain file directly, and without
// needing types defined in dependency order (resolution happens at validation
// time, not at define time, so forward and circular refs both work).
const types = new Map()

function register(name, entry) {
  types.set(name, entry)
}

function resolve(name) {
  return types.get(name)
}

module.exports = { register, resolve }
