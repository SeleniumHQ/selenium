// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.redis;

import io.lettuce.core.KeyValue;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.resource.ClientResources;
import io.lettuce.core.resource.DefaultClientResources;
import org.openqa.selenium.grid.distributor.model.Host;
import org.redisson.Redisson;
import org.redisson.api.RBucket;
import org.redisson.api.RSet;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;

import java.io.Closeable;
import java.net.URI;
import java.util.*;

public class GridRedisClient implements Closeable {
  private final RedisClient client;
  private final RedissonClient redissonClient;
  private final StatefulRedisConnection<String, String> connection;

  public GridRedisClient(URI serverUri) {
    ClientResources sharedResources = DefaultClientResources.create();
    client = RedisClient.create(sharedResources, RedisURI.create(serverUri));

    Config redissonConfig = new Config();
    redissonConfig.useSingleServer().setAddress(serverUri.toString());

    redissonClient = Redisson.create(redissonConfig);
    connection = client.connect();
  }

  public StatefulRedisConnection<String, String> getConnection() {
    return connection;
  }

  public void mset(Map<String, String> map) {
    connection.sync().mset(map);
  }

  public List<KeyValue<String, String>> mget(String...keys) {
    return connection.sync().mget(keys);
  }
  public String get(String key) {
    return connection.sync().get(key);
  }

  public boolean isOpen() {
    return connection.isOpen();
  }

  public void del(String...var1) {
    connection.sync().del(var1);
  }

  public void addHost(Host host, String hostSetName) {
    RSet<Host> hostSet = redissonClient.getSet(hostSetName);
    hostSet.add(host);
  }

  public Set<Host> getHosts(String hostSetName) {
    return redissonClient.getSet(hostSetName);
  }

  public void removeHost(UUID nodeId, String hostSetName) {
    Set<Host> hostSet = getHosts(hostSetName);
    for (Host host : hostSet) {
      if (host.getId().equals(nodeId))
        redissonClient.getSet(hostSetName).remove(host);
    }
  }


  @Override
  public void close() {
    client.shutdown();
    redissonClient.shutdown();
  }
}
