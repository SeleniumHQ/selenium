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

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.ByteBuffer;
import org.junit.jupiter.api.Test;

class BinaryMessageTest {

  @Test
  void copiesOnlyTheReadableRegionOfABuffer() {
    // Backing array is 16 bytes but only the slice [4..8) is readable.
    byte[] backing = {0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0};
    ByteBuffer buffer = ByteBuffer.wrap(backing);
    buffer.position(4).limit(8);

    BinaryMessage message = new BinaryMessage(buffer);

    assertThat(message.data()).containsExactly(1, 2, 3, 4);
  }
}
