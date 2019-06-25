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

public class JavascriptDialogOpening {

  /**
   * Frame url.
   */
  private final String url;
  /**
   * Message that will be displayed by the dialog.
   */
  private final String message;
  /**
   * Dialog type.
   */
  private final DialogType type;
  /**
   * True iff browser is capable showing or acting on the given dialog. When browser has no dialog
   * handler for given target, calling alert while Page domain is engaged will stall the page
   * execution. Execution can be resumed via calling Page.handleJavaScriptDialog.
   */
  private final boolean hasBrowserHandler;
  /**
   * Default dialog prompt.
   */
  private final String defaultPrompt;

  public JavascriptDialogOpening(
      String url,
      String message,
      DialogType type,
      boolean hasBrowserHandler,
      String defaultPrompt) {
    this.url = Objects.requireNonNull(url, "url is required");
    this.message = Objects.requireNonNull(message, "message is required");
    this.type = Objects.requireNonNull(type, "type is required");
    this.hasBrowserHandler = hasBrowserHandler;
    this.defaultPrompt = defaultPrompt;
  }

  private static JavascriptDialogOpening fromJson(JsonInput input) {
    String url = input.nextString();
    String message = null, defaultPrompt = null;
    DialogType type = null;
    Boolean hasBrowserHandler = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "message":
          message = input.nextString();
          break;
        case "defaultPrompt":
          defaultPrompt = input.nextString();
          break;
        case "type":
          type = DialogType.getDialogType(input.nextString());
          break;
        case "hasBrowserHandler":
          hasBrowserHandler = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new JavascriptDialogOpening(url, message, type, hasBrowserHandler, defaultPrompt);
  }
}
