package org.openqa.selenium.devtools.idealized.runtime.model;

import org.openqa.selenium.internal.Require;

public class BindingCalled {

  private final String name;
  private final String payload;

  public BindingCalled(String name, String payload) {
    this.name = Require.nonNull("Name", name);
    this.payload = Require.nonNull("Payload", payload);
  }

  public String getName() {
    return name;
  }

  public String getPayload() {
    return payload;
  }

  @Override
  public String toString() {
    return "BindingCalled{" +
      "name='" + name + '\'' +
      ", payload='" + payload + '\'' +
      '}';
  }
}
