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

package org.openqa.selenium.injector;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.json.Json;

import java.util.ArrayList;
import java.util.List;

public class InjectorTest {

  @Test
  public void shouldInstantiateAnObjectWithANoArgPublicConstructor() {
    Injector injector = Injector.builder().build();

    List list = injector.newInstance(ArrayList.class);

    assertTrue(list instanceof ArrayList);
  }

  @Test
  public void unmetConstructorParametersAreAnError() {
    Injector injector = Injector.builder().build();

    assertThatExceptionOfType(UnableToInstaniateInstanceException.class)
        .isThrownBy(() -> injector.newInstance(NeedsJson.class));
  }

  @Test
  public void shouldUseObjectsInInjectorToPopulateNewClassViaPublicConstructor() {
    Json json = new Json();
    Injector injector = Injector.builder().register(json).build();

    NeedsJson needsJson = injector.newInstance(NeedsJson.class);

    assertSame(json, needsJson.json);
  }

  public static class NeedsJson {
    private final Json json;

    public NeedsJson(Json json) {
      this.json = json;
    }
  }

  @Test
  public void shouldUseLongestConstructor() {
    Json json = new Json();
    Proxy proxy = new Proxy();
    Injector injector = Injector.builder().register(json).register(proxy).build();

    MultipleConstructors instance = injector.newInstance(MultipleConstructors.class);

    assertSame(json, instance.json);
    assertSame(proxy, instance.proxy);
  }

  public static class MultipleConstructors {

    private final Proxy proxy;
    private final Json json;

    public MultipleConstructors() {
      this(null, null);
    }

    // In the middle in case the constructors are found in declaration order.
    public MultipleConstructors(Proxy proxy, Json json) {
      this.proxy = proxy;
      this.json = json;
    }

    public MultipleConstructors(Json json) {
      this(null, json);
    }

    public MultipleConstructors(Proxy proxy) {
      this(proxy, null);
    }
  }

  @Test
  public void itIsNotAllowedToInsertTwoInstancesOfTheSameClass() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> Injector.builder().register("hello").register("world"));
  }

  @Test
  public void canFallbackToParentInjector() {
    Json json = new Json();
    Injector parent = Injector.builder().register(json).build();

    Proxy proxy = new Proxy();
    Injector child = Injector.builder().parent(parent).register(proxy).build();

    MultipleConstructors instance = child.newInstance(MultipleConstructors.class);

    assertSame(json, instance.json);
    assertSame(proxy, instance.proxy);
  }

  @Test
  public void shouldBeAbleToCallNonPublicConstructors() {
    Json json = new Json();
    Injector injector = Injector.builder().register(json).build();

    HiddenConstructor instance = injector.newInstance(HiddenConstructor.class);

    assertSame(json, instance.json);
  }

  public static class HiddenConstructor {

    private final Json json;

    HiddenConstructor(Json json) {
      this.json = json;
    }
  }

  @Test
  public void shouldUseSubClassesForConstructorArgs() {
    Injector injector = Injector.builder().register("cheese").build();

    SuperTypeConstructor instance = injector.newInstance(SuperTypeConstructor.class);

    assertEquals("cheese", instance.thing);
  }

  public static class SuperTypeConstructor {

    private final Object thing;

    public SuperTypeConstructor(Object thing) {
      this.thing = thing;
    }
  }
}