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

import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public class CompoundMutatorTest {
  private ScriptMutator mutator;

  @Before
  public void setUp() {
    mutator = new CompoundMutator("http://selenium.googlecode.com");
  }

  @Test
  public void testLeavesAPlainScriptIntact() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return document", builder);

    assertTrue(builder.toString().contains("return document"));
  }

  @Test
  public void testEscapesNewLines() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return\ndocument", builder);

    assertTrue(builder.toString().contains("return\\ndocument"));
  }

  @Test
  public void testEscapesSingleQuotes() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return 'document'", builder);

    assertTrue(builder.toString().contains("return \\'document\\'"));
  }

  @Test
  public void testReplacesReferencesViaSeleniumToDocument() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return selenium.browserbot.getDocument()", builder);
    String script = builder.toString();

    assertTrue(script, script.contains("selenium.browserbot = {}"));
    assertTrue(script, script.contains("selenium = {}"));
    assertTrue(script, script.contains("getDocument = function() { return document; }"));
  }

  @Test
  public void testShouldWrapJavascriptInAnEvalStatement() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return selenium.browserbot.getDocument()", builder);
    String script = builder.toString();

    assertTrue(script, script.startsWith("return eval('"));
    assertTrue(script, script.endsWith("');"));
  }
}
