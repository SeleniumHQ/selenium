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

/**
 * Interface implemented by each driver that allows access to the virtual authenticator API.
 */
public interface HasVirtualAuthenticator {
  /**
   * Adds a virtual authenticator with the given options.
   * @return the new virtual authenticator.
   */
  VirtualAuthenticator addVirtualAuthenticator(VirtualAuthenticatorOptions options);

  /**
   * Removes a previously added virtual authenticator. The authenticator is no
   * longer valid after removal, so no methods may be called.
   */
  void removeVirtualAuthenticator(VirtualAuthenticator authenticator);
}
