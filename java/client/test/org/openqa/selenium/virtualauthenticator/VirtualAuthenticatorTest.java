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

import static org.assertj.core.api.Assumptions.assumeThat;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Fail.fail;

import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.virtualauthenticator.Credential;
import org.openqa.selenium.virtualauthenticator.HasVirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticatorOptions;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticatorOptions.Protocol;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.Map;
import java.util.List;

public class VirtualAuthenticatorTest extends JUnit4TestBase {

  /**
   * A pkcs#8 encoded unencrypted EC256 private key as a base64url string.
   */
  private final String base64EncodedPK =
      "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"
    + "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"
    + "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB";

  private final PKCS8EncodedKeySpec privateKey =
      new PKCS8EncodedKeySpec(Base64.getUrlDecoder().decode(base64EncodedPK));

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
    + "    challenge: Int8Array.from(\"challenge\"),"
    + "    pubKeyCredParams: ["
    + "      {type: \"public-key\", alg: -7},"
    + "    ],"
    + "    user: {"
    + "      name: \"name\","
    + "      displayName: \"displayName\","
    + "      id: Int8Array.from([1]),"
    + "    },"
    + "  }, options);"

    + "  try {"
    + "    const credential = await navigator.credentials.create({publicKey: options});"
    + "    return {"
    + "      status: \"OK\","
    + "      credential: {"
    + "        id: credential.id,"
    + "        rawId: Array.from(new Int8Array(credential.rawId)),"
    + "        transports: credential.response.getTransports(),"
    + "      }"
    + "    };"
    + "  } catch (error) {"
    + "    return {status: error.toString()};"
    + "  }"
    + "}"

    + "async function getCredential(credentials, options = {}) {"
    + "  options = Object.assign({"
    + "    challenge: Int8Array.from(\"Winter is Coming\"),"
    + "    rpId: \"localhost\","
    + "    allowCredentials: credentials,"
    + "    userVerification: \"preferred\","
    + "  }, options);"

    + "  try {"
    + "    const attestation = await navigator.credentials.get({publicKey: options});"
    + "    return {"
    + "      status: \"OK\","
    + "      attestation: {"
    + "        userHandle: new Int8Array(attestation.response.userHandle),"
    + "      },"
    + "    };"
    + "  } catch (error) {"
    + "    return {status: error.toString()};"
    + "  }"
    + "}";

  private VirtualAuthenticator authenticator;

  @Before
  public void setup() {
    assumeThat(driver).isInstanceOf(HasVirtualAuthenticator.class);
    driver.get(appServer.create(new Page()
        .withTitle("Virtual Authenticator Test")
        .withScripts(script)));
  }

  public void createSimpleU2FAuthenticator() {
    VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions()
        .setProtocol(Protocol.U2F);
    authenticator = ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
  }

  public void createRKEnabledAuthenticator() {
    VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions()
        .setProtocol(Protocol.CTAP2)
        .setHasResidentKey(true)
        .setHasUserVerification(true)
        .setIsUserVerified(true);
    authenticator = ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
  }

  /**
   * @param list a list of numbers between -128 and 127.
   * @return a byte array containing the list.
   */
  public byte[] convertListIntoArrayOfBytes(List<Long> list) {
    byte[] ret = new byte[list.size()];
    for (int i = 0; i < list.size(); ++i)
      ret[i] = list.get(i).byteValue();
    return ret;
  }

  @After
  public void tearDown() {
    if (authenticator != null)
      ((HasVirtualAuthenticator) driver).removeVirtualAuthenticator(authenticator);
  }

