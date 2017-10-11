package org.openqa.selenium.remote.session;

import static java.util.Collections.singleton;

import org.openqa.selenium.Proxy;

import java.util.AbstractMap;
import java.util.Collection;
import java.util.Map;
import java.util.TreeMap;

public class ProxyTransform implements CapabilityTransform {

  @Override
  public Collection<Map.Entry<String, Object>> apply(Map.Entry<String, Object> entry) {
    if (!"proxy".equals(entry.getKey())) {
      return singleton(entry);
    }

    Object rawProxy = entry.getValue();
    Map<String, Object> proxy;
    if (rawProxy instanceof Proxy) {
      proxy = new TreeMap<>(((Proxy) rawProxy).toJson());
    } else {
      //noinspection unchecked
      proxy = new TreeMap<>((Map<String, Object>) rawProxy);
    }
    if (proxy.containsKey("proxyType")) {
      proxy.put(
          "proxyType",
          String.valueOf(proxy.get("proxyType")).toLowerCase());
    }
    return singleton(new AbstractMap.SimpleImmutableEntry<>(entry.getKey(), proxy));
  }
}
