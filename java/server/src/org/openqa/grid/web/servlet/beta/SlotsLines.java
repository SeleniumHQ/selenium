package org.openqa.grid.web.servlet.beta;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.openqa.grid.internal.TestSlot;

public class SlotsLines {
  Map<MiniCapability, List<TestSlot>> slots = new HashMap<MiniCapability, List<TestSlot>>();


  public void add(TestSlot slot) {
    MiniCapability c = new MiniCapability(slot);
    List<TestSlot> l = slots.get(c);
    if (l == null) {
      l = new ArrayList<TestSlot>();
      slots.put(c, l);
    }
    l.add(slot);
  }

  public Set<MiniCapability> getLinesType() {
    return slots.keySet();
  }

  public List<TestSlot> getLine(MiniCapability cap) {
    return slots.get(cap);
  }
}
