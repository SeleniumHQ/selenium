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

package org.openqa.selenium.io;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Random;
import java.util.concurrent.ExecutionException;

@Tag("UnitTests")
class StreamHelperTest {

  @Test
  void testTransferTo() throws ExecutionException, InterruptedException {
    byte[] data = new byte[64 * 1024];
    // seeded random for reproducible tests
    new Random(64).nextBytes(data);

    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      StreamHelper.asyncTransferTo(new ByteArrayInputStream(data), out).get();

      Assertions.assertArrayEquals(data, out.toByteArray());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
