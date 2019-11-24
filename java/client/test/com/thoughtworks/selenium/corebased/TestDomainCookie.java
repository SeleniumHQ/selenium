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

package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

public class TestDomainCookie extends InternalSelenseTestBase {
  @Test
  public void testDomainCookie() {
    String host =
        selenium
            .getEval("parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).host;");

    if (!selenium.getExpression(host).matches("^[\\s\\S]*\\.[\\s\\S]*\\.[\\s\\S]*$")) {
      System.out.println("Skipping test: hostname too short: " + host);
      return;
    }

    assertTrue(selenium.getExpression(host).matches("^[\\s\\S]*\\.[\\s\\S]*\\.[\\s\\S]*$"));
    String domain =
        selenium
            .getEval("var host = parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).host; host.replace(/^[^\\.]*/, \"\");");
    String base =
        selenium
            .getEval("parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).pathname;");
    selenium.open(base + "/path1/cookie1.html");
    selenium.deleteCookie("testCookieWithSameName", "path=/");
    selenium.deleteCookie("addedCookieForPath1", "path=" + base + "/path1/");
    selenium.deleteCookie("domainCookie", "domain=" + domain + "; path=/");
    assertEquals(selenium.getCookie(), "");
    selenium.open(base + "/path1/cookie1.html");
    selenium.createCookie("domainCookie=domain value", "domain=" + domain + "; path=/");
    assertEquals(selenium.getCookieByName("domainCookie"), "domain value");
    selenium.deleteCookie("domainCookie", "domain=" + domain + "; path=/");
    assertFalse(selenium.isCookiePresent("domainCookie"));
    assertEquals(selenium.getCookie(), "");
  }
}
