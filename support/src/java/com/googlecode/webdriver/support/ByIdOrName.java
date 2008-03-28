package com.googlecode.webdriver.support;

import com.googlecode.webdriver.By;
import com.googlecode.webdriver.How;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.WebDriver;

import java.util.List;
import java.util.ArrayList;

public class ByIdOrName extends By {
  private By idFinder;
  private By nameFinder;
  private String idOrName;

  public ByIdOrName(String idOrName) {
    this.idOrName = idOrName;
    idFinder = By.id(idOrName);
    nameFinder = By.name(idOrName);
  }

  @Override
  public WebElement findElement(WebDriver driver) {
    // First, try to locate by id
    WebElement toReturn = idFinder.findElement(driver);
    if (toReturn != null)
      return toReturn;

    // Then by name
    return nameFinder.findElement(driver);
  }

  @Override
  public List<WebElement> findElements(WebDriver driver) {
    List<WebElement> elements = new ArrayList<WebElement>();

    // First: Find by id ...
    elements.addAll(idFinder.findElements(driver));
    // Second: Find by name ...
    elements.addAll(nameFinder.findElements(driver));

    return elements;
  }

  @Override
  public String toString() {
    return "by id or name \"" + idOrName + '"';
  }
}
