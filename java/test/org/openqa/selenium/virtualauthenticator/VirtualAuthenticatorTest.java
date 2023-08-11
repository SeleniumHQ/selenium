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
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.assertj.core.api.Fail.fail;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.net.MalformedURLException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticatorOptions.Protocol;

class VirtualAuthenticatorTest extends JupiterTestBase {

  /** A pkcs#8 encoded encrypted RSA private key as a base64url string. */
  private static final String base64EncodedPK =
      "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbBOu5Lhs4vpowbCnmCyLUpIE7JM9sm9QXzye2G+jr+Kr"
          + "MsinWohEce47BFPJlTaDzHSvOW2eeunBO89ZcvvVc8RLz4qyQ8rO98xS1jtgqi1NcBPETDrtzthODu/gd0sjB2Tk3TLuB"
          + "GVoPXt54a+Oo4JbBJ6h3s0+5eAfGplCbSNq6hN3Jh9YOTw5ZA6GCEy5l8zBaOgjXytd2v2OdSVoEDNiNQRkjJd2rmS2oi"
          + "9AyQFR3B7BrPSiDlCcITZFOWgLF5C31Wp/PSHwQhlnh7/6YhnE2y9tzsUvzx0wJXrBADW13+oMxrneDK3WGbxTNYgIi1P"
          + "vSqXlqGjHtCK+R2QkXAgMBAAECggEAVc6bu7VAnP6v0gDOeX4razv4FX/adCao9ZsHZ+WPX8PQxtmWYqykH5CY4TSfsui"
          + "zAgyPuQ0+j4Vjssr9VODLqFoanspT6YXsvaKanncUYbasNgUJnfnLnw3an2XpU2XdmXTNYckCPRX9nsAAURWT3/n9ljc/"
          + "XYY22ecYxM8sDWnHu2uKZ1B7M3X60bQYL5T/lVXkKdD6xgSNLeP4AkRx0H4egaop68hoW8FIwmDPVWYVAvo8etzWCtib"
          + "RXz5FcNld9MgD/Ai7ycKy4Q1KhX5GBFI79MVVaHkSQfxPHpr7/XcmpQOEAr+BMPon4s4vnKqAGdGB3j/E3d/+4F2swyko"
          + "QKBgQD8hCsp6FIQ5umJlk9/j/nGsMl85LgLaNVYpWlPRKPc54YNumtvj5vx1BG+zMbT7qIE3nmUPTCHP7qb5ERZG4CdMC"
          + "S6S64/qzZEqijLCqepwj6j4fV5SyPWEcpxf6ehNdmcfgzVB3Wolfwh1ydhx/96L1jHJcTKchdJJzlfTvq8wwKBgQDeCnK"
          + "ws1t5GapfE1rmC/h4olL2qZTth9oQmbrXYohVnoqNFslDa43ePZwL9Jmd9kYb0axOTNMmyrP0NTj41uCfgDS0cJnNTc63ojKjegxHIyYDKRZNVUR/dxAYB/vPfBYZUS7M89pO6LLsHhzS3qpu3/hppo/Uc/AM"
          + " /r8PSflNHQKBgDnWgBh6OQncChPUl"
          + "OLv9FMZPR1ZOfqLCYrjYEqiuzGm6iKM13zXFO4AGAxu1P/IAd5BovFcTpg79Z8tWqZaUUwvscnl+cRlj+mMXAmdqCeO8V"
          + "ASOmqM1ml667axeZDIR867ZG8K5V029Wg+4qtX5uFypNAAi6GfHkxIKrD04yOHAoGACdh4wXESi0oiDdkz3KOHPwIjn6B"
          + "hZC7z8mx+pnJODU3cYukxv3WTctlUhAsyjJiQ/0bK1yX87ulqFVgO0Knmh+wNajrb9wiONAJTMICG7tiWJOm7fW5cfTJw"
          + "WkBwYADmkfTRmHDvqzQSSvoC2S7aa9QulbC3C/qgGFNrcWgcT9kCgYAZTa1P9bFCDU7hJc2mHwJwAW7/FQKEJg8SL33KI"
          + "NpLwcR8fqaYOdAHWWz636osVEqosRrHzJOGpf9x2RSWzQJ+dq8+6fACgfFZOVpN644+sAHfNPAI/gnNKU5OfUv+eav8fB"
          + "nzlf1A3y3GIkyMyzFN3DE7e0n/lyqxE4HBYGpI8g==";

  private static final PKCS8EncodedKeySpec privateKey =
      new PKCS8EncodedKeySpec(Base64.getMimeDecoder().decode(base64EncodedPK));

