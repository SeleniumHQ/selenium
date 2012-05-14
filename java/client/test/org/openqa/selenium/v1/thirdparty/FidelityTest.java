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


package org.openqa.selenium.v1.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import com.thoughtworks.selenium.Wait;

import org.testng.annotations.Test;

public class FidelityTest extends InternalSelenseTestBase {

  long timeout = 60000;

  @Test(dataProvider = "system-properties")
  public void stockSearch() {
    selenium.open("https://www.fidelity.com/");
    selenium.click("link=Research");
    selenium.click("link=Quotes");
    selenium.waitForPageToLoad(Long.toString(timeout));
    selenium.selectFrame("body");
    selenium.selectFrame("content");
    selenium.type("SID_VALUE_ID", "AAPL");
    selenium.click("submit");
    selenium.waitForPageToLoad(Long.toString(timeout));
    selenium.select("research_option0", "label=Charts");
    new Wait() {
      @Override
      public boolean until() {
        return selenium
            .isElementPresent("//img[contains(@src,'https://scs.fidelity.com/research/images/go.gif')]");
      }
    }.wait("couldn't find go button", 60000);
    selenium.click("//img[contains(@src,'https://scs.fidelity.com/research/images/go.gif')]");
    selenium.waitForPageToLoad(Long.toString(timeout));
  }
}
