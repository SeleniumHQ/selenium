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

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.rest.RestishHandler;
import org.openqa.selenium.remote.server.rest.ResultType;

import org.json.JSONObject;

/**
 * RestishHandler that returns general status information about the server.
 */
public class Status implements RestishHandler {

  private final Response response;

  public Status() {
    response = new Response();
  }

  public Response getResponse() {
    return response;
  }

  public ResultType handle() throws Exception {
    response.setStatus(ErrorCodes.SUCCESS);

    BuildInfo buildInfo = new BuildInfo();

    JSONObject info = new JSONObject()
        .put("build", new JSONObject()
            .put("version", buildInfo.getReleaseLabel())
            .put("revision", buildInfo.getBuildRevision())
            .put("time", buildInfo.getBuildTime()))
        .put("os", new JSONObject()
            .put("name", System.getProperty("os.name"))
            .put("arch", System.getProperty("os.arch"))
            .put("version", System.getProperty("os.version")))
        .put("java", new JSONObject()
            .put("version", System.getProperty("java.version")));

    response.setValue(info);

    return ResultType.SUCCESS;
  }
}
