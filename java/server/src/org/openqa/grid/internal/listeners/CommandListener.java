/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.internal.listeners;

import org.openqa.grid.internal.TestSession;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * wrapped around each request received and forwarded by the hub.
 */
public interface CommandListener {

  /**
   * Executed before the hub forwards the request. reading the content of the request stream will
   * prevent the content from being forwarded.
   * <p/>
   * Throwing an exception will prevent the forward to the remote.
   * 
   * @param session
   * @param request
   * @param response
   */
  public void beforeCommand(TestSession session, HttpServletRequest request,
      HttpServletResponse response);

  /**
   * Executed just before the forwards returns.
   * <p/>
   * Throwing an exception will result in an error for the client.
   * 
   * @param session
   * @param request
   * @param response
   */
  public void afterCommand(TestSession session, HttpServletRequest request,
      HttpServletResponse response);

}
