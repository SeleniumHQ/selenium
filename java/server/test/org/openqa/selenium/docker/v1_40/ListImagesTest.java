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

package org.openqa.selenium.docker.v1_40;

import org.junit.Test;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.docker.ImageId;
import org.openqa.selenium.docker.internal.Reference;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Map;
import java.util.Set;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;

public class ListImagesTest {

  @Test
  public void shouldReturnImageIfTagIsPresent() {

    HttpHandler handler = req -> {
      String filters = req.getQueryParameter("filters");
      try {
        String decoded = URLDecoder.decode(filters, "UTF-8");
        Map<String, Object> raw = new Json().toType(decoded, MAP_TYPE);

        Map<?, ?> rawRef = (Map<?, ?>) raw.get("reference");
        assertThat(rawRef.get("selenium/standalone-firefox:latest")).isEqualTo(true);

        return new HttpResponse()
            .addHeader("Content-Type", "application/json")
            .setContent(Contents.utf8String(
                "[{\"Containers\":-1,\"Created\":1581716253," +
                "\"Id\":\"sha256:bc24341497a00a3afbf04c518cb4bf98834d933ae331d1c5d3cd6f52c079049e\","
                +
                "\"Labels\":{\"authors\":\"SeleniumHQ\"},\"ParentId\":\"\"," +
                "\"RepoDigests\":null," +
                "\"RepoTags\":[\"selenium/standalone-firefox:latest\"]," +
                "\"SharedSize\":-1,\"Size\":765131593,\"VirtualSize\":765131593}]"));
      } catch (UnsupportedEncodingException ignore) {
        return null;
      }
    };

    Reference reference = Reference.parse(
      "selenium/standalone-firefox:latest");

    Set<Image> images = new ListImages(handler).apply(reference);

    assertThat(images.size()).isEqualTo(1);
    Image image = images.iterator().next();

    assertThat(image.getId())
      .isEqualTo(new ImageId("sha256:bc24341497a00a3afbf04c518cb4bf98834d933ae331d1c5d3cd6f52c079049e"));
  }
}
