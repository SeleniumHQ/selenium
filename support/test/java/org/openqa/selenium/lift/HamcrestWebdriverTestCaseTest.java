package org.openqa.selenium.lift;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

import org.hamcrest.Matcher;
import org.jmock.Expectations;
import org.jmock.Sequence;
import org.jmock.integration.junit3.MockObjectTestCase;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;

/**
 * Unit test for {@link HamcrestWebDriverTestCase}.
 * @author rchatley (Robert Chatley)
 *
 */
@SuppressWarnings("unchecked")
public class HamcrestWebdriverTestCaseTest extends MockObjectTestCase {

	final String text = "abcde";
	final String url = "http://www.example.com";
	Finder<WebElement, WebDriver> something = mock(Finder.class);
	Matcher<Integer> someNumberOf = mock(Matcher.class);

	HamcrestWebDriverTestCase testcase = createTestCase();
	
	public void testDelegatesAllCallsToItsTestContext() {
		
		final TestContext testContext = mock(TestContext.class);
		testcase.setContext(testContext);
		
		final Sequence given = sequence("given here");
		
		checking(new Expectations() {{ 
			one(testContext).goTo(url); inSequence(given);
			one(testContext).clickOn(something); inSequence(given);
			one(testContext).type(text, something); inSequence(given);
			one(testContext).assertPresenceOf(something); inSequence(given);
			one(testContext).assertPresenceOf(someNumberOf, something); inSequence(given);
		}});
		
		testcase.goTo(url);
		testcase.clickOn(something);
		testcase.type(text, something);
		testcase.assertPresenceOf(something);
		testcase.assertPresenceOf(someNumberOf, something);
	}
	
	public void testProvidesSyntacticSugarMethodNamedInto() throws Exception {
		
		Finder<WebElement, WebDriver> result = testcase.into(something);
		assertThat(result, is(something));
	}

	private HamcrestWebDriverTestCase createTestCase() {
		HamcrestWebDriverTestCase testcase = new HamcrestWebDriverTestCase() {

			@Override
			protected WebDriver createDriver() {
				return mock(WebDriver.class);
			}
		};
		return testcase;
	}
	
}
