package org.openqa.selenium.devtools.page.model;

import static java.util.Arrays.stream;

import org.openqa.selenium.devtools.DevToolsException;

public enum TransitionType {
  LINK("link"),
  TYPED("typed"),
  ADDRESS_BAR("address_bar"),
  AUTO_BOOKMARK("auto_bookmark"),
  AUTO_SUBFRAME("auto_subframe"),
  MANUAL_SUBFRAME("manual_subframe"),
  GENERATED("generated"),
  AUTO_TOPLEVEL("auto_toplevel"),
  FORM_SUBMIT("form_submit"),
  RELOAD("reload"),
  KEYWORD("keyword"),
  KEYWORD_GENERATED("keyword_generated"),
  OTHER("other");

  private final String val;

  TransitionType(String val) {
    this.val = val;
  }

  public static TransitionType getTransitionType(String val) {
    return stream(TransitionType.values())
        .filter(v -> v.getVal().equalsIgnoreCase(val))
        .findFirst().orElseThrow(() -> new DevToolsException(val + " not found in TransitionType"));
  }


  public String getVal() {
    return val;
  }
}
