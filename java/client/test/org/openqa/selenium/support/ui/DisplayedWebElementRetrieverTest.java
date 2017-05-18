package org.openqa.selenium.support.ui;

import static org.mockito.BDDMockito.given;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.openqa.selenium.By;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.WebElement;

@RunWith(MockitoJUnitRunner.class)
public class DisplayedWebElementRetrieverTest {

  @Mock private WebElementRetrieverHandlingIframes mockedRetriever;
  @Mock private WebElement mockedElement;

  private DisplayedWebElementRetriever sut;

  @Before
  public void setUp() throws Exception {
    sut = new DisplayedWebElementRetriever(mockedRetriever);
  }

  @Test(expected = ElementNotVisibleException.class)
  public void invisibleElement() throws Exception {
    By by = By.id("whatever");
    given(mockedElement.isDisplayed()).willReturn(false);
    WebElement invisibleElement = mockedElement;
    given(mockedRetriever.findElement(by)).willReturn(invisibleElement);

    sut.findElement(by);

    // then exception is thrown
  }


  @Test
  public void visibleElement() throws Exception {
    By by = By.id("whatever");
    given(mockedElement.isDisplayed()).willReturn(true);
    WebElement visibleElement = mockedElement;
    given(mockedRetriever.findElement(by)).willReturn(visibleElement);

    WebElement found = sut.findElement(by);

    Assert.assertSame(mockedElement, found);
  }
}
