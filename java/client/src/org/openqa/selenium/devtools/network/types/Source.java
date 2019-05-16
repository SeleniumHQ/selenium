package org.openqa.selenium.devtools.network.types;

import java.util.Objects;

public enum Source {
  Server,
  Proxy;

  public static Source getSource(String name){
    Objects.requireNonNull(name,"'name' field to find Source is mandatory");
    if (Server.name().equalsIgnoreCase(name)) return Server;
    if (Proxy.name().equalsIgnoreCase(name)) return Proxy;
    else throw new RuntimeException("Given value of "+name+" is not valid for Source");
  }
}
