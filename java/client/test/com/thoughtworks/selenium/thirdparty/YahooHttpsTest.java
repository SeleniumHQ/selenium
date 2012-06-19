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


package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.After;
import org.junit.Test;

public class YahooHttpsTest extends InternalSelenseTestBase {

  @After
  public void resetTimeout() {
    selenium.setTimeout("30000");
  }

  @Test
  public void testYahoo() throws Exception {
    selenium.setTimeout("120000");

    // this site has **two** HTTPS hosts (akamai and yahoo), so it's a good test of the new
    // multi-domain keystore support we just added
    selenium
        .open(
            "https://login11.marketingsolutions.yahoo.com/adui/signin/loadSignin.do?d=U2FsdGVkX1_evOPYuoCCKbeDENMTzoQ6O.oTzifl7TwsO8IqXh6duToE2tI2&p=11&s=21");
  }

}
