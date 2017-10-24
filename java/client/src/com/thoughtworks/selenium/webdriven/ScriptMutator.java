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

package com.thoughtworks.selenium.webdriven;

/**
 * A mechanism for taking a single method from a script meant for Selenium Core and converting to
 * something that webdriver can evaluate.
 */
public interface ScriptMutator {
  /**
   * Mutate a script. The original, unmodified script is used to generate a script on the
   * StringBuilder, the "toString" method of which should be used to get the result. We make use of
   * a StringBuilder rather than a normal String so that we can efficiently chain mutators.
   *
   * @param script The original script.
   * @param outputTo The mutated script.
   */
  void mutate(String script, StringBuilder outputTo);
}
