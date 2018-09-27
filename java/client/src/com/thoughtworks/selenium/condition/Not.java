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
 * Simple predicate class, which also knows how to wait for its condition to be true. Used by
 * Selenium tests. A "Not" is the inverse of any other Condition.
 */
public class Not extends Condition {
  private Condition positiveCondition;

  public Not(Condition positiveCondition) {
    super("NOT of (" + positiveCondition.getMessage() + ")");
    this.positiveCondition = positiveCondition;
  }

  @Override
  public boolean isTrue(ConditionRunner.Context context) {
    return !positiveCondition.isTrue(context);
  }

}
