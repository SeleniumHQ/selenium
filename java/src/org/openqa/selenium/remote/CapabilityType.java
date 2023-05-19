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

/** Commonly seen remote webdriver capabilities. */
public interface CapabilityType {

  String BROWSER_NAME = "browserName";
  String PLATFORM_NAME = "platformName";
  String BROWSER_VERSION = "browserVersion";
  String ACCEPT_INSECURE_CERTS = "acceptInsecureCerts";
  String PAGE_LOAD_STRATEGY = "pageLoadStrategy";
  String PROXY = "proxy";
  String SET_WINDOW_RECT = "setWindowRect";
  String TIMEOUTS = "timeouts";
  String STRICT_FILE_INTERACTABILITY = "strictFileInteractability";
  String UNHANDLED_PROMPT_BEHAVIOUR = "unhandledPromptBehavior";
}
