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

import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import com.google.common.base.Splitter;

import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UploadHandler implements HttpHandler {

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    HttpResponse res = new HttpResponse();
    res.setHeader("Content-Type", "text/html");
    res.setStatus(HTTP_OK);

    StringBuilder content = new StringBuilder();

    // I mean. Seriously. *sigh*
    try {
      String decoded = URLDecoder.decode(
          string(req),
          Charset.defaultCharset().displayName());

      String[] splits = decoded.split("\r\n");

      // First line is the boundary marker
      String boundary = splits[0];
      List<Map<String, Object>> allParts = new ArrayList<>();
      Map<String, Object> values = new HashMap<>();
      boolean inHeaders = true;
      for (int i = 1; i < splits.length; i++) {
        if ("".equals(splits[i])) {
          inHeaders = false;
          continue;
        }

        if (splits[i].startsWith(boundary)) {
          inHeaders = true;
          allParts.add(values);
          continue;
        }

        if (inHeaders && splits[i].toLowerCase().startsWith("content-disposition:")) {
          for (String keyValue : Splitter.on(';').trimResults().omitEmptyStrings().split(splits[i])) {
            Matcher matcher = Pattern.compile("(\\S+)\\s*=.*\"(.*?)\".*").matcher(keyValue);
            if (matcher.find()) {
              values.put(matcher.group(1), matcher.group(2));
            }
          };
        } else if (!inHeaders) {
          String c = (String) values.getOrDefault("content", "");
          c += splits[i];
          values.put("content", c);
        }
      }

      Object value = allParts.stream()
          .filter(map -> "upload".equals(map.get("name")))
          .findFirst()
          .map(map -> map.get("content"))
          .orElseThrow(() -> new RuntimeException("Cannot find uploaded data"));

      content.append(value);
    } catch (UnsupportedEncodingException e) {
      throw new UncheckedIOException(e);
    }

    // Slow down the upload so we can verify WebDriver waits.
    try {
      Thread.sleep(2500);
    } catch (InterruptedException ignored) {
    }

    content.append("<script>window.top.window.onUploadDone();</script>");

    res.setContent(utf8String(content.toString()));

    return res;
  }
}
