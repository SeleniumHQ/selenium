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

/**
 * Interface representing basic, low-level keyboard operations.  It offers a set of low-level "do as
 * I say" commands to allow precise emulation of user input.
 *
 * @deprecated Use {@link Actions} and {@link KeyInput} instead.
 */
@Deprecated
public interface Keyboard {

  /**
   * Sends keys to the keyboard representation in the browser.
   *
   * Special keys that are not text, represented as {@link org.openqa.selenium.Keys} are recognized
   * both as part of sequences of characters, or individually.
   *
   * Modifier keys are preserved throughout the lifetime of the send keys operation, and are
   * released upon this method returning.
   *
   * @param keysToSend one or more sequences of characters or key representations to type on the
   *                   keyboard
   * @throws IllegalArgumentException if keysToSend is null
   */
  void sendKeys(CharSequence... keysToSend);

  /**
   * Press a key on the keyboard that isn't text.  Please see {@link org.openqa.selenium.Keys} for
   * an exhaustive list of recognized pressable keys.
   *
   * If <code>keyToPress</code> is a sequence of characters, different driver implementations may
   * choose to throw an exception or to read only the first character in the sequence.
   *
   * @param keyToPress the key to press, if a sequence only the first character will be read or an
   *                   exception is thrown
   */
  void pressKey(CharSequence keyToPress);

  /**
   * Release a key on the keyboard that isn't text.  Please see {@link org.openqa.selenium.Keys} for
   * an exhaustive list of recognized pressable keys.
   *
   * If <code>keyToRelease</code> is a sequence of characters, different driver implementations may
   * choose to throw an exception or to read only the first character in the sequence.
   *
   * @param keyToRelease the key to press, if a sequence only the first character will be read or an
   *                     exception is thrown
   */
  void releaseKey(CharSequence keyToRelease);

}
