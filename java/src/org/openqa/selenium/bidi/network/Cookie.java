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
package org.openqa.selenium.bidi.network;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.openqa.selenium.json.JsonInput;

public class Cookie {
  public enum SameSite {
    STRICT("strict"),
    LAX("lax"),
    NONE("none");

    private final String type;

    SameSite(String type) {
      this.type = type;
    }

    @Override
    public String toString() {
      return type;
    }

    public static SameSite findByName(String name) {
      SameSite result = null;
      for (SameSite type : values()) {
        if (type.toString().equalsIgnoreCase(name)) {
          result = type;
          break;
        }
      }
      return result;
    }
  }

  private final String name;
  private final BytesValue value;
  private final String domain;
  private final String path;
  private final long size;
  private final boolean isSecure;
  private final boolean isHttpOnly;
  private final SameSite sameSite;
  private final Optional<Long> expiry;

  public Cookie(
      String name,
      BytesValue value,
      String domain,
      String path,
      long size,
      boolean isSecure,
      boolean httpOnly,
      SameSite sameSite,
      Optional<Long> expiry) {
    this.name = name;
    this.value = value;
    this.domain = domain;
    this.path = path;
    this.size = size;
    this.isSecure = isSecure;
    this.isHttpOnly = httpOnly;
    this.sameSite = sameSite;
    this.expiry = expiry;
  }

  public static Cookie fromJson(JsonInput input) {
    String name = null;
    BytesValue value = null;
    String domain = null;
    String path = null;
    long size = 0;
    boolean isSecure = false;
    boolean isHttpOnly = false;
    SameSite sameSite = null;
    Optional<Long> expiry = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "name":
          name = input.read(String.class);
          break;
        case "value":
          value = input.read(BytesValue.class);
          break;
        case "domain":
          domain = input.read(String.class);
          break;
        case "path":
          path = input.read(String.class);
          break;
        case "size":
          size = input.read(Long.class);
          break;
        case "secure":
          isSecure = input.read(Boolean.class);
          break;
        case "httpOnly":
          isHttpOnly = input.read(Boolean.class);
          break;
        case "sameSite":
          String sameSiteValue = input.read(String.class);
          sameSite = SameSite.findByName(sameSiteValue);
          break;
        case "expiry":
          expiry = Optional.of(input.read(Long.class));
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new Cookie(name, value, domain, path, size, isSecure, isHttpOnly, sameSite, expiry);
  }

  public String getName() {
    return name;
  }

  public BytesValue getValue() {
    return value;
  }

  public String getDomain() {
    return domain;
  }

  public String getPath() {
    return path;
  }

  public long getSize() {
    return size;
  }

  public boolean isSecure() {
    return isSecure;
  }

  public boolean isHttpOnly() {
    return isHttpOnly;
  }

  public SameSite getSameSite() {
    return sameSite;
  }

  public Optional<Long> getExpiry() {
    return expiry;
  }

  public Map<String, Object> toMap() {
    Map<String, Object> map = new HashMap<>();
    map.put("name", getName());
    map.put("value", getValue().toMap());
    map.put("domain", getDomain());
    map.put("path", getPath());
    map.put("size", getSize());
    map.put("secure", isSecure());
    map.put("httpOnly", isHttpOnly());
    map.put("sameSite", getSameSite().toString());

    getExpiry().ifPresent(expiryValue -> map.put("expiry", expiryValue));

    return map;
  }
}
