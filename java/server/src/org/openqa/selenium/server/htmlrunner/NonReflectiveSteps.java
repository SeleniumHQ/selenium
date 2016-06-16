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

package org.openqa.selenium.server.htmlrunner;


import com.google.common.base.Supplier;
import com.google.common.base.Suppliers;
import com.google.common.collect.ImmutableMap;
import com.google.common.primitives.Booleans;

import com.thoughtworks.selenium.SeleneseTestBase;
import com.thoughtworks.selenium.SeleniumException;

import java.util.List;
import java.util.logging.Logger;

class NonReflectiveSteps {
  private static final Logger LOG = Logger.getLogger("Selenium Core Step");
  private static final ImmutableMap<String, CoreStepFactory> wrappableSteps =
    new ReflectivelyDiscoveredSteps().get();

  private static Supplier<ImmutableMap<String, CoreStepFactory>> STEPS =
    Suppliers.memoize(() -> build());

  public ImmutableMap<String, CoreStepFactory> get() {
    return STEPS.get();
  }

  private static ImmutableMap<String, CoreStepFactory> build() {
    ImmutableMap.Builder<String, CoreStepFactory> steps = ImmutableMap.builder();

    CoreStepFactory nextCommandFails = (remainingSteps, locator, value) -> {
      if (!remainingSteps.hasNext()) {
        throw new SeleniumException("Next command not present. Unable to assert failure");
      }
      List<String> toWrap = remainingSteps.next();
      if (!wrappableSteps.containsKey(toWrap.get(0))) {
        throw new SeleniumException("Unable to wrap: " + toWrap.get(0));
      }

      return (selenium -> {
        Object result;

        try {
          result = wrappableSteps.get(toWrap.get(0)).create(null, locator, value).execute(selenium);
        } catch (SeleniumException e) {
          result = e.getMessage();
        }

        SeleneseTestBase.assertEquals(value, String.valueOf(result));
        return null;
      });
    };
    // Not ideal, but it'll help us move things forward
    steps.put("assertErrorOnNext", nextCommandFails);
    steps.put("assertFailureOnNext", nextCommandFails);

    steps.put("echo", ((remainingSteps, locator, value) -> (selenium) -> {
      LOG.info(locator);
      return null;
    }));

    steps.put("pause", ((remainingSteps, locator, value) -> (selenium) -> {
      try {
        long timeout = Long.parseLong(locator);
        Thread.sleep(timeout);
        return null;
      } catch (NumberFormatException e) {
        throw new SeleniumException("Unable to parse timeout: " + locator);
      } catch (InterruptedException e) {
        System.exit(255);
        throw new CoreRunnerError("We never get this far");
      }
    }));
    return steps.build();
  }
}
