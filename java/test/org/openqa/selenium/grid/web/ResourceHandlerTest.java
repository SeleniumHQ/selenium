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

package org.openqa.selenium.grid.web;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static java.net.HttpURLConnection.HTTP_MOVED_TEMP;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class ResourceHandlerTest {

  @TempDir
  File folder;
  private Path base;

  @BeforeEach
  public void getPath() throws IOException {
    this.base = folder.toPath();
  }

  @Test
  public void shouldLoadContent() throws IOException {
    Files.write(base.resolve("content.txt"), "I like cheese".getBytes(UTF_8));

    HttpHandler handler = new ResourceHandler(new PathResource(base));
    HttpResponse res = handler.execute(new HttpRequest(GET, "/content.txt"));

    assertThat(Contents.string(res)).isEqualTo("I like cheese");
  }

  @Test
  public void shouldRedirectIfDirectoryButPathDoesNotEndInASlash() throws IOException {
    Path dir = base.resolve("cheese");

    Files.createDirectories(dir);

    HttpHandler handler = new ResourceHandler(new PathResource(base));
    HttpResponse res = handler.execute(new HttpRequest(GET, "/cheese"));

    assertThat(res.getStatus()).isEqualTo(HTTP_MOVED_TEMP);
    assertThat(res.getHeader("Location")).endsWith("/cheese/");
  }

  @Test
  public void shouldLoadAnIndexPage() throws IOException {
    Path subdir = base.resolve("subdir");
    Files.createDirectories(subdir);

    Files.write(subdir.resolve("1.txt"), new byte[0]);
    Files.write(subdir.resolve("2.txt"), new byte[0]);

    HttpHandler handler = new ResourceHandler(new PathResource(base));
    HttpResponse res = handler.execute(new HttpRequest(GET, "/subdir/"));

    String text = Contents.string(res);
    assertThat(text).contains("1.txt");
    assertThat(text).contains("2.txt");
  }

  @Test
  public void canBeNestedWithinARoute() throws IOException {
    Path contents = base.resolve("cheese").resolve("cake.txt");

    Files.createDirectories(contents.getParent());
    Files.write(contents, "delicious".getBytes(UTF_8));

    HttpHandler handler = Route.prefix("/peas").to(Route.combine(new ResourceHandler(new PathResource(base))));

    // Check redirect works as expected
    HttpResponse res = handler.execute(new HttpRequest(GET, "/peas/cheese"));
    assertThat(res.getStatus()).isEqualTo(HTTP_MOVED_TEMP);
    assertThat(res.getHeader("Location")).isEqualTo("/peas/cheese/");

    // And now that content can be read
    res = handler.execute(new HttpRequest(GET, "/peas/cheese/cake.txt"));
    assertThat(res.getStatus()).isEqualTo(HTTP_OK);
    assertThat(Contents.string(res)).isEqualTo("delicious");
  }

  @Test
  public void shouldRedirectToIndexPageIfOneExists() throws IOException {
    Path index = base.resolve("index.html");
    Files.write(index, "Cheese".getBytes(UTF_8));

    ResourceHandler handler = new ResourceHandler(new PathResource(base));
    HttpResponse res = handler.execute(new HttpRequest(GET, "/"));

    assertThat(res.isSuccessful()).isTrue();

    String content = Contents.string(res);
    assertThat(content).isEqualTo("Cheese");
  }
}
