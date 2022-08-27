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

package org.openqa.selenium.grid.router;

import com.google.common.collect.ImmutableMap;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import javax.management.AttributeNotFoundException;
import javax.management.InstanceNotFoundException;
import javax.management.IntrospectionException;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanException;
import javax.management.MBeanInfo;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.ReflectionException;
import java.lang.management.ManagementFactory;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.logging.Logger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

public class JmxTest {

  private static final Logger LOG = Logger.getLogger(LocalNode.class.getName());

  private final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private final MBeanServer beanServer = ManagementFactory.getPlatformMBeanServer();

  @Test
  public void shouldBeAbleToRegisterBaseServerConfig() {
    try {
      ObjectName name = new ObjectName("org.seleniumhq.grid:type=Config,name=BaseServerConfig");
      new JMXHelper().unregister(name);

      BaseServerOptions baseServerOptions = new BaseServerOptions(
        new MapConfig(
          ImmutableMap.of("server", ImmutableMap.of("port", PortProber.findFreePort()))));

      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfoArray = info.getAttributes();
      assertThat(attributeInfoArray).hasSize(3);

      String uriValue = (String) beanServer.getAttribute(name, "Uri");
      assertThat(uriValue).isEqualTo(baseServerOptions.getExternalUri().toString());

    } catch (InstanceNotFoundException | IntrospectionException | ReflectionException
      | MalformedObjectNameException e) {
      fail("Could not find the registered MBean");
    } catch (MBeanException e) {
      fail("MBeanServer exception");
    } catch (AttributeNotFoundException e) {
      fail("Could not find the registered MBean's attribute");
    }
  }

  @Test
  public void shouldBeAbleToRegisterNode() throws URISyntaxException {
    try {
      URI nodeUri = new URI("https://example.com:1234");
      ObjectName name = new ObjectName("org.seleniumhq.grid:type=Node,name=LocalNode");
      new JMXHelper().unregister(name);

      Tracer tracer = DefaultTestTracer.createTracer();
      EventBus bus = new GuavaEventBus();

      Secret secret = new Secret("cheese");

      LocalNode localNode = LocalNode.builder(tracer, bus, nodeUri, nodeUri, secret)
        .add(CAPS, new TestSessionFactory((id, caps) -> new Session(
          id,
          nodeUri,
          new ImmutableCapabilities(),
          caps,
          Instant.now()))).build();

      assertThat(localNode).isNotNull();

      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfo = info.getAttributes();
      assertThat(attributeInfo).hasSize(9);

      String currentSessions = (String) beanServer.getAttribute(name, "CurrentSessions");
      assertThat(Integer.parseInt(currentSessions)).isZero();

      String maxSessions = (String) beanServer.getAttribute(name, "MaxSessions");
      assertThat(Integer.parseInt(maxSessions)).isEqualTo(1);

      String status = (String) beanServer.getAttribute(name, "Status");
      assertThat(status).isEqualTo("UP");

      String totalSlots = (String) beanServer.getAttribute(name, "TotalSlots");
      assertThat(Integer.parseInt(totalSlots)).isEqualTo(1);

      String usedSlots = (String) beanServer.getAttribute(name, "UsedSlots");
      assertThat(Integer.parseInt(usedSlots)).isZero();

      String load = (String) beanServer.getAttribute(name, "Load");
      assertThat(Float.parseFloat(load)).isEqualTo(0.0f);

      String remoteNodeUri = (String) beanServer.getAttribute(name, "RemoteNodeUri");
      assertThat(remoteNodeUri).isEqualTo(nodeUri.toString());

      String gridUri = (String) beanServer.getAttribute(name, "GridUri");
      assertThat(gridUri).isEqualTo(nodeUri.toString());

    } catch (InstanceNotFoundException | IntrospectionException | ReflectionException
      | MalformedObjectNameException e) {
      fail("Could not find the registered MBean");
    } catch (MBeanException e) {
      fail("MBeanServer exception");
    } catch (AttributeNotFoundException e) {
      fail("Could not find the registered MBean's attribute");
    }
  }

