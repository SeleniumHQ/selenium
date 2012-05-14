/*
Copyright 2011 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote.server.resource;

import org.openqa.selenium.remote.server.rest.RestishHandler;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.net.URL;

public class StaticResource implements RestishHandler {

  private volatile String file;
  private volatile URL response;

  public ResultType handle() throws Exception {
    response = StaticResource.class.getResource(file);
    return ResultType.SUCCESS;
  }

  public URL getResponse() {
    return response;
  }

  public void setFile(String file) {
    this.file = String.format("/%s/%s",
        StaticResource.class.getPackage().getName().replace(".", "/"),
        file);
  }

  @Override
  public String toString() {
    return String.format("[static resource: %s]", file);
  }
}
