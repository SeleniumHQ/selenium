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

package org.openqa.selenium.docker;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;

// https://docs.docker.com/engine/api/v1.41/#operation/SystemVersion
class VersionCommandTest {

  @Test
  void ifDockerIsDownReturnEmpty() {
    HttpHandler handler =
        req -> {
          throw new UncheckedIOException(new IOException("Eep"));
        };

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isNotPresent();
  }

  @Test
  void shouldReturnEmptyIfServerReturnsAnUnsuccessfulResponseStatus() {
    HttpHandler handler = req -> new HttpResponse().setStatus(HTTP_INTERNAL_ERROR);

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isNotPresent();
  }

  @Test
  void shouldReturnEmptyIfServerDoesNotSupportOurVersionOfTheDockerApi() {
    // We only support v1.40+
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                .setContent(utf8String("{\"ApiVersion\":\"1.12\",\"MinAPIVersion\":\"1.2\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isNotPresent();
  }

  @Test
  void shouldReturnEmptyIfServerVersionOfDockerApiIsHigherThanAnyWeSupport() {
    // I sincerely hope that there is no version "9999999" of the docker protocol.
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                .setContent(
                    utf8String("{\"ApiVersion\":\"9999999.12\",\"MinAPIVersion\":\"9999999.0\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isNotPresent();
  }

  @Test
  void shouldReturnADockerInstanceIfTheVersionOfTheApiSupportedIsOneSeleniumAlsoSupports() {
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                // Note: the version here does not exactly match any we claim to provide
                .setContent(utf8String("{\"ApiVersion\":\"1.42\",\"MinAPIVersion\":\"1.12\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isPresent();
    assertThat(maybeDocker.get().version()).isEqualTo("1.40");
  }

  @Test
  void shouldSupportDockerEngine290WithApi152() {
    // Docker Engine 29.0 uses API version 1.52 (max) and 1.44 (min)
    // Should select 1.48 as it's within the supported range [1.44, 1.52]
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                .setContent(utf8String("{\"ApiVersion\":\"1.52\",\"MinAPIVersion\":\"1.44\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isPresent();
    assertThat(maybeDocker.get().version()).isEqualTo("1.48");
  }

  @Test
  void shouldSupportDockerEngine250WithApi144() {
    // Docker Engine 25.0 uses API version 1.44 (max) and 1.24 (min)
    // Should select 1.44 as it matches exactly
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                .setContent(utf8String("{\"ApiVersion\":\"1.44\",\"MinAPIVersion\":\"1.24\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isPresent();
    assertThat(maybeDocker.get().version()).isEqualTo("1.44");
  }

  @Test
  void shouldSupportDockerEngine2010WithApi140() {
    // Docker Engine 20.10 uses API version 1.41 (max) and 1.12 (min)
    // Should select 1.40 as it's within the supported range [1.12, 1.41]
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                .setContent(utf8String("{\"ApiVersion\":\"1.41\",\"MinAPIVersion\":\"1.12\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isPresent();
    assertThat(maybeDocker.get().version()).isEqualTo("1.40");
  }

  @Test
  void shouldSupportDockerEngine1903WithApi140() {
    // Docker Engine 19.03 uses API version 1.40 (max) and 1.12 (min)
    // Should select 1.40 as it matches exactly
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                .setContent(utf8String("{\"ApiVersion\":\"1.40\",\"MinAPIVersion\":\"1.12\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isPresent();
    assertThat(maybeDocker.get().version()).isEqualTo("1.40");
  }

  @Test
  void shouldSupportDockerEngine280WithApi148() {
    // Docker Engine 28.0 uses API version 1.48 (max) and 1.24 (min)
    // Should select 1.48 as it matches exactly
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                .setContent(utf8String("{\"ApiVersion\":\"1.48\",\"MinAPIVersion\":\"1.24\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isPresent();
    assertThat(maybeDocker.get().version()).isEqualTo("1.48");
  }

  @Test
  void shouldSupportDockerEngine290WithApi150() {
    // Docker Engine 29.0 uses API version 1.50 (max) and 1.24 (min)
    // Should select 1.48 as it's the highest supported version within range
    HttpHandler handler =
        req ->
            new HttpResponse()
                .addHeader("Content-Type", "application/json")
                .setContent(utf8String("{\"ApiVersion\":\"1.50\",\"MinAPIVersion\":\"1.24\"}"));

    Optional<DockerProtocol> maybeDocker = new VersionCommand(handler).getDockerProtocol();

    assertThat(maybeDocker).isPresent();
    assertThat(maybeDocker.get().version()).isEqualTo("1.48");
  }
}
