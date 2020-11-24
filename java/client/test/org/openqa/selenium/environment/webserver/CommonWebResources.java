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

import org.openqa.selenium.build.InProject;
import org.openqa.selenium.grid.web.MergedResource;
import org.openqa.selenium.grid.web.PathResource;
import org.openqa.selenium.grid.web.Resource;
import org.openqa.selenium.grid.web.ResourceHandler;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;

import java.io.UncheckedIOException;
import java.nio.file.Path;

import static org.openqa.selenium.build.InProject.locate;

public class CommonWebResources implements Routable {

  private final Routable delegate;

  public CommonWebResources() {
    Resource resources = new MergedResource(new PathResource(locate("common/src/web")))
      .alsoCheck(new PathResource(locate("javascript").getParent()).limit("javascript"))
      .alsoCheck(new PathResource(locate("third_party/closure/goog").getParent()).limit("goog"))
      .alsoCheck(new PathResource(locate("third_party/js").getParent()).limit("js"));

    Path runfiles = InProject.findRunfilesRoot();
    if (runfiles != null) {
      ResourceHandler handler = new ResourceHandler(new PathResource(runfiles));
      delegate = Route.combine(
        new ResourceHandler(resources),
        Route.prefix("/filez").to(Route.combine(handler))
      );
    } else {
      delegate = new ResourceHandler(resources);
    }
  }

  @Override
  public boolean matches(HttpRequest req) {
    return delegate.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return delegate.execute(req);
  }
}
