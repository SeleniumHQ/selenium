package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.By;
import org.openqa.selenium.How;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ByIdOrName;

import java.lang.reflect.Field;

public class Annotations {
  private Field field;

  public Annotations(Field field) {
    this.field = field;
  }

  public boolean isLookupCached() {
    return (field.getAnnotation(CacheLookup.class) != null);
  }

  public By buildBy() {
    How how = How.ID_OR_NAME;
    String using = field.getName();

    FindBy findBy = field.getAnnotation(FindBy.class);
    if (findBy != null) {
      how = findBy.how();
      using = findBy.using();
    }

    switch (how) {
    case ID:
      return By.id(using);

    case ID_OR_NAME:
      return new ByIdOrName(using);

    case LINK_TEXT:
      return By.linkText(using);

    case NAME:
      return By.name(using);

    case XPATH:
      return By.xpath(using);

    default:
      throw new IllegalArgumentException("Cannot determine how to locate element");
    }
  }

}
