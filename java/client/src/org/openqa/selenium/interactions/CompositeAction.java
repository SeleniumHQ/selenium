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

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableList;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.internal.MultiAction;

import java.util.ArrayList;
import java.util.List;

/**
 * An action for aggregating actions and triggering all of them at the same time.
 *
 */
public class CompositeAction implements Action {
  private WebDriver driver;
  private List<Action> actionsList = new ArrayList<>();

  public CompositeAction() {
  }

  public CompositeAction(WebDriver driver) {
    this.driver = driver;
  }

  public void perform() {
    if (driver != null && driver instanceof CanPerformActionChain) {
      ((CanPerformActionChain) driver).getActionChainExecutor().execute(this);

    } else {
      for (Action action : actionsList) {
        action.perform();
      }
    }
  }

  public CompositeAction addAction(Action action) {
    actionsList.add(action);
    return this;
  }

  @VisibleForTesting
  int getNumberOfActions() {
    return actionsList.size();
  }

  public List<Action> asList() {
    ImmutableList.Builder<Action> builder = new ImmutableList.Builder<>();
    for (Action action : actionsList) {
      if (action instanceof MultiAction) {
        builder.addAll(((MultiAction) action).getActions());
      } else {
        builder.add(action);
      }
    }
    return builder.build();
  }
}
