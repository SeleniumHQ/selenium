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

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import java.math.BigInteger;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.script.RegExpValue;
import org.openqa.selenium.bidi.script.RemoteValue;
import org.openqa.selenium.print.PrintOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JupiterTestBase;

class WebScriptExecuteTest extends JupiterTestBase {

  @Test
  void canExecuteScriptWithUndefinedArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==undefined)\n"
                    + "                throw Error(\"Argument should be undefined, but was"
                    + " \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                "undefined");

    assertThat(value.getType()).isEqualTo("undefined");
  }

  @Test
  void canExecuteScriptWithNullArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==null)\n"
                    + "                throw Error(\"Argument should be undefined, but was"
                    + " \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                "null");

    assertThat(value.getType()).isEqualTo("null");
  }

  @Test
  void canExecuteScriptWithMinusZeroArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==-0)\n"
                    + "                throw Error(\"Argument should be -0, but was \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                "-0");

    assertThat(value.getType()).isEqualTo("number");
    assertThat(value.getValue().get()).isEqualTo("-0");
  }

  @Test
  void canExecuteScriptWithInfinityArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==Infinity)\n"
                    + "                throw Error(\"Argument should be Infinity, but was"
                    + " \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                "Infinity");

    assertThat(value.getType()).isEqualTo("number");
    assertThat(value.getValue().get()).isEqualTo("Infinity");
  }

  @Test
  void canExecuteScriptWithMinusInfinityArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==-Infinity)\n"
                    + "                throw Error(\"Argument should be -Infinity, but was"
                    + " \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                "-Infinity");

    assertThat(value.getType()).isEqualTo("number");
    assertThat(value.getValue().get()).isEqualTo("-Infinity");
  }

  @Test
  void canExecuteScriptWithNumberArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==1.4)\n"
                    + "                throw Error(\"Argument should be 1.4, but was \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                1.4);

    assertThat(value.getType()).isEqualTo("number");
    assertThat(value.getValue().get()).isEqualTo(1.4);
  }

  @Test
  void canExecuteScriptWithIntegerArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==1)\n"
                    + "                throw Error(\"Argument should be 1, but was \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                1);

    assertThat(value.getType()).isEqualTo("number");
    assertThat(value.getValue().get()).isEqualTo(1L);
  }

  @Test
  void canExecuteScriptWithBooleanArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==true)\n"
                    + "                throw Error(\"Argument should be true, but was \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                true);

    assertThat(value.getType()).isEqualTo("boolean");
    assertThat(value.getValue().get()).isEqualTo(true);
  }

  @Test
  void canExecuteScriptWithBigIntArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(arg!==42n)\n"
                    + "                throw Error(\"Argument should be 42n, but was \"+arg);\n"
                    + "            return arg;\n"
                    + "        }}",
                BigInteger.valueOf(42L));

    assertThat(value.getType()).isEqualTo("bigint");
    assertThat(value.getValue().get()).isEqualTo("42");
  }

  @Test
  void canExecuteScriptWithArrayArgument() {
    List<Object> list = new ArrayList<>();
    list.add(1);
    list.add(2);

    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(! (arg instanceof Array))\n"
                    + "                throw Error(\"Argument type should be Array, but was \"+\n"
                    + "                    Object.prototype.toString.call(arg));\n"
                    + "            return arg;\n"
                    + "        }}",
                list);

    assertThat(value.getType()).isEqualTo("array");
    List<RemoteValue> values = (List<RemoteValue>) value.getValue().get();
    assertThat(values.size()).isEqualTo(2);
  }

  @Test
  void canExecuteScriptWithSetArgument() {
    Set<Integer> set = new HashSet<>();
    set.add(1);
    set.add(2);

    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(! (arg instanceof Set))\n"
                    + "                throw Error(\"Argument type should be Set, but was \"+\n"
                    + "                    Object.prototype.toString.call(arg));\n"
                    + "            return arg;\n"
                    + "        }}",
                set);

    assertThat(value.getType()).isEqualTo("set");
    List<RemoteValue> values = (List<RemoteValue>) value.getValue().get();
    assertThat(values.size()).isEqualTo(2);
  }

  @Test
  void canExecuteScriptWithDateArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(! (arg instanceof Date))\n"
                    + "                throw Error(\"Argument type should be Date, but was \"+\n"
                    + "                    Object.prototype.toString.call(arg));\n"
                    + "            return arg;\n"
                    + "        }}",
                Instant.now());

    assertThat(value.getType()).isEqualTo("date");
  }

  @Test
  void canExecuteScriptWithMapArgument() {
    Map<Object, Object> mapValue = new HashMap<>();
    mapValue.put("foobar", 1);
    mapValue.put(List.of(1, 2), List.of(4, 5, 6));

    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(! (arg instanceof Map))\n"
                    + "                throw Error(\"Argument type should be Map, but was \"+\n"
                    + "                    Object.prototype.toString.call(arg));\n"
                    + "            return arg;\n"
                    + "        }}",
                mapValue);

    assertThat(value.getType()).isEqualTo("map");

    Map<Object, RemoteValue> values = (Map<Object, RemoteValue>) value.getValue().get();
    assertThat(values.size()).isEqualTo(2);
  }

  @Test
  void canExecuteScriptWithObjectArgument() {

    PrintOptions options = new PrintOptions();

    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(! (arg instanceof Object))\n"
                    + "                throw Error(\"Argument type should be Object, but was \"+\n"
                    + "                    Object.prototype.toString.call(arg));\n"
                    + "            return arg;\n"
                    + "        }}",
                options);

    assertThat(value.getType()).isEqualTo("object");

    Map<Object, RemoteValue> values = (Map<Object, RemoteValue>) value.getValue().get();
    assertThat(values.size()).isEqualTo(6);
  }

  @Test
  void canExecuteScriptWithRegExpArgument() {
    RemoteValue value =
        ((RemoteWebDriver) driver)
            .script()
            .execute(
                "(arg) => {{\n"
                    + "            if(! (arg instanceof RegExp))\n"
                    + "                throw Error(\"Argument type should be RegExp, but was \"+\n"
                    + "                    Object.prototype.toString.call(arg));\n"
                    + "            return arg;\n"
                    + "        }}",
                new RegExpValue("foo", "g"));

    assertThat(value.getType()).isEqualTo("regexp");

    RegExpValue resultValue = (RegExpValue) value.getValue().get();
    assertThat(resultValue.getPattern()).isEqualTo("foo");
    assertThat(resultValue.getFlags()).isEqualTo("g");
  }

  @AfterEach
  public void cleanUp() {
    driver.quit();
  }
}
