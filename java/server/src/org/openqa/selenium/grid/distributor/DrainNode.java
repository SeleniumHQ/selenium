package org.openqa.selenium.grid.distributor;

import static org.openqa.selenium.remote.http.Contents.asJson;

import com.google.common.collect.ImmutableMap;

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
    HttpResponse response = new HttpResponse();
    boolean value = distributor.drain(nodeId);

    if (value) {
      response.setContent(
          asJson(ImmutableMap.of("value", value, "message",
                                 "Node status was successfully set to draining.")));
    } else {
      response.setContent(
          asJson(ImmutableMap.of("value", value, "message",
                                 "Unable to drain node. Please check the node exists by using /status. If so, try again.")));
    }

    return response;
  }
}
