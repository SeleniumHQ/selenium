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

package org.openqa.selenium.testing;

import static org.junit.Assert.fail;

import java.util.concurrent.Callable;
import java.util.function.Consumer;

public class Assertions {
  private Assertions() {
    // Utility class.
  }

  public static void assertException(Runnable test, Consumer<Exception> handler) {
    try {
      test.run();
      fail("Expected an exception to be thrown");
    } catch (Exception e) {
      handler.accept(e);
    }
  }
}
