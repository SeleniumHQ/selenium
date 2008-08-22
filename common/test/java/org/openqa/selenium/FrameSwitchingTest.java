package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

public class FrameSwitchingTest extends AbstractDriverTestCase {
	@Ignore("safari")
    public void testShouldContinueToReferToTheSameFrameOnceItHasBeenSelected() {
        driver.get(framesetPage);

        driver.switchTo().frame(2);
        WebElement checkbox = driver.findElement(By.xpath("//input[@name='checky']"));
        checkbox.toggle();
        checkbox.submit();

        assertThat(driver.findElement(By.xpath("//p")).getText(), equalTo("Success!"));
    }

	@Ignore(value = "safari", reason = "Test fails")
    public void testShouldAutomaticallyUseTheFirstFrameOnAPage() {
        driver.get(framesetPage);

        // Notice that we've not switched to the 0th frame
        WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertThat(pageNumber.getText().trim(), equalTo("1"));
    }

	@Ignore(value = "safari", reason = "Test fails")
    public void testShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargettedPage() {
        driver.get(framesetPage);

        driver.findElement(By.linkText("top")).click();
        
        assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
    }

    public void testShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded() {
        driver.get(iframePage);
        driver.findElement(By.id("iframe_page_heading"));
    }

    @Ignore("safari")
    public void testShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage() {
        driver.get(iframePage);
        driver.switchTo().frame(0);

        try {
            driver.switchTo().defaultContent();
            driver.findElement(By.id("iframe_page_heading"));
        } catch (Exception e) {
            fail("Should have switched back to main content");
        }
    }

    @Ignore("safari")
    public void testShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt() {
        driver.get(iframePage);
        driver.switchTo().frame(0);

        driver.findElement(By.id("submitButton")).click();
        String hello = driver.findElement(By.id("greeting")).getText();
        assertThat(hello, equalTo("Success!"));
    }

    @Ignore("safari")
    public void testShouldBeAbleToSelectAFrameByName() {
        driver.get(framesetPage);

        driver.switchTo().frame("second");
        assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("2"));
    }

    @Ignore("safari")
    public void testShouldSelectChildFramesByUsingADotSeparatedString() {
        driver.get(framesetPage);

        driver.switchTo().frame("fourth.child2");
        assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("11"));
    }

    @Ignore("safari")
    public void testShouldSwitchToChildFramesTreatingNumbersAsIndex() {
        driver.get(framesetPage);

        driver.switchTo().frame("fourth.1");
        assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("11"));
    }

    @NoDriverAfterTest
    @Ignore("safari")
    public void testClosingTheFinalBrowserWindowShouldNotCauseAnExceptionToBeThrown() {
        driver.get(simpleTestPage);
        try {
        	driver.close();
        } catch (Exception e) {
        	fail("This is not expected. " + e.getMessage());
        }
    }

    @Ignore("safari")
    public void testShouldBeAbleToFlipToAFrameIdentifiedByItsId() {
        driver.get(framesetPage);

        driver.switchTo().frame("fifth");

        try {
            driver.findElement(By.id("username"));
        } catch (NoSuchElementException e) {
            fail("Driver did not switch by frame id");
        }
    }

    @Ignore("safari")
    public void testShouldThrowAnExceptionWhenAFrameCannotBeFound() {
        driver.get(xhtmlTestPage);

        try {
            driver.switchTo().frame("Nothing here");
            fail("Should not have been able to switch");
        } catch (NoSuchFrameException e) {
            // This is expected
        }
    }

    @Ignore("safari")   
    public void testShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex() {
        driver.get(xhtmlTestPage);

        try {
            driver.switchTo().frame(27);
            fail("Should not have been able to switch");
        } catch (NoSuchFrameException e) {
            // This is expected
        }
    }

    @Ignore("safari")
    public void testShouldBeAbleToFindElementsInIframesByName() {
        driver.get(iframePage);

        driver.switchTo().frame("iframe1");
        WebElement element = driver.findElement(By.name("id-name1"));

        assertNotNull(element);
    }

    @Ignore("safari")
    public void testShouldBeAbleToFindElementsInIframesByXPath() {
        driver.get(iframePage);

        driver.switchTo().frame("iframe1");

        WebElement element = driver.findElement(By.xpath("//*[@id = 'changeme']"));

        assertNotNull(element);
    }
}
