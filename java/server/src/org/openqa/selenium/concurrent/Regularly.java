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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.atomic.AtomicBoolean;

public class Regularly {

  private final ScheduledExecutorService executor;
  private final List<RetryingRunnable> scheduledRunnables = new ArrayList<>();

  public Regularly(String name) {
    Objects.requireNonNull(name, "Name must be set");

    this.executor = Executors.newScheduledThreadPool(1, r -> {
      Thread thread = new Thread(r, name);
      thread.setDaemon(true);
      return thread;
    });
  }

  public void submit(Runnable task, Duration successPeriod, Duration retryPeriod) {
    Objects.requireNonNull(task, "Task to schedule must be set.");
    Objects.requireNonNull(successPeriod, "Success period must be set.");
    Objects.requireNonNull(retryPeriod, "Retry period must be set.");

    RetryingRunnable runnable = new RetryingRunnable(
        task,
        successPeriod.toMillis(),
        retryPeriod.toMillis());

    synchronized (scheduledRunnables) {
      scheduledRunnables.add(runnable);
    }

    executor.schedule(runnable, 0, MILLISECONDS);
  }

  public void shutdown() {
    executor.shutdown();
  }

  public void remove(Runnable runnable) {
    synchronized (scheduledRunnables) {
      Iterator<RetryingRunnable> iterator = scheduledRunnables.iterator();
      while (iterator.hasNext()) {
        RetryingRunnable compareWith = iterator.next();
        if (compareWith.equals(runnable)) {
          iterator.remove();
          compareWith.stop();
        }
      }
    }
  }

  private class RetryingRunnable implements Runnable {

    private final Runnable delegate;
    private final long successPeriod;
    private final long retryPeriod;
    private final AtomicBoolean stop = new AtomicBoolean(false);

    public RetryingRunnable(Runnable delegate, long successPeriod, long retryPeriod) {
      this.delegate = delegate;
      this.successPeriod = successPeriod;
      this.retryPeriod = retryPeriod;
    }

    @Override
    public void run() {
      if (stop.get()) {
        return;
      }

      try {
        delegate.run();
        executor.schedule(this, successPeriod, MILLISECONDS);
      } catch (Exception e) {
        executor.schedule(this, retryPeriod, MILLISECONDS);
      }
    }

    public void stop() {
      this.stop.set(true);
    }
  }
}