  private JavascriptExecutor jsAwareDriver;
  private VirtualAuthenticator authenticator;

  @BeforeEach
  public void setup() throws MalformedURLException {
    assumeThat(driver).isInstanceOf(HasVirtualAuthenticator.class);
    jsAwareDriver = (JavascriptExecutor) driver;

    // According to the spec, the only way we can use the virtual
    // authenticator is if we are using HTTPS or contacting
    // `localhost` directly. When we try and access the `NettyAppServer`
    // over HTTPS, the `registerCredential` method is missing. Let's
    // make the assumption that the server being used is running on
    // `localhost` and rewrite URLs from there.
    driver.get(toLocalUrl(appServer.whereIs("virtual-authenticator.html")));
  }

  private void createRKEnabledU2FAuthenticator() {
    VirtualAuthenticatorOptions options =
        new VirtualAuthenticatorOptions().setProtocol(Protocol.U2F).setHasResidentKey(true);
    authenticator = ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
  }

  private void createRKDisabledU2FAuthenticator() {
    VirtualAuthenticatorOptions options =
        new VirtualAuthenticatorOptions().setProtocol(Protocol.U2F).setHasResidentKey(false);
    authenticator = ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
  }

  private void createRKEnabledCTAP2Authenticator() {
    VirtualAuthenticatorOptions options =
        new VirtualAuthenticatorOptions()
            .setProtocol(Protocol.CTAP2)
            .setHasResidentKey(true)
            .setHasUserVerification(true)
            .setIsUserVerified(true);
    authenticator = ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
  }

  private void createRKDisabledCTAP2Authenticator() {
    VirtualAuthenticatorOptions options =
        new VirtualAuthenticatorOptions()
            .setProtocol(Protocol.CTAP2)
            .setHasResidentKey(false)
            .setHasUserVerification(true)
            .setIsUserVerified(true);
    authenticator = ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
  }

  /**
   * @param list a list of numbers between -128 and 127.
   * @return a byte array containing the list.
   */
  private byte[] convertListIntoArrayOfBytes(List<Long> list) {
    byte[] ret = new byte[list.size()];
    for (int i = 0; i < list.size(); ++i) {
      ret[i] = list.get(i).byteValue();
    }
    return ret;
  }

  @SuppressWarnings("unchecked")
  private List<Long> extractRawIdFrom(Object response) {
    Map<String, Object> responseJson = (Map<String, Object>) response;
    Map<String, Object> credentialJson = (Map<String, Object>) responseJson.get("credential");
    return (List<Long>) credentialJson.get("rawId");
  }

  @SuppressWarnings("unchecked")
  private String extractIdFrom(Object response) {
    Map<String, Object> responseJson = (Map<String, Object>) response;
    Map<String, Object> credentialJson = (Map<String, Object>) responseJson.get("credential");
    return (String) credentialJson.get("id");
  }

  private Object getAssertionFor(Object credentialId) {
    return jsAwareDriver.executeAsyncScript(
        "getCredential([{"
            + "  \"type\": \"public-key\","
            + "  \"id\": Int8Array.from(arguments[0]),"
            + "}]).then(arguments[arguments.length - 1]);",
        credentialId);
  }

  @AfterEach
  public void tearDown() {
    if (authenticator != null) {
      ((HasVirtualAuthenticator) driver).removeVirtualAuthenticator(authenticator);
    }
  }

