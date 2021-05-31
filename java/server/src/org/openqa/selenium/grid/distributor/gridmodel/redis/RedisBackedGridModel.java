package org.openqa.selenium.grid.distributor.gridmodel.redis;

import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.distributor.GridModel;
import org.openqa.selenium.remote.SessionId;

import java.util.Set;

public class RedisBackedGridModel implements GridModel {

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
