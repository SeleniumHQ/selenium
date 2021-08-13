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

package org.openqa.selenium.remote.tracing;

import io.opentelemetry.semconv.trace.attributes.SemanticAttributes;

public enum AttributeKey {

  EXCEPTION_EVENT(SemanticAttributes.EXCEPTION_EVENT_NAME),
  EXCEPTION_TYPE(SemanticAttributes.EXCEPTION_TYPE.getKey()),
  EXCEPTION_MESSAGE(SemanticAttributes.EXCEPTION_MESSAGE.getKey()),
  EXCEPTION_STACKTRACE(SemanticAttributes.EXCEPTION_STACKTRACE.getKey()),

  SPAN_KIND("span.kind"),

  HTTP_METHOD(SemanticAttributes.HTTP_METHOD.getKey()),
  HTTP_URL(SemanticAttributes.HTTP_URL.getKey()),
  HTTP_STATUS_CODE(SemanticAttributes.HTTP_STATUS_CODE.getKey()),
  HTTP_TARGET_HOST(SemanticAttributes.HTTP_TARGET.getKey()),
  HTTP_CLIENT_CLASS("http.client_class"),
  HTTP_HANDLER_CLASS("http.handler_class"),
  HTTP_USER_AGENT(SemanticAttributes.HTTP_USER_AGENT.getKey()),
  HTTP_HOST(SemanticAttributes.HTTP_HOST.getKey()),
  HTTP_TARGET(SemanticAttributes.HTTP_TARGET.getKey()),
  HTTP_REQUEST_CONTENT_LENGTH(SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH.getKey()),
  HTTP_CLIENT_IP(SemanticAttributes.HTTP_CLIENT_IP.getKey()),
  HTTP_SCHEME(SemanticAttributes.HTTP_SCHEME.getKey()),
  HTTP_FLAVOR(SemanticAttributes.HTTP_FLAVOR.getKey()),

  ERROR("error"),

  LOGGER_CLASS("logger"),

  DRIVER_RESPONSE("driver.response"),
  DRIVER_URL("driver.url"),
  DOWNSTREAM_DIALECT("downstream.dialect"),
  UPSTREAM_DIALECT("upstream.dialect"),

  SESSION_ID("session.id"),
  SESSION_CAPABILITIES("session.capabilities"),
  SESSION_URI("session.uri"),

  DATABASE_STATEMENT (SemanticAttributes.DB_STATEMENT.getKey()),
  DATABASE_OPERATION (SemanticAttributes.DB_OPERATION.getKey()),
  DATABASE_USER (SemanticAttributes.DB_USER.getKey()),
  DATABASE_CONNECTION_STRING (SemanticAttributes.DB_CONNECTION_STRING.getKey()),
  DATABASE_SYSTEM(SemanticAttributes.DB_SYSTEM.getKey()),

  REQUEST_ID ("request.id");

  private final String key;

  AttributeKey(String key) {
    this.key = key;
  }

  public String getKey() {
    return this.key;
  }
}