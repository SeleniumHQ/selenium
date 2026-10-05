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

package org.openqa.selenium.concurrent;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
public class GuardedRunnableTest {

  @Test
  void shouldKeepRunningAfterTaskThrowsAnException() throws InterruptedException {
    assertKeepsRunning(
        () -> {
          throw new RuntimeException("expected");
        });
  }

  @Test
  void shouldKeepRunningAfterTaskThrowsAnError() throws InterruptedException {
    assertKeepsRunning(
        () -> {
          throw new StackOverflowError("expected");
        });
  }

  private void assertKeepsRunning(Runnable failing) throws InterruptedException {
    CountDownLatch executions = new CountDownLatch(3);
    ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor();

    try {
      service.scheduleAtFixedRate(
          GuardedRunnable.guard(
              () -> {
                executions.countDown();
                failing.run();
              }),
          0,
          20,
          TimeUnit.MILLISECONDS);

      assertThat(executions.await(10, TimeUnit.SECONDS)).isTrue();
    } finally {
      service.shutdownNow();
    }
  }
}
