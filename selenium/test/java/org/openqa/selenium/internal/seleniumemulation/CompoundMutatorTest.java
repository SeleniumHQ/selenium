/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.internal.seleniumemulation;

import junit.framework.TestCase;

public class CompoundMutatorTest extends TestCase {
  private ScriptMutator mutator;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    mutator = new CompoundMutator("http://selenium.googlecode.com");
  }

  public void testLeavesAPlainScriptIntact() {
    StringBuilder builder = new StringBuilder();
    
    mutator.mutate("return document", builder);

    assertTrue(builder.toString().contains("return document"));
  }
  
  public void testEscapesNewLines() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return\ndocument", builder);

    assertTrue(builder.toString().contains("return\\ndocument"));
  }
  
  public void testEscapesSingleQuotes() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return 'document'", builder);

    assertTrue(builder.toString().contains("return \\'document\\'"));
  }

  public void testReplacesReferencesViaSeleniumToDocument() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return selenium.browserbot.getDocument()", builder);
    String script = builder.toString();

    assertTrue(script, script.contains("selenium.browserbot = {}"));
    assertTrue(script, script.contains("selenium = {}"));
    assertTrue(script, script.contains("getDocument = function() { return document; }"));
  }

  public void testShouldWrapJavascriptInAnEvalStatement() {
    StringBuilder builder = new StringBuilder();

    mutator.mutate("return selenium.browserbot.getDocument()", builder);
    String script = builder.toString();

    assertTrue(script, script.startsWith("return eval('"));
    assertTrue(script, script.endsWith("');"));
  }
}
