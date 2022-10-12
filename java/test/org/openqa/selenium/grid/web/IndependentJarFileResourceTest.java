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

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class IndependentJarFileResourceTest {

  private Path target;

  @BeforeEach
  void downloadJar() throws IOException {
    String endpoint = "https://github.com/SeleniumHQ/selenium/releases/download/selenium-4.5.0/selenium-server-4.5.0.jar";
    URL url = new URL(endpoint);
    ReadableByteChannel readableByteChannel = Channels.newChannel(url.openStream());
    target = Files.createTempFile("test", "jar");
    target.toFile().deleteOnExit();
    try (FileOutputStream fileOutputStream = new FileOutputStream(target.toFile())) {
      fileOutputStream.getChannel()
        .transferFrom(readableByteChannel, 0, Long.MAX_VALUE);
    }
  }

  @Test
  void testCapabilities() throws IOException {
    assertThat(target.toFile()).exists();
    assertThat(Files.size(target)).isNotZero();
    IndependentJarFileResource resource = new IndependentJarFileResource(target.toFile(),
    "/javascript/grid-ui/build", "");
    assertThat(resource.isDirectory()).isTrue();
    assertThat(resource.list()).isNotEmpty();

    Optional<Resource> staticResource = resource.get("static");
    assertThat(staticResource.isPresent()).isTrue();
    assertThat(staticResource.get().isDirectory()).isTrue();
    assertThat(staticResource.get().list()).isNotEmpty();

    Optional<Resource> indexHtml = resource.get("index.html");
    assertThat(indexHtml.isPresent()).isTrue();
    Resource index = indexHtml.get();
    assertThat(index.isDirectory()).isFalse();
    assertThat(index.read().isPresent()).isTrue();
    assertThat(new String(index.read().get())).contains("<title>Selenium Grid</title>");
  }

}
