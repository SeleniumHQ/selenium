package org.openqa.grid.internal;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.grid.common.RegistrationRequest;

public class MyCustomProxy extends RemoteProxy {

  public static String MY_STRING = "my string";
  public static URL MY_URL;
  public static boolean MY_BOOLEAN = true;

  public MyCustomProxy(RegistrationRequest request, Registry registry) {

    super(request, registry);
    try {
      MY_URL = new URL("http://www.google.com");
    } catch (MalformedURLException e) {
    }
  }

  public Boolean getBoolean() {
    return MY_BOOLEAN;
  }

  public URL getURL() {
    return MY_URL;
  }

  public String getString() {
    return MY_STRING;
  }

}
