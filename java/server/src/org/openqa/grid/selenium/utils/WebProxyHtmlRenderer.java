/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.grid.selenium.utils;

import java.util.Map;

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.selenium.proxy.DefaultRemoteProxy;
import org.openqa.grid.web.utils.BrowserNameUtils;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

public class WebProxyHtmlRenderer implements HtmlRenderer {

  private RemoteProxy proxy;

  @SuppressWarnings("unused")
  private WebProxyHtmlRenderer() {
  }

  public WebProxyHtmlRenderer(RemoteProxy proxy) {
    this.proxy = proxy;
  }

  public String renderSummary() {
    StringBuilder builder = new StringBuilder();
    builder.append("<fieldset>");
    builder.append("<legend>").append(proxy.getClass().getSimpleName()).append("</legend>");
    builder.append("listening on ").append(proxy.getRemoteHost());

    if (((DefaultRemoteProxy) proxy).isDown()) {
      builder.append("(cannot be reached at the moment)");
    }
    builder.append("<br />");
    if (proxy.getTimeOut() > 0) {
      int inSec = proxy.getTimeOut() / 1000;
      builder.append("test session time out after ").append(inSec).append(" sec.<br />");
    }

    builder.append("Supports up to <b>").append(proxy.getMaxNumberOfConcurrentTestSessions())
        .append("</b> concurrent tests from: <br />");

    builder.append("");
    for (TestSlot slot : proxy.getTestSlots()) {
      TestSession session = slot.getSession();

      String icon = getIcon(slot.getCapabilities());
      if (icon != null) {
        builder.append("<img ");
        builder.append("src='").append(icon).append("' ");
      } else {
        builder.append("<a href='#' ");
      }

      if (session != null) {
        builder.append(" class='busy' ");
        builder.append(" title='").append(session.get("lastCommand")).append("' ");
      } else {
        builder.append(" title='")
        .append(slot.getCapabilities())
        .append("type="+slot.getProtocol())
        .append("' ");
      }

      if (icon != null) {
        builder.append("/>");
      } else {
        builder.append(">");
        builder.append(slot.getCapabilities().get(CapabilityType.BROWSER_NAME));
        builder.append("</a>");
      }

    }
    builder.append("</fieldset>");

    return builder.toString();
  }

  private String getIcon(Map<String, Object> capabilities) {
    return BrowserNameUtils.getConsoleIconPath(new DesiredCapabilities(capabilities),
        proxy.getRegistry());
  }

}
