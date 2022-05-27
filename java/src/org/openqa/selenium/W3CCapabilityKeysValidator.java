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

package org.openqa.selenium;

import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;

public class W3CCapabilityKeysValidator {

  private static final Logger LOG = Logger.getLogger(W3CCapabilityKeysValidator.class.getName());
  private static final Predicate<String> ACCEPTED_W3C_PATTERNS = new AcceptedW3CCapabilityKeys();

  public static void validateCapability(String capabilityName) {
    if (!ACCEPTED_W3C_PATTERNS.test(capabilityName)) {
      LOG.log(Level.WARNING,
              () -> String.format("Support for Legacy Capabilities is deprecated; " +
                                  "You are sending \"%s\" which is an invalid capability. " +
                                  "Please update to W3C Syntax: https://www.selenium.dev/blog/2022/legacy-protocol-support/",
                                  capabilityName));
    }

  }
}
