package org.openqa.selenium.support.pagefactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.assertj.core.util.Lists;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsByXPath;

import java.util.Arrays;
import java.util.Collections;

public class ByChainedShadowTest {

  public static final String SHADOW_ROOT_SCRIPT = "arguments[0].shadowRoot";

  @Test
  public void testEmptyBysFindElement() {
    AllDriver driver = mock(AllDriver.class);

    ByChainedShadow byChainedShadow = new ByChainedShadow();

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> byChainedShadow.findElement(driver));
  }

  @Test
  public void testEmptyBysFindElements() {
    AllDriver driver = mock(AllDriver.class);

    ByChainedShadow byChainedShadow = new ByChainedShadow();

    assertThat(byChainedShadow.findElements(driver))
        .isEmpty();
  }

  @Test
  public void testNonEmptyFindElement() {
    AllDriver driver = mock(AllDriver.class);
    WebElement element1 = mock(WebElement.class);
    WebElement element2 = mock(WebElement.class);

    when(driver.findElementsByXPath("xpath")).thenReturn(Arrays.asList(element1, element2));

    ByChainedShadow by = new ByChainedShadow(By.xpath("xpath"));
    assertThat(by.findElement(driver)).isEqualTo(element1);
  }

  @Test
  public void testNonEmptyFindElements() {
    AllDriver driver = mock(AllDriver.class);
    WebElement element1 = mock(WebElement.class);
    WebElement element2 = mock(WebElement.class);

    when(driver.findElementsByXPath("xpath")).thenReturn(Lists.list(element1, element2));

    ByChainedShadow by = new ByChainedShadow(By.xpath("xpath"));
    assertThat(by.findElements(driver)).hasSize(2);
    assertThat(by.findElements(driver)).contains(element1, element2);
  }

  @Test
  public void testMultipleBysFindElement() {
    AllDriver driver = mock(AllDriver.class);
    WebElement element1 = mock(WebElement.class);
    WebElement element2 = mock(WebElement.class);
    WebElement shadowElement1 = mock(WebElement.class);
    WebElement shadowElement2 = mock(WebElement.class);
    WebElement innerShadow1 = mock(WebElement.class);
    WebElement innerShadow2 = mock(WebElement.class);

    when(driver.findElementsByXPath("xpath")).thenReturn(Lists.list(element1, element2));
    when(driver.executeScript(SHADOW_ROOT_SCRIPT, element1)).thenReturn(shadowElement1);
    when(driver.executeScript(SHADOW_ROOT_SCRIPT, element2)).thenReturn(shadowElement2);
    when(shadowElement1.findElements(By.cssSelector("css")))
        .thenReturn(Collections.singletonList(innerShadow1));
    when(shadowElement2.findElements(By.cssSelector("css")))
        .thenReturn(Collections.singletonList(innerShadow2));

    ByChainedShadow by = new ByChainedShadow(By.xpath("xpath"), By.cssSelector("css"));
    verify(driver, times(2)).executeScript(any());
    assertThat(by.findElement(driver)).isEqualTo(innerShadow1);
  }

  @Test
  public void testMultipleBysErrorFindElement() {
    AllDriver driver = mock(AllDriver.class);
    WebElement element1 = mock(WebElement.class);
    WebElement element2 = mock(WebElement.class);
    WebElement shadowElement1 = mock(WebElement.class);
    WebElement shadowElement2 = mock(WebElement.class);

    when(driver.findElementsByXPath("xpath")).thenReturn(Lists.list(element1, element2));
    when(driver.executeScript(SHADOW_ROOT_SCRIPT, element1)).thenReturn(shadowElement1);
    when(driver.executeScript(SHADOW_ROOT_SCRIPT, element2)).thenReturn(shadowElement2);
    when(shadowElement1.findElements(By.cssSelector("css"))).thenReturn(Collections.emptyList());
    when(shadowElement2.findElements(By.cssSelector("css"))).thenReturn(Collections.emptyList());

    ByChainedShadow by = new ByChainedShadow(By.xpath("xpath"), By.cssSelector("css"));
    verify(driver, times(2)).executeScript(any());
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> by.findElement(driver));
  }

  @Test
  public void testMultipleBysFindElements() {
    AllDriver driver = mock(AllDriver.class);
    WebElement element1 = mock(WebElement.class);
    WebElement element2 = mock(WebElement.class);
    WebElement shadowElement1 = mock(WebElement.class);
    WebElement shadowElement2 = mock(WebElement.class);
    WebElement innerShadow1 = mock(WebElement.class);
    WebElement innerShadow2 = mock(WebElement.class);

    when(driver.findElementsByXPath("xpath")).thenReturn(Lists.list(element1, element1));
    when(driver.executeScript(SHADOW_ROOT_SCRIPT, element1)).thenReturn(shadowElement1);
    when(driver.executeScript(SHADOW_ROOT_SCRIPT, element2)).thenReturn(shadowElement2);
    when(shadowElement1.findElements(By.cssSelector("css")))
        .thenReturn(Collections.singletonList(innerShadow1));
    when(shadowElement2.findElements(By.cssSelector("css")))
        .thenReturn(Collections.singletonList(innerShadow2));

    ByChainedShadow by = new ByChainedShadow(By.xpath("xpath"), By.cssSelector("css"));
    verify(driver, times(2)).executeScript(any());
    assertThat(by.findElements(driver)).hasSize(2);
    assertThat(by.findElements(driver)).contains(innerShadow1, innerShadow2);
  }

  @Test
  public void testMultipleBysEmptyFindElements() {
    AllDriver driver = mock(AllDriver.class);
    WebElement element1 = mock(WebElement.class);
    WebElement element2 = mock(WebElement.class);
    WebElement shadowElement1 = mock(WebElement.class);
    WebElement shadowElement2 = mock(WebElement.class);

    when(driver.findElementsByXPath("xpath")).thenReturn(Lists.list(element1, element1));
    when(driver.executeScript(SHADOW_ROOT_SCRIPT, element1)).thenReturn(shadowElement1);
    when(driver.executeScript(SHADOW_ROOT_SCRIPT, element2)).thenReturn(shadowElement2);
    when(shadowElement1.findElements(By.cssSelector("css"))).thenReturn(Collections.emptyList());
    when(shadowElement2.findElements(By.cssSelector("css"))).thenReturn(Collections.emptyList());

    ByChainedShadow by = new ByChainedShadow(By.xpath("xpath"), By.cssSelector("css"));
    verify(driver, times(2)).executeScript(any());
    assertThat(by.findElements(driver)).isNotNull();
    assertThat(by.findElements(driver)).isEmpty();
  }

  private interface AllDriver extends
                              FindsByXPath, FindsByCssSelector, SearchContext, JavascriptExecutor {
    //Placeholder
  }
}
