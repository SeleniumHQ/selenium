/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.server.browserlaunchers;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parse a Selenium browser string to extract browserStartCommand if there is one.
 */
public class BrowserStringParser {

  public class Result {

    private boolean match;
    private String customLauncher;

    public Result(boolean match, String customLauncher) {
      this.match = match;
      this.customLauncher = customLauncher;
    }

    public Result(boolean match) {
      this(match, null);
    }

    public boolean match() {
      return match;
    }

    public String customLauncher() {
      return this.customLauncher;
    }

  }

  /**
   * Returns the browser start command, if any, for the browser in the 'browserString' parameter. If
   * the browserString cannot be matched to the 'knownBrowser' parameter, an illegal argument
   * exception is thrown.
   * 
   * @param browserIdentifier a known browser identifier.
   * @param userBrowserSpecification the string sent by the client to identify the type of browser
   *        to start, e.g. *firefox
   * @return Match result, never null.
   */
  public Result parseBrowserStartCommand(String browserIdentifier, String userBrowserSpecification) {
    final Pattern pattern;
    final Matcher matcher;
    final String customLauncher;

    pattern = Pattern.compile("^\\*?" + browserIdentifier + "\\s*(\\s(.*))?$");
    matcher = pattern.matcher(userBrowserSpecification);
    if (!matcher.find()) {
      return new Result(false);
    }

    if (matcher.group(2) == null || "".equals(matcher.group(2).trim())) {
      customLauncher = null;
    } else {
      customLauncher = matcher.group(2).trim();
    }
    return new Result(true, ("".equals(customLauncher)) ? null : customLauncher);
  }

}
