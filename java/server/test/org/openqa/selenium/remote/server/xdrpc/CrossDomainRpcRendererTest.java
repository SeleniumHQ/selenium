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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.google.common.base.Charsets;
import com.google.common.base.Strings;

import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.server.FakeHttpRequest;
import org.openqa.selenium.remote.server.FakeHttpResponse;
import org.openqa.selenium.remote.server.rest.RestishHandler;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

/**
 * Unit tests for {@link CrossDomainRpcRenderer}
 */
public class CrossDomainRpcRendererTest {

  private FakeHttpRequest fakeRequest;
  private FakeHttpResponse fakeResponse;
  private RestishHandler nullHandler;

  @Before
  public void setUp() {
    fakeRequest = new FakeHttpRequest();
    fakeResponse = new FakeHttpResponse();
    nullHandler = null;
  }

  private static String getContent(FakeHttpResponse response) {
    byte[] data = response.getContent();
    return new String(data);
  }

  @Test
  public void correctlyRendersANormalCrossDomainRpc() throws Exception {
    final String response = new JSONObject().put("foo", "bar").toString();
    final CrossDomainRpc rpc = new CrossDomainRpc("GET", "/session", "");

    fakeRequest.setAttribute("rpc", rpc);
    fakeRequest.setAttribute("response", response);

    new CrossDomainRpcRenderer(":response", ":error")
        .render(fakeRequest, fakeResponse, nullHandler);

    assertEquals(200, fakeResponse.getStatus());
    assertEquals("application/json", fakeResponse.getContentType());
    assertEquals(Charsets.UTF_8, fakeResponse.getEncoding());
    assertTrue(fakeResponse.isTerminated());

    assertEqualsStringPlusTheDifferenceInNullCharacters(
        response, getContent(fakeResponse));
  }
  
  @Test
  public void correctlyRendersCrossDomainRpcsWithMissingResponseObjects()
      throws Exception {
    final CrossDomainRpc rpc = new CrossDomainRpc("POST", "/session/foo/url",
        "{\"url\":\"http://www.google.com\"}");

    fakeRequest.setAttribute("rpc", rpc);
    fakeRequest.setUri("http://localhost:1234/session/foo");

    new CrossDomainRpcRenderer(":response", ":error")
        .render(fakeRequest, fakeResponse, nullHandler);

    assertEquals(200, fakeResponse.getStatus());
    assertEquals("application/json", fakeResponse.getContentType());
    assertEquals(Charsets.UTF_8, fakeResponse.getEncoding());
    assertTrue(fakeResponse.isTerminated());

    JSONObject response = new JSONObject(getContent(fakeResponse));
    assertEquals(ErrorCodes.SUCCESS, response.getInt("status"));
    assertTrue(response.isNull("value"));
    assertEquals("foo", response.getString("sessionId"));
  }

  /**
   * Asserts the actual string is equal to the expected string. If the
   * actual string is of greater length, asserts that extra characters are all
   * the null characters (\0).
   *
   * @param expected Expected string.
   * @param actual Actual string.
   */
  private static void assertEqualsStringPlusTheDifferenceInNullCharacters(
      String expected, String actual) {
    int difference = actual.length() - expected.length();
    assertEquals(expected, actual.substring(0, expected.length()));
    assertEquals(Strings.repeat("\0", difference),
        actual.substring(expected.length()));
  }

  private static String repeat(char c, int n) {
    StringBuilder builder = new StringBuilder();
    for (int i = 0; i < n; ++i) {
      builder.append(c);
    }
    return builder.toString();
  }
}
