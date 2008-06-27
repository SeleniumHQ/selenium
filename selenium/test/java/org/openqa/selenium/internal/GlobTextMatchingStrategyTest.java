package org.openqa.selenium.internal;

import junit.framework.TestCase;


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
}
