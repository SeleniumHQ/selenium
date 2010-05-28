/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.html5;

/**
 * Interface for web storage allowing access to the browser local storage
 * and session storage.
 */
public interface WebStorage {
  /**
   * Gets the storage areas specific to the current top level browsing
   * context. Each context has a unique set of session storage,
   * one for each origin. Sites can add data to the session storage
   * and it will be accessible to any page from the same site opened in that
   * window.
   * 
   * @return {@link Storage} object containing the current session storage data
   *     for the currently opened site in the browser.
   */
  Storage getSessionStorage();
  
  /**
   * Get the page local storage area. Each site has its own separate storage
   * area.
   * 
   * @return {@link Storage} object containing the current local storage data
   *     for the site currently opened in the browser.
   */
  Storage getLocalStorage();
}
