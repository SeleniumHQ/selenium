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

package org.openqa.selenium.devtools.idealized.fetch.model;

import org.openqa.selenium.devtools.idealized.page.model.FrameId;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.Optional;

public class RequestPaused {

  private final RequestId requestId;
  private final FrameId frameId;
  private final Optional<RequestId> networkId;
  private final Optional<HttpRequest> request;
  private final Optional<HttpResponse> response;

  public RequestPaused(
    RequestId requestId,
    FrameId frameId,
    Optional<RequestId> networkId,
    Optional<HttpRequest> request,
    Optional<HttpResponse> response) {
    this.requestId = Require.nonNull("Request ID", requestId);
    this.frameId = Require.nonNull("Frame ID", frameId);
    this.networkId = Require.nonNull("Network ID", networkId);
    this.request = Require.nonNull("Request", request);
    this.response = Require.nonNull("Response", response);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public FrameId getFrameId() {
    return frameId;
  }

  public Optional<RequestId> getNetworkId() {
    return networkId;
  }

  public Optional<HttpRequest> getRequest() {
    return request;
  }

  public Optional<HttpResponse> getResponse() {
    return response;
  }
}
