package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

import java.util.Date;

/**
 * Cookie object
 */
public class Cookie {

  private String name;

  private String value;

  private String domain;

  private String path;

  private long expires;

  private boolean httpOnly;

  private boolean secure;

  public String getName() {
    return name;
  }

  public String getValue() {
    return value;
  }

  public String getDomain() {
    return domain;
  }

  public String getPath() {
    return path;
  }

  public long getExpires() {
    return expires;
  }

  public boolean isHttpOnly() {
    return httpOnly;
  }

  public boolean isSecure() {
    return secure;
  }

  public Cookie(String name, String value, String domain, String path, long expires,
                Boolean httpOnly, Boolean secure) {
    this.name = requireNonNull(name, "'name' is required for Cookie");
    this.value = requireNonNull(value, "'value' is required for Cookie");
    this.domain = requireNonNull(domain, "'domain' is required for Cookie");
    this.path = requireNonNull(path, "'path' is required for Cookie");
    this.expires = expires;
    this.httpOnly = httpOnly;
    this.secure = secure;
  }

  org.openqa.selenium.Cookie asSeleniumCookie() {
    return new org.openqa.selenium.Cookie.Builder(name, value).domain(domain).path(path)
        .expiresOn(new Date(expires)).isSecure(secure).isHttpOnly(httpOnly).build();
  }

  public static Cookie fromSeleniumCookie(org.openqa.selenium.Cookie cookie) {
    return new Cookie(cookie.getName(), cookie.getValue(), cookie.getDomain(), cookie.getPath(),
                      cookie.getExpiry() != null ? cookie.getExpiry().getTime() : 0,
                      cookie.isHttpOnly(), cookie.isSecure());
  }

  public static Cookie parseCookie(JsonInput input) {

    String name = null;

    String value = null;

    String domain = null;

    String path = null;

    long expires = 0;

    boolean httpOnly = false;

    boolean secure = false;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "name":
          name = input.nextString();
          break;
        case "value":
          value = input.nextString();
          break;
        case "domain":
          domain = input.nextString();
          break;

        case "path":
          path = input.nextString();
          break;

        case "expires":
          expires = input.nextNumber().longValue();
          break;
        case "httpOnly":
          httpOnly = input.nextBoolean();
          break;
        case "secure":
          secure = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new Cookie(name, value, domain, path, expires, httpOnly, secure);
  }
}
