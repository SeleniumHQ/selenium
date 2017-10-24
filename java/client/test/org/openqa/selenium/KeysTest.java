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

import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertThat;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public class KeysTest {

  @Test
  public void charAtPosition0ReturnsKeyCode() {
    assertNotSame(Keys.LEFT.charAt(0), 0);
  }

  @Test
  public void charAtOtherPositionReturnsZero() {
    assertEquals(Keys.LEFT.charAt(10), 0);
  }

  @Test
  public void lengthIsAlwaysOne() {
    assertThat(Keys.LEFT.length(), is(1));
  }

  @Test
  public void validSubSequence() {
    assertEquals(Keys.LEFT.subSequence(0, 1), String.valueOf(Keys.LEFT));
  }

  @Test
  public void invalidSubSequenceThrows() {
    Throwable t = catchThrowable(() -> Keys.LEFT.subSequence(-1, 10));
    assertThat(t, instanceOf(IndexOutOfBoundsException.class));
  }

  @Test
  public void buildChord() {
    CharSequence[] sequences = {"foo", Keys.LEFT};
    assertEquals(Keys.chord(sequences), "foo\uE012\uE000");
  }

  @Test
  public void keyForCharacterCode() {
    Keys key = Keys.LEFT;
    assertThat(Keys.getKeyFromUnicode(key.charAt(0)), is(key));
  }

}
