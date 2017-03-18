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

package org.openqa.grid.internal.utils.configuration;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

import com.beust.jcommander.JCommander;

import org.junit.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class StandaloneConfigurationTest {

  @Test
  public void testDefaults() {
    StandaloneConfiguration sc = new StandaloneConfiguration();
    assertEquals(StandaloneConfiguration.DEFAULT_ROLE, sc.role);
    assertEquals(StandaloneConfiguration.DEFAULT_BROWSER_TIMEOUT, sc.browserTimeout);
    assertEquals(StandaloneConfiguration.DEFAULT_DEBUG_TOGGLE, sc.debug);
    assertEquals(StandaloneConfiguration.DEFAULT_TIMEOUT, sc.timeout);
    assertFalse(sc.help);
    assertNull(sc.jettyMaxThreads);
    assertNull(sc.log);
  }

  @Test
  public void testConstructorEqualsDefaultConfig() {
    StandaloneConfiguration actual = new StandaloneConfiguration();
    StandaloneConfiguration expected =
      StandaloneConfiguration.loadFromJSON(StandaloneConfiguration.DEFAULT_STANDALONE_CONFIG_FILE);

    assertEquals(expected.role, actual.role);
    assertEquals(expected.browserTimeout, actual.browserTimeout);
    assertEquals(expected.debug, actual.debug);
    assertEquals(expected.timeout, actual.timeout);
    assertEquals(expected.help, actual.help);
    assertEquals(expected.jettyMaxThreads, actual.jettyMaxThreads);
    assertEquals(expected.log, actual.log);
  }

  @Test
  public void commandLineParsing() throws Exception {
    StandaloneConfiguration sc = new StandaloneConfiguration();
    String[] args = "-timeout 32123 -browserTimeout 456".split(" ");
    new JCommander(sc, args);
    assertEquals(32123, sc.timeout.intValue());
    assertEquals(456, sc.browserTimeout.intValue());
  }

  @Test
  public void testSetTimeout() throws Exception {
    StandaloneConfiguration sc = new StandaloneConfiguration();
    sc.timeout = 123;
    assertEquals(123, sc.timeout.intValue());
  }

  @Test
  public void testSetBrowserTimeout() throws Exception {
    StandaloneConfiguration sc = new StandaloneConfiguration();
    sc.browserTimeout = 1233;
    assertEquals(1233, sc.browserTimeout.intValue());
  }

  @Test
  public void testIsMergeAble() {
    StandaloneConfiguration sc = new StandaloneConfiguration();

    // can't merge null onto null
    assertFalse(sc.isMergeAble(null, null));

    // test with Character
    assertTrue(sc.isMergeAble('a','a'));
    assertTrue(sc.isMergeAble('a', 'b'));
    assertTrue(sc.isMergeAble('a', null));
    assertFalse(sc.isMergeAble(null, 'b'));

    // test with Integer
    assertTrue(sc.isMergeAble(1, 1));
    assertTrue(sc.isMergeAble(1, 2));
    assertTrue(sc.isMergeAble(1, null));
    assertFalse(sc.isMergeAble(null, 2));

    // test with Boolean
    assertTrue(sc.isMergeAble(true, true));
    assertTrue(sc.isMergeAble(true, false));
    assertTrue(sc.isMergeAble(true, null));
    assertFalse(sc.isMergeAble(null, false));

    // test with String
    assertTrue(sc.isMergeAble("a", "a"));
    assertTrue(sc.isMergeAble("a", "b"));
    assertTrue(sc.isMergeAble("a", null));
    assertFalse(sc.isMergeAble(null, "b"));

    // test with Collections
    assertTrue(sc.isMergeAble(Arrays.asList(new String[]{"a", "b"}),
                              Arrays.asList(new String[]{"b", "c"})));
    assertTrue(sc.isMergeAble(Arrays.asList(new String[]{"a", "b"}),
                              Arrays.asList(new String[]{"a", "b"})));
    assertTrue(sc.isMergeAble(Arrays.asList(new String[]{"b", "c"}), Arrays.asList()));
    assertTrue(sc.isMergeAble(Arrays.asList(new String[]{"b", "c"}), null));
    assertFalse(sc.isMergeAble(Arrays.asList(), Arrays.asList(new String[]{"b", "c"})));
    assertFalse(sc.isMergeAble(null, Arrays.asList(new String[]{"b", "c"})));

    // test with Maps
    Map<String, Integer> map = new ImmutableMap.Builder<String, Integer>()
      .put("one", 1).put("two", 2).build();
    Map<String, Integer> map2 = new ImmutableMap.Builder<String, Integer>()
      .put("three", 3).put("four", 4).build();
    assertTrue(sc.isMergeAble(map, map));
    assertTrue(sc.isMergeAble(map, map2));
    assertTrue(sc.isMergeAble(map, null));

    Map<String, Integer> map3 = new HashMap<>();
    map3.put("five", 5);
    assertTrue(sc.isMergeAble(map3, Maps.newHashMap()));

    assertFalse(sc.isMergeAble(new ImmutableMap.Builder<String, Integer>().build(), map3));
    assertFalse(sc.isMergeAble(null, map3));
  }

  @Test
  public void testMergeWithRealValues() {
    StandaloneConfiguration sc = new StandaloneConfiguration();
    StandaloneConfiguration other = new StandaloneConfiguration();
    other.browserTimeout = 5000;
    other.debug = true;
    other.help = true;
    other.jettyMaxThreads = 1000;
    other.log = "foo.log";
    other.port = 4321;
    other.role = "wd";
    other.timeout = 4200;
    sc.merge(other);

    assertEquals(other.browserTimeout, sc.browserTimeout);
    assertEquals(other.jettyMaxThreads, sc.jettyMaxThreads);
    assertEquals(other.timeout, sc.timeout);
    // these values are merge protected
    assertNotEquals(other.debug, sc.debug);
    assertNotEquals(other.port, sc.port);
    assertNotEquals(other.log, sc.log);
    assertNotEquals(other.help, sc.help);
    assertNotEquals(other.role, sc.role);
  }

}
