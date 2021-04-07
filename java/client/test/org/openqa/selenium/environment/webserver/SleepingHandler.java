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

import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;

import static org.openqa.selenium.remote.http.Contents.utf8String;

public class SleepingHandler implements HttpHandler {

  private static final String RESPONSE_STRING_FORMAT =
      "<html><head><title>Done</title></head><body>Slept for %ss</body></html>";

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    String duration = req.getQueryParameter("time");
    long timeout = Long.parseLong(duration) * 1000;

    reallySleep(timeout);

    return new HttpResponse()
      .setHeader("Content-Type", "text/html")
      //Dont Cache Anything  at the browser
      .setHeader("Cache-Control","no-cache")
      .setHeader("Pragma","no-cache")
      .setHeader("Expires", "0")
      .setContent(utf8String(String.format(RESPONSE_STRING_FORMAT, duration)));
  }

  private void reallySleep(long timeout) {
    long start = System.currentTimeMillis();
    try {
      Thread.sleep(timeout);
      while ( (System.currentTimeMillis() - start) < timeout) {
        Thread.sleep( 20);
      }
    } catch (InterruptedException ignore) {
    }
  }
}
