/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.htmlunit;

import org.junit.Test;
import org.openqa.selenium.Keys;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class InputKeysContainerTest {
  @Test
  public void testConstructionFromSingleCharSequence() {
    CharSequence sequence = "abc";
    InputKeysContainer container = new InputKeysContainer(sequence);

    assertEquals("Should be the same as input sequence", "abc", container.toString());
  }

  @Test
  public void testConstructionFromMultipleSequences() {
    CharSequence seq1 = "abc";
    CharSequence seq2 = "def";

    InputKeysContainer container = new InputKeysContainer(seq1, " ", seq2);
    assertEquals("Should be concatenation of two sequences with space", "abc def",
        container.toString());
  }

  @Test
  public void testShouldTerminateStringAtSubmissionKey() {
    InputKeysContainer container = new InputKeysContainer(true, "abc", Keys.ENTER, "def");

    assertEquals("Should not get a string past Keys.ENTER", "abc",
        container.toString());
    assertTrue("Was supposed to identify submit key.", container.wasSubmitKeyFound());
  }

  @Test
  public void testShouldNotTerminateAStringIfNotRequested() {
    InputKeysContainer container = new InputKeysContainer(false, "abc", Keys.ENTER, "def");

    assertEquals("Should get the entire string", "abc" + '\uE007' + "def",
        container.toString());
    assertTrue("Was supposed to identify submit key.", container.wasSubmitKeyFound());
  }

  @Test
  public void testShouldCapitalizeWhenAsked() {
    InputKeysContainer container = new InputKeysContainer(false, "abc", Keys.ENTER, "def");
    container.setCapitalization(true);

    assertEquals("Should get the a capitalized string", "ABC" + '\uE007' + "DEF",
        container.toString());
  }
}