  @Test
  void testCreateAuthenticator() {
    // Register a credential on the Virtual Authenticator.
    createRKDisabledU2FAuthenticator();
    Object response =
        jsAwareDriver.executeAsyncScript(
            "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response).asInstanceOf(MAP).containsEntry("status", "OK");

    // Attempt to use the credential to get an assertion.
    assertThat(response)
        .extracting("credential.rawId")
        .extracting(this::getAssertionFor)
        .asInstanceOf(MAP)
        .containsEntry("status", "OK");
  }

  @Test
  void testRemoveAuthenticator() {
    VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions();
    VirtualAuthenticator authenticator =
        ((HasVirtualAuthenticator) driver).addVirtualAuthenticator(options);
    ((HasVirtualAuthenticator) driver).removeVirtualAuthenticator(authenticator);
    // no exceptions.
  }

  @Test
  void testAddNonResidentCredential() {
    // Add a non-resident credential using the testing API.
    createRKDisabledCTAP2Authenticator();
    byte[] credentialId = {1, 2, 3, 4};
    Credential credential =
        Credential.createNonResidentCredential(
            credentialId, "localhost", privateKey, /* signCount= */ 0);
    authenticator.addCredential(credential);

    // Attempt to use the credential to generate an assertion.
    Object response = getAssertionFor(Arrays.asList(1, 2, 3, 4));
    assertThat(response).asInstanceOf(MAP).containsEntry("status", "OK");
  }

  @Test
  void testAddNonResidentCredentialWhenAuthenticatorUsesU2FProtocol() {
    // Add a non-resident credential using the testing API.

    createRKDisabledU2FAuthenticator();

    /** A pkcs#8 encoded unencrypted EC256 private key as a base64url string. */
    String base64EncodedPK =
        "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"
            + "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"
            + "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB";

    PKCS8EncodedKeySpec privateKey =
        new PKCS8EncodedKeySpec(Base64.getUrlDecoder().decode(base64EncodedPK));

    byte[] credentialId = {1, 2, 3, 4};
    Credential credential =
        Credential.createNonResidentCredential(
            credentialId, "localhost", privateKey, /* signCount= */ 0);
    authenticator.addCredential(credential);

    // Attempt to use the credential to generate an assertion.
    Object response = getAssertionFor(Arrays.asList(1, 2, 3, 4));
    assertThat(response).asInstanceOf(MAP).containsEntry("status", "OK");
  }

  @Test
  void testAddResidentCredential() {
    // Add a resident credential using the testing API.
    createRKEnabledCTAP2Authenticator();
    byte[] credentialId = {1, 2, 3, 4};
    byte[] userHandle = {1};
    Credential credential =
        Credential.createResidentCredential(
            credentialId, "localhost", privateKey, userHandle, /* signCount= */ 0);
    authenticator.addCredential(credential);

    // Attempt to use the credential to generate an assertion. Notice we use an
    // empty allowCredentials array.
    Object response =
        jsAwareDriver.executeAsyncScript(
            "getCredential([]).then(arguments[arguments.length - 1]);");

    assertThat(response).asInstanceOf(MAP).containsEntry("status", "OK");
    assertThat(response).extracting("attestation.userHandle").asList().containsExactly(1L);
  }

  @Test
  void testAddResidentCredentialNotSupportedWhenAuthenticatorUsesU2FProtocol() {
    assertThrows(
        InvalidArgumentException.class,
        () -> {
          // Add a resident credential using the testing API.
          createRKEnabledU2FAuthenticator();

          /** A pkcs#8 encoded unencrypted EC256 private key as a base64url string. */
          String base64EncodedPK =
              "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"
                  + "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"
                  + "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB";

          PKCS8EncodedKeySpec privateKey =
              new PKCS8EncodedKeySpec(Base64.getUrlDecoder().decode(base64EncodedPK));

          byte[] credentialId = {1, 2, 3, 4};
          byte[] userHandle = {1};
          Credential credential =
              Credential.createResidentCredential(
                  credentialId, "localhost", privateKey, userHandle, /* signCount= */ 0);
          authenticator.addCredential(credential);
        });
  }

  @Test
  void testGetCredentials() {
    // Create an authenticator and add two credentials.
    createRKEnabledCTAP2Authenticator();

    // Register a resident credential.
    Object response1 =
        jsAwareDriver.executeAsyncScript(
            "registerCredential({authenticatorSelection: {requireResidentKey: true}})"
                + " .then(arguments[arguments.length - 1]);");
    assertThat(response1).asInstanceOf(MAP).containsEntry("status", "OK");

    // Register a non resident credential.
    Object response2 =
        jsAwareDriver.executeAsyncScript(
            "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response2).asInstanceOf(MAP).containsEntry("status", "OK");

    byte[] credential1Id = convertListIntoArrayOfBytes(extractRawIdFrom(response1));
    byte[] credential2Id = convertListIntoArrayOfBytes(extractRawIdFrom(response2));

    assertThat(credential1Id).isNotEqualTo(credential2Id);

    // Retrieve the two credentials.
    List<Credential> credentials = authenticator.getCredentials();
    assertThat(credentials.size()).isEqualTo(2);

    Credential credential1 = null;
    Credential credential2 = null;
    for (Credential credential : credentials) {
      if (Arrays.equals(credential.getId(), credential1Id)) {
        credential1 = credential;
      } else if (Arrays.equals(credential.getId(), credential2Id)) {
        credential2 = credential;
      } else {
        fail("Unrecognized credential id");
      }
    }

    assertThat(credential1.isResidentCredential()).isTrue();
    assertThat(credential1.getPrivateKey()).isNotNull();
    assertThat(credential1.getRpId()).isEqualTo("localhost");
    assertThat(credential1.getUserHandle()).isEqualTo(new byte[] {1});
    assertThat(credential1.getSignCount()).isEqualTo(1);

    assertThat(credential2.isResidentCredential()).isFalse();
    assertThat(credential2.getPrivateKey()).isNotNull();
    // Non resident keys do not store raw RP IDs or user handles.
    assertThat(credential2.getRpId()).isNull();
    assertThat(credential2.getUserHandle()).isNull();
    assertThat(credential2.getSignCount()).isEqualTo(1);
  }

  @Test
  void testRemoveCredentialByRawId() {
    createRKDisabledU2FAuthenticator();

    // Register credential.
    Object response =
        jsAwareDriver.executeAsyncScript(
            "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response).asInstanceOf(MAP).containsEntry("status", "OK");

    // Remove a credential by its ID as an array of bytes.
    List<Long> rawId = extractRawIdFrom(response);
    byte[] rawCredentialId = convertListIntoArrayOfBytes(rawId);
    authenticator.removeCredential(rawCredentialId);

    // Trying to get an assertion should fail.
    response = getAssertionFor(rawId);
    assertThat(response)
        .asInstanceOf(MAP)
        .extracting("status")
        .asString()
        .startsWith("NotAllowedError");
  }

  @Test
  void testRemoveCredentialByBase64UrlId() {
    createRKDisabledU2FAuthenticator();

    // Register credential.
    Object response =
        jsAwareDriver.executeAsyncScript(
            "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response).asInstanceOf(MAP).containsEntry("status", "OK");
    List<Long> rawId = extractRawIdFrom(response);

    // Remove a credential by its base64url ID.
    String credentialId = extractIdFrom(response);
    authenticator.removeCredential(credentialId);

    // Trying to get an assertion should fail.
    response = getAssertionFor(rawId);
    assertThat(response)
        .asInstanceOf(MAP)
        .extracting("status")
        .asString()
        .startsWith("NotAllowedError");
  }

  @Test
  void testRemoveAllCredentials() {
    createRKDisabledU2FAuthenticator();

    // Register two credentials.
    Object response1 =
        jsAwareDriver.executeAsyncScript(
            "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response1).asInstanceOf(MAP).containsEntry("status", "OK");
    List<Long> rawId1 = extractRawIdFrom(response1);

    Object response2 =
        jsAwareDriver.executeAsyncScript(
            "registerCredential().then(arguments[arguments.length - 1]);");
    assertThat(response2).asInstanceOf(MAP).containsEntry("status", "OK");
    List<Long> rawId2 = extractRawIdFrom(response1);

    // Remove all credentials.
    authenticator.removeAllCredentials();

    // Trying to get an assertion allowing for any of both should fail.
    Object response =
        jsAwareDriver.executeAsyncScript(
            "getCredential([{"
                + "  \"type\": \"public-key\","
                + "  \"id\": Int8Array.from(arguments[0]),"
                + "}, {"
                + "  \"type\": \"public-key\","
                + "  \"id\": Int8Array.from(arguments[1]),"
                + "}]).then(arguments[arguments.length - 1]);",
            rawId1,
            rawId2);
    assertThat(response)
        .asInstanceOf(MAP)
        .extracting("status")
        .asString()
        .startsWith("NotAllowedError");
  }

  @Test
  void testSetUserVerified() {
    createRKEnabledCTAP2Authenticator();

    // Register a credential requiring UV.
    Object response =
        jsAwareDriver.executeAsyncScript(
            "registerCredential({authenticatorSelection: {userVerification: 'required'}})"
                + "  .then(arguments[arguments.length - 1]);");
    assertThat(response).asInstanceOf(MAP).containsEntry("status", "OK");
    List<Long> rawId = extractRawIdFrom(response);

    // Getting an assertion requiring user verification should succeed.
    response =
        jsAwareDriver.executeAsyncScript(
            "getCredential([{"
                + "  \"type\": \"public-key\","
                + "  \"id\": Int8Array.from(arguments[0]),"
                + "}], {userVerification: 'required'}).then(arguments[arguments.length - 1]);",
            rawId);
    assertThat(response).asInstanceOf(MAP).containsEntry("status", "OK");

    // Disable user verification.
    authenticator.setUserVerified(false);

    // Getting an assertion requiring user verification should fail.
    response =
        jsAwareDriver.executeAsyncScript(
            "getCredential([{"
                + "  \"type\": \"public-key\","
                + "  \"id\": Int8Array.from(arguments[0]),"
                + "}], {userVerification: 'required'}).then(arguments[arguments.length - 1]);",
            rawId);
    assertThat(response)
        .asInstanceOf(MAP)
        .extracting("status")
        .asString()
        .startsWith("NotAllowedError");
  }
}
