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
package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/**
 * Navigation history entry.
 */
public class NavigationEntry {

  /**
   * Unique id of the navigation history entry.
   */
  private final int id;
  /**
   * URL of the navigation history entry.
   */
  private final String url;
  /**
   * URL that the user typed in the url bar.
   */
  private final String userTypedURL;
  /**
   * Title of the navigation history entry.
   */
  private final String title;
  /**
   * Transition type.
   */
  private final TransitionType transitionType;

  public NavigationEntry(Integer id, String url, String userTypedURL, String title,
                         TransitionType transitionType) {
    this.id = Objects.requireNonNull(id, "Id is required");
    this.url = Objects.requireNonNull(url, "url is required");
    this.userTypedURL = Objects.requireNonNull(userTypedURL, "userTypedURL is required");
    this.title = Objects.requireNonNull(title, "title is required");
    this.transitionType = Objects.requireNonNull(transitionType, "transitionType is required");
  }

  private static NavigationEntry fromJson(JsonInput input) {
    Integer id = null;
    String url = null, userTypedURL = null, title = null;
    TransitionType transitionType = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "id":
          id = input.read(Integer.class);
          break;
        case "url":
          url = input.nextString();
          break;
        case "userTypedURL":
          userTypedURL = input.nextString();
          break;
        case "title":
          title = input.nextString();
          break;
        case "transitionType":
          transitionType = TransitionType.getTransitionType(input.nextString());
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new NavigationEntry(id, url, userTypedURL, title, transitionType);
  }
}
