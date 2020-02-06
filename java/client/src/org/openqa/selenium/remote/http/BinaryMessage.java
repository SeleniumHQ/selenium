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

package org.openqa.selenium.remote.http;

import java.nio.ByteBuffer;
import java.util.Objects;

public class BinaryMessage implements Message {

  private final byte[] data;

  public BinaryMessage(ByteBuffer data) {
    Objects.requireNonNull(data, "Data to use must be set.");

    ByteBuffer copy = data.asReadOnlyBuffer();
    this.data = new byte[copy.capacity()];
    copy.get(this.data);
  }

  public BinaryMessage(byte[] data) {
    Objects.requireNonNull(data, "Data to use must be set.");

    this.data = new byte[data.length];
    System.arraycopy(data, 0, this.data, 0, data.length);
  }

  public byte[] data() {
    return data;
  }

}

