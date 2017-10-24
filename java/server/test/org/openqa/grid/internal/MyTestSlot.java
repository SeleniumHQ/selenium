package org.openqa.grid.internal;

import org.openqa.grid.common.SeleniumProtocol;

import java.util.Map;

public class MyTestSlot extends TestSlot {
  private String slotName;

  public MyTestSlot(RemoteProxy proxy, SeleniumProtocol protocol,
                    Map<String, Object> capabilities) {
    super(proxy, protocol, capabilities);
  }

  public void setSlotName(String slotName) {
    this.slotName = slotName;
  }

  @Override
  public String toString() {
    return slotName + super.toString();
  }
}
