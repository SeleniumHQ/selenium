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
 * Used as the basis of {@link Sequence}s for the W3C WebDriver spec <a
 * href="https://www.w3.org/TR/webdriver/#actions">Action commands</a>.
 */
public abstract class Interaction {

  private final InputSource source;

  protected Interaction(InputSource source) {
    // Avoiding a guava dependency.
    if (source == null) {
      throw new NullPointerException("Input source must not be null");
    }
    this.source = source;
  }

  protected boolean isValidFor(SourceType sourceType) {
    return source.getInputType() == sourceType;
  }

  public InputSource getSource() {
    return source;
  }
}
