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

package org.openqa.selenium;

import java.util.ArrayList;
import java.util.List;

/** Utility class for concurrency tests. */
public class ParallelTestRunner {
  public interface Worker {
    void run();
  }

  private static class WorkerThread extends Thread { // Thread safety reviewed
    private final Worker _worker;
    private volatile Throwable _throwable;

    private WorkerThread(String name, Worker worker) {
      super(name);
      _worker = worker;
    }

    @Override
    public void run() {
      try {
        _worker.run();
      } catch (Throwable t) {
        _throwable = t;
      }
    }

    public Throwable getThrowable() {
      return _throwable;
    }
  }

  private final List<Worker> _workers;

  public ParallelTestRunner(List<Worker> workers) {
    _workers = workers;
  }

  public void run() throws Exception {
    final List<WorkerThread> threads = new ArrayList<>(_workers.size());
    Throwable t = null;
    int i = 1;
    for (Worker worker : _workers) {
      final WorkerThread thread = new WorkerThread("WorkerThread #" + i, worker);
      ++i;
      threads.add(thread);
      thread.start();
    }
    for (WorkerThread thread : threads) {
      try {
        thread.join();
        if (t == null) {
          t = thread.getThrowable();
        } else {
          final Throwable t2 = thread.getThrowable();
          if (t2 != null) {
            System.err.println(thread + " failed.");
            t2.printStackTrace(System.err);
          }
        }
      } catch (InterruptedException ignored) {
        interrupt(threads);
      }
    }
    if (t != null) {
      if (t instanceof Exception) {
        throw (Exception) t;
      } else if (t instanceof Error) {
        throw (Error) t;
      } else {
        throw new RuntimeException("Unexpected Throwable " + t.getClass().getName(), t);
      }
    }
  }

  private void interrupt(List<WorkerThread> threads) {
    for (WorkerThread thread : threads) {
      thread.interrupt();
    }
  }
}
