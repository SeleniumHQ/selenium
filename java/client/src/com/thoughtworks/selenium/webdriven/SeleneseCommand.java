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

package com.thoughtworks.selenium.webdriven;

import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

public abstract class SeleneseCommand<T> {

  private long defaultTimeout;

  public T apply(WebDriver driver, String[] args) {
    try {
      switch (args.length) {
        case 0:
          return handleSeleneseCommand(driver, null, null);

        case 1:
          return handleSeleneseCommand(driver, args[0], null);

        case 2:
          return handleSeleneseCommand(driver, args[0], args[1]);

        default:
          throw new SeleniumException("Too many arguments! " + args.length);
      }
    } catch (WebDriverException e) {
      throw new SeleniumException(e.getMessage(), e);
    }
  }

  public void setDefaultTimeout(long defaultTimeout) {
    this.defaultTimeout = defaultTimeout;
  }

  protected long toLong(String timeout) {
    // Of course, a non-breaking space doesn't count as whitespace.
    timeout = timeout.replace('\u00A0',' ').trim();
    return "".equals(timeout) ? defaultTimeout : Long.valueOf(timeout);
  }

  protected abstract T handleSeleneseCommand(WebDriver driver, String locator, String value);
}
