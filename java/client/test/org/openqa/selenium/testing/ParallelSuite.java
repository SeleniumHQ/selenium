package org.openqa.selenium.testing;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.junit.runner.Runner;
import org.junit.runner.notification.RunNotifier;
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
    
    for (final Runner runner : getChildren()) {
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
    private final ConcurrentLinkedQueue<Runnable> tasks = new ConcurrentLinkedQueue<Runnable>();
    private volatile boolean isStopped = false;

    public ThreadPool(int threadCount, final Runnable perThreadCleanup) {
      threads = new ArrayList<Thread>(threadCount);
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
