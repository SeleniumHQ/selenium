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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.google.common.collect.ImmutableMap;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class CapabilitiesTest {

  @Test
  void canCreateEmptyCapabilities() {
    Capabilities caps = new ImmutableCapabilities();
    assertThat(caps.asMap()).isEmpty();
  }

  @Test
  void canCreateSinglePairCapabilities() {
    Capabilities caps = new ImmutableCapabilities("c1", "v1");
    assertThat(caps.asMap()).isEqualTo(ImmutableMap.of("c1", "v1"));
  }

  @Test
  void canCreateTwoPairCapabilities() {
    Capabilities caps = new ImmutableCapabilities("c1", "v1", "c2", 2);
    assertThat(caps.asMap()).isEqualTo(ImmutableMap.of("c1", "v1", "c2", 2));
  }

  @Test
  void canCreateThreePairCapabilities() {
    Capabilities caps = new ImmutableCapabilities("c1", "v1", "c2", 2, "c3", true);
    assertThat(caps.asMap()).isEqualTo(ImmutableMap.of("c1", "v1", "c2", 2, "c3", true));
  }

  @Test
  void canCreateFourPairCapabilities() {
    Capabilities caps = new ImmutableCapabilities("c1", "v1", "c2", 2, "c3", true, "c4", "v4");
    assertThat(caps.asMap())
        .isEqualTo(ImmutableMap.of("c1", "v1", "c2", 2, "c3", true, "c4", "v4"));
  }

  @Test
  void canCreateFivePairCapabilities() {
    Capabilities caps =
        new ImmutableCapabilities("c1", "v1", "c2", 2, "c3", true, "c4", "v4", "c5", "v5");
    assertThat(caps.asMap())
        .isEqualTo(ImmutableMap.of("c1", "v1", "c2", 2, "c3", true, "c4", "v4", "c5", "v5"));
  }

  @Test
  void canCompareCapabilities() {
    MutableCapabilities caps1 = new MutableCapabilities();
    MutableCapabilities caps2 = new MutableCapabilities();
    assertThat(new ImmutableCapabilities(caps2)).isEqualTo(new ImmutableCapabilities(caps1));

    caps1.setCapability("xxx", "yyy");
    assertThat(new ImmutableCapabilities(caps1)).isNotEqualTo(new ImmutableCapabilities(caps2));

    caps2.setCapability("xxx", "yyy");
    assertThat(new ImmutableCapabilities(caps2)).isEqualTo(new ImmutableCapabilities(caps1));
  }

  @Test
  void shouldCheckKeyType() {
    Map<Object, Object> map = new HashMap<>();
    map.put(new Object(), new Object());
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> new ImmutableCapabilities(map));
  }

  @Test
  void canMergeImmutableCapabilities() {
    Map<String, Object> map1 = ImmutableMap.of("c1", "v1", "c2", "v2");
    Map<String, Object> map2 = ImmutableMap.of("c1", "new value", "c3", "v3");
    Capabilities caps1 = new ImmutableCapabilities(map1);
    Capabilities caps2 = new ImmutableCapabilities(map2);
    Capabilities merged = caps1.merge(caps2);
    assertThat(merged).isNotSameAs(caps1).isNotSameAs(caps2);
    assertThat(merged.asMap())
        .containsExactlyEntriesOf(ImmutableMap.of("c1", "new value", "c2", "v2", "c3", "v3"));
    assertThat(caps1.asMap()).containsExactlyEntriesOf(map1);
    assertThat(caps2.asMap()).containsExactlyEntriesOf(map2);
  }

  @Test
  void canMergeMutableCapabilities() {
    Map<String, Object> map1 = ImmutableMap.of("c1", "v1", "c2", "v2");
    Map<String, Object> map2 = ImmutableMap.of("c1", "new value", "c3", "v3");
    Capabilities caps1 = new MutableCapabilities(map1);
    Capabilities caps2 = new MutableCapabilities(map2);
    Capabilities merged = caps1.merge(caps2);
    assertThat(merged).isNotSameAs(caps1).isNotSameAs(caps2);
    assertThat(merged.asMap())
        .containsExactlyEntriesOf(ImmutableMap.of("c1", "new value", "c2", "v2", "c3", "v3"));
    assertThat(caps1.asMap()).containsExactlyEntriesOf(map1);
    assertThat(caps2.asMap()).containsExactlyEntriesOf(map2);
  }

  @Test
  void ensureHashCodesAreEqual() {
    Capabilities one = new ImmutableCapabilities("key1", "value1", "key2", "value2");
    Capabilities two = new MutableCapabilities(ImmutableMap.of("key1", "value1", "key2", "value2"));
    Capabilities three =
        new PersistentCapabilities(new ImmutableCapabilities("key2", "value2"))
            .setCapability("key1", "value1");

    assertThat(one.hashCode()).isEqualTo(two.hashCode());
    assertThat(one.hashCode()).isEqualTo(three.hashCode());
    assertThat(two.hashCode()).isEqualTo(three.hashCode());
  }

  @Test
  void ensureEqualHashCodesMightBeNotEqual() {
    Capabilities one = new ImmutableCapabilities("key", "DB");
    Capabilities two = new ImmutableCapabilities("key", "Ca");

    assertThat(one.hashCode()).isEqualTo(two.hashCode());
    assertThat(one).isNotEqualTo(two);
  }
}
