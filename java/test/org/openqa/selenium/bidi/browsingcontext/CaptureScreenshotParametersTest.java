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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CaptureScreenshotParametersTest {
  @Test
  void stringRepresentation() {
    assertThat(new CaptureScreenshotParameters()).hasToString("CaptureScreenshotParameters{}");
    assertThat(
            new CaptureScreenshotParameters()
                .clip(new BoxClipRectangle(200, 100, 1024, 768))
                .toString())
        .contains(
            "CaptureScreenshotParameters{clip={",
            "type=box",
            "x=200.0",
            "y=100.0",
            "width=1024.0",
            "height=768.0");

    assertThat(
            new CaptureScreenshotParameters().clip(new ElementClipRectangle("sha-id")).toString())
        .contains("CaptureScreenshotParameters{clip={", "type=element", "sharedId=sha-id");

    assertThat(
            new CaptureScreenshotParameters()
                .clip(new ElementClipRectangle("sha-id-123", "handle-456"))
                .toString())
        .contains(
            "CaptureScreenshotParameters{clip={",
            "type=element",
            "sharedId=sha-id-123",
            "handle=handle-456");
  }
}
