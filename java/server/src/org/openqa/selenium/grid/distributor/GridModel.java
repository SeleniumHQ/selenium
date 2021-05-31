package org.openqa.selenium.grid.distributor;

import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.remote.SessionId;

import java.util.Set;

public interface GridModel {

  public void add(NodeStatus node);

  public void refresh(NodeStatus status);

  public void touch(NodeId id);

  public void remove(NodeId id);

  public void purgeDeadNodes();

  public Availability setAvailability(NodeId id, Availability availability);

  public boolean reserve(SlotId slotId);

  public Set<NodeStatus> getSnapshot();

  public Set<NodeStatus> nodes(Availability availability);

  public void release(SessionId id);

  public void setSession(SlotId slotId, Session session);

}
