/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.support.ui;

import junit.framework.TestCase;

public class LoadableComponentTest extends TestCase {
  public void testShouldDoNothingIfComponentIsAlreadyLoaded() {
    try {
      new DetonatingComponent().get();
    } catch (RuntimeException e) {
      fail("Should not have called the load method");
    }
  }

  public void testShouldCauseTheLoadMethodToBeCalledIfTheComponentIsNotAlreadyLoaded() {
    LoadsOk ok = new LoadsOk(true);

    ok.get();

    assertTrue(ok.wasLoadCalled());
  }

  public void testShouldThrowAnErrorIfCallingLoadDoesNotCauseTheComponentToLoad() {
    LoadsOk ok = new LoadsOk(false);

    try {
      ok.get();
      fail();
    } catch (Error e) {
      assertEquals("Expected failure", e.getMessage());
    }
  }

  private static class DetonatingComponent extends LoadableComponent<DetonatingComponent> {

    protected void load() {
      throw new RuntimeException("I should never be called");
    }

    protected void isLoaded() throws Error {
      // Do nothing
    }
  }

  private static class LoadsOk extends LoadableComponent<LoadsOk> {
    private final boolean secondLoadCallPasses;
    private boolean callOfLoadMethodForced;
    private boolean loadCalled;

    public LoadsOk(boolean secondLoadCallPasses) {
      this.secondLoadCallPasses = secondLoadCallPasses;
    }

    protected void load() {
      loadCalled = true;
    }

    protected void isLoaded() throws Error {
      if (!callOfLoadMethodForced) {
        callOfLoadMethodForced = true;
        throw new Error("Never reported in test");
      }

      if (!secondLoadCallPasses) {
        throw new Error("Expected failure");
      }
    }

    public boolean wasLoadCalled() {
      return loadCalled;
    }
  }
}
