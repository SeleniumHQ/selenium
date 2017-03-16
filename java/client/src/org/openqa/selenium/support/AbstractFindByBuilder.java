package org.openqa.selenium.support;

import org.openqa.selenium.By;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by paul on 3/8/17.
 */
public abstract class AbstractFindByBuilder {

  public abstract By buildIt(Object annotation);

  protected By buildByFromFindBy(FindBy findBy) {
    assertValidFindBy(findBy);

    By ans = buildByFromShortFindBy(findBy);
    if (ans == null) {
      ans = buildByFromLongFindBy(findBy);
    }

    return ans;
  }

  protected By buildByFromShortFindBy(FindBy findBy) {
    if (!"".equals(findBy.className()))
      return By.className(findBy.className());

    if (!"".equals(findBy.css()))
      return By.cssSelector(findBy.css());

    if (!"".equals(findBy.id()))
      return By.id(findBy.id());

    if (!"".equals(findBy.linkText()))
      return By.linkText(findBy.linkText());

    if (!"".equals(findBy.name()))
      return By.name(findBy.name());

    if (!"".equals(findBy.partialLinkText()))
      return By.partialLinkText(findBy.partialLinkText());

    if (!"".equals(findBy.tagName()))
      return By.tagName(findBy.tagName());

    if (!"".equals(findBy.xpath()))
      return By.xpath(findBy.xpath());

    // Fall through
    return null;
  }
  protected By buildByFromLongFindBy(FindBy findBy) {
    How how = findBy.how();
    String using = findBy.using();

    switch (how) {
      case CLASS_NAME:
        return By.className(using);

      case CSS:
        return By.cssSelector(using);

      case ID:
      case UNSET:
        return By.id(using);

      case ID_OR_NAME:
        return new ByIdOrName(using);

      case LINK_TEXT:
        return By.linkText(using);

      case NAME:
        return By.name(using);

      case PARTIAL_LINK_TEXT:
        return By.partialLinkText(using);

      case TAG_NAME:
        return By.tagName(using);

      case XPATH:
        return By.xpath(using);

      default:
        // Note that this shouldn't happen (eg, the above matches all
        // possible values for the How enum)
        throw new IllegalArgumentException("Cannot determine how to locate element ");
    }
  }
  protected void assertValidFindBys(FindBys findBys) {
    for (FindBy findBy : findBys.value()) {
      assertValidFindBy(findBy);
    }
  }
  protected void assertValidFindBy(FindBy findBy) {
    if (findBy.how() != null) {
      if (findBy.using() == null) {
        throw new IllegalArgumentException(
            "If you set the 'how' property, you must also set 'using'");
      }
    }

    Set<String> finders = new HashSet<>();
    if (!"".equals(findBy.using())) finders.add("how: " + findBy.using());
    if (!"".equals(findBy.className())) finders.add("class name:" + findBy.className());
    if (!"".equals(findBy.css())) finders.add("css:" + findBy.css());
    if (!"".equals(findBy.id())) finders.add("id: " + findBy.id());
    if (!"".equals(findBy.linkText())) finders.add("link text: " + findBy.linkText());
    if (!"".equals(findBy.name())) finders.add("name: " + findBy.name());
    if (!"".equals(findBy.partialLinkText()))
      finders.add("partial link text: " + findBy.partialLinkText());
    if (!"".equals(findBy.tagName())) finders.add("tag name: " + findBy.tagName());
    if (!"".equals(findBy.xpath())) finders.add("xpath: " + findBy.xpath());

    // A zero count is okay: it means to look by name or id.
    if (finders.size() > 1) {
      throw new IllegalArgumentException(
          String.format("You must specify at most one location strategy. Number found: %d (%s)",
                        finders.size(), finders.toString()));
    }
  }

  protected void assertValidFindAll(FindAll findBys) {
    for (FindBy findBy : findBys.value()) {
      assertValidFindBy(findBy);
    }
  }


}
