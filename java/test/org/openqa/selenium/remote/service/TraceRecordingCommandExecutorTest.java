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

package org.openqa.selenium.remote.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.Proxy;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.remote.http.ClientConfig;

@Tag("UnitTests")
class TraceRecordingCommandExecutorTest {

  @Test
  void findsProxyUrlAmongLogLines() {
    String output =
        "[2026-11-19T13:51:43.824Z DEBUG] Starting driver in pipe mode: /usr/bin/chromedriver\r\n"
            + "{\"driver_path\":\"/usr/bin/chromedriver\",\"proxy_url\":\"http://127.0.0.1:43341\"}\n"
            + "[2026-11-19T13:51:43.863Z DEBUG] Pipe mode proxy listening\n";

    assertThat(TraceRecordingCommandExecutor.findProxyUrl(output))
        .isEqualTo("http://127.0.0.1:43341");
  }

  @Test
  void ignoresOutputWithoutAValidReadyLine() {
    assertThat(TraceRecordingCommandExecutor.findProxyUrl("")).isNull();
    assertThat(TraceRecordingCommandExecutor.findProxyUrl("[INFO] proxy_url not yet\n")).isNull();
    assertThat(TraceRecordingCommandExecutor.findProxyUrl("{\"proxy_url\": broken")).isNull();
  }

  @Test
  void findsTraceErrorAmongLogLines() {
    String output =
        "[2026-11-20T11:37:24.846Z WARN] Unable to save trace: disk full\n"
            + "{\"trace_error\":\"disk full\"}\n";

    assertThat(TraceRecordingCommandExecutor.findTraceError(output)).isEqualTo("disk full");
  }

  @Test
  void noTraceErrorWhenAbsent() {
    String output = "{\"proxy_url\":\"http://127.0.0.1:43341\"}\n[INFO] Trace saved to t.zip\n";

    assertThat(TraceRecordingCommandExecutor.findTraceError(output)).isNull();
  }

  @Test
  void upstreamArgumentHasNoUserInfo() throws MalformedURLException {
    URL remote = new URL("https://me%40corp.com:s3cret@hub.example.com:443/wd/hub");

    assertThat(TraceRecordingCommandExecutor.withoutUserInfo(remote))
        .isEqualTo("https://hub.example.com:443/wd/hub");
  }

  @Test
  void upstreamAuthorizationComesFromUserInfo() throws MalformedURLException {
    URL remote = new URL("https://me%40corp.com:s3cret@hub.example.com/wd/hub");

    assertThat(
            TraceRecordingCommandExecutor.basicAuthorization(remote, ClientConfig.defaultConfig()))
        .isEqualTo(basic("me@corp.com:s3cret"));
  }

  @Test
  void upstreamAuthorizationComesFromClientCredentials() throws MalformedURLException {
    URL remote = new URL("https://hub.example.com/wd/hub");
    ClientConfig config =
        ClientConfig.defaultConfig().authenticateAs(new UsernameAndPassword("u", "p"));

    assertThat(TraceRecordingCommandExecutor.basicAuthorization(remote, config))
        .isEqualTo("Basic dTpw");
    assertThat(
            TraceRecordingCommandExecutor.basicAuthorization(remote, ClientConfig.defaultConfig()))
        .isNull();
  }

  @Test
  void proxyArgumentComesFromClientConfig() {
    Proxy proxy =
        new Proxy(Proxy.Type.HTTP, InetSocketAddress.createUnresolved("proxy.corp", 3128));

    assertThat(
            TraceRecordingCommandExecutor.proxyArgument(ClientConfig.defaultConfig().proxy(proxy)))
        .isEqualTo("http://proxy.corp:3128");
    assertThat(TraceRecordingCommandExecutor.proxyArgument(ClientConfig.defaultConfig())).isNull();
  }

  private static String basic(String userAndPassword) {
    return "Basic "
        + Base64.getEncoder().encodeToString(userAndPassword.getBytes(StandardCharsets.UTF_8));
  }
}
