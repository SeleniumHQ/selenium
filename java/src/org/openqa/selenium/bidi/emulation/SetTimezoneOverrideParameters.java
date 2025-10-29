package org.openqa.selenium.bidi.emulation;

public class SetTimezoneOverrideParameters extends AbstractOverrideParameters {

  public SetTimezoneOverrideParameters(String timezone) {
    map.put("timezone", timezone);
  }

  @Override
  public SetTimezoneOverrideParameters contexts(java.util.List<String> contexts) {
    super.contexts(contexts);
    return this;
  }

  @Override
  public SetTimezoneOverrideParameters userContexts(java.util.List<String> userContexts) {
    super.userContexts(userContexts);
    return this;
  }
}
