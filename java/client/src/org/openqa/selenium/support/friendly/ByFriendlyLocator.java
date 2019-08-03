package org.openqa.selenium.support.friendly;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.Resources;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsDriver;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static com.google.common.base.Preconditions.checkArgument;
import static org.openqa.selenium.json.Json.MAP_TYPE;

public class ByFriendlyLocator {

  private static final Json JSON = new Json();
  private static final String FIND_ELEMENTS;
  static {
    try {
      String location = String.format(
        "/%s/%s",
        ByFriendlyLocator.class.getPackage().getName().replace(".", "/"),
        "findElements.js");

      URL url = ByFriendlyLocator.class.getResource(location);

      String rawFunction = Resources.toString(url, StandardCharsets.UTF_8);
      FIND_ELEMENTS = String.format("return (%s).apply(null, arguments);", rawFunction);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
  public static FriendlyBy withTagName(String tagName) {
    Objects.requireNonNull(tagName, "Tag name to look for must be set");

    return new FriendlyBy(By.tagName(tagName));
  }

  public static class FriendlyBy extends By {
    private final Object root;
    private final List<Map<String, Object>> filters;

    private FriendlyBy(Object rootLocator) {
      this(rootLocator, ImmutableList.of());
    }

    private FriendlyBy(Object rootLocator, List<Map<String, Object>> filters) {
      if (rootLocator instanceof By) {
        assertLocatorCanBeSerialized(rootLocator);
        rootLocator = asAtomLocatorParameter((By) rootLocator);
      } else if (rootLocator instanceof Map) {
        if (((Map<?, ?>) rootLocator).keySet().size() != 1) {
          throw new IllegalArgumentException(
            "Root locators as find element payload must only have a single key: " + rootLocator);
        }
      } else if (!(rootLocator instanceof WebElement)) {
        throw new IllegalArgumentException("Root locator must be an element or a locator: " + rootLocator);
      }

      this.root = Objects.requireNonNull(rootLocator);
      this.filters = ImmutableList.copyOf(Objects.requireNonNull(filters));
    }

    public FriendlyBy above(WebElement element) {
      Objects.requireNonNull(element, "Element to search for must be set.");
      return simpleDirection("above", element);
    }

    public FriendlyBy above(By locator) {
      Objects.requireNonNull(locator, "Locator to use must be set.");
      assertLocatorCanBeSerialized(locator);
      return simpleDirection("above", locator);
    }

    public FriendlyBy below(WebElement element) {
      Objects.requireNonNull(element, "Element to search for must be set.");
      return simpleDirection("below", element);
    }

    public FriendlyBy below(By locator) {
      Objects.requireNonNull(locator, "Locator to use must be set.");
      assertLocatorCanBeSerialized(locator);
      return simpleDirection("below", locator);
    }

    public FriendlyBy toLeftOf(WebElement element) {
      Objects.requireNonNull(element, "Element to search for must be set.");
      return simpleDirection("left", element);
    }

    public FriendlyBy toLeftOf(By locator) {
      Objects.requireNonNull(locator, "Locator to use must be set.");
      assertLocatorCanBeSerialized(locator);
      return simpleDirection("left", locator);
    }

    public FriendlyBy toRightOf(WebElement element) {
      Objects.requireNonNull(element, "Element to search for must be set.");
      return simpleDirection("right", element);
    }

    public FriendlyBy toRightOf(By locator) {
      Objects.requireNonNull(locator, "Locator to use must be set.");
      assertLocatorCanBeSerialized(locator);
      return simpleDirection("right", locator);
    }

    public FriendlyBy near(WebElement element) {
      Objects.requireNonNull(element, "Element to search for must be set.");
      return near(element, 50);
    }

    public FriendlyBy near(WebElement element, int atMostDistanceInPixels) {
      Objects.requireNonNull(element, "Element to search for must be set.");
      checkArgument(atMostDistanceInPixels > 0, "Distance must be greater than 0.");

      return near((Object) element, atMostDistanceInPixels);
    }

    public FriendlyBy near(By locator) {
      Objects.requireNonNull(locator, "Locator to use for must be set.");
      return near((Object) locator, 50);
    }

    public FriendlyBy near(By locator, int atMostDistanceInPixels) {
      Objects.requireNonNull(locator, "Locator to use for must be set.");
      checkArgument(atMostDistanceInPixels > 0, "Distance must be greater than 0.");

      return near((Object) locator, atMostDistanceInPixels);
    }

    private FriendlyBy near(Object locator, int atMostDistanceInPixels) {
      Objects.requireNonNull(locator, "Locator to use must be set.");
      checkArgument(atMostDistanceInPixels > 0, "Distance must be greater than 0.");

      return new FriendlyBy(
        root,
        amend(ImmutableMap.of(
          "kind", "near",
          "args", ImmutableList.of(asAtomLocatorParameter(locator), "distance", atMostDistanceInPixels))));
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      JavascriptExecutor js = extractJsExecutor(context);

      @SuppressWarnings("unchecked")
      List<WebElement> elements = (List<WebElement>) js.executeScript(FIND_ELEMENTS, this.toJson());
      System.out.println(elements);
      return elements;
    }

    private FriendlyBy simpleDirection(String direction, Object locator) {
      Objects.requireNonNull(direction, "Direction to search in must be set.");
      Objects.requireNonNull(locator, "Locator to use must be set.");

      return new FriendlyBy(
        root,
        amend(ImmutableMap.of(
          "kind", direction,
          "args", ImmutableList.of(asAtomLocatorParameter(locator)))));

    }

    private List<Map<String, Object>> amend(Map<String, Object> toAdd) {
      return ImmutableList.<Map<String, Object>>builder()
        .addAll(filters)
        .add(toAdd)
        .build();
    }

    private JavascriptExecutor extractJsExecutor(SearchContext context) {
      if (context instanceof JavascriptExecutor) {
        return (JavascriptExecutor) context;
      }

      Object current = context;
      while (current instanceof WrapsDriver) {
        WebDriver driver = ((WrapsDriver) context).getWrappedDriver();
        if (driver instanceof JavascriptExecutor) {
          return (JavascriptExecutor) driver;
        }
        current = driver;
      }

      throw new IllegalArgumentException("Cannot find elements, since the context cannot execute JS: " + context);
    }

    private Map<String, Object> toJson() {
      return ImmutableMap.of(
        "friendly", ImmutableMap.of(
          "root", root,
          "filters", filters));
    }
  }

  private static Object asAtomLocatorParameter(Object object) {
    if (object instanceof WebElement) {
      return object;
    }

    if (!(object instanceof By)) {
      throw new IllegalArgumentException("Expected locator to be either an element or a By: " + object);
    }

    assertLocatorCanBeSerialized((By) object);

    Map<String, Object> raw = JSON.toType(JSON.toJson(object), MAP_TYPE);

    if (!(raw.get("using") instanceof String)) {
      throw new JsonException("Expected JSON encoded form of locator to have a 'using' field. " + raw);
    }
    if (!raw.containsKey("value")) {
      throw new JsonException("Expected JSON encoded form of locator to have a 'value' field: " + raw);
    }

    return ImmutableMap.of((String) raw.get("using"), raw.get("value"));
  }

  private static void assertLocatorCanBeSerialized(Object locator) {
    Objects.requireNonNull(locator, "Locator must be set.");

    Class<?> clazz = locator.getClass();

    while (!clazz.equals(Object.class)) {
      try {
        clazz.getDeclaredMethod("toJson");
        return;
      } catch (NoSuchMethodException e) {
        // Do nothing. Continue with the loop
      }
      clazz = clazz.getSuperclass();
    }

    throw new IllegalArgumentException(
      "Locator must be serializable to JSON using a `toJson` method. " + locator);
  }
}
