package org.openqa.selenium.devtools.network.model;

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

  public static WebSocketFrame parse(JsonInput input){
    WebSocketFrame webSocketFrame = new WebSocketFrame();
    while (input.hasNext()){
      switch (input.nextName()){
        case "opcode":
          webSocketFrame.setOpcode(input.nextNumber());
          break;
        case "mask" :
          webSocketFrame.setMask(input.nextBoolean());
          break;
        case "payloadData" :
          webSocketFrame.setPayloadData(input.nextString());
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return webSocketFrame;
  }

  public Number getOpcode() {
    return opcode;
  }

  public void setOpcode(Number opcode) {
    this.opcode = opcode;
  }

  public boolean isMask() {
    return mask;
  }

  public void setMask(boolean mask) {
    this.mask = mask;
  }

  public String getPayloadData() {
    return payloadData;
  }

  public void setPayloadData(String payloadData) {
    this.payloadData = payloadData;
  }


}
