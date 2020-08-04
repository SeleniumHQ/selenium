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

public enum AttributeKey {

  EXCEPTION_EVENT("exception"),
  EXCEPTION_TYPE("exception.type"),
  EXCEPTION_MESSAGE("exception.message"),
  EXCEPTION_STACKTRACE("exception.stacktrace"),

  SPAN_KIND("span.kind"),

  HTTP_METHOD("http.method"),
  HTTP_URL("http.url"),
  HTTP_STATUS_CODE("http.status_code"),
  HTTP_TARGET_HOST("http.target_host"),
  HTTP_CLIENT_CLASS("http.client_class"),
  HTTP_HANDLER_CLASS("http.handler_class"),

  LOGGER_CLASS("logger"),

  DRIVER_RESPONSE("driver.response"),
  DRIVER_URL("driver.url"),
  DOWNSTREAM_DIALECT("downstream.dialect"),
  UPSTREAM_DIALECT("upstream.dialect"),

  SESSION_ID("session.id"),
  SESSION_CAPABILITIES("session.capabilities"),
  SESSION_URI("session.uri"),

  DATABASE_STATEMENT ("db.statement"),
  DATABASE_OPERATION ("db.operation"),
  DATABASE_USER ("db.user"),
  DATABASE_CONNECTION_STRING ("db.connection_string"),
  DATABASE_SYSTEM("db.system");

  private final String name;

  AttributeKey(String name) {
    this.name = name;
  }

  @Override
  public String toString() {
    return this.name;
  }
}