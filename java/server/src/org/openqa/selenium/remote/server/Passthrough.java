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

package org.openqa.selenium.remote.server;

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableSet;
import com.google.common.io.CharStreams;
import com.google.common.net.MediaType;

import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.Objects;
import java.util.logging.Logger;

class Passthrough implements SessionCodec {

  private final static Logger LOG = Logger.getLogger(Passthrough.class.getName());

  private final static ImmutableSet<String> IGNORED_REQ_HEADERS = ImmutableSet.<String>builder()
      .add("connection")
      .add("keep-alive")
      .add("proxy-authorization")
      .add("proxy-authenticate")
      .add("proxy-connection")
      .add("te")
      .add("trailer")
      .add("transfer-encoding")
      .add("upgrade")
      .build();

  private final URL upstream;

  public Passthrough(URL upstream) {
    this.upstream = upstream;
  }

  @Override
  public void handle(HttpRequest req, HttpResponse resp) throws IOException {
    URL target = new URL(upstream.toExternalForm() + req.getUri());
    HttpURLConnection connection = (HttpURLConnection) target.openConnection();
    connection.setInstanceFollowRedirects(true);
    connection.setRequestMethod(req.getMethod().toString());
    connection.setDoInput(true);
    connection.setDoOutput(true);
    connection.setUseCaches(false);

    for (String name : req.getHeaderNames()) {
      if (IGNORED_REQ_HEADERS.contains(name.toLowerCase())) {
        continue;
      }

      for (String value : req.getHeaders(name)) {
        connection.addRequestProperty(name, value);
      }
    }
    // None of this "keep alive" nonsense.
    connection.setRequestProperty("Connection", "close");

    if (POST == req.getMethod()) {
      // We always transform to UTF-8 on the way up.
      String contentType = req.getHeader("Content-Type");
      contentType = contentType == null ? JSON_UTF_8.toString() : contentType;

      MediaType type = MediaType.parse(contentType);
      connection.setRequestProperty("Content-Type", type.withCharset(UTF_8).toString());

      Charset charSet = req.getContentEncoding();

      StringWriter logWriter = new StringWriter();
      try (
          InputStream is = req.consumeContentStream();
          Reader reader = new InputStreamReader(is, charSet);
          Reader in = new TeeReader(reader, logWriter);
          OutputStream os = connection.getOutputStream();
          Writer out = new OutputStreamWriter(os, UTF_8)) {
        CharStreams.copy(in, out);
      }
      LOG.info("To upstream: " + logWriter.toString());
    }

    resp.setStatus(connection.getResponseCode());
    // clear response defaults.
    resp.setHeader("Date",null);
    resp.setHeader("Server",null);

    connection.getHeaderFields().entrySet().stream()
        .filter(entry -> entry.getKey() != null && entry.getValue() != null)
        .filter(entry -> !IGNORED_REQ_HEADERS.contains(entry.getKey().toLowerCase()))
        .forEach(entry -> {
          entry.getValue().stream()
              .filter(Objects::nonNull)
              .forEach(value -> resp.addHeader(entry.getKey(), value));
        });
    InputStream in = connection.getErrorStream();
    if (in == null) {
      in = connection.getInputStream();
    }

    String charSet = connection.getContentEncoding() != null ? connection.getContentEncoding() : UTF_8.name();
     try (Reader reader = new InputStreamReader(in, charSet)) {
      String content = CharStreams.toString(reader);
      LOG.info("To downstream: " + content);
      resp.setContent(content.getBytes(charSet));
    } finally {
      in.close();
    }
  }
}
