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

import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Safely {

  private static final Logger LOG = Logger.getLogger(Safely.class.getName());

  public static void safelyCall(TearDownFixture... fixtures) {
    ExecutorService executor = Executors.newFixedThreadPool(fixtures.length);
    List<CompletableFuture<Void>> futures = new LinkedList<>();

    for (TearDownFixture fixture : fixtures) {
      CompletableFuture<Void> check = new CompletableFuture<>();
      executor.submit(
          () -> {
            // Fixture being null is handled by the exception check.
            try {
              fixture.tearDown();
            } catch (Exception ignored) {
              // nothing to see here.
            }
            check.complete(null);
          });
      futures.add(check);
    }

    executor.shutdown();

    try {
      CompletableFuture.allOf(futures.toArray(new CompletableFuture[] {})).get(2, TimeUnit.MINUTES);
    } catch (TimeoutException ex) {
      LOG.log(Level.WARNING, "tear down timed out: {}", ex.toString());
    } catch (Exception ex) {
      LOG.log(Level.WARNING, "tear down failed", ex);
    }
  }
}
