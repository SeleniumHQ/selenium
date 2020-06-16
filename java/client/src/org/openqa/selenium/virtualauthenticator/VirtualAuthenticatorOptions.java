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

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Options for the creation of virtual authenticators.
 * @see <a href="https://w3c.github.io/webauthn/#sctn-automation">https://w3c.github.io/webauthn/#sctn-automation</a>
 */
public class VirtualAuthenticatorOptions {

  public enum Protocol {
    CTAP2("ctap2"),
    U2F("ctap1/u2f");

    public final String id;

    Protocol(String id) {
      this.id = id;
    }
  }

  public enum Transport {
    BLE("ble"),
    INTERNAL("internal"),
    NFC("nfc"),
    USB("usb");

    public final String id;

    Transport(String id) {
      this.id = id;
    }
  }

  private Protocol protocol = Protocol.CTAP2;
  private Transport transport = Transport.USB;
  private boolean hasResidentKey = false;
  private boolean hasUserVerification = false;
  private boolean isUserConsenting = true;
  private boolean isUserVerified = false;

  public VirtualAuthenticatorOptions() { }

  public VirtualAuthenticatorOptions setProtocol(Protocol protocol) {
    this.protocol = protocol;
    return this;
  }

  public VirtualAuthenticatorOptions setTransport(Transport transport) {
    this.transport = transport;
    return this;
  }

  public VirtualAuthenticatorOptions setHasResidentKey(boolean hasResidentKey) {
    this.hasResidentKey = hasResidentKey;
    return this;
  }

  public VirtualAuthenticatorOptions setHasUserVerification(boolean hasUserVerification) {
    this.hasUserVerification = hasUserVerification;
    return this;
  }

  public VirtualAuthenticatorOptions setIsUserConsenting(boolean isUserConsenting) {
    this.isUserConsenting = isUserConsenting;
    return this;
  }

  public VirtualAuthenticatorOptions setIsUserVerified(boolean isUserVerified) {
    this.isUserVerified = isUserVerified;
    return this;
  }

  public Map<String, Object> toMap() {
    Map<String, Object> map = new HashMap<>();
    map.put("protocol", protocol.id);
    map.put("transport", transport.id);
    map.put("hasResidentKey", hasResidentKey);
    map.put("hasUserVerification", hasUserVerification);
    map.put("isUserConsenting", isUserConsenting);
    map.put("isUserVerified", isUserVerified);
    return Collections.unmodifiableMap(map);
  }
}
