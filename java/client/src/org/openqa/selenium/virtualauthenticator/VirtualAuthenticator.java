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

import org.openqa.selenium.virtualauthenticator.Credential;

import java.util.List;
import java.util.Objects;

/**
 * Represents a virtual authenticator.
 */
public interface VirtualAuthenticator {

  /**
   * @return the authenticator unique identifier.
   */
  public String getId();

  /**
   * Injects a credential into the authenticator.
   */
  public void addCredential(Credential credential);

  /**
   * @return the list of credentials owned by the authenticator.
   */
  public List<Credential> getCredentials();

  /**
   * Removes a credential from the authenticator.
   * @param credentialId the ID of the credential to be removed.
   */
  public void removeCredential(byte[] credentialId);

  /**
   * Removes a credential from the authenticator.
   * @param credentialId the ID of the credential to be removed as a base64url
   *                     string.
   */
  public void removeCredential(String credentialId);

  /**
   * Removes all the credentials from the authenticator.
   */
  public void removeAllCredentials();

  /**
   * Sets whether the authenticator will simulate success or fail on user verification.
   * @param verified true if the authenticator will pass user verification,
   *                 false otherwise.
   */
  public void setUserVerified(boolean verified);
}
