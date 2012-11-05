/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.server.mock;

import org.openqa.selenium.server.RemoteCommand;

import static org.junit.Assert.assertEquals;


public class DriverRequest extends AsyncHttpRequest {

  RemoteCommand cmd;

  /**
   * Send a command to the server.
   * 
   * @param url the url to contact, not including the command in the GET args
   * @param cmd remote command; normally null
   * @param timeoutInMillis time to wait before giving up on the request
   * @return request object; used to acquire result when it's eventually ready
   */
  public static DriverRequest request(String url, RemoteCommand cmd, String sessionId,
      int timeoutInMillis) {
    DriverRequest request = new DriverRequest();
    request.cmd = cmd;
    StringBuffer query = new StringBuffer(url);
    query.append('?');
    query.append(cmd.getCommandURLString());
    if (sessionId != null) {
      query.append("&sessionId=");
      query.append(sessionId);
    }
    AsyncHttpRequest.constructRequest(request, "driverRequest: " + query, query.toString(), null,
        timeoutInMillis);
    return request;
  }

  public void expectResult(String expected) {
    String message = cmd.getCommand() + " result got mangled";
    assertEquals(message, expected, getResult());
  }

  /** returns the result of the previous command, e.g. "OK" or "OK,123" */
  @Override
  public String getResult() {
    return super.getResult();
  }
}
