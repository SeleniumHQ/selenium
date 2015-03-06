/*
Copyright 2007-2009 Selenium committers
Copyright 2007-2009 Software Freedom Conservancy

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

package org.openqa.selenium.htmlunit;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.StandardSeleniumTests;
import org.openqa.selenium.remote.DesiredCapabilities;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    StandardSeleniumTests.class,
    HtmlUnitSpecificTests.class
})
public class JavascriptEnabledHtmlUnitDriverTests {

  // Used by the reflection-based supplier
  public static class HtmlUnitDriverForTest extends HtmlUnitDriver {
    public HtmlUnitDriverForTest(Capabilities capabilities) {
      super(tweak(capabilities));
    }

    private static Capabilities tweak(Capabilities capabilities) {
      DesiredCapabilities caps = new DesiredCapabilities(capabilities);
      caps.setJavascriptEnabled(true);
      caps.setVersion("3.6");
      return caps;
    }
  }
}
