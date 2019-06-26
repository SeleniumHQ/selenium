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

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.network.model.LoaderId;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/**
 * Information about the Frame on the page.
 */
public class Frame {

  /**
   * Frame unique identifier.
   */
  private final String id;
  /**
   * Identifier of the loader associated with this frame.
   */
  private final LoaderId loaderId;
  /**
   * Frame document's security origin.
   */
  private final String securityOrigin;
  /**
   * Frame document's mimeType as determined by the browser.
   */
  private final String mimeType;

  // Optionals
  /**
   * Parent frame identifier.
   */
  private final String parentId;
  /**
   * Frame's name as specified in the tag.
   */
  private final String name;
  /**
   * Frame document's URL fragment including the '#'.
   */
  @Beta
  private final String urlFragment;
  /**
   * If the frame failed to load, this contains the URL that could not be loaded. Note that unlike
   * url above, this URL may contain a fragment.
   */
  @Beta
  private final String unreachableUrl;

  public Frame(
      String id,
      LoaderId loaderId,
      String securityOrigin,
      String mimeType,
      String parentId,
      String name,
      String urlFragment,
      String unreachableUrl) {
    this.id = Objects.requireNonNull(id, "Id is required");
    this.loaderId = Objects.requireNonNull(loaderId, "loaderId is required");
    this.securityOrigin = Objects.requireNonNull(securityOrigin, "securityOrigin is required");
    this.mimeType = Objects.requireNonNull(mimeType, "mimeType is required");
    // Optionals
    this.parentId = parentId;
    this.name = name;
    this.urlFragment = urlFragment;
    this.unreachableUrl = unreachableUrl;
  }

  private static Frame fromJson(JsonInput input) {

    LoaderId loaderId = null;
    String id = null,
        securityOrigin = null,
        mimeType = null,
        parentId = null,
        name = null,
        urlFragment = null,
        unreachableUrl = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "id":
          id = input.nextString();
          break;
        case "loaderId":
          loaderId = input.read(LoaderId.class);
          break;
        case "securityOrigin":
          securityOrigin = input.nextString();
          break;
        case "mimeType":
          mimeType = input.nextString();
          break;
        case "parentId":
          parentId = input.nextString();
          break;
        case "name":
          name = input.nextString();
          break;
        case "urlFragment":
          urlFragment = input.nextString();
          break;
        case "unreachableUrl":
          unreachableUrl = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new Frame(
        id, loaderId, securityOrigin, mimeType, parentId, name, urlFragment, unreachableUrl);
  }
}
