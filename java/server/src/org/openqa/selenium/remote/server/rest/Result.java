/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote.server.rest;

/**
 * A container for the MIME type and renderer of a given result type. Several Result objects can
 * exist for each ResultType. The created Result instances are stored in ResultConfig and are mapped
 * to a specific ResultType.
 */
public class Result {

  private final String mimeType;
  private final Renderer renderer;
  private final boolean onlyForExactMatch;

  public Result(String mimeType, Renderer renderer) {
    this(mimeType, renderer, false);
  }

  public Result(String mimeType, Renderer renderer, boolean onlyForExactMatch) {
    this.mimeType = mimeType;
    this.renderer = renderer;
    this.onlyForExactMatch = onlyForExactMatch;
  }

  public boolean isExactMimeTypeMatch(String contentType) {
    // Not the world's best heuristic.
    if (contentType == null) {
      return false;
    }

    String[] types = contentType.split("[,;]");
    for (String type : types) {
      if (mimeType.equals(type)) {
        return true;
      }
    }
    return false;
  }

  public boolean isOnlyForExactMatch() {
    return onlyForExactMatch;
  }

  public Renderer getRenderer() {
    return renderer;
  }

  public String getMimeType() {
    return mimeType;
  }

  @Override
  public String toString() {
    return String.format("Result: %s -> %s", mimeType, renderer.getClass());
  }
}
