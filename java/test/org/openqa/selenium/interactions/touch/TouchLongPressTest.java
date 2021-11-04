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

package org.openqa.selenium.interactions.touch;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.interactions.TouchScreen;

/**
 * Tests the long press action.
 */
public class TouchLongPressTest {

  @Mock private TouchScreen mockTouch;
  @Mock private Coordinates mockCoordinates;
  @Mock private Locatable locatableStub;

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);
    when(locatableStub.getCoordinates()).thenReturn(mockCoordinates);
  }

  @Test
  public void testCanLongPress() {
    LongPressAction longPress = new LongPressAction(mockTouch, locatableStub);
    longPress.perform();

    verify(mockTouch).longPress(mockCoordinates);
    verifyNoMoreInteractions(mockTouch);
    verifyNoInteractions(mockCoordinates);
  }
}
