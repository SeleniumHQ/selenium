/*
Copyright 2013 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium;

import java.util.List;
import java.util.Map;

/**
 * Represents a heap snapshot.
 */
public class HeapSnapshot {
  private List<Integer> edgeData;
  private long edgeCount;
  private List<Integer> nodeData;
  private long nodeCount;
  private List<String> stringData;
  private Map<String, ?> metaData;

  @SuppressWarnings("unchecked")
  public static HeapSnapshot ParseHeapSnapshot(Object heapSnapshot) {
    Map<String, ?> data = (Map<String, ?>) heapSnapshot;

    List<Integer> edgeData = (List<Integer>) data.get("edges");
    List<Integer> nodeData = (List<Integer>) data.get("nodes");
    List<String> stringData = (List<String>) data.get("strings");
    Map<String, ?> info = (Map<String, ?>) data.get("snapshot");
    long edgeCount = (Long) info.get("edge_count");
    long nodeCount = (Long) info.get("node_count");
    Map<String, ?> metaData = (Map<String, ?>) info.get("meta");

    return new HeapSnapshot(edgeData, edgeCount, nodeData, nodeCount,
        stringData, metaData);
  }

  private HeapSnapshot(List<Integer> edgeData, long edgeCount,
      List<Integer> nodeData, long nodeCount, List<String> stringData,
      Map<String, ?> metaData) {
    this.edgeData = edgeData;
    this.edgeCount = edgeCount;
    this.nodeData = nodeData;
    this.nodeCount = nodeCount;
    this.stringData = stringData;
    this.metaData = metaData;
  }

  public List<Integer> getEdgeData() {
    return edgeData;
  }

  public long getEdgeCount() {
    return edgeCount;
  }

  public List<Integer> getNodeData() {
    return nodeData;
  }

  public long getNodeCount() {
    return nodeCount;
  }

  public List<String> getStringData() {
    return stringData;
  }

  public Map<String, ?> getMetaData() {
    return metaData;
  }
}
