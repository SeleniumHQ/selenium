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

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

import com.google.common.collect.ImmutableMap;
import java.lang.management.ManagementFactory;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.logging.Logger;

import javax.management.AttributeList;
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
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.MBean;
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

class JmxTest {

  private static final Logger LOG = Logger.getLogger(LocalNode.class.getName());

  private final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private final MBeanServer beanServer = ManagementFactory.getPlatformMBeanServer();

  @Test
  void shouldBeAbleToRegisterBaseServerConfig() {
    try {
      ObjectName name = new ObjectName("org.seleniumhq.grid:type=Config,name=BaseServerConfig");
      new JMXHelper().unregister(name);

      BaseServerOptions baseServerOptions =
          new BaseServerOptions(
              new MapConfig(
                  ImmutableMap.of("server", ImmutableMap.of("port", PortProber.findFreePort()))));

      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfoArray = info.getAttributes();
      assertThat(attributeInfoArray).hasSize(3);

      AttributeList attributeList = getAttributeList(name, attributeInfoArray);
      assertThat(attributeList)
        .isNotNull()
        .hasSize(3);

      String uriValue = (String) beanServer.getAttribute(name, "Uri");
      assertThat(uriValue).isEqualTo(baseServerOptions.getExternalUri().toString());

    } catch (InstanceNotFoundException
        | IntrospectionException
        | ReflectionException
        | MalformedObjectNameException e) {
      fail("Could not find the registered MBean");
    } catch (MBeanException e) {
      fail("MBeanServer exception");
    } catch (AttributeNotFoundException e) {
      fail("Could not find the registered MBean's attribute");
    }
  }

  @Test
  void shouldBeAbleToRegisterNode() throws URISyntaxException {
    try {
      URI nodeUri = new URI("https://example.com:1234");
      ObjectName name = new ObjectName("org.seleniumhq.grid:type=Node,name=LocalNode");
      new JMXHelper().unregister(name);

      Tracer tracer = DefaultTestTracer.createTracer();
      EventBus bus = new GuavaEventBus();

      Secret secret = new Secret("cheese");

      LocalNode localNode =
          LocalNode.builder(tracer, bus, nodeUri, nodeUri, secret)
              .add(
                  CAPS,
                  new TestSessionFactory(
                      (id, caps) ->
                          new Session(
                              id, nodeUri, new ImmutableCapabilities(), caps, Instant.now())))
              .build();

      assertThat(localNode).isNotNull();

      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfo = info.getAttributes();
      assertThat(attributeInfo).hasSize(9);

      AttributeList attributeList = getAttributeList(name, attributeInfo);
      assertThat(attributeList)
        .isNotNull()
        .hasSize(9);

      Object currentSessions = beanServer.getAttribute(name, "CurrentSessions");
      assertNumberAttribute(currentSessions, 0);

      Object maxSessions = beanServer.getAttribute(name, "MaxSessions");
      assertNumberAttribute(maxSessions, 1);

      String status = (String) beanServer.getAttribute(name, "Status");
      assertThat(status).isEqualTo("UP");

      Object totalSlots = beanServer.getAttribute(name, "TotalSlots");
      assertNumberAttribute(totalSlots, 1);

      Object usedSlots = beanServer.getAttribute(name, "UsedSlots");
      assertNumberAttribute(usedSlots, 0);

      Object load = beanServer.getAttribute(name, "Load");
      assertNumberAttribute(attributeList, 0.0f);

      String remoteNodeUri = (String) beanServer.getAttribute(name, "RemoteNodeUri");
      assertThat(remoteNodeUri).isEqualTo(nodeUri.toString());

      String gridUri = (String) beanServer.getAttribute(name, "GridUri");
      assertThat(gridUri).isEqualTo(nodeUri.toString());

    } catch (InstanceNotFoundException
        | IntrospectionException
        | ReflectionException
        | MalformedObjectNameException e) {
      fail("Could not find the registered MBean");
    } catch (MBeanException e) {
      fail("MBeanServer exception");
    } catch (AttributeNotFoundException e) {
      fail("Could not find the registered MBean's attribute");
    }
  }

  @Test
  void shouldBeAbleToRegisterSessionQueueServerConfig() {
    try {
      ObjectName name =
          new ObjectName("org.seleniumhq.grid:type=Config,name=NewSessionQueueConfig");

      new JMXHelper().unregister(name);

      NewSessionQueueOptions newSessionQueueOptions =
          new NewSessionQueueOptions(new MapConfig(ImmutableMap.of()));
      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfoArray = info.getAttributes();
      assertThat(attributeInfoArray).hasSize(2);

      AttributeList attributeList = getAttributeList(name, attributeInfoArray);
      assertThat(attributeList)
        .isNotNull()
        .hasSize(2);

      Object requestTimeout = beanServer.getAttribute(name, "RequestTimeoutSeconds");
      assertNumberAttribute(requestTimeout, newSessionQueueOptions.getRequestTimeoutSeconds());

      Object retryInterval = beanServer.getAttribute(name, "RetryIntervalMilliseconds");
      assertNumberAttribute(retryInterval, newSessionQueueOptions.getRetryIntervalMilliseconds());
    } catch (InstanceNotFoundException
        | IntrospectionException
        | ReflectionException
        | MalformedObjectNameException e) {
      fail("Could not find the registered MBean");
    } catch (MBeanException e) {
      fail("MBeanServer exception");
    } catch (AttributeNotFoundException e) {
      fail("Could not find the registered MBean's attribute");
    }
  }