  @Test
  public void shouldBeAbleToRegisterSessionQueuerServerConfig() {
    try {
      ObjectName name = new ObjectName(
        "org.seleniumhq.grid:type=Config,name=NewSessionQueueConfig");

      new JMXHelper().unregister(name);

      NewSessionQueueOptions newSessionQueueOptions =
        new NewSessionQueueOptions(new MapConfig(ImmutableMap.of()));
      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfoArray = info.getAttributes();
      assertThat(attributeInfoArray).hasSize(2);

      String requestTimeout = (String) beanServer.getAttribute(name, "RequestTimeoutSeconds");
      assertThat(Long.parseLong(requestTimeout))
        .isEqualTo(newSessionQueueOptions.getRequestTimeoutSeconds());

      String retryInterval = (String) beanServer.getAttribute(name, "RetryIntervalSeconds");
      assertThat(Long.parseLong(retryInterval))
        .isEqualTo(newSessionQueueOptions.getRetryIntervalSeconds());
    } catch (InstanceNotFoundException | IntrospectionException | ReflectionException
      | MalformedObjectNameException e) {
      fail("Could not find the registered MBean");
    } catch (MBeanException e) {
      fail("MBeanServer exception");
    } catch (AttributeNotFoundException e) {
      fail("Could not find the registered MBean's attribute");
    }
  }

  @Test
  public void shouldBeAbleToRegisterSessionQueue() {
    try {
      ObjectName name = new ObjectName("org.seleniumhq.grid:type=SessionQueue,name=LocalSessionQueue");

      new JMXHelper().unregister(name);

      Tracer tracer = DefaultTestTracer.createTracer();

      NewSessionQueue sessionQueue = new LocalNewSessionQueue(
        tracer,
        new DefaultSlotMatcher(),
        Duration.ofSeconds(2),
        Duration.ofSeconds(2),
        new Secret(""));

      assertThat(sessionQueue).isNotNull();
      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfoArray = info.getAttributes();
      assertThat(attributeInfoArray).hasSize(1);

      String size = (String) beanServer.getAttribute(name, "NewSessionQueueSize");
      assertThat(Integer.parseInt(size)).isZero();
    } catch (InstanceNotFoundException | IntrospectionException | ReflectionException
      | MalformedObjectNameException e) {
      fail("Could not find the registered MBean");
    } catch (MBeanException e) {
      fail("MBeanServer exception");
    } catch (AttributeNotFoundException e) {
      fail("Could not find the registered MBean's attribute");
    }
  }

  @Test
  public void shouldBeAbleToMonitorHub() throws Exception {
    ObjectName name = new ObjectName("org.seleniumhq.grid:type=Distributor,name=LocalDistributor");

    new JMXHelper().unregister(name);

    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    Secret secret = new Secret("cheese");
    URI nodeUri = new URI("https://example.com:1234");

    LocalNode localNode = LocalNode.builder(tracer, bus, nodeUri, nodeUri, secret)
      .add(CAPS, new TestSessionFactory((id, caps) -> new Session(
        id,
        nodeUri,
        new ImmutableCapabilities(),
        caps,
        Instant.now()))).build();

    NewSessionQueue sessionQueue = new LocalNewSessionQueue(
      tracer,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      secret);

    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(localNode),
      new LocalSessionMap(tracer, bus),
      sessionQueue,
      new DefaultSlotSelector(),
      secret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor.add(localNode);

    MBeanInfo info = beanServer.getMBeanInfo(name);
    assertThat(info).isNotNull();

    String nodeUpCount = (String) beanServer.getAttribute(name, "NodeUpCount");
    LOG.info("Node up count=" + nodeUpCount);
    assertThat(Integer.parseInt(nodeUpCount)).isEqualTo(1);

    String nodeDownCount = (String) beanServer.getAttribute(name, "NodeDownCount");
    LOG.info("Node down count=" + nodeDownCount);
    assertThat(Integer.parseInt(nodeDownCount)).isZero();

    String activeSlots = (String) beanServer.getAttribute(name, "ActiveSlots");
    LOG.info("Active slots count=" + activeSlots);
    assertThat(Integer.parseInt(activeSlots)).isZero();

    String idleSlots = (String) beanServer.getAttribute(name, "IdleSlots");
    LOG.info("Idle slots count=" + idleSlots);
    assertThat(Integer.parseInt(idleSlots)).isEqualTo(1);
  }

}

