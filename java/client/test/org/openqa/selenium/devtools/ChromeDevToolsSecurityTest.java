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
package org.openqa.selenium.devtools;

import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.devtools.security.Security.disable;
import static org.openqa.selenium.devtools.security.Security.enable;
import static org.openqa.selenium.devtools.security.Security.setIgnoreCertificateErrors;

import org.junit.Test;
import org.openqa.selenium.devtools.security.Security;
import org.openqa.selenium.testing.Ignore;

@Ignore
public class ChromeDevToolsSecurityTest extends DevToolsTestBase {

  @Test
  public void loadInsecureWebsite() {

    devTools.send(enable());

    devTools.send(setIgnoreCertificateErrors(false));

    devTools.addListener(Security.securityStateChanged(),
                         securityStateChanged -> assertTrue(securityStateChanged
                           .getSummary().contains("This page has a non-HTTPS secure origin")));

    driver.get(appServer.whereIs("devToolsSecurityTest"));

    assertTrue(driver.getPageSource().contains("Security Test"));

    devTools.send(disable());

  }

  @Test
  public void loadSecureWebsite() {

    devTools.send(enable());

    devTools.send(setIgnoreCertificateErrors(true));

    driver.get(appServer.whereIsSecure("devToolsSecurityTest"));

    assertTrue(driver.getPageSource().contains("Security Test"));

  }

}
