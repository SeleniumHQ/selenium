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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.junit.Test;

import java.time.Clock;
import java.time.Duration;

public class SlowLoadableComponentTest {

  @Test
  public void testShouldDoNothingIfComponentIsAlreadyLoaded() {
    new DetonatingSlowLoader().get();
  }

  @Test
  public void testShouldCauseTheLoadMethodToBeCalledIfTheComponentIsNotAlreadyLoaded() {
    int numberOfTimesThroughLoop = 1;
    SlowLoading slowLoading = new SlowLoading(
        Clock.systemDefaultZone(), 1, numberOfTimesThroughLoop).get();

    assertThat(slowLoading.getLoopCount()).isEqualTo(numberOfTimesThroughLoop);
  }

  @Test
  public void testTheLoadMethodShouldOnlyBeCalledOnceIfTheComponentTakesALongTimeToLoad() {
    new OnlyOneLoad(Clock.systemDefaultZone(), 5, 5).get();
  }

  @Test
  public void testShouldThrowAnErrorIfCallingLoadDoesNotCauseTheComponentToLoadBeforeTimeout() {
    TickingClock clock = new TickingClock();
    assertThatExceptionOfType(Error.class).isThrownBy(() -> new BasicSlowLoader(clock, 2).get());
  }

  @Test
  public void testShouldCancelLoadingIfAnErrorIsDetected() {
    HasError error = new HasError();
    assertThatExceptionOfType(CustomError.class).isThrownBy(error::get);
  }


  private static class DetonatingSlowLoader extends SlowLoadableComponent<DetonatingSlowLoader> {

    public DetonatingSlowLoader() {
      super(Clock.systemDefaultZone(), 1);
    }

    @Override
    protected void load() {
      throw new RuntimeException("Should never be called");
    }

    @Override
    protected void isLoaded() throws Error {
      // Does nothing
    }
  }

  private static class SlowLoading extends SlowLoadableComponent<SlowLoading> {

    private int counts;
    private long loopCount;

    public SlowLoading(Clock clock, int timeOutInSeconds, int counts) {
      super(clock, timeOutInSeconds);
      this.counts = counts;
    }

    @Override
    protected void load() {
      // Does nothing
    }

    @Override
    protected void isLoaded() throws Error {
      if (loopCount > counts) {
        throw new Error();
      }

      loopCount++;
    }

    public long getLoopCount() {
      return loopCount;
    }
  }

  private static class OnlyOneLoad extends SlowLoading {

    private boolean loadAlreadyCalled;

    public OnlyOneLoad(Clock clock, int timeOutInSeconds, int counts) {
      super(clock, timeOutInSeconds, counts);
    }

    @Override
    protected void load() {
      if (loadAlreadyCalled) {
        throw new Error();
      }
      loadAlreadyCalled = true;
    }
  }

  private static class BasicSlowLoader extends SlowLoadableComponent<BasicSlowLoader> {

    private final TickingClock clock;

    public BasicSlowLoader(TickingClock clock, int timeOutInSeconds) {
      super(clock, timeOutInSeconds);
      this.clock = clock;
    }

    @Override
    protected void load() {
      // Does nothing
    }

    @Override
    protected void isLoaded() throws Error {
      // Cheat and increment the clock here, because otherwise it's hard to
      // get to.
      clock.sleep(Duration.ofSeconds(1));
      throw new Error(); // Never loads
    }
  }

  private static class HasError extends SlowLoadableComponent<HasError> {

    public HasError() {
      super(new TickingClock(), 1000);
    }

    @Override
    protected void load() {
      // does nothing
    }

    @Override
    protected void isLoaded() throws Error {
      throw new AssertionError();
    }

    @Override
    protected void isError() throws Error {
      throw new CustomError();
    }
  }

  private static class CustomError extends Error {

  }
}
