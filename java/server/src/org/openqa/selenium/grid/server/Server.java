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

package org.openqa.selenium.grid.server;

import org.openqa.selenium.grid.component.HasLifecycle;
import org.openqa.selenium.remote.http.HttpHandler;

import javax.servlet.Servlet;
import java.net.URL;

public interface Server<T extends Server> extends HasLifecycle<T> {

  boolean isStarted();

  /**
   * Until we can migrate to {@link HttpHandler}s for everything, we leave this escape hatch.
   *
   * @deprecated
   */
  @Deprecated
  void addServlet(Class<? extends Servlet> servlet, String pathSpec);

  /**
   * Until we can migrate to {@link HttpHandler}s for everything, we leave this escape hatch.
   *
   * @deprecated
   */
  @Deprecated
  void addServlet(Servlet servlet, String pathSpec);

  T setHandler(HttpHandler handler);

  URL getUrl();
}
