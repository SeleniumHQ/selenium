package org.openqa.grid.common;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.PropertySetting;
import org.openqa.selenium.json.TypeCoercer;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.util.function.BiFunction;

public class GridConfiguredJson {

  private final static Json JSON = new Json();

  private GridConfiguredJson() {
    // Utility class
  }

  public static <T> T toType(String json, Type typeOfT) {
    try (Reader reader = new StringReader(json);
        JsonInput jsonInput = JSON.newInput(reader)) {
      return toType(jsonInput, typeOfT);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static <T> T toType(JsonInput jsonInput, Type typeOfT) {
    return jsonInput
        .propertySetting(PropertySetting.BY_FIELD)
        .addCoercers(new CapabilityMatcherCoercer(), new PrioritizerCoercer())
        .read(typeOfT);
  }

  private static class SimpleClassNameCoercer<T> extends TypeCoercer<T> {

    private final Class<?> stereotype;

    protected SimpleClassNameCoercer(Class<?> stereotype) {
      this.stereotype = stereotype;
    }

    @Override
    public boolean test(Class<?> aClass) {
      return stereotype.isAssignableFrom(aClass);
    }

    @Override
    public BiFunction<JsonInput, PropertySetting, T> apply(Type type) {
      return (jsonInput, setting) -> {
        String clazz = jsonInput.nextString();
        try {
          return (T) Class.forName(clazz).asSubclass(stereotype).newInstance();
        } catch (ReflectiveOperationException e) {
          throw new JsonException(String.format("%s could not be coerced to instance", clazz));
        }
      };
    }
  }

  private static class CapabilityMatcherCoercer extends SimpleClassNameCoercer<CapabilityMatcher> {
    protected CapabilityMatcherCoercer() {
      super(CapabilityMatcher.class);
    }
  }

  private static class PrioritizerCoercer extends SimpleClassNameCoercer<Prioritizer> {
    protected PrioritizerCoercer() {
      super(Prioritizer.class);
    }
  }


}
