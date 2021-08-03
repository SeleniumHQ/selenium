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
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.config.SessionRequestOptions;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.fail;

public class JmxTest {

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
      URI nodeUri = new URI("http://example.com:1234");
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

      SessionRequestOptions queueOptions =
        new SessionRequestOptions(new MapConfig(ImmutableMap.of()));
      MBeanInfo info = beanServer.getMBeanInfo(name);
      assertThat(info).isNotNull();

      MBeanAttributeInfo[] attributeInfoArray = info.getAttributes();
      assertThat(attributeInfoArray).hasSize(2);

      String requestTimeout = (String) beanServer.getAttribute(name, "RequestTimeoutSeconds");
      assertThat(Long.parseLong(requestTimeout)).isEqualTo(queueOptions.getRequestTimeoutSeconds());

      String retryInterval = (String) beanServer.getAttribute(name, "RetryIntervalSeconds");
      assertThat(Long.parseLong(retryInterval)).isEqualTo(queueOptions.getRetryIntervalSeconds());
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
      EventBus bus = new GuavaEventBus();

      NewSessionQueue sessionQueue = new LocalNewSessionQueue(
        tracer,
        bus,
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
}

