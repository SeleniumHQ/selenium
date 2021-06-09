package org.openqa.selenium.grid.distributor;

import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.remote.SessionId;

import java.util.Set;

public interface GridModel {

  public static final SessionId RESERVED = new SessionId("reserved");

  void add(NodeStatus node);

  void refresh(NodeStatus status);

  void touch(NodeId id);

  void remove(NodeId id);

  void purgeDeadNodes();

  Availability setAvailability(NodeId id, Availability availability);

  boolean reserve(SlotId slotId);

  Set<NodeStatus> getSnapshot();

  void release(SessionId id);

  void setSession(SlotId slotId, Session session);

  AvailabilityAndNode findNode(NodeId id);

  void reserve(NodeStatus status, Slot slot);

  NodeStatus rewrite(NodeStatus status, Availability availability);

  void amend(Availability availability, NodeStatus status, Slot slot);

  public class AvailabilityAndNode {
    public final Availability availability;
    public final NodeStatus status;

    public AvailabilityAndNode(Availability availability, NodeStatus status) {
      this.availability = availability;
      this.status = status;
    }
  }

}
