/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium;

import java.util.Date;
import java.text.SimpleDateFormat;

public class Cookie {
    private final String name;
    private final String value;
    private final String path;
    private final String domain;
    private final Date expiry;

    /**
     * Creates a cookie. If the path is left blank or set to null it will be
     * set to "/"
     *
     * @param name name cannot be null or empty string
     * @param value value can be an empty string but not be null
     * @param path The path to use. Will default to "/"
     * @param expiry expiry can be null
     */
    public Cookie(String name, String value, String path, Date expiry) {
      this(name, value, null, path, expiry);
    }

  public Cookie(String name, String value, String domain, String path, Date expiry) {
    this.name = name;
    this.value = value;
    this.path = path == null || "".equals(path) ? "/" : path;
    this.domain = domain;

    if (expiry != null) {
      //igonre the milliseconds because firefox only keeps the seconds
      this.expiry = new Date(expiry.getTime() / 1000 * 1000);
    } else {
      this.expiry = null;
    }

    validate();
  }

  /**
   * Create a cookie for the default path with the given name and value with
   * no expiry set.
   *
   * @param name The cookie's name
   * @param value The cookie's value
   */
    public Cookie(String name, String value) {
        this(name, value, "/", null);
    }

  /**
   * Create a cookie.
   *
   * @param name The cookie's name
   * @param value The cookie's value
   * @param path The path the cookie is for
   */
    public Cookie(String name, String value, String path) {
        this(name, value, path, null);
    }

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

    public boolean isSecure() {
        return false;
    }

    public Date getExpiry() {
        return expiry;
    }

    protected void validate() {
        if (name == null || "".equals(name) || value == null || path == null)
            throw new IllegalArgumentException("Required attributes are not set or " +
                    "any non-null attribute set to null");

        if (name.indexOf(';') != -1)
            throw new IllegalArgumentException(
                    "Cookie names cannot contain a ';': " + name);
    }

    @Override
    public String toString() {
        return name + "=" + value 
                + (expiry == null ? "" : "; expires=" + new SimpleDateFormat("EEE, dd-MM-yyyy hh:mm:ss z").format(expiry))
                + ("".equals(path) ? "" : "; path=" + path)
                + (domain == null ? "" : "; domain=" + domain);
//                + (isSecure ? ";secure;" : "");
    }

    /**
     *  Two cookies are equal if the name and value match
     */
    @Override
    public boolean equals(Object o) {
      if (this == o) {
        return true;
      }
      if (!(o instanceof Cookie)) {
        return false;
      }

      Cookie cookie = (Cookie) o;

      if (!name.equals(cookie.name)) {
        return false;
      }
      return !(value != null ? !value.equals(cookie.value) : cookie.value != null);
    }

    @Override
    public int hashCode() {
      return name.hashCode();
    }

  public static class Builder {

    private final String name;
    private final String value;
    private String path;
    private String domain;
    private Date expiry;

    public Builder(String name, String value) {
      this.name = name;
      this.value = value;
    }

    public Builder domain(String host) {
      this.domain = host;
      return this;
    }

    public Builder path(String path) {
      this.path = path;
      return this;
    }

    public Builder expiresOn(Date expiry) {
      this.expiry = expiry;
      return this;
    }

    public Cookie build() {
      return new Cookie(name, value, domain, path, expiry);
    }
  }
}
