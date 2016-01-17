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

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.junit.runner.Runner;
import org.junit.runner.notification.RunNotifier;
import org.junit.runners.ParentRunner;
import org.junit.runners.Suite;
import org.junit.runners.model.InitializationError;
import org.junit.runners.model.RunnerBuilder;

import com.google.common.base.Preconditions;
import com.google.common.base.Throwables;

public class ParallelSuite extends Suite {
  public static final String PARALLELIZATION_ENV_VAR_NAME = "PARALLEL_DRIVER_COUNT";

  public ParallelSuite(Class<?> klass, RunnerBuilder builder) throws InitializationError {
      super(klass, builder);
  }

  public ParallelSuite(RunnerBuilder builder, Class<?>[] classes) throws InitializationError {
      super(builder, classes);
  }

  @Override
  public void run(final RunNotifier notifier) {
    ThreadPool threadPool = new ThreadPool(getParallelization(), new Runnable() {
      @Override
      public void run() {
        JUnit4TestBase.removeDriver();
      }
    });

    for (final Runner runner : getFilteredChildren()) {
      threadPool.execute(new Runnable() {
        @Override
        public void run() {
          runner.run(notifier);
        }
      });
    }
    try {
      threadPool.shutdownAndWait();
    } catch (InterruptedException e) {
      Throwables.propagate(e);
    }
  }

  @SuppressWarnings("unchecked")
  private Collection<Runner> getFilteredChildren() {
    try {
      Method getFilteredChildren = ParentRunner.class.getDeclaredMethod("getFilteredChildren");
      getFilteredChildren.setAccessible(true);
      return (Collection<Runner>) getFilteredChildren.invoke(this);
    } catch (ReflectiveOperationException e) {
      return getChildren();
    }
  }

  private static int getParallelization() {
    String var = System.getenv(PARALLELIZATION_ENV_VAR_NAME);
    try {
      if (var != null) {
        return Integer.parseInt(var);
      }
    } catch (NumberFormatException e) {
    }
    return 1;
  }

  /**
   * This isn't a standard java thread pool because we want to specify a cleanup action per thread.
   */
  private static class ThreadPool {
    private final List<Thread> threads;
    private final ConcurrentLinkedQueue<Runnable> tasks = new ConcurrentLinkedQueue<>();
    private volatile boolean isStopped = false;

    public ThreadPool(int threadCount, final Runnable perThreadCleanup) {
      threads = new ArrayList<>(threadCount);
      for (int i = 0; i < threadCount; ++i) {
        Thread thread = new Thread() {
          @Override
          public void run() {
            while (!isStopped || !tasks.isEmpty()) {
              Runnable task = tasks.poll();
              if (task != null) {
                task.run();
              }
              Thread.yield();
            }
            perThreadCleanup.run();
          }
        };
        thread.start();
        threads.add(thread);
      }
    }

    public void execute(Runnable runnable) {
      Preconditions.checkState(!isStopped,
          "Thread pool has been shut down, not admitting new tasks");
      tasks.add(runnable);
    }

    public void shutdownAndWait() throws InterruptedException {
      isStopped = true;
      for (Thread thread : threads) {
        thread.join();
      }
    }
  }
}
