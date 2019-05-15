package org.openqa.selenium.devtools.network.events;

import org.openqa.selenium.devtools.network.types.RequestId;
import org.openqa.selenium.devtools.network.types.Response;
import org.openqa.selenium.devtools.network.types.SecurityDetails;
import org.openqa.selenium.devtools.network.types.SignedExchangeError;
import org.openqa.selenium.devtools.network.types.SignedExchangeHeader;
import org.openqa.selenium.devtools.network.types.SignedExchangeInfo;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
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
              case "header":
                header = SignedExchangeHeader.parseResponse(input);
                break;
              case "securityDetails":
                securityDetails = SecurityDetails.parseResponse(input);
                break;
              case "errors":
                input.beginArray();
                errors = new ArrayList<>();
                while (input.hasNext()) {
                  errors.add(SignedExchangeError.parseResponse(input));
                }
                input.endArray();
                break;
              default:
                input.skipValue();
                break;

            }
          }
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
