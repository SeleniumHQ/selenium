package org.openqa.selenium.support.locators;

import static java.util.stream.StreamSupport.stream;

import java.util.List;
import java.util.ServiceLoader;
import java.util.stream.Collectors;

public class ServiceLocatorFactory {

  private static List<LocatorStrategy> locatorStrategyList;

  private ServiceLocatorFactory() {
  }

  public static void load() {
    locatorStrategyList = getStrategyProviders();
  }

  public static void loadWithClassLoader(ClassLoader classLoader) {
    locatorStrategyList = getStrategyProviders(classLoader);
  }

  private static List<LocatorStrategy> getStrategyProviders() {
    ClassLoader loader = Thread.currentThread().getContextClassLoader();
     return getStrategyProviders(loader);
  }

  private static List<LocatorStrategy> getStrategyProviders(ClassLoader classLoader) {
    ServiceLoader<LocatorStrategy> loader = ServiceLoader.load(LocatorStrategy.class, classLoader);
    return stream(loader.spliterator(), false).collect(Collectors.toList());
  }

  public static List<LocatorStrategy> getLocatorPlugIns(){
    return locatorStrategyList;
  }
}
