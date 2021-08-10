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

package org.openqa.selenium.internal;

import java.util.Collection;
import java.util.IdentityHashMap;

/**
 * A simple manager for shutdown hooks, with plenty of room for improvement.
 */
public class ShutdownHooks {

  private static IdentityHashMap<Thread, Thread> defaultHooks;
  private static IdentityHashMap<Thread, Thread> atEndHooks;

  static {
    defaultHooks = new IdentityHashMap<>();
    atEndHooks = new IdentityHashMap<>();
    Runtime.getRuntime().addShutdownHook(new Thread(ShutdownHooks::runShutdownHooks));
  }

  private ShutdownHooks() {
    // Utility class
  }

  public static void add(Thread hook, HookExecutionStrategy strategy) {
    if (strategy.equals(HookExecutionStrategy.DEFAULT)) {
      defaultHooks.put(hook, hook);
    } else {
      atEndHooks.put(hook, hook);
    }
  }

  public static void add(Thread hook) {
    add(hook, HookExecutionStrategy.DEFAULT);
  }

  static void runShutdownHooks() {
    Collection<Thread> threads;
    synchronized (ShutdownHooks.class) {
      threads = defaultHooks.keySet();
      defaultHooks = null;
    }
    runHooks(threads);
    Collection<Thread> atEndThreads;
    synchronized (ShutdownHooks.class) {
      atEndThreads = atEndHooks.keySet();
      atEndHooks = null;
    }
    runHooks(atEndThreads);
  }

  private static void runHooks(Collection<Thread> threads) {
    for (Thread hook : threads) {
      hook.start();
    }
    for (Thread hook : threads) {
      while (true) {
        try {
          hook.join();
          break;
        } catch (InterruptedException ignored) {
        }
      }
    }
  }

  public enum HookExecutionStrategy {
    AT_END,      // Hook will be executed after all DEFAULT ones are executed
    DEFAULT      // Hook will be executed before all AT_END ones
  }

}
