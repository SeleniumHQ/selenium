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

package org.openqa.selenium.remote.server.handler;

import com.google.gson.JsonObject;

import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.rest.RestishHandler;

/**
 * RestishHandler that returns general status information about the server.
 */
public class Status implements RestishHandler<Response> {

  @Override
  public Response handle() throws Exception {
    Response response = new Response();
    response.setStatus(ErrorCodes.SUCCESS);
    response.setState(ErrorCodes.SUCCESS_STRING);

    BuildInfo buildInfo = new BuildInfo();

    JsonObject info = new JsonObject();
    JsonObject build = new JsonObject();
    build.addProperty("version", buildInfo.getReleaseLabel());
    build.addProperty("revision", buildInfo.getBuildRevision());
    build.addProperty("time", buildInfo.getBuildTime());
    info.add("build", build);
    JsonObject os = new JsonObject();
    os.addProperty("name", System.getProperty("os.name"));
    os.addProperty("arch", System.getProperty("os.arch"));
    os.addProperty("version", System.getProperty("os.version"));
    info.add("os", os);
    JsonObject java = new JsonObject();
    java.addProperty("version", System.getProperty("java.version"));
    info.add("java", java);

    // https://w3c.github.io/webdriver/webdriver-spec.html#status
    info.addProperty("ready", true);
    info.addProperty("message", "Server is running");

    response.setValue(info);
    return response;
  }
}