  @Test
  public void testCreateAuthenticator() {
    // Register a credential on the Virtual Authenticator.
    createSimpleU2FAuthenticator();
    Map<String, Object> response = (Map<String, Object>)
      ((JavascriptExecutor) driver).executeAsyncScript(
        "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response.get("status")).isEqualTo("OK");

    // Attempt to use the credential to get an assertion.
    Object credentialId = ((Map<String, Object>) response.get("credential")).get("rawId");
    response = (Map<String, Object>)
      ((JavascriptExecutor) driver).executeAsyncScript(
        "getCredential([{"
      + "  \"type\": \"public-key\","
      + "  \"id\": Int8Array.from(arguments[0]),"
      + "}]).then(arguments[arguments.length - 1]);", credentialId);

    assertThat(response.get("status")).isEqualTo("OK");
  }

  @Test
  public void testRemoveAuthenticator() {
    VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions();
    VirtualAuthenticator authenticator =
        ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
    ((HasVirtualAuthenticator) driver).removeVirtualAuthenticator(authenticator);
    // no exceptions.
  }

  @Test
  public void testAddNonResidentCredential() {
    // Add a non-resident credential using the testing API.
    createSimpleU2FAuthenticator();
    byte[] credentialId = {(byte) 1, (byte) 2, (byte) 3, (byte) 4};
    Credential credential = Credential.createNonResidentCredential(
        credentialId, "localhost", privateKey, /*signCount=*/0);
    authenticator.addCredential(credential);

    // Attempt to use the credential to generate an assertion.
    Map<String, Object> response = (Map<String, Object>)
      ((JavascriptExecutor) driver).executeAsyncScript(
        "getCredential([{"
      + "  \"type\": \"public-key\","
      + "  \"id\": new Int8Array([1, 2, 3, 4]),"
      + "}]).then(arguments[arguments.length - 1]);");

    assertThat(response.get("status")).isEqualTo("OK");
  }

  @Test
  public void testAddResidentCredential() {
    // Add a resident credential using the testing API.
    createRKEnabledAuthenticator();
    byte[] credentialId = {1, 2, 3, 4};
    byte[] userHandle = {1};
    Credential credential = Credential.createResidentCredential(
        credentialId, "localhost", privateKey, userHandle, /*signCount=*/0);
    authenticator.addCredential(credential);

    // Attempt to use the credential to generate an assertion. Notice we use an
    // empty allowCredentials array.
    Map<String, Object> response = (Map<String, Object>)
      ((JavascriptExecutor) driver).executeAsyncScript(
        "getCredential([]).then(arguments[arguments.length - 1]);");

    assertThat(response.get("status")).isEqualTo("OK");

    Map<String, Object> attestation = (Map<String, Object>) response.get("attestation");
    assertThat((List) attestation.get("userHandle")).containsExactly(1L);
  }

  @Test
  public void testGetCredentials() {
    // Create an authenticator and add two credentials.
    createRKEnabledAuthenticator();

    // Register a resident credential.
    Map<String, Object> response1 = (Map<String, Object>)
      ((JavascriptExecutor) driver).executeAsyncScript(
        "registerCredential({authenticatorSelection: {requireResidentKey: true}})"
      + " .then(arguments[arguments.length - 1]);");
    assertThat(response1.get("status")).isEqualTo("OK");
    Map<String, Object> credential1json = (Map<String, Object>) response1.get("credential");
    byte[] credential1Id = convertListIntoArrayOfBytes((ArrayList<Long>) credential1json.get("rawId"));

    // Register a non resident credential.
    Map<String, Object> response2 = (Map<String, Object>)
      ((JavascriptExecutor) driver).executeAsyncScript(
        "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response2.get("status")).isEqualTo("OK");
    Map<String, Object> credential2json = (Map<String, Object>) response2.get("credential");
    byte[] credential2Id = convertListIntoArrayOfBytes((ArrayList<Long>) credential2json.get("rawId"));

    assertThat(credential1Id).isNotEqualTo(credential2Id);

    // Retrieve the two credentials.
    List<Credential> credentials = authenticator.getCredentials();
    assertThat(credentials.size()).isEqualTo(2);

    Credential credential1 = null;
    Credential credential2 = null;
    for (Credential credential : credentials) {
      if (Arrays.equals(credential.getId(), credential1Id))
        credential1 = credential;
      else if (Arrays.equals(credential.getId(), credential2Id))
        credential2 = credential;
      else
        fail("Unrecognized credential id");
    }

    assertThat(credential1.getIsResidentCredential()).isTrue();
    assertThat(credential1.getPrivateKey()).isNotNull();
    assertThat(credential1.getRpId()).isEqualTo("localhost");
    assertThat(credential1.getUserHandle()).isEqualTo(new byte[] {1});
    assertThat(credential1.getSignCount()).isEqualTo(1);

    assertThat(credential2.getIsResidentCredential()).isFalse();
    assertThat(credential2.getPrivateKey()).isNotNull();
    // Non resident keys do not store raw RP IDs or user handles.
    assertThat(credential2.getRpId()).isNull();
    assertThat(credential2.getUserHandle()).isNull();
    assertThat(credential2.getSignCount()).isEqualTo(1);
  }
}
