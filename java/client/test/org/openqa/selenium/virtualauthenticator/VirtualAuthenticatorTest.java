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

package org.openqa.selenium.virtualauthenticator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;
import static org.openqa.selenium.testing.drivers.Browser.OPERA;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.virtualauthenticator.HasVirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticatorOptions;

import java.util.Map;

public class VirtualAuthenticatorTest extends JUnit4TestBase {

  private final String script =
      "async function registerCredential(options = {}) {"
    + "  options = Object.assign({"
    + "    authenticatorSelection: {"
    + "      requireResidentKey: false,"
    + "    },"
    + "    rp: {"
    + "      id: \"localhost\","
    + "      name: \"Selenium WebDriver Test\","
    + "    },"
    + "    challenge: Uint8Array.from(\"challenge\"),"
    + "    pubKeyCredParams: ["
    + "      {type: \"public-key\", alg: -7},"
    + "    ],"
    + "    user: {"
    + "      name: \"name\","
    + "      displayName: \"displayName\","
    + "      id: Uint8Array.from([1]),"
    + "    },"
    + "  }, options);"

    + "  try {"
    + "    const credential = await navigator.credentials.create({publicKey: options});"
    + "    return {"
    + "      status: \"OK\","
    + "      credential: {"
    + "        id: credential.id,"
    + "        rawId: Array.from(new Uint8Array(credential.rawId)),"
    + "        transports: credential.response.getTransports(),"
    + "      }"
    + "    };"
    + "  } catch (error) {"
    + "    return {status: error.toString()};"
    + "  }"
    + "}"

    + "async function getCredential(credential, options = {}) {"
    + "  options = Object.assign({"
    + "    challenge: Uint8Array.from(\"Winter is Coming\"),"
    + "    rpId: \"localhost\","
    + "    allowCredentials: [credential],"
    + "    userVerification: \"preferred\","
    + "  }, options);"

    + "  try {"
    + "    const attestation = await navigator.credentials.get({publicKey: options});"
    + "    return {"
    + "      status: \"OK\","
    + "      attestation,"
    + "    };"
    + "  } catch (error) {"
    + "    return {status: error.toString()};"
    + "  }"
    + "}";

  @Before
  public void setup() {
    driver.get(appServer.create(new Page()
        .withTitle("Virtual Authenticator Test")
        .withScripts(script)));
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(IE)
  @NotYetImplemented(MARIONETTE)
  @NotYetImplemented(OPERA)
  @NotYetImplemented(SAFARI)
  public void testCreateAuthenticator() {
    // Register a credential on the Virtual Authenticator.
    VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions();
    ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
    Map<String, Object> response = (Map<String, Object>)
      ((JavascriptExecutor) driver).executeAsyncScript(
        "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response.get("status")).isEqualTo("OK");

    // Attempt to use the credential to get an assertion.
    Object credentialId = ((Map<String, Object>) response.get("credential")).get("rawId");
    response = (Map<String, Object>)
      ((JavascriptExecutor) driver).executeAsyncScript(
        "getCredential({"
      + "  \"type\": \"public-key\","
      + "  \"id\": Uint8Array.from(arguments[0]),"
      + "}).then(arguments[arguments.length - 1]);", credentialId);

    assertThat(response.get("status")).isEqualTo("OK");
  }
}
