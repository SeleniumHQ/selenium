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

import static java.util.Collections.unmodifiableMap;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public class Cookie {
  public enum SameSite {
    STRICT("strict"),
    LAX("lax"),
    NONE("none"),
    DEFAULT("default");

    private final String type;

    SameSite(String type) {
      this.type = type;
    }

    @Override
    public String toString() {
      return type;
    }

    public static SameSite findByName(String name) {
      for (SameSite type : values()) {
        if (type.toString().equalsIgnoreCase(name)) {
          return type;
        }
      }
      throw new IllegalArgumentException("Unsupported \"SameSite\" attribute: " + name);
    }
  }

  private final String name;
  private final BytesValue value;
  private final @Nullable String domain;
  private final @Nullable String path;
  private final @Nullable Long size;
  private final boolean isSecure;
  private final boolean isHttpOnly;
  private final @Nullable SameSite sameSite;
  private final Optional<Long> expiry;

  public Cookie(
      String name,
      BytesValue value,
      @Nullable String domain,
      @Nullable String path,
      @Nullable Long size,
      boolean isSecure,
      boolean httpOnly,
      @Nullable SameSite sameSite,
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
    Long size = null;
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
          isSecure = input.readNonNull(Boolean.class);
          break;
        case "httpOnly":
          isHttpOnly = input.readNonNull(Boolean.class);
          break;
        case "sameSite":
          String sameSiteValue = input.readNonNull(String.class);
          sameSite = SameSite.findByName(sameSiteValue);
          break;
        case "expiry":
          expiry = Optional.of(input.readNonNull(Long.class));
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new Cookie(
        Require.nonNull("name", name),
        Require.nonNull("value", value),
        domain,
        path,
        size,
        isSecure,
        isHttpOnly,
        sameSite,
        expiry);
  }

  public String getName() {
    return name;
  }

  public BytesValue getValue() {
    return value;
  }

  @Nullable
  public String getDomain() {
    return domain;
  }

  @Nullable
  public String getPath() {
    return path;
  }

  @Nullable
  public Long getSize() {
    return size;
  }

  public boolean isSecure() {
    return isSecure;
  }

  public boolean isHttpOnly() {
    return isHttpOnly;
  }

  @Nullable
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
    if (domain != null) map.put("domain", domain);
    if (path != null) map.put("path", path);
    if (size != null) map.put("size", size);
    map.put("secure", isSecure());
    map.put("httpOnly", isHttpOnly());
    if (sameSite != null) map.put("sameSite", sameSite.toString());
    expiry.ifPresent(expiry -> map.put("expiry", expiry));
    return unmodifiableMap(map);
  }
}
