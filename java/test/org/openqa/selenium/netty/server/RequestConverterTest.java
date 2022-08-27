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

package org.openqa.selenium.netty.server;

import io.netty.channel.embedded.EmbeddedChannel;
import io.netty.handler.codec.http.DefaultFullHttpRequest;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpVersion;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.HttpRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class RequestConverterTest {

  @Test
  public void canConvertASimpleRequest() {
    RequestConverter converter = new RequestConverter();

    EmbeddedChannel channel = new EmbeddedChannel(converter);

    FullHttpRequest httpRequest = new DefaultFullHttpRequest(
      HttpVersion.HTTP_1_1, HttpMethod.GET, "/cheese");
    httpRequest.headers().add("How-Good", "Delicious");

    assertThat(channel.writeInbound(httpRequest)).isTrue();
    HttpRequest req = channel.readInbound();
    assertThat(req.getMethod()).isEqualTo(GET);
    assertThat(req.getUri()).isEqualTo("/cheese");
    assertThat(req.getHeader("How-Good")).isEqualTo("Delicious");
  }

  @Test
  public void returnsAnErrorForUnhandledMethods() {
    RequestConverter converter = new RequestConverter();

    EmbeddedChannel channel = new EmbeddedChannel(converter);

    FullHttpRequest httpRequest = new DefaultFullHttpRequest(
      HttpVersion.HTTP_1_1, HttpMethod.PATCH, "/cheese");

    assertThat(channel.writeInbound(httpRequest)).isFalse();
    FullHttpResponse res = channel.readOutbound();

    assertThat(res.status()).isEqualTo(HttpResponseStatus.METHOD_NOT_ALLOWED);
  }

}
