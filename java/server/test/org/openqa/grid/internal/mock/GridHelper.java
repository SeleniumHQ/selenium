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

package org.openqa.grid.internal.mock;

/**
 * create mocked object for testing grid internal.
 * Objects will have all the normal object characteristics,
 * and will reserve/release the resources on the hub, but will
 *  not forward the requests to the nodes.
 */
public class GridHelper {

//  public static MockedRequestHandler createNewSessionHandler(GridRegistry registry,
//      Map<String, Object> desiredCapability) {
//    SeleniumBasedRequest request =
//        createNewSessionRequest(registry, desiredCapability);
//    return new MockedRequestHandler(request, null, registry);
//  }
//
//
//  public static MockedRequestHandler createStopSessionHandler(GridRegistry registry, TestSession session) {
//    SeleniumBasedRequest request = createMockedRequest(registry, RequestType.STOP_SESSION, null);
//    MockedRequestHandler handler = new MockedRequestHandler(request, null, registry);
//    handler.setSession(session);
//    return handler;
//  }
//
//  public static SeleniumBasedRequest createMockedRequest(GridRegistry registry,
//      RequestType type, Map<String, Object> desiredCapability) {
//    HttpServletRequest request = mock(HttpServletRequest.class);
//    return new SeleniumBasedRequest(request, registry, type, desiredCapability) {
//
//      @Override
//      public ExternalSessionKey extractSession() {
//        return null;
//      }
//
//      @Override
//      public RequestType extractRequestType() {
//        return null;
//      }
//
//      @Override
//      public Map<String, Object> extractDesiredCapability() {
//        return getDesiredCapabilities();
//      }
//    };
//  }
//
//  public static SeleniumBasedRequest createNewSessionRequest(GridRegistry registry,
//      Map<String, Object> desiredCapability) {
//    return createMockedRequest(registry, RequestType.START_SESSION, desiredCapability);
//  }
}
