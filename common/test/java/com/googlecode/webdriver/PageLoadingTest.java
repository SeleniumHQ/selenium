package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

public class PageLoadingTest extends AbstractDriverTestCase {
    public void testShouldWaitForDocumentToBeLoaded() {
        driver.get(simpleTestPage);

        assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
    }
    
    public void testShouldFollowRedirectsSentInTheHttpResponseHeaders() {
        driver.get(redirectPage);

        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void testShouldFollowMetaRedirects() throws Exception {
        driver.get(metaRedirectPage);
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }
    
    public void testShouldBeAbleToGetAFragmentOnTheCurrentPage() {
        driver.get(xhtmlTestPage);
        driver.get(xhtmlTestPage + "#text");
    }

    public void testShouldReturnWhenGettingAUrlThatDoesNotResolve() {
        // Of course, we're up the creek if this ever does get registered
        driver.get("http://www.thisurldoesnotexist.comx/");
    }

    public void testShouldReturnWhenGettingAUrlThatDoesNotConnect() {
        // Here's hoping that there's nothing here. There shouldn't be
        driver.get("http://localhost:3001");
    }

    @Ignore("safari")
    public void testShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded() {
        driver.get(framesetPage);

        driver.switchTo().frame(0);
        WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertThat(pageNumber.getText().trim(), equalTo("1"));

        driver.switchTo().frame(1);
        pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertThat(pageNumber.getText().trim(), equalTo("2"));
    }

    @Ignore("safari")
    @NeedsFreshDriver
    public void testSouldDoNothingIfThereIsNothingToGoBackTo() {
        driver.get(formPage);

        driver.navigate().back();
        assertThat(driver.getTitle(), equalTo("We Leave From Here"));
      }

    @Ignore("safari")
      public void testShouldBeAbleToNavigateBackInTheBrowserHistory() {
          driver.get(formPage);

          driver.findElement(By.id("imageButton")).submit();
          assertThat(driver.getTitle(), equalTo("We Arrive Here"));

          driver.navigate().back();
          assertThat(driver.getTitle(), equalTo("We Leave From Here"));
      }

    @Ignore("safari")
      public void testShouldBeAbleToNavigateForwardsInTheBrowserHistory() {
          driver.get(formPage);

          driver.findElement(By.id("imageButton")).submit();
          assertThat(driver.getTitle(), equalTo("We Arrive Here"));

          driver.navigate().back();
          assertThat(driver.getTitle(), equalTo("We Leave From Here"));

          driver.navigate().forward();
          assertThat(driver.getTitle(), equalTo("We Arrive Here"));
      }
}
