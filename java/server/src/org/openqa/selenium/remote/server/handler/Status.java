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

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.rest.RestishHandler;

/**
 * RestishHandler that returns general status information about the server.
 */
public class Status implements RestishHandler<Response> {

  @Override
  public Response handle() {
    Response response = new Response();
    response.setStatus(ErrorCodes.SUCCESS);
    response.setState(ErrorCodes.SUCCESS_STRING);

    BuildInfo buildInfo = new BuildInfo();

    Object info = ImmutableMap.of(
        "ready", true,
        "message", "Server is running",
        "build", ImmutableMap.of(
            "version", buildInfo.getReleaseLabel(),
            "revision", buildInfo.getBuildRevision(),
            "time", buildInfo.getBuildTime()
        ),
        "os", ImmutableMap.of(
            "name", System.getProperty("os.name"),
            "arch", System.getProperty("os.arch"),
            "version", System.getProperty("os.version")),
        "java", ImmutableMap.of("version", System.getProperty("java.version")));

    response.setValue(info);
    return response;
  }
}
