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
package org.openqa.selenium.devtools.io.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/**
 * This is either obtained from another method or specifed as blob is greater where uuid is
 * an UUID of a Blob.
 */
public class StreamHandle {

  private final String uuid;

  public StreamHandle(String uuid) {
    this.uuid = Objects.requireNonNull(uuid, "value is missing");
  }

  private static StreamHandle fromJson(JsonInput input) {
    return new StreamHandle(input.nextString());
  }
}
