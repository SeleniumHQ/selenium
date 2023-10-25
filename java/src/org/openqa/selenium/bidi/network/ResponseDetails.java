package org.openqa.selenium.bidi.network;

import java.io.StringReader;
import java.util.Map;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

public class ResponseDetails extends BaseParameters {
  private static final Json JSON = new Json();

  private final ResponseData responseData;

  private ResponseDetails(BaseParameters baseParameters, ResponseData responseData) {
    super(
        baseParameters.getBrowsingContextId(),
        baseParameters.isBlocked(),
        baseParameters.getNavigationId(),
        baseParameters.getRedirectCount(),
        baseParameters.getRequest(),
        baseParameters.getTimestamp(),
        baseParameters.getIntercepts());
    this.responseData = responseData;
  }

  public static ResponseDetails fromJsonMap(Map<String, Object> jsonMap) {
    try (StringReader baseParameterReader = new StringReader(JSON.toJson(jsonMap));
        StringReader responseDataReader = new StringReader(JSON.toJson(jsonMap.get("response")));
        JsonInput baseParamsInput = JSON.newInput(baseParameterReader);
        JsonInput responseDataInput = JSON.newInput(responseDataReader)) {
      return new ResponseDetails(
          BaseParameters.fromJson(baseParamsInput), ResponseData.fromJson(responseDataInput));
    }
  }

  public ResponseData getResponseData() {
    return responseData;
  }
}
