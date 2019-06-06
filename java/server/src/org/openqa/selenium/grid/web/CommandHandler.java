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

import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.UncheckedIOException;

@Deprecated
@FunctionalInterface
public interface CommandHandler extends HttpHandler {
  void execute(HttpRequest req, HttpResponse res) throws IOException;

  @SuppressWarnings("FunctionalInterfaceMethodChanged")
  @Override
  default HttpResponse execute(HttpRequest req) {
    HttpResponse res = new HttpResponse();
    try {
      execute(req, res);
      return res;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
