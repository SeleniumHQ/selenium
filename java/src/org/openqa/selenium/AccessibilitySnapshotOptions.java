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

import java.util.Objects;

/**
 * What an accessibility snapshot leaves out. Every option has a default, so {@link #defaults()} is
 * the snapshot {@link WebDriver#getAccessibilitySnapshot()} takes; instances are immutable and each
 * {@code with} method returns a new one.
 *
 * <pre>
 * AccessibilitySnapshotOptions unpruned =
 *     AccessibilitySnapshotOptions.defaults().withInterestingOnly(false);
 * AccessibilityNode full = driver.getAccessibilitySnapshot(unpruned);
 * </pre>
 */
public final class AccessibilitySnapshotOptions {

  private static final AccessibilitySnapshotOptions DEFAULTS =
      new AccessibilitySnapshotOptions(true);

  private final boolean interestingOnly;

  private AccessibilitySnapshotOptions(boolean interestingOnly) {
    this.interestingOnly = interestingOnly;
  }

  /** The default snapshot: unnamed generic and presentational nodes pruned. */
  public static AccessibilitySnapshotOptions defaults() {
    return DEFAULTS;
  }

  /**
   * With {@code true}, the default, elements of role {@code generic}, {@code none} or {@code
   * presentation} with no name produce no node and their children take their place. With {@code
   * false} every rendered element produces a node, with the role it has, as Puppeteer's {@code
   * accessibility.snapshot({ interestingOnly: false })} does.
   *
   * @param interestingOnly whether to prune
   * @return options with this setting
   */
  public AccessibilitySnapshotOptions withInterestingOnly(boolean interestingOnly) {
    return interestingOnly == this.interestingOnly
        ? this
        : new AccessibilitySnapshotOptions(interestingOnly);
  }

  /**
   * @return whether unnamed generic and presentational nodes are pruned
   */
  public boolean isInterestingOnly() {
    return interestingOnly;
  }

  @Override
  public boolean equals(Object o) {
    return o instanceof AccessibilitySnapshotOptions
        && ((AccessibilitySnapshotOptions) o).interestingOnly == interestingOnly;
  }

  @Override
  public int hashCode() {
    return Objects.hash(interestingOnly);
  }

  @Override
  public String toString() {
    return "AccessibilitySnapshotOptions{interestingOnly=" + interestingOnly + "}";
  }
}
