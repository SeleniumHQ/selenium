package org.openqa.selenium.remote;

import org.apache.http.client.methods.HttpUriRequest;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.Urls;

import java.net.URL;

public class CommandInfo {

  private final String url;
  private final HttpVerb verb;

  public CommandInfo(String url, HttpVerb verb) {
    this.url = url;
    this.verb = verb;
  }

  HttpUriRequest getMethod(URL base, Command command) {
    StringBuilder urlBuilder = new StringBuilder();

    urlBuilder.append(base.toExternalForm().replaceAll("/$", ""));
    for (String part : url.split("/")) {
      if (part.length() == 0) {
        continue;
      }

      urlBuilder.append("/");
      if (part.startsWith(":")) {
        String value = get(part.substring(1), command);
        if (value != null) {
          urlBuilder.append(get(part.substring(1), command));
        }
      } else {
        urlBuilder.append(part);
      }
    }

    return verb.createMethod(urlBuilder.toString());
  }

  private String get(String propertyName, Command command) {
    if ("sessionId".equals(propertyName)) {
      SessionId id = command.getSessionId();
      if (id == null) {
        throw new WebDriverException("Session ID may not be null");
      }
      return id.toString();
    }

    // Attempt to extract the property name from the parameters
    Object value = command.getParameters().get(propertyName);
    if (value != null) {
      return Urls.urlEncode(String.valueOf(value));
    }
    return null;
  }
}
