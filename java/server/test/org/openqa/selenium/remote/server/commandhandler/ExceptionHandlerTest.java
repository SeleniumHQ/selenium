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

package org.openqa.selenium.remote.server.commandhandler;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.junit.Assert.assertEquals;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.junit.Test;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.commandhandler.ExceptionHandler;

import java.lang.reflect.Type;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class ExceptionHandlerTest {

  private final static Type MAP_TYPE = new TypeToken<Map<String, Object>>(){}.getType();

  @Test
  public void shouldSetErrorCodeForJsonWireProtocol() {
    Exception e = new NoSuchSessionException("This does not exist");
    HttpResponse response = new HttpResponse();
    new ExceptionHandler(e).execute(new HttpRequest(HttpMethod.POST, "/session"), response);

    assertEquals(HTTP_INTERNAL_ERROR, response.getStatus());

    Map<String, Object> err = new Gson().fromJson(response.getContentString(), MAP_TYPE);
    assertEquals(ErrorCodes.NO_SUCH_SESSION, ((Number) err.get("status")).intValue());
  }

  @Test
  public void shouldSetErrorCodeForW3cSpec() {
    Exception e = new NoAlertPresentException("This does not exist");
    HttpResponse response = new HttpResponse();
    new ExceptionHandler(e).execute(new HttpRequest(HttpMethod.POST, "/session"), response);

    Map<String, Object> err = new Gson().fromJson(response.getContentString(), MAP_TYPE);
    Map<?, ?> value = (Map<?, ?>) err.get("value");
    assertEquals(value.toString(),"no such alert", value.get("error"));
  }

  @Test
  public void shouldUnwrapAnExecutionException() {
    Exception noSession = new SessionNotCreatedException("This does not exist");
    Exception e = new ExecutionException(noSession);
    HttpResponse response = new HttpResponse();
    new ExceptionHandler(e).execute(new HttpRequest(HttpMethod.POST, "/session"), response);

    Map<String, Object> err = new Gson().fromJson(response.getContentString(), MAP_TYPE);
    Map<?, ?> value = (Map<?, ?>) err.get("value");

    assertEquals(ErrorCodes.SESSION_NOT_CREATED, ((Number) err.get("status")).intValue());
    assertEquals("session not created", value.get("error"));
  }
}
