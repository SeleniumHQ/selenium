/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

import org.openqa.selenium.internal.seleniumemulation.GlobTextMatchingStrategy;


public class GlobTextMatchingStrategyTest extends TestCase {
	public void testShouldMatchAgainstASimplePattern() {
		GlobTextMatchingStrategy glob = new GlobTextMatchingStrategy();
		boolean result = glob.isAMatch("This is a test", "This is a test");
		
		assertTrue(result);
	}
	
	public void testShouldMatchAgainstAMultilinePattern() {
		GlobTextMatchingStrategy glob = new GlobTextMatchingStrategy();
		boolean result = glob.isAMatch("This is a test", "\n\nThis is a test.\n\n");
		assertTrue(result);
	}
	
	public void testShouldMatchAgainstAPatternContainingAFullStop() {
		GlobTextMatchingStrategy glob = new GlobTextMatchingStrategy();
		boolean result = glob.isAMatch("This is a test of the open command.", "This is a test of the open command.");
		assertTrue(result);
	}
	
	public void testShouldMatchUsingAStringThatIsASubstringOfTheFullText() {
		GlobTextMatchingStrategy glob = new GlobTextMatchingStrategy();
		boolean result = glob.isAMatch("test", "This is a test of the open command.");
		assertTrue(result);
	}
	
	public void testShouldMatchAStarAgainstManyCharacters() {
		GlobTextMatchingStrategy glob = new GlobTextMatchingStrategy();
		boolean result = glob.isAMatch("This * test", "\t\r\nThis is a test of the open command.");
		assertTrue(result);
	}

  public void testShouldMatchEvenWhenTextIsAtTheStartOfAString() {
    GlobTextMatchingStrategy glob = new GlobTextMatchingStrategy();

    // The second text contains the nbsp character.
		boolean result = glob.isAMatch("this is the span",
        "this is the span    first option second option third,,option Line 1 Line 2  th1th2abcdf1f2 ");
		assertTrue(result);
  }
}
