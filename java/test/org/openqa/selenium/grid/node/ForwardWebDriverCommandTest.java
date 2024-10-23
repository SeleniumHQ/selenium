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

package org.openqa.selenium.grid.node;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.openqa.selenium.remote.http.Contents.asJson;

import com.google.common.collect.ImmutableMap;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class ForwardWebDriverCommandTest {

  private Node mockNode;
  private ForwardWebDriverCommand command;

  @BeforeEach
  void setUp() {
    mockNode = mock(Node.class);
    when(mockNode.getId()).thenReturn(new NodeId(UUID.randomUUID()));
    command = new ForwardWebDriverCommand(mockNode);
  }

  @Test
  void testExecuteWithValidSessionOwner() {
    HttpRequest mockRequest = mock(HttpRequest.class);
    when(mockRequest.getUri()).thenReturn("/session/1234");

    SessionId sessionId = new SessionId("1234");
    when(mockNode.isSessionOwner(sessionId)).thenReturn(true);

    HttpResponse expectedResponse = new HttpResponse();
    when(mockNode.executeWebDriverCommand(mockRequest)).thenReturn(expectedResponse);

    HttpResponse actualResponse = command.execute(mockRequest);
    assertEquals(expectedResponse, actualResponse);
  }

  @Test
  void testExecuteWithInvalidSessionOwner() {
    HttpRequest mockRequest = mock(HttpRequest.class);
    when(mockRequest.getUri()).thenReturn("/session/5678");

    SessionId sessionId = new SessionId("5678");
    when(mockNode.isSessionOwner(sessionId)).thenReturn(false);

    HttpResponse actualResponse = command.execute(mockRequest);
    HttpResponse expectResponse =
        new HttpResponse()
            .setStatus(HTTP_INTERNAL_ERROR)
            .setContent(
                asJson(
                    ImmutableMap.of(
                        "error", String.format("Session not found in node %s", mockNode.getId()))));
    assertEquals(expectResponse.getStatus(), actualResponse.getStatus());
    assertEquals(expectResponse.getContentEncoding(), actualResponse.getContentEncoding());
  }
}
