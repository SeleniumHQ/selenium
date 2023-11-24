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

public class Page {

  private String title = "";
  private String[] scripts = {};
  private String[] styles = {};
  private String[] bodyParts = {};
  private String onLoad;
  private String onBeforeUnload;

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

  public String toString() {
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
        String.format(
            "<body %s %s>",
            onLoad == null ? "" : String.format("onload='%s'", onLoad),
            onBeforeUnload == null ? "" : String.format("onbeforeunload='%s'", onBeforeUnload)),
        String.join("\n", bodyParts),
        "</body>",
        "</html>");
  }
}
