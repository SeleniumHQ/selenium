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

import org.openqa.selenium.internal.Require;

import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * A credential stored in a virtual authenticator.
 * @see <a href="https://w3c.github.io/webauthn/#credential-parameters">https://w3c.github.io/webauthn/#credential-parameters</a>
 */
public class Credential {

  private final byte[] id;
  private final boolean isResidentCredential;
  private final String rpId;
  private final PKCS8EncodedKeySpec privateKey;
  private final byte[] userHandle;
  private final int signCount;

  /**
   * Creates a non resident (i.e. stateless) credential.
   */
  public static Credential createNonResidentCredential(
    byte[] id,
    String rpId,
    PKCS8EncodedKeySpec privateKey,
    int signCount) {
    return new Credential(
      id,
      false,
      Require.nonNull("rpId", rpId),
      privateKey,
      null, signCount);
  }

  /**
   * Creates a resident (i.e. stateful) credential.
   */
  public static Credential createResidentCredential(
    byte[] id,
    String rpId,
    PKCS8EncodedKeySpec privateKey,
    byte[] userHandle,
    int signCount) {
    return new Credential(
      id,
      true,
      Require.nonNull("rpId", rpId),
      privateKey,
      Require.nonNull("User handle", userHandle),
      signCount);
  }

  /**
   * Creates a credential from a map.
   */
  public static Credential fromMap(Map<String, Object> map) {
    Base64.Decoder decoder = Base64.getUrlDecoder();
    return new Credential(
      decoder.decode((String) map.get("credentialId")),
      (boolean) map.get("isResidentCredential"),
      (String) map.get("rpId"),
      new PKCS8EncodedKeySpec(decoder.decode((String) map.get("privateKey"))),
      map.get("userHandle") == null ? null : decoder.decode((String) map.get("userHandle")),
      ((Long) map.get("signCount")).intValue());
  }

  private Credential(
    byte[] id,
    boolean isResidentCredential,
    String rpId,
    PKCS8EncodedKeySpec privateKey,
    byte[] userHandle,
    int signCount) {
    this.id = Require.nonNull("Id", id);
    this.isResidentCredential = isResidentCredential;
    this.rpId = rpId;
    this.privateKey = Require.nonNull("Private key", privateKey);
    this.userHandle = userHandle;
    this.signCount = signCount;
  }

  public byte[] getId() {
    return Arrays.copyOf(id, id.length);
  }

  public boolean isResidentCredential() {
    return isResidentCredential;
  }

  public String getRpId() {
    return rpId;
  }

  public PKCS8EncodedKeySpec getPrivateKey() {
    return privateKey;
  }

  public byte[] getUserHandle() {
    return userHandle == null ? null : Arrays.copyOf(userHandle, userHandle.length);
  }

  public int getSignCount() {
    return signCount;
  }

  public Map<String, Object> toMap() {
    Base64.Encoder encoder = Base64.getUrlEncoder();
    Map<String, Object> map = new HashMap<>();
    map.put("credentialId", encoder.encodeToString(id));
    map.put("isResidentCredential", isResidentCredential);
    map.put("rpId", rpId);
    map.put("privateKey", encoder.encodeToString(privateKey.getEncoded()));
    map.put("signCount", signCount);
    if (userHandle != null) {
      map.put("userHandle", encoder.encodeToString(userHandle));
    }
    return Collections.unmodifiableMap(map);
  }
}
