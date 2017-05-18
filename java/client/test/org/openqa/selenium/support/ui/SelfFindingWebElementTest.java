package org.openqa.selenium.support.ui;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

@RunWith(MockitoJUnitRunner.class)
public class SelfFindingWebElementTest {

  @Mock private WebElementRetriever mockedRetriever;
  @Mock private WebElement mockedElement;
  @Mock private By mockedBy;
  private SelfFindingWebElement sut;

  @Before
  public void setUp() {
    given(mockedRetriever.findElement(mockedBy)).willReturn(mockedElement);
    sut = new SelfFindingWebElement(mockedBy, mockedRetriever);
  }

  @Test
  public void testClick() {
    // when
    sut.click();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testSubmit() {
    // when
    sut.submit();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testSendKeys() {
    // when
    sut.sendKeys("whatever");

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testClear() {
    // when
    sut.clear();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testGetTagName() {
    // when
    sut.getTagName();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testGetAttribute() {
    // when
    sut.getAttribute("whatever");

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testIsSelected() {
    // when
    sut.isSelected();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testIsEnabled() {
    // when
    sut.isEnabled();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testGetText() {
    // when
    sut.getText();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testFindElements() {
    // when
    sut.findElements(By.id("whatever"));

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testFindElement() {
    // when
    sut.findElement(By.id("whatever"));

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testIsDisplayed() {
    // when
    sut.isDisplayed();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testGetLocation() {
    // when
    sut.getLocation();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testGetSize() {
    // when
    sut.getSize();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testGetRect() {
    // when
    sut.getRect();

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testGetCssValue() {
    // when
    sut.getCssValue("whatever");

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }

  @Test
  public void testGetScreenshotAs() {
    // when
    sut.getScreenshotAs(null);

    // then
    verify(mockedRetriever).findElement(mockedBy);
  }
}
