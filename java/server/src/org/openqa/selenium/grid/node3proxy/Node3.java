package org.openqa.selenium.grid.node3proxy;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.component.HealthCheck;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.NodeStatus;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public class Node3 extends Node {

  private URI externalUri;
  private Integer maxSessionCount;
  private List<MutableCapabilities> capabilities;

  public Node3(DistributedTracer tracer, UUID id, URI externalUri, Integer maxSessionCount, List<MutableCapabilities> capabilities) {
    super(tracer, id);
    this.externalUri = externalUri;
    this.maxSessionCount = maxSessionCount;
    this.capabilities = capabilities;
  }

  @Override
  public Optional<Session> newSession(Capabilities capabilities) {
    return Optional.empty();
  }

  @Override
  public void executeWebDriverCommand(HttpRequest req, HttpResponse resp) {

  }

  @Override
  public Session getSession(SessionId id) throws NoSuchSessionException {
    return null;
  }

  @Override
  public void stop(SessionId id) throws NoSuchSessionException {

  }

  @Override
  protected boolean isSessionOwner(SessionId id) {
    return false;
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return false;
  }

  @Override
  public NodeStatus getStatus() {
    return null;
  }

  @Override
  public HealthCheck getHealthCheck() {
    return null;
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "id", getId(),
        "uri", externalUri,
        "maxSessions", maxSessionCount,
        "capabilities", capabilities);
  }
}