  @Test
  void shouldBeAbleToRegisterSessionQueue() {
    try {
      ObjectName name =
          new ObjectName("org.seleniumhq.grid:type=SessionQueue,name=LocalSessionQueue");

      new JMXHelper().unregister(name);

      Tracer tracer = DefaultTestTracer.createTracer();

      NewSessionQueue sessionQueue =
          new LocalNewSessionQueue(
              tracer,
              new DefaultSlotMatcher(),
              Duration.ofSeconds(2),
              Duration.ofSeconds(2),
              new Secret(""),
              5);

      assertThat(sessionQueue).isNotNull();
      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfoArray = info.getAttributes();
      assertThat(attributeInfoArray).hasSize(1);

      AttributeList attributeList = getAttributeList(name, attributeInfoArray);
      assertThat(attributeList)
        .isNotNull()
        .hasSize(1);

      Object size = beanServer.getAttribute(name, "NewSessionQueueSize");
      assertNumberAttribute(size, 0);
    } catch (InstanceNotFoundException
        | IntrospectionException
        | ReflectionException
        | MalformedObjectNameException e) {
      fail("Could not find the registered MBean");
    } catch (MBeanException e) {
      fail("MBeanServer exception");
    } catch (AttributeNotFoundException e) {
      fail("Could not find the registered MBean's attribute");
    }
  }

  @Test
  void shouldBeAbleToMonitorHub() throws Exception {
    ObjectName name = new ObjectName("org.seleniumhq.grid:type=Distributor,name=LocalDistributor");

    new JMXHelper().unregister(name);

    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    Secret secret = new Secret("cheese");
    URI nodeUri = new URI("https://example.com:1234");

    LocalNode localNode =
        LocalNode.builder(tracer, bus, nodeUri, nodeUri, secret)
            .add(
                CAPS,
                new TestSessionFactory(
                    (id, caps) ->
                        new Session(id, nodeUri, new ImmutableCapabilities(), caps, Instant.now())))
            .build();

    NewSessionQueue sessionQueue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            secret,
            5);

    try (LocalDistributor distributor =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(localNode),
            new LocalSessionMap(tracer, bus),
            sessionQueue,
            new DefaultSlotSelector(),
            secret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            Runtime.getRuntime().availableProcessors(),
            new DefaultSlotMatcher())) {

      distributor.add(localNode);

      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfoArray = info.getAttributes();
      assertThat(attributeInfoArray).hasSize(4);

      AttributeList attributeList = getAttributeList(name, attributeInfoArray);
      assertThat(attributeList)
        .isNotNull()
        .hasSize(4);

      Object nodeUpCount = beanServer.getAttribute(name, "NodeUpCount");
      LOG.info("Node up count=" + nodeUpCount);
      assertNumberAttribute(nodeUpCount, 1);

      Object nodeDownCount = beanServer.getAttribute(name, "NodeDownCount");
      LOG.info("Node down count=" + nodeDownCount);
      assertNumberAttribute(nodeDownCount, 0);

      Object activeSlots = beanServer.getAttribute(name, "ActiveSlots");
      LOG.info("Active slots count=" + activeSlots);
      assertNumberAttribute(activeSlots, 0);

      Object idleSlots = beanServer.getAttribute(name, "IdleSlots");
      LOG.info("Idle slots count=" + idleSlots);
      assertNumberAttribute(idleSlots, 1);
    }
  }

  private AttributeList getAttributeList(ObjectName name, MBeanAttributeInfo[] attributeInfoArray) throws InstanceNotFoundException, ReflectionException {
    String[] attributeNames = new String[attributeInfoArray.length];
    for (int i = 0; i < attributeInfoArray.length; i++) {
      attributeNames[i] = attributeInfoArray[i].getName();
    }

    return beanServer.getAttributes(name, attributeNames);
  }

  private void assertCommonNumberAttributes(Object attribute) {
    assertThat(attribute).isNotNull();
    assertThat(attribute).isInstanceOf(Number.class);
  }

  private void assertNumberAttribute(Object attribute, int expectedValue) {
    assertCommonNumberAttributes(attribute);
    assertThat(Integer.parseInt(attribute.toString())).isEqualTo(expectedValue);
  }

  private void assertNumberAttribute(Object attribute, long expectedValue) {
    assertCommonNumberAttributes(attribute);
    assertThat(Long.parseLong(attribute.toString())).isEqualTo(expectedValue);
  }

  private void assertNumberAttribute(Object attribute, float expectedValue) {
    assertCommonNumberAttributes(attribute);
    assertThat(Float.parseFloat(attribute.toString())).isEqualTo(expectedValue);
  }

}
