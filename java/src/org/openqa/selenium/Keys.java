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

import java.util.Arrays;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

/**
 * Representations of pressable keys that aren't text. These are stored in the Unicode PUA (Private
 * Use Area) code points, 0xE000–0xF8FF. These values are used internally by WebDriver to simulate
 * keyboard input where standard Unicode characters are insufficient, such as modifier and control
 * keys.
 *
 * <p>The codes follow conventions partially established by the W3C WebDriver specification and the
 * Selenium project. Some values (e.g., RIGHT_SHIFT, RIGHT_COMMAND) are used in ChromeDriver but are
 * not currently part of the W3C spec. Others (e.g., OPTION, FN) are symbolic and reserved for
 * possible future mapping.
 *
 * <p>For consistency across platforms and drivers, values should be verified before assuming native
 * support.
 *
 * @see <a href="https://www.w3.org/TR/webdriver/#keyboard-actions">W3C WebDriver Keyboard
 *     Actions</a>
 * @see <a href="http://www.google.com.au/search?&q=unicode+pua&btnK=Search">Unicode PUA
 *     Overview</a>
 */
@NullMarked
public enum Keys implements CharSequence {
  // Basic control characters
  NULL('\uE000'),
  CANCEL('\uE001'), // ^break
  HELP('\uE002'),
  BACK_SPACE('\uE003'),
  TAB('\uE004'),
  CLEAR('\uE005'),
  RETURN('\uE006'),
  ENTER('\uE007'),
  SHIFT('\uE008'),
  LEFT_SHIFT(Keys.SHIFT),
  CONTROL('\uE009'),
  LEFT_CONTROL(Keys.CONTROL),
  ALT('\uE00A'),
  LEFT_ALT(Keys.ALT),
  PAUSE('\uE00B'),
  ESCAPE('\uE00C'),
  SPACE('\uE00D'),
  PAGE_UP('\uE00E'),
  PAGE_DOWN('\uE00F'),
  END('\uE010'),
  HOME('\uE011'),
  LEFT('\uE012'),
  ARROW_LEFT(Keys.LEFT),
  UP('\uE013'),
  ARROW_UP(Keys.UP),
  RIGHT('\uE014'),
  ARROW_RIGHT(Keys.RIGHT),
  DOWN('\uE015'),
  ARROW_DOWN(Keys.DOWN),
  INSERT('\uE016'),
  DELETE('\uE017'),
  SEMICOLON('\uE018'),
  EQUALS('\uE019'),

  // Number pad keys
  NUMPAD0('\uE01A'),
  NUMPAD1('\uE01B'),
  NUMPAD2('\uE01C'),
  NUMPAD3('\uE01D'),
  NUMPAD4('\uE01E'),
  NUMPAD5('\uE01F'),
  NUMPAD6('\uE020'),
  NUMPAD7('\uE021'),
  NUMPAD8('\uE022'),
  NUMPAD9('\uE023'),
  MULTIPLY('\uE024'),
  ADD('\uE025'),
  SEPARATOR('\uE026'),
  SUBTRACT('\uE027'),
  DECIMAL('\uE028'),
  DIVIDE('\uE029'),

  // Function keys
  F1('\uE031'),
  F2('\uE032'),
  F3('\uE033'),
  F4('\uE034'),
  F5('\uE035'),
  F6('\uE036'),
  F7('\uE037'),
  F8('\uE038'),
  F9('\uE039'),
  F10('\uE03A'),
  F11('\uE03B'),
  F12('\uE03C'),

  META('\uE03D'),
  COMMAND(Keys.META),

  // Extended macOS/ChromeDriver keys (based on observed Chrome usage)
  RIGHT_SHIFT('\uE050'), // aligns with ChromeDriver usage
  RIGHT_CONTROL('\uE051'),
  RIGHT_ALT('\uE052'),
  RIGHT_COMMAND('\uE053'),

  // Symbolic macOS keys not yet standardized
  OPTION('\uE052'),
  FN('\uE051'), // TODO: symbolic only; confirm or remove in future

  ZENKAKU_HANKAKU('\uE040');

  private final char keyCode;
  private final int codePoint;

  Keys(Keys key) {
    this(key.charAt(0));
  }

  Keys(char keyCode) {
    this.keyCode = keyCode;
    this.codePoint = String.valueOf(keyCode).codePoints().findFirst().getAsInt();
  }

  public int getCodePoint() {
    return codePoint;
  }

  @Override
  public char charAt(int index) {
    if (index == 0) {
      return keyCode;
    }
    return 0;
  }

  @Override
  public int length() {
    return 1;
  }

  @Override
  public CharSequence subSequence(int start, int end) {
    if (start == 0 && end == 1) {
      return String.valueOf(keyCode);
    }
    throw new IndexOutOfBoundsException();
  }

  @Override
  public String toString() {
    return String.valueOf(keyCode);
  }

  /**
   * Simulate pressing many keys at once in a "chord". Takes a sequence of Keys.XXXX or strings;
   * appends each to a string, adds the chord termination key (Keys.NULL), and returns it.
   *
   * <p>Note: Keys.NULL signals release of modifier keys like CTRL/ALT/SHIFT via keyup events.
   *
   * @param value characters to send
   * @return String representation of the char sequence
   */
  public static String chord(CharSequence... value) {
    return chord(Arrays.asList(value));
  }

  /**
   * Overload of {@link #chord(CharSequence...)} that accepts an iterable.
   *
   * @param value characters to send
   * @return String representation of the char sequence
   */
  public static String chord(Iterable<CharSequence> value) {
    StringBuilder builder = new StringBuilder();
    for (CharSequence seq : value) {
      builder.append(seq);
    }
    builder.append(Keys.NULL);
    return builder.toString();
  }

  /**
   * Retrieves the {@link Keys} enum constant corresponding to the given Unicode character.
   *
   * @param key unicode character code
   * @return special key linked to the character code, or null if not found
   */
  public static @Nullable Keys getKeyFromUnicode(char key) {
    for (Keys unicodeKey : values()) {
      if (unicodeKey.charAt(0) == key) {
        return unicodeKey;
      }
    }
    return null;
  }
}
