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
import org.openqa.selenium.internal.Require;

public class BinaryMessage implements Message {

  private final byte[] data;

  public BinaryMessage(ByteBuffer data) {
    ByteBuffer copy = Require.nonNull("Data to use", data).asReadOnlyBuffer();
    this.data = new byte[copy.remaining()];
    copy.get(this.data);
  }

  public BinaryMessage(byte[] data) {
    Require.nonNull("Data to use", data);

    this.data = new byte[data.length];
    System.arraycopy(data, 0, this.data, 0, data.length);
  }

  /**
   * Returns a {@link BinaryMessage} backed directly by {@code data} with no defensive copy. The
   * caller transfers ownership of the array — once wrapped it must not be mutated, otherwise a
   * downstream reader will see the mutation. Intended for callers that have just produced a fresh
   * array (for example {@link java.io.ByteArrayOutputStream#toByteArray()}) and want to avoid the
   * second allocation that the public constructor performs.
   */
  public static BinaryMessage wrap(byte[] data) {
    return new BinaryMessage(Require.nonNull("Data to use", data), Ownership.TRANSFER);
  }

  // Sentinel for the private no-copy constructor below — gives it a distinct signature from
  // the public defensive-copy BinaryMessage(byte[]) and documents the contract at the call site.
  private enum Ownership {
    TRANSFER
  }

  private BinaryMessage(byte[] data, Ownership ownership) {
    Require.nonNull("Ownership", ownership);
    this.data = data;
  }

  public byte[] data() {
    return data;
  }
}
