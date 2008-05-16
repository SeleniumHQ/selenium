package com.googlecode.webdriver.support;

import java.util.ArrayList;
import java.util.List;

import com.googlecode.webdriver.By;
import com.googlecode.webdriver.SearchContext;
import com.googlecode.webdriver.WebElement;

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
  public WebElement findElement(SearchContext finder) {
    // First, try to locate by id
    WebElement toReturn = idFinder.findElement(finder);
    if (toReturn != null)
      return toReturn;

    // Then by name
    return nameFinder.findElement(finder);
  }

  @Override
  public List<WebElement> findElements(SearchContext finder) {
    List<WebElement> elements = new ArrayList<WebElement>();

    // First: Find by id ...
    elements.addAll(idFinder.findElements(finder));
    // Second: Find by name ...
    elements.addAll(nameFinder.findElements(finder));

    return elements;
  }

  @Override
  public String toString() {
    return "by id or name \"" + idOrName + '"';
  }
}
