package org.openqa.selenium.bidi.network;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

import java.io.StringReader;

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

  public static BeforeRequestSent fromJsonString(String jsonString) {
    try (StringReader baseParameterReader = new StringReader(jsonString);
        StringReader initiatorReader = new StringReader(jsonString);
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
