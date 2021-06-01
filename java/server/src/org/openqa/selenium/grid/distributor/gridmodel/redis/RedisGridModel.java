package org.openqa.selenium.grid.distributor.gridmodel.redis;

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeDrainStarted;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.distributor.GridModel;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;

import java.net.URI;
import java.util.Set;
import java.util.logging.Logger;

import static org.openqa.selenium.grid.data.Availability.DRAINING;

public class RedisGridModel implements GridModel {

  private static final Logger LOG = Logger.getLogger(RedisGridModel.class.getName());
  private final EventBus events;
  private final URI redisServerUri;

  public RedisGridModel(EventBus events, URI redisServerUri) {
    this.events = Require.nonNull("Event bus", events);
    this.redisServerUri = Require.nonNull("Redis Server URI", redisServerUri);

    this.events.addListener(NodeDrainStarted.listener(nodeId -> setAvailability(nodeId, DRAINING)));
    this.events.addListener(SessionClosedEvent.listener(this::release));
  }

  public static GridModel create(Config config) {
    EventBus bus = new EventBusOptions(config).getEventBus();
    RedisGridModelOptions options = new RedisGridModelOptions(config);

    return new RedisGridModel(bus, options.getRedisServerUri());
  }

  @Override
  public void add(NodeStatus node) {

  }

  @Override
  public void refresh(NodeStatus status) {

  }

  @Override
  public void touch(NodeId id) {

  }

  @Override
  public void remove(NodeId id) {

  }

  @Override
  public void purgeDeadNodes() {

  }

  @Override
  public Availability setAvailability(NodeId id, Availability availability) {
    return null;
  }

  @Override
  public boolean reserve(SlotId slotId) {
    return false;
  }

  @Override
  public Set<NodeStatus> getSnapshot() {
    return null;
  }

  @Override
  public Set<NodeStatus> nodes(Availability availability) {
    return null;
  }

  @Override
  public void release(SessionId id) {

  }

  @Override
  public void setSession(SlotId slotId, Session session) {

  }
}
