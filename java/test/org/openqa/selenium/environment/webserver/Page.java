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

package org.openqa.selenium.environment.webserver;

import org.jspecify.annotations.Nullable;

public class Page {

  private String title = "";
  private String[] scripts = {};
  private String[] styles = {};
  private String[] bodyParts = {};
  private @Nullable String onLoad;
  private @Nullable String onBeforeUnload;
  private boolean doctype = false;

  public Page withTitle(String title) {
    this.title = title;
    return this;
  }

  public Page withScripts(String... scripts) {
    this.scripts = scripts;
    return this;
  }

  public Page withStyles(String... styles) {
    this.styles = styles;
    return this;
  }

  public Page withBody(String... bodyParts) {
    this.bodyParts = bodyParts;
    return this;
  }

  public Page withOnLoad(String onLoad) {
    this.onLoad = onLoad;
    return this;
  }

  public Page withOnBeforeUnload(String onBeforeUnload) {
    this.onBeforeUnload = onBeforeUnload;
    return this;
  }

  /**
   * Opt-in to a standards-mode document shape: a leading {@code <!DOCTYPE html>} and the {@code
   * <script>}/{@code <style>} blocks moved inside {@code <head>}, instead of after it closes.
   * Layout-sensitive tests should use this to get deterministic parsing/quirks-mode behavior;
   * default output is unchanged for backward compatibility with existing callers.
   */
  public Page withDoctype() {
    this.doctype = true;
    return this;
  }

  public String toString() {
    String body =
        String.format(
            "<body %s %s>",
            onLoad == null ? "" : String.format("onload='%s'", onLoad),
            onBeforeUnload == null ? "" : String.format("onbeforeunload='%s'", onBeforeUnload));

    if (doctype) {
      return String.join(
          "\n",
          "<!DOCTYPE html>",
          "<html>",
          "<head>",
          String.format("<title>%s</title>", title),
          "<script type='text/javascript'>",
          String.join("\n", scripts),
          "</script>",
          "<style>",
          String.join("\n", styles),
          "</style>",
          "</head>",
          body,
          String.join("\n", bodyParts),
          "</body>",
          "</html>");
    }

    return String.join(
        "\n",
        "<html>",
        "<head>",
        String.format("<title>%s</title>", title),
        "</head>",
        "<script type='text/javascript'>",
        String.join("\n", scripts),
        "</script>",
        "<style>",
        String.join("\n", styles),
        "</style>",
        body,
        String.join("\n", bodyParts),
        "</body>",
        "</html>");
  }
}
