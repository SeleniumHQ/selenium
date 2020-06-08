package org.openqa.selenium;

import com.google.auto.service.AutoService;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@AutoService(By.class)
public class ByAi extends By implements Serializable {
  private static final long serialVersionUID = 950486519474262245L;
  private final String locator;

  public ByAi(String locator) {
    if (locator == null) {
      throw new IllegalArgumentException("Cannot find elements when the locator is null.");
    }

    this.locator = locator;
  }

  public WebElement findElement(SearchContext context) {
    return context.findElement(this);
  }

  @Override
  public List<WebElement> findElements(SearchContext context) {
    return new ArrayList<>();
  }

  @Override
  public String toString() {
    return "ByAi: " + locator;
  }

  private Map<String, Object> toJson() {
    Map<String, Object> asJson = new HashMap<>();
    asJson.put("using", "css selector");
    asJson.put("value", locator);

    return Collections.unmodifiableMap(asJson);
  }
}
