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

import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CreateCookie extends SeleneseCommand<Void> {
  private final Pattern NAME_VALUE_PAIR_PATTERN =
      Pattern.compile("([^\\s=\\[\\]\\(\\),\"\\/\\?@:;]+)=([^\\[\\]\\(\\),\"\\/\\?@:;]*)");
  private static final Pattern MAX_AGE_PATTERN = Pattern.compile("max_age=(\\d+)");
  private static final Pattern PATH_PATTERN = Pattern.compile("path=([^\\s,]+)[,]?");

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String nameValuePair, String optionsString) {
    Matcher nameValuePairMatcher = NAME_VALUE_PAIR_PATTERN.matcher(nameValuePair);
    if (!nameValuePairMatcher.find())
      throw new SeleniumException("Invalid parameter: " + nameValuePair);

    String name = nameValuePairMatcher.group(1);
    String value = nameValuePairMatcher.group(2);

    Matcher maxAgeMatcher = MAX_AGE_PATTERN.matcher(optionsString);
    Date maxAge = null;

    if (maxAgeMatcher.find()) {
      maxAge =
          new Date(System.currentTimeMillis() + Integer.parseInt(maxAgeMatcher.group(1)) * 1000);
    }

    String path = null;
    Matcher pathMatcher = PATH_PATTERN.matcher(optionsString);
    if (pathMatcher.find()) {
      path = pathMatcher.group(1);
      try {
        if (path.startsWith("http")) {
          path = new URL(path).getPath();
        }
      } catch (MalformedURLException e) {
        // Fine.
      }
    }

    Cookie cookie = new Cookie(name, value, path, maxAge);
    driver.manage().addCookie(cookie);

    return null;
  }
}
