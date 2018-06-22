package org.openqa.selenium.grid.protocol;

import org.openqa.selenium.WebDriverException;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.Objects;

public class Registration {

  private final String id;
  private final URL url;

  public Registration(Map<String, Object> raw) {
    @SuppressWarnings("unchecked") Map<String, Object> config =
        (Map<String, Object>) Objects.requireNonNull(raw.get("configuration"));

    this.id = (String) Objects.requireNonNull(config.get("id"));

    String host = (String) Objects.requireNonNull(config.get("remoteHost"));
    try {
      this.url = new URL(host);
    } catch (MalformedURLException e) {
      throw new WebDriverException(e);
    }
  }

  public String getId() {
    return id;
  }
}
