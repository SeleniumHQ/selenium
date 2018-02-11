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

package org.openqa.grid.internal.utils;

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.TestSlot;
import org.openqa.selenium.remote.CapabilityType;

/**
 * Default html render that doesn't assume anything about a proxy ( in particular, it doesn't assume
 * it's a selenium1 or 2 proxy.) , and just display very basic info about it for the console.
 */
public class DefaultHtmlRenderer implements HtmlRenderer {

  private RemoteProxy proxy;

  @SuppressWarnings("unused")
  private DefaultHtmlRenderer() {
  }

  public DefaultHtmlRenderer(RemoteProxy proxy) {
    this.proxy = proxy;
  }

  public String renderSummary() {
    StringBuilder builder = new StringBuilder();
    builder.append("<fieldset>");
    builder.append("<legend>").append(proxy.getClass().getSimpleName()).append("</legend>");
    builder.append("listening on ").append(proxy.getRemoteHost());
    if (proxy.getTimeOut() > 0) {
      int inSec = proxy.getTimeOut() / 1000;
      builder.append("test session time out after ").append(inSec).append(" sec.");
    }

    builder.append("<br>Supports up to <b>").append(proxy.getMaxNumberOfConcurrentTestSessions())
        .append("</b> concurrent tests from : </u><br>");

    for (TestSlot slot : proxy.getTestSlots()) {
      builder.append(slot.getCapabilities().containsKey(CapabilityType.BROWSER_NAME) ? slot.getCapabilities().get(
        CapabilityType.BROWSER_NAME) : slot.getCapabilities().get(CapabilityType.APPLICATION_NAME));
      builder.append("protocol:"+slot.getProtocol()+"<br>");
      TestSession session = slot.getSession();
      builder.append(session == null ? "(free)" : "(busy, session " + session + ")");
      builder.append("<br>");
    }
    builder.append("</fieldset>");
    return builder.toString();
  }
}
