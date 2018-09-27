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

package com.thoughtworks.selenium.webdriven.commands;

import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.WebDriver;

import java.net.MalformedURLException;
import java.net.URL;

public class OpenWindow extends SeleneseCommand<Void> {
  private final URL baseUrl;
  private final GetEval opener;

  public OpenWindow(String baseUrl, GetEval opener) {
    try {
      this.baseUrl = new URL(baseUrl);
    } catch (MalformedURLException e) {
      throw new SeleniumException(e.getMessage(), e);
    }
    this.opener = opener;
  }

  @Override
  protected Void handleSeleneseCommand(final WebDriver driver, final String url,
      final String windowID) {
    try {
      final String urlToOpen = url.contains("://") ? url : new URL(baseUrl, url).toString();

      String[] args = {String.format("window.open('%s', '%s'); null;", urlToOpen, windowID)};

      opener.apply(driver, args);
    } catch (MalformedURLException e) {
      throw new SeleniumException(e.getMessage(), e);
    }

    return null;
  }
}
