package org.openqa.selenium.grid.distributor;

import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.UUID;

public class DrainNode implements HttpHandler {
  private final Distributor distributor;
  private final UUID nodeId;

  public DrainNode(Distributor distributor, UUID nodeId) {
    this.distributor = Objects.requireNonNull(distributor);
    this.nodeId = Objects.requireNonNull(nodeId);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    distributor.drain(nodeId);
    return new HttpResponse();
  }
}
