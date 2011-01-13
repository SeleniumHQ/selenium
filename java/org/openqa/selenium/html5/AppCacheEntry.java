/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.html5;

/**
 * Represents a cache resource in the application cache.
 */
public class AppCacheEntry {
  private final AppCacheType type;
  private final String url;
  private final String mimeType;

  public AppCacheEntry(AppCacheType type, String url, String mimeType) {
    this.type = type;
    this.url = url;
    this.mimeType = mimeType;
  }

  /**
   * Gets the cache type, which can be any of the resource types listed in
   * {@link AppCacheType}
   *
   * @return {@link AppCacheType}
   */
  public AppCacheType getType() {
    return type;
  }

  /**
   * Gets a String representation of the URL which identifies the cache resource.
   *
   * @return The URL of the cache resource
   */
  public String getUrl() {
    return url;
  }

  /**
   * Gets String representation of the Mime type the cache resource is labeled with.
   *
   * @return Mime type of the cache resource
   */
  public String getMimeType() {
    return mimeType;
  }

  /**
   * Gets a human readable String representation of the cache entry.
   *
   * @return A human readable String.
   */
  @Override
  public String toString() {
    return "CacheEntry [mimeType=" + mimeType + ", type=" + type
        + ", url=" + url + "]";
  }
}
