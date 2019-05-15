package org.openqa.selenium.devtools.network.types;

/**
 * The underlying connection technology that the browser is supposedly using
 */
public enum ConnectionType {

  NONE("none"),
  CELLULAR_2G("cellular2g"),
  CELLULAR_3G("cellular3g"),
  CELLULAR_4G("cellular4g"),
  BLUETOOTH("bluetooth"),
  ETHERNET("ethernet"),
  WIFI("wifi"),
  WIMAX("wimax"),
  OTHER("other");

  private String type;


  ConnectionType(String type) {
    this.type = type;
  }

  public String getType() {
    return type;
  }

}
