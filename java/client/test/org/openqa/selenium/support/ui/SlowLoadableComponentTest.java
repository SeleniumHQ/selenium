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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public class SlowLoadableComponentTest {

  @Test
  public void testShouldDoNothingIfComponentIsAlreadyLoaded() {
    try {
      new DetonatingSlowLoader().get();
    } catch (RuntimeException e) {
      fail("Did not expect load to be called");
    }
  }

  @Test
  public void testShouldCauseTheLoadMethodToBeCalledIfTheComponentIsNotAlreadyLoaded() {
    int numberOfTimesThroughLoop = 1;
    SlowLoading slowLoading = new SlowLoading(new SystemClock(), 1, numberOfTimesThroughLoop).get();

    assertEquals(numberOfTimesThroughLoop, slowLoading.getLoopCount());
  }

  @Test
  public void testTheLoadMethodShouldOnlyBeCalledOnceIfTheComponentTakesALongTimeToLoad() {
    try {
      new OnlyOneLoad(new SystemClock(), 5, 5).get();
    } catch (RuntimeException e) {
      fail("Did not expect load to be called more than once");
    }
  }

  @Test
  public void testShouldThrowAnErrorIfCallingLoadDoesNotCauseTheComponentToLoadBeforeTimeout() {
    FakeClock clock = new FakeClock();
    try {
      new BasicSlowLoader(clock, 2).get();
    } catch (Error e) {
      // We expect to time out
      return;
    }
    fail();
  }

  @Test
  public void testShouldCancelLoadingIfAnErrorIsDetected() {
    HasError error = new HasError();

    try {
      error.get();
      fail();
    } catch (CustomError e) {
      // This is expected
    }
  }


  private static class DetonatingSlowLoader extends SlowLoadableComponent<DetonatingSlowLoader> {

    public DetonatingSlowLoader() {
      super(new SystemClock(), 1);
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

    private final FakeClock clock;
    private final static int MILLIS_IN_A_SECOND = 1000;

    public BasicSlowLoader(FakeClock clock, int timeOutInSeconds) {
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
      clock.timePasses(MILLIS_IN_A_SECOND);
      throw new Error(); // Never loads
    }
  }

  private static class HasError extends SlowLoadableComponent<HasError> {

    public HasError() {
      super(new FakeClock(), 1000);
    }

    @Override
    protected void load() {
      // does nothing
    }

    @Override
    protected void isLoaded() throws Error {
      fail();
    }

    @Override
    protected void isError() throws Error {
      throw new CustomError();
    }
  }

  private static class CustomError extends Error {

  }
}
