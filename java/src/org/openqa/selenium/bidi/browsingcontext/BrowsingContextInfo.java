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

package org.openqa.selenium.bidi.browsingcontext;

import static org.openqa.selenium.bidi.browsingcontext.BrowsingContext.LIST_OF_BROWSING_CONTEXT_INFO;

import java.util.List;
import org.openqa.selenium.json.JsonInput;

public class BrowsingContextInfo {

  private final String id;

  private final String url;

  private final List<BrowsingContextInfo> children;

  private final String parentBrowsingContext;

  public String getId() {
    return id;
  }

  public String getUrl() {
    return url;
  }

  public List<BrowsingContextInfo> getChildren() {
    return children;
  }

  public String getParentBrowsingContext() {
    return parentBrowsingContext;
  }

  public BrowsingContextInfo(
      String id, String url, List<BrowsingContextInfo> children, String parentBrowsingContext) {
    this.id = id;
    this.url = url;
    this.children = children;
    this.parentBrowsingContext = parentBrowsingContext;
  }

  public static BrowsingContextInfo fromJson(JsonInput input) {
    String id = null;
    String url = null;
    List<BrowsingContextInfo> children = null;
    String parentBrowsingContext = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "context":
          id = input.read(String.class);
          break;

        case "url":
          url = input.read(String.class);
          break;

        case "children":
          children = input.read(LIST_OF_BROWSING_CONTEXT_INFO);
          break;

        case "parent":
          parentBrowsingContext = input.read(String.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new BrowsingContextInfo(id, url, children, parentBrowsingContext);
  }
}
