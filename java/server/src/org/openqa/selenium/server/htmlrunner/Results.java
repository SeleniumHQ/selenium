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

import com.google.common.base.Function;
import com.google.common.collect.FluentIterable;

import org.openqa.selenium.internal.BuildInfo;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import javax.swing.text.MutableAttributeSet;
import javax.swing.text.html.HTML;
import javax.swing.text.html.HTMLDocument;
import javax.swing.text.html.HTMLEditorKit;

public class Results {

  private final String suiteSource;
  private final List<String> allTables = new LinkedList<>();
  private final List<Boolean> allResults = new LinkedList<>();
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
    succeeded &= passed;

    allTables.add(
      massage(rawSource, "insert-core-result", stepResults, input -> input.getRenderableClass()));
    allResults.add(passed);
  }

  private <X> String massage(
    String rawSource,
    String toSubstitute,
    List<X> toConvert,
    Function<X, String> transform) {

    Reader stringReader = new StringReader(rawSource);
    HTMLEditorKit htmlKit = new HTMLEditorKit();
    HTMLDocument doc = (HTMLDocument) htmlKit.createDefaultDocument();
    HTMLEditorKit.Parser parser = doc.getParser();
    doc.setAsynchronousLoadPriority(-1);
    ElementCallback callback;
    try {
      callback = new ElementCallback(
        toSubstitute,
        FluentIterable.from(toConvert).transform(transform).iterator());
      parser.parse(stringReader, callback, true);
    } catch (IOException e) {
      throw new RuntimeException("Unable to parse test table");
    }

    StringBuilder sb = new StringBuilder();
    int previousPosition = rawSource.length();
    for (int i = callback.tagPositions.size() - 1; i >= 0; i--) {
      int pos = callback.tagPositions.get(i);
      String toReplace = callback.originals.get(i);
      String substitution = callback.substitutions.get(i);
      String snippet = rawSource.substring(pos, previousPosition).replace('\\', '/');
      String replaceSnippet = snippet.replaceFirst("\\Q" + toReplace + "\\E", substitution);
      sb.insert(0, replaceSnippet);
      previousPosition = pos;
    }
    String snippet = rawSource.substring(0, previousPosition);
    sb.insert(0, snippet);

    return sb.toString();
  }

  public HTMLTestResults toSuiteResult() {
    BuildInfo buildInfo = new BuildInfo();

    return new HTMLTestResults(
      buildInfo.getReleaseLabel(),
      buildInfo.getBuildRevision(),
      isSuccessful() ? "PASS" : "FAIL",
      String.valueOf(System.currentTimeMillis() - start),
      String.valueOf(allTables.size()),
      String.valueOf(numberOfPasses),
      String.valueOf(allTables.size() - numberOfPasses),
      String.valueOf(commandPasses),
      String.valueOf(commandFailures),
      String.valueOf(commandErrors),
      massage(
        suiteSource,
        "insert-test-result",
        allResults,
        input -> input ? "status_passed" : "status_failed"),
      allTables,
      log.toString());
  }

  private static class ElementCallback extends HTMLEditorKit.ParserCallback {
    private final String toSubstitute;
    private final List<Integer> tagPositions = new LinkedList<>();
    private final List<String> originals = new LinkedList<>();
    private final List<String> substitutions = new LinkedList<>();
    private final Iterator<String> allResults;

    public ElementCallback(String toSubstitute, Iterator<String> allResults) {
      this.toSubstitute = toSubstitute;
      this.allResults = allResults;
    }

    @Override
    public void handleStartTag(HTML.Tag tag, MutableAttributeSet attrs, int pos) {
      if (allResults.hasNext() && HTML.Tag.TR.equals(tag)) {
        Object rawAttr = attrs.getAttribute(HTML.Attribute.CLASS);
        if (rawAttr != null) {
          String classes = String.valueOf(rawAttr);
          if (classes.contains(toSubstitute)) {
            String result = allResults.next();
            originals.add(classes);
            substitutions.add(classes.replace(toSubstitute, result));
            tagPositions.add(pos);
          }
        }
      }
    }
  }
}
