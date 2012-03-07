/*
 Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.remote.server.xdrpc;

import org.jmock.Expectations;
import org.jmock.Mockery;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;

import javax.servlet.http.HttpServletRequest;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

/**
 * Unit tests for {@link CrossDomainRpcLoader}.
 */
public class CrossDomainRpcLoaderTest {

  private Mockery mockery;
  private HttpServletRequest mockRequest;

  @Before
  public void setUp() {
    mockery = new Mockery();
    mockRequest = mockery.mock(HttpServletRequest.class);
  }

  @After
  public void tearDown() {
    mockery.assertIsSatisfied();
  }

  @Test
  public void jsonRequestMustHaveAMethod() throws IOException, JSONException {
    HttpServletRequest mockRequest = createJsonRequest(null, "/", "data");
    try {
      new CrossDomainRpcLoader().loadRpc(mockRequest);
      fail();
    } catch (IllegalArgumentException expected) {
    }
  }

  @Test
  public void jsonRequestMustHaveAPath() throws IOException, JSONException {
    HttpServletRequest mockRequest = createJsonRequest("GET", null, "data");
    try {
      new CrossDomainRpcLoader().loadRpc(mockRequest);
      fail();
    } catch (IllegalArgumentException expected) {
    }
  }

  @Test
  public void jsonRequestMustHaveAData() throws IOException, JSONException {
    HttpServletRequest mockRequest = createJsonRequest("GET", "/", null);
    try {
      new CrossDomainRpcLoader().loadRpc(mockRequest);
      fail();
    } catch (IllegalArgumentException expected) {
    }
  }

  @Test
  public void rpcRequestDataInitializedWithDataAsAString()
      throws IOException, JSONException {
    HttpServletRequest mockRequest = createJsonRequest("GET", "/",
        new JSONObject().put("foo", "bar"));

    CrossDomainRpc rpc = new CrossDomainRpcLoader().loadRpc(mockRequest);
    assertEquals("{\"foo\":\"bar\"}", rpc.getData());
  }

  private HttpServletRequest createJsonRequest(final String method,
      final String path, final Object data) throws IOException, JSONException {
    mockery.checking(new Expectations() {{
      allowing(mockRequest).getHeader("content-type");
      will(returnValue("application/json"));
      
      allowing(mockRequest).getReader();
      will(returnValue(new BufferedReader(new StringReader(
          new JSONObject()
              .put("method", method)
              .put("path", path)
              .put("data", data)
              .toString()))));
    }});

    return mockRequest;
  }
}
