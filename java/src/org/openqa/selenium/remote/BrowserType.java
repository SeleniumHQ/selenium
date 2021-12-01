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

package org.openqa.selenium.remote;

/**
 * All the browsers supported by selenium
 *
 * @deprecated Prefer to use {@link Browser}
 */
@Deprecated
public interface BrowserType {
  String FIREFOX = "firefox";
  String SAFARI = "safari";
  String OPERA = "opera";
  String EDGE = "MicrosoftEdge";
  String EDGEHTML = "EdgeHTML";
  String CHROME = "chrome";

  String ANDROID = "android";
  String HTMLUNIT = "htmlunit";
  String IE = "internet explorer";
  String IPHONE = "iPhone";
  String IPAD = "iPad";
}
