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

import org.openqa.selenium.internal.Require;

public class Status {

  private final Kind kind;
  private final String description;

  public static final Status OK = new Status(Kind.OK, "");
  public static final Status ABORTED = new Status(Kind.ABORTED, "");
  public static final Status CANCELLED = new Status(Kind.CANCELLED, "");
  public static final Status NOT_FOUND = new Status(Kind.NOT_FOUND, "");
  public static final Status RESOURCE_EXHAUSTED = new Status(Kind.RESOURCE_EXHAUSTED, "");
  public static final Status UNKNOWN = new Status(Kind.UNKNOWN, "");
  public static final Status INVALID_ARGUMENT = new Status(Kind.INVALID_ARGUMENT, "");
  public static final Status DEADLINE_EXCEEDED = new Status(Kind.DEADLINE_EXCEEDED, "");
  public static final Status ALREADY_EXISTS = new Status(Kind.ALREADY_EXISTS, "");
  public static final Status PERMISSION_DENIED = new Status(Kind.PERMISSION_DENIED, "");
  public static final Status OUT_OF_RANGE = new Status(Kind.OUT_OF_RANGE, "");
  public static final Status UNIMPLEMENTED = new Status(Kind.UNIMPLEMENTED, "");
  public static final Status INTERNAL = new Status(Kind.INTERNAL, "");
  public static final Status UNAVAILABLE = new Status(Kind.UNAVAILABLE, "");
  public static final Status UNAUTHENTICATED = new Status(Kind.UNAUTHENTICATED, "");

  private Status(Kind kind, String description) {
    this.kind = Require.nonNull("Kind", kind);
    this.description = Require.nonNull("Description", description);
  }

  public Status withDescription(String description) {
    return new Status(getKind(), Require.nonNull("Description", description));
  }

  public Kind getKind() {
    return kind;
  }

  public String getDescription() {
    return description;
  }

  public enum Kind {
    OK,
    ABORTED,
    CANCELLED,
    NOT_FOUND,
    RESOURCE_EXHAUSTED,
    UNKNOWN,
    INVALID_ARGUMENT,
    DEADLINE_EXCEEDED,
    ALREADY_EXISTS,
    PERMISSION_DENIED,
    OUT_OF_RANGE,
    UNIMPLEMENTED,
    INTERNAL,
    UNAVAILABLE,
    UNAUTHENTICATED
  }
}
