package org.openqa.selenium.edge;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;

public abstract class EdgeDriverService extends DriverService {

  public EdgeDriverService(
      File executable,
      int port,
      ImmutableList<String> args,
      ImmutableMap<String, String> environment) throws IOException {
    super(executable, port, args, environment);
  }

  public static abstract class Builder<DS extends EdgeDriverService, B extends EdgeDriverService.Builder<?, ?>>
      extends DriverService.Builder<DS, B> {

    protected abstract boolean isEdgeHTML();

  }
}
