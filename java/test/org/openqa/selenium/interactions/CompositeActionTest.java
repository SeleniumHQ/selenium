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

package org.openqa.selenium.interactions;

import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.mockito.InOrder;
import org.mockito.Mockito;

@Tag("UnitTests")
public class CompositeActionTest {

  @Test
  public void invokingActions() {
    CompositeAction sequence = new CompositeAction();
    final Action dummyAction1 = mock(Action.class);
    final Action dummyAction2 = mock(Action.class, "dummy2");
    final Action dummyAction3 = mock(Action.class, "dummy3");

    sequence.addAction(dummyAction1);
    sequence.addAction(dummyAction2);
    sequence.addAction(dummyAction3);
    sequence.perform();

    InOrder order = Mockito.inOrder(dummyAction1, dummyAction2, dummyAction3);
    order.verify(dummyAction1).perform();
    order.verify(dummyAction2).perform();
    order.verify(dummyAction3).perform();
    order.verifyNoMoreInteractions();
  }
}
