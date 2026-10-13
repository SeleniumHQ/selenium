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

// The engine and platform splits the keyboard still needs: Firefox reports
// different keydown codes for a handful of keys, and a different Meta code on
// macOS. Every other branch in goog.userAgent was for Internet Explorer,
// EdgeHTML or long-gone engine versions.

// Firefox's UA carries "Gecko/<date>"; Blink and WebKit say "like Gecko" with
// no slash, and Firefox on iOS is WebKit underneath, so it correctly reads as
// not-Gecko here.
export function isGecko(win: Window = window): boolean {
  return /\bGecko\//.test(win.navigator.userAgent)
}

// "Macintosh", not "Mac": iOS user agents say "like Mac OS X".
export function isMac(win: Window = window): boolean {
  return /Macintosh/.test(win.navigator.userAgent)
}
