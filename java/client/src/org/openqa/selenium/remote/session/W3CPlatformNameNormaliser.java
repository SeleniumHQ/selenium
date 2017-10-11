package org.openqa.selenium.remote.session;

import static java.util.Collections.singleton;
import static java.util.Locale.ENGLISH;

import java.util.AbstractMap;
import java.util.Collection;
import java.util.Map;

public class W3CPlatformNameNormaliser implements CapabilityTransform {

  @Override
  public Collection<Map.Entry<String, Object>> apply(Map.Entry<String, Object> entry) {
    if (!"platformName".equals(entry.getKey())) {
      return singleton(entry);
    }

    return singleton(new AbstractMap.SimpleImmutableEntry<String, Object>(
        entry.getKey(),
        String.valueOf(entry.getValue()).toLowerCase(ENGLISH)));
  }
}
