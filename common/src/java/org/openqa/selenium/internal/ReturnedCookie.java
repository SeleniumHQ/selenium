package org.openqa.selenium.internal;

import org.openqa.selenium.Cookie;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.Date;

public class ReturnedCookie extends Cookie {
  private String domain;
  private boolean isSecure;

  public ReturnedCookie(String name, String value, String domain, String path, Date expiry, boolean isSecure) {
    super(name, value, path, expiry);

    this.domain = domain;
    this.isSecure = isSecure;

    validate();
  }

  public String getDomain() {
    return domain;
  }

  public boolean isSecure() {
    return isSecure;
  }

  @Override
  protected void validate() {
    super.validate();

    if (domain != null && !"".equals(domain)) {
      try {
        String domainToUse = domain.startsWith("http") ? domain : "http://" + domain;
        URL url = new URL(domainToUse);
        InetAddress.getByName(url.getHost());
      } catch (MalformedURLException e) {
        throw new IllegalArgumentException(String.format("URL not valid: %s", domain));
      } catch (UnknownHostException e) {
        throw new IllegalArgumentException(String.format("Domain does not exist: %s", domain));
      }
    }
  }

  @Override
  public String toString() {
    return getName() + "=" + getValue()
        + (getExpiry() == null ? "" : ";expires=" + getExpiry())
        + ("".equals(getPath()) ? "" : ";path=" + getPath())
        + (isSecure ? ";secure;" : "");
  }
}
