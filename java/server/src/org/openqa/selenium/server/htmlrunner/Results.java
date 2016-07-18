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

package org.openqa.selenium.server.htmlrunner;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;

import org.openqa.selenium.internal.BuildInfo;

import java.util.LinkedList;
import java.util.List;

public class Results {

  private final String suiteSource;
  private final List results = new LinkedList<>();
  private final List<String> allTables = new LinkedList<>();
  private final StringBuilder log = new StringBuilder();
  private final long start = System.currentTimeMillis();

  private boolean succeeded = true;
  private long numberOfPasses;
  private long commandPasses;
  private long commandFailures;
  private long commandErrors;

  public Results(String suiteSource) {
    this.suiteSource = suiteSource;
  }

  public boolean isSuccessful() {
    return succeeded;
  }

  public void addTest(String rawSource, List<CoreTestCase.StepResult> stepResults) {
    allTables.add(rawSource);
    boolean passed = true;
    for (CoreTestCase.StepResult stepResult : stepResults) {
      passed &= stepResult.isSuccessful();
      if (stepResult.isSuccessful()) {
        commandPasses++;
      } else if (stepResult.isError()) {
        commandErrors++;
      } else {
        commandFailures++;
      }

      log.append(stepResult.getStepLog()).append("\n");
    }

    if (passed) {
      numberOfPasses++;
    }
  }

  public HTMLTestResults toSuiteResult() {
    BuildInfo buildInfo = new BuildInfo();

    return new HTMLTestResults(
      buildInfo.getReleaseLabel(),
      buildInfo.getBuildRevision(),
      isSuccessful() ? "PASS" : "FAIL",
      String.valueOf(SECONDS.convert(System.currentTimeMillis() - start, MILLISECONDS)),
      String.valueOf(results.size()),
      String.valueOf(numberOfPasses),
      String.valueOf(results.size() - numberOfPasses),
      String.valueOf(commandPasses),
      String.valueOf(commandFailures),
      String.valueOf(commandErrors),
      suiteSource,
      allTables,
      log.toString());
  }
}
