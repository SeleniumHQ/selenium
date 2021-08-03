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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.Keys.LEFT;
import static org.openqa.selenium.Keys.chord;
import static org.openqa.selenium.Keys.getKeyFromUnicode;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.testing.UnitTests;

@Category(UnitTests.class)
public class KeysTest {

  @Test
  public void charAtPosition0ReturnsKeyCode() {
    assertThat(Keys.LEFT.charAt(0)).isNotEqualTo(0);
  }

  @Test
  public void charAtOtherPositionReturnsZero() {
    assertThat(Keys.LEFT.charAt(10)).isEqualTo((char) 0);
  }

  @Test
  public void lengthIsAlwaysOne() {
    assertThat(LEFT.length()).isEqualTo(1);
  }

  @Test
  public void validSubSequence() {
    assertThat(String.valueOf(LEFT)).isEqualTo(LEFT.subSequence(0, 1));
  }

  @Test
  public void invalidSubSequenceThrows() {
    assertThatExceptionOfType(IndexOutOfBoundsException.class)
        .isThrownBy(() -> LEFT.subSequence(-1, 10));
  }

  @Test
  public void buildChord() {
    CharSequence[] sequences = {"foo", Keys.LEFT};
    assertThat(chord(sequences)).isEqualTo("foo\uE012\uE000");
  }

  @Test
  public void keyForCharacterCode() {
    Keys key = Keys.LEFT;
    assertThat((CharSequence) getKeyFromUnicode(key.charAt(0))).isEqualTo(key);
  }

}
