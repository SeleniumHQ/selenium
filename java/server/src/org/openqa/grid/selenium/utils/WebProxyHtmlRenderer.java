package org.openqa.grid.selenium.utils;

import static org.openqa.grid.common.RegistrationRequest.BROWSER;

import java.util.Map;

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.selenium.proxy.WebRemoteProxy;
import org.openqa.grid.web.utils.BrowserNameUtils;

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
		if (((WebRemoteProxy)proxy).isDown()){
			builder.append("(cannot be reached at the moment)");
		}
		builder.append("<br>");
		if (proxy.getTimeOut() > 0) {
			int inSec = proxy.getTimeOut() / 1000;
			builder.append("test session time out after ").append(inSec).append(" sec.<br>");
		}

		builder.append("Supports up to <b>").append(proxy.getMaxNumberOfConcurrentTestSessions()).append("</b> concurrent tests from : </u><br>");
		
		builder.append("");
		for (TestSlot slot : proxy.getTestSlots()) {
			TestSession session = slot.getSession();
			builder.append("<img ");
			builder.append("src='").append(getIcon(slot.getCapabilities())).append("' ");

			if (session != null) {
				builder.append(" class='busy' ");
				builder.append(" title='").append(session.get("lastCommand")).append("' ");
			} else {
				builder.append(" title='").append(slot.getCapabilities()).append("' ");
			}
			builder.append("/>");
		}
		builder.append("</fieldset>");
		
		
		return builder.toString();
	}

	private String getIcon(Map<String, Object> capabilities) {
		return "/grid/resources/images/" + BrowserNameUtils.consoleIconName((String) capabilities.get(BROWSER)) + ".png";
	}

}
