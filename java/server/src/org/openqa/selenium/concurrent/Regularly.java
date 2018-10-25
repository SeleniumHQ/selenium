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

import static java.util.concurrent.TimeUnit.MILLISECONDS;

import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

public class Regularly {

  private final long successPeriod;
  private final long retryPeriod;
  private final ScheduledExecutorService executor;

  public Regularly(String name, Duration successPeriod, Duration retryPeriod) {
    Objects.requireNonNull(name, "Name must be set");

    this.successPeriod = Objects.requireNonNull(successPeriod, "Success period must be set.")
        .toMillis();
    this.retryPeriod = Objects.requireNonNull(retryPeriod, "Retry period must be set.")
        .toMillis();

    this.executor = Executors.newScheduledThreadPool(1, r -> new Thread(r, name));
  }

  public void submit(Runnable task) {
    Objects.requireNonNull(task, "Task to schedule must be set.");

    executor.schedule(new RetryingRunnable(task), 0, MILLISECONDS);
  }

  public void shutdown() {
    executor.shutdown();
  }

  private class RetryingRunnable implements Runnable {

    private final Runnable delegate;

    public RetryingRunnable(Runnable delegate) {
      this.delegate = delegate;
    }

    @Override
    public void run() {
      try {
        delegate.run();
        executor.schedule(this, successPeriod, MILLISECONDS);
      } catch (Exception e) {
        executor.schedule(this, retryPeriod, MILLISECONDS);
      }
    }
  }
}
