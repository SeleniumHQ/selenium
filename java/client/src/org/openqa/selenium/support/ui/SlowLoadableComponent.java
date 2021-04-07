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

package org.openqa.selenium.support.ui;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;


/**
 * A {@link LoadableComponent} which might not have finished loading when load() returns. After a
 * call to load(), the isLoaded() method should continue to fail until the component has fully
 * loaded.
 *
 * <pre class="code">
 * new SlowHypotheticalComponent().get();
 * </pre>
 *
 * @param <T> The type to be returned (normally the subclass' type)
 */
public abstract class SlowLoadableComponent<T extends LoadableComponent<T>>
    extends LoadableComponent<T> {

  private final Clock clock;
  private final Duration timeOutInSeconds;

  public SlowLoadableComponent(java.time.Clock clock, int timeOutInSeconds) {
    this.clock = clock;
    this.timeOutInSeconds = Duration.ofSeconds(timeOutInSeconds);
  }

  @Override
  @SuppressWarnings("unchecked")
  public T get() {
    try {
      isLoaded();
      return (T) this;
    } catch (Error e) {
      load();
    }

    Instant end = clock.instant().plus(timeOutInSeconds);

    while (clock.instant().isBefore(end)) {
      try {
        isLoaded();
        return (T) this;
      } catch (Error e) {
        // Not a problem, we could still be loading
      }

      isError();

      waitFor();
    }

    isLoaded();
    return (T) this;
  }

  /**
   * Check for well known error cases, which would mean that loading has finished, but an error
   * condition was seen. If an error has occurred throw an Error, possibly by using JUnit's
   * Assert.assert* methods
   *
   * @throws Error When a well-known error condition has caused the load to fail
   */
  protected void isError() throws Error {
    // no-op by default
  }


  protected long sleepFor() {
    return 200;
  }

  private void waitFor() {
    try {
      Thread.sleep(sleepFor());
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new AssertionError(e);
    }
  }

}
