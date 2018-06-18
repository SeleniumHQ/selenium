package org.openqa.selenium.grid;

import org.openqa.selenium.grid.hub.Hub;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.server.CommandHandler;
import org.openqa.selenium.remote.server.scheduler.Distributor;

public enum  Role {
  HUB {
    @Override
    CommandHandler build(String[] args) {
      return new Hub(new Json(), new Distributor());
    }
  },
  ;

  abstract CommandHandler build(String[] args);

  public static Role get(String name) {
    if (name == null) {
      return null;
    }

    name = name.toLowerCase();
    for (Role role : Role.values()) {
      if (role.name().toLowerCase().equals(name)) {
        return role;
      }
    }

    return null;
  }
}
