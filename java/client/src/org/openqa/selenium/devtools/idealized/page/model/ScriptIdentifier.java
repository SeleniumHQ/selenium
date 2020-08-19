package org.openqa.selenium.devtools.idealized.page.model;

import org.openqa.selenium.internal.Require;

public class ScriptIdentifier {

  private final Object actualIdentifier;

  public ScriptIdentifier(Object actualIdentifier) {
    this.actualIdentifier = Require.nonNull("Actual identifier", actualIdentifier);
  }

  public Object getActualIdentifier() {
    return actualIdentifier;
  }

}
