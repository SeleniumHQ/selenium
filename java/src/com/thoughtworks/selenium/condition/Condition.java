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
package com.thoughtworks.selenium.condition;

/**
 * Simple predicate class, which also knows how to wait for the condition to be true. Used by
 * Selenium tests.
 * <p>
 * Conditions have two basic properties:
 * <ul>
 * <li>a message (purely used for displaying purposes)
 * <li>an implementation of
 * {@link Condition#isTrue(ConditionRunner.Context)}
 * </ul>
 */
public abstract class Condition {

  private final String message;

  /**
   * Creates an instance of Condition with is canonical name as message
   */
  protected Condition() {
    message = getClass().getCanonicalName();
  }

  /**
   * Creates an instance of Condition with the given {@code message} and {@code args}, which are in
   * the {@link String#format(String, Object...)} model.
   *
   * @param message message
   * @param args    args
   */
  protected Condition(String message, Object[] args) {
    if (null == message) {
      throw new NullPointerException("Condition names must not be null");
    }
    this.message = String.format(message, args);
  }

  // drop these for var-args in another year.
  protected Condition(String message) {
    this(message, new Object[0]);
  }

  protected Condition(String message, Object arg) {
    this(message, new Object[]{arg});
  }

  protected Condition(String message, Object arg0, Object arg1) {
    this(message, new Object[]{arg0, arg1});
  }

  protected Condition(String message, Object arg0, Object arg1, Object arg2) {
    this(message, new Object[]{arg0, arg1, arg2});
  }

  protected Condition(String message, Object arg0, Object arg1, Object arg2, Object arg3) {
    this(message, new Object[]{arg0, arg1, arg2, arg3});
  }

  protected Condition(String message, Object arg0, Object arg1, Object arg2, Object arg3,
                      Object arg4) {
    this(message, new Object[]{arg0, arg1, arg2, arg3, arg4});
  }

  public abstract boolean isTrue(ConditionRunner.Context runner);

  public String getMessage() {
    return toString();
  }

  @Override
  public String toString() {
    return "Condition \"" + message + "\"";
  }
}
