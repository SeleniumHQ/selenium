/*
Copyright 2007-2010 Selenium committers

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

package org.openqa.selenium.interactions;

import static org.junit.Assert.assertEquals;

import org.jmock.Expectations;
import org.jmock.integration.junit4.JUnitRuleMockery;
import org.junit.Rule;
import org.junit.Test;

/**
 * Tests the CompositeAction class
 * 
 */
public class CompositeActionTest {

  @Rule public JUnitRuleMockery mockery = new JUnitRuleMockery();

  @Test
  public void addingActions() {
    CompositeAction sequence = new CompositeAction();
    final Action dummyAction1 = mockery.mock(Action.class);
    final Action dummyAction2 = mockery.mock(Action.class, "dummy2");
    final Action dummyAction3 = mockery.mock(Action.class, "dummy3");

    sequence.addAction(dummyAction1)
        .addAction(dummyAction2)
        .addAction(dummyAction3);

    assertEquals(3, sequence.getNumberOfActions());
  }

  @Test
  public void invokingActions() {
    CompositeAction sequence = new CompositeAction();
    final Action dummyAction1 = mockery.mock(Action.class);
    final Action dummyAction2 = mockery.mock(Action.class, "dummy2");
    final Action dummyAction3 = mockery.mock(Action.class, "dummy3");

    sequence.addAction(dummyAction1);
    sequence.addAction(dummyAction2);
    sequence.addAction(dummyAction3);

    mockery.checking(new Expectations() {{
      oneOf(dummyAction1).perform();
      oneOf(dummyAction2).perform();
      oneOf(dummyAction3).perform();
    }});

    sequence.perform();
  }
}
