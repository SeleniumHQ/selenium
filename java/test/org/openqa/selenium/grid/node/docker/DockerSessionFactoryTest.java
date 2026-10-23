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

package org.openqa.selenium.grid.node.docker;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import java.net.URI;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.docker.Docker;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

@Tag("UnitTests")
class DockerSessionFactoryTest {

  private static final Capabilities RECORDING_CAPS =
      new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true);

  /** Stubs the inherited Node environment so the tests do not depend on the test runner's own. */
  private static class TestFactory extends DockerSessionFactory {

    private final Map<String, String> inheritedEnvVars;

    TestFactory(Image videoImage, Map<String, String> inheritedEnvVars) {
      super(
          mock(Tracer.class),
          mock(HttpClient.Factory.class),
          Duration.ofMinutes(5),
          Duration.ofSeconds(120),
          new Docker(req -> new HttpResponse()),
          URI.create("http://localhost:2375"),
          mock(Image.class),
          new ImmutableCapabilities("browserName", "chrome"),
          List.of(),
          videoImage,
          new DockerAssetsPath("/opt/selenium/assets", "/opt/selenium/assets"),
          "grid-network",
          true,
          caps -> true,
          Map.of(),
          List.of(),
          Map.of(),
          Duration.ofSeconds(10));
      this.inheritedEnvVars = inheritedEnvVars;
    }

    @Override
    Map<String, String> getBrowserContainerEnvVars(Capabilities sessionCapabilities) {
      return new HashMap<>(inheritedEnvVars);
    }
  }

  @Test
  void inlineRecordingAlwaysWritesToASessionSubfolder() {
    DockerSessionFactory factory = new TestFactory(null, Map.of());

    Map<String, String> envVars = factory.createBrowserContainerEnvVars(RECORDING_CAPS);

    assertThat(envVars).containsEntry("SE_RECORD_VIDEO", "true");
    assertThat(envVars).containsEntry("SE_VIDEO_RECORD_STANDALONE", "true");
    assertThat(envVars).containsEntry("SE_VIDEO_SESSION_SUBFOLDER", "true");
    assertThat(envVars).containsEntry("SE_VIDEO_FILE_NAME", "auto");
  }

  @Test
  void inlineRecordingOverridesAnInheritedSubfolderOptOut() {
    // The browser container binds the assets root, so a flat layout would scatter every session's
    // video into it.
    DockerSessionFactory factory =
        new TestFactory(null, Map.of("SE_VIDEO_SESSION_SUBFOLDER", "false"));

    Map<String, String> envVars = factory.createBrowserContainerEnvVars(RECORDING_CAPS);

    assertThat(envVars).containsEntry("SE_VIDEO_SESSION_SUBFOLDER", "true");
  }

  @Test
  void inlineRecordingOverridesAnInheritedFixedFileName() {
    // video.sh only creates the session subfolder on its dynamic naming path, so a fixed name
    // would silently disable the subfolder.
    DockerSessionFactory factory = new TestFactory(null, Map.of("SE_VIDEO_FILE_NAME", "video.mp4"));

    Map<String, String> envVars = factory.createBrowserContainerEnvVars(RECORDING_CAPS);

    assertThat(envVars).containsEntry("SE_VIDEO_FILE_NAME", "auto");
    assertThat(envVars).containsEntry("SE_VIDEO_SESSION_SUBFOLDER", "true");
  }

  @Test
  void noVideoEnvVarsWhenSessionDoesNotRecord() {
    DockerSessionFactory factory = new TestFactory(null, Map.of());

    Map<String, String> envVars =
        factory.createBrowserContainerEnvVars(new ImmutableCapabilities("browserName", "chrome"));

    assertThat(envVars).doesNotContainKey("SE_RECORD_VIDEO");
    assertThat(envVars).doesNotContainKey("SE_VIDEO_SESSION_SUBFOLDER");
    assertThat(envVars).doesNotContainKey("SE_VIDEO_FILE_NAME");
  }

  @Test
  void videoContainerDoesNotInheritTheSessionSubfolderSetting() {
    // The video container's bind mount is already per-session, so a "true" inherited from the Node
    // would nest twice. The value is pinned blank, which nothing inherited can survive, and which
    // leaves the image's own default in charge.
    Image videoImage = mock(Image.class);
    DockerSessionFactory factory = new TestFactory(videoImage, Map.of());

    Map<String, String> envVars = factory.getVideoContainerEnvVars(RECORDING_CAPS, "10.0.0.5");

    assertThat(envVars).containsEntry("SE_VIDEO_SESSION_SUBFOLDER", "");
  }
}
