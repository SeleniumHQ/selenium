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

public class VariableDeclarationTest extends TestCase {

  private static final String REPLACEMENT = "selenium.browserbot = {};";
  
  private VariableDeclaration declaration;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    declaration = new VariableDeclaration(
        "selenium.browserbot", REPLACEMENT);
  }

  public void testShouldLeaveThingsWellAloneIfNotNeeded() {
    StringBuilder builder = new StringBuilder();
    declaration.mutate("I like cheese", builder);

    // We don't expect the variable declaration to be written
    assertEquals(builder.toString(), "", builder.toString());
  }

  public void testShouldAddDeclarationIfNecesssary() {
    StringBuilder builder = new StringBuilder();
    declaration.mutate("selenium.browserbot.findElement", builder);

    assertEquals(REPLACEMENT, builder.toString());
  }

  public void testReplacementStillHappensWithStrangeSpacing() {
    StringBuilder builder = new StringBuilder();
    declaration.mutate("selenium   \n\n\n .browserbot .findCheese", builder);

    assertEquals(REPLACEMENT, builder.toString());
  }
}
