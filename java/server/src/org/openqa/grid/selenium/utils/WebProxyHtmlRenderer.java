package org.openqa.grid.selenium.utils;

import java.util.Map;

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.selenium.proxy.WebRemoteProxy;
import org.openqa.grid.web.utils.BrowserNameUtils;
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
    builder.append("listening on ").append(proxy.getRemoteURL());

    if (((WebRemoteProxy) proxy).isDown()) {
      builder.append("(cannot be reached at the moment)");
    }
    builder.append("<br />");
    if (proxy.getTimeOut() > 0) {
      int inSec = proxy.getTimeOut() / 1000;
      builder.append("test session time out after ").append(inSec).append(" sec.<br />");
    }

    builder.append("Supports up to <b>").append(proxy.getMaxNumberOfConcurrentTestSessions()).append("</b> concurrent tests from: <br />");

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
        builder.append(" title='").append(slot.getCapabilities()).append("' ");
      }

      if (icon != null) {
        builder.append("/>");
      } else {
        builder.append(">");
        builder.append(slot.getCapabilities().get("browserName"));
        builder.append("</a>");
      }

    }
    builder.append("</fieldset>");

    return builder.toString();
  }

  private String getIcon(Map<String, Object> capabilities) {
    return BrowserNameUtils.getConsoleIconPath(new DesiredCapabilities(capabilities), proxy.getRegistry());
  }

}
