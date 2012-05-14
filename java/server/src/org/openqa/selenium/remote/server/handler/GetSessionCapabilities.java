/*
Copyright 2007-2009 Selenium committers

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

import com.google.common.collect.Maps;

import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Map;

public class GetSessionCapabilities extends ResponseAwareWebDriverHandler {

  public GetSessionCapabilities(Session session) {
    super(session);
  }

  public ResultType call() {
    Session session = getSession();
    Map<String, Object> capabilities = (Map<String, Object>) session.getCapabilities().asMap();
    capabilities = Maps.newHashMap(capabilities);

    // Only servers implementing the server-side webdriver-backed selenium need
    // to return this particular value
    capabilities.put("webdriver.remote.sessionid", session.getSessionId().toString());

    response.setValue(describeSession(capabilities));

    return ResultType.SUCCESS;
  }

  protected Map<String, Object> describeSession(Map<String, Object> capabilities) {
    return capabilities;
  }
}
