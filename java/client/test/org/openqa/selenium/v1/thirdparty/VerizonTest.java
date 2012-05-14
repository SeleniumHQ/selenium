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

import org.testng.annotations.Test;

public class VerizonTest extends InternalSelenseTestBase {
  private static final String TIMEOUT = "60000";

  @Test(dataProvider = "system-properties", enabled = false)
  //Ignored because this test is too slow
  public void signUp() {
    selenium.setTimeout(TIMEOUT);
    selenium.open("http://www22.verizon.com/");
    selenium.click("link=Set Up New Phone Service");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.click("//a[@href=\"/ForYourHome/NewConnect/OrderWelcomeSignin.aspx\"]");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.type("txtSTREET_ADDRESS1", "49 Bonnie Lane");
    selenium.type("txtCITY", "Dedham");
    selenium.select("lstSTATE", "label=MA");
    selenium.type("txtZIP_CODE", "02026");
    selenium.click("imgNext");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.click("//img[@alt='next']");
    selenium.waitForPageToLoad(TIMEOUT);
    selenium.click("btnGetItNow");
    selenium.waitForPageToLoad(TIMEOUT);
  }
}
