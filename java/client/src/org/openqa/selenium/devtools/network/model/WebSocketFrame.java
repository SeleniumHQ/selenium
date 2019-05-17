package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

/**
 * WebSocket message data. This represents an entire WebSocket message, not just a fragmented frame as the name suggests.
 */
public class WebSocketFrame {

  /**
   * WebSocket message opcode.
   */
  private Number opcode;
  /**
   * WebSocket message mask.
   */
  private boolean mask;

  /**
   * WebSocket message payload data. If the opcode is 1, this is a text message and payloadData is a UTF-8 string. If the opcode isn't 1, then payloadData is a base64 encoded string representing binary data.
   */
  private String payloadData;

  private WebSocketFrame(Number opcode, boolean mask, String payloadData) {
    this.opcode = requireNonNull(opcode, "'opcode' is required for WebSocketFrame");
    this.mask = mask;
    this.payloadData = requireNonNull(payloadData, "'payloadData' is required for WebSocketFrame");
  }

  public static WebSocketFrame parse(JsonInput input) {

    Number opcode = null;
    boolean mask = false;
    String payloadData = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "opcode":
          opcode = input.nextNumber();
          break;
        case "mask":
          mask = input.nextBoolean();
          break;
        case "payloadData":
          payloadData = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WebSocketFrame(opcode, mask, payloadData);
  }

  public Number getOpcode() {
    return opcode;
  }

  public boolean isMask() {
    return mask;
  }

  public String getPayloadData() {
    return payloadData;
  }

}
