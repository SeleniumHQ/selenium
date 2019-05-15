package org.openqa.selenium.devtools.network.events;

import org.openqa.selenium.devtools.network.types.RequestId;
import org.openqa.selenium.devtools.network.types.Response;
import org.openqa.selenium.devtools.network.types.SecurityDetails;
import org.openqa.selenium.devtools.network.types.SignedExchangeError;
import org.openqa.selenium.devtools.network.types.SignedExchangeHeader;
import org.openqa.selenium.devtools.network.types.SignedExchangeInfo;
import org.openqa.selenium.json.JsonInput;

import java.util.List;

/**
 * Object for storing Network.signedExchangeReceived response
 */
public class SignedExchangeReceived {

  /**
   * Request identifier
   */
  private final RequestId requestId;

  /**
   * Information about the signed exchange response
   */
  private final SignedExchangeInfo info;

  public SignedExchangeReceived(RequestId requestId,
                                SignedExchangeInfo info) {
    this.requestId = requestId;
    this.info = info;
  }

  private static SignedExchangeReceived fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    SignedExchangeInfo info = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "info":
          input.beginObject();

          Response outerResponse = null;
          SignedExchangeHeader header = null;
          SecurityDetails securityDetails = null;
          List<SignedExchangeError> errors = null;

          while (input.hasNext()) {
            switch (input.nextName()) {
              case "outerResponse":
                outerResponse = Response.parseResponse(input);
                break;

            }
          }
          //TODO: @GED add parse for header, securityDetails, errors
          info = new SignedExchangeInfo(outerResponse, header, securityDetails, errors);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new SignedExchangeReceived(requestId, info);
  }
}
