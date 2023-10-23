package org.openqa.selenium.bidi.network;

import java.io.StringReader;
import java.util.Map;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

public class BeforeRequestSent extends BaseParameters {
  private static final Json JSON = new Json();

  private final Initiator initiator;

  private BeforeRequestSent(BaseParameters baseParameters, Initiator initiator) {
    super(
        baseParameters.getBrowsingContextId(),
        baseParameters.isBlocked(),
        baseParameters.getNavigationId(),
        baseParameters.getRedirectCount(),
        baseParameters.getRequest(),
        baseParameters.getTimestamp(),
        baseParameters.getIntercepts());
    this.initiator = initiator;
  }

  public static BeforeRequestSent fromJsonMap(Map<String, Object> jsonMap) {
    try (StringReader baseParameterReader = new StringReader(JSON.toJson(jsonMap));
        StringReader initiatorReader = new StringReader(JSON.toJson(jsonMap.get("initiator")));
        JsonInput baseParamsInput = JSON.newInput(baseParameterReader);
        JsonInput initiatorInput = JSON.newInput(initiatorReader)) {
      return new BeforeRequestSent(
          BaseParameters.fromJson(baseParamsInput), Initiator.fromJson(initiatorInput));
    }
  }

  public Initiator getInitiator() {
    return initiator;
  }
}
