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

package org.openqa.selenium.chromium;

import org.openqa.selenium.Capabilities;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

public class ChromiumDevToolsLocator {

  private static final Logger LOG = Logger.getLogger(ChromiumDevToolsLocator.class.getName());

  public static Optional<URI> getReportedUri(String capabilityKey, Capabilities caps) {
    Object raw = caps.getCapability(capabilityKey);
    if (!(raw instanceof Map)) {
      LOG.fine("No capabilities for " + capabilityKey);
      return Optional.empty();
    }

    raw = ((Map<?, ?>) raw).get("debuggerAddress");
    if (!(raw instanceof String)) {
      LOG.fine("No debugger address");
      return Optional.empty();
    }

    int index = ((String) raw).lastIndexOf(':');
    if (index == -1 || index == ((String) raw).length() - 1) {
      LOG.fine("No index in " + raw);
      return Optional.empty();
    }

    try {
      URI uri = new URI(String.format("http://%s", raw));
      LOG.fine("URI found: " + uri);
      return Optional.of(uri);
    } catch (URISyntaxException e) {
      LOG.warning("Unable to create URI from: " + raw);
      return Optional.empty();
    }
  }
}
