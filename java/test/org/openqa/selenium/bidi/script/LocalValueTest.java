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

package org.openqa.selenium.bidi.script;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.testing.JupiterTestBase;

class LocalValueTest extends JupiterTestBase {

  @Test
  void canCallFunctionWithUndefinedArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.undefinedValue();
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(arg!==undefined)\n"
                + "                throw Error(\"Argument should be undefined, but was \"+arg);\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("undefined");
  }

  @Test
  void canCallFunctionWithNullArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.nullValue();
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(arg!==null)\n"
                + "                throw Error(\"Argument should be undefined, but was \"+arg);\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("null");
  }

  @Test
  void canCallFunctionWithMinusZeroArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.numberValue(PrimitiveProtocolValue.SpecialNumberType.MINUS_ZERO);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(arg!==-0)\n"
                + "                throw Error(\"Argument should be -0, but was \"+arg);\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((String) successResult.getResult().getValue().get()).isEqualTo("-0");
  }

  @Test
  void canCallFunctionWithInfinityArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.numberValue(PrimitiveProtocolValue.SpecialNumberType.INFINITY);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(arg!==Infinity)\n"
                + "                throw Error(\"Argument should be Infinity, but was \"+arg);\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((String) successResult.getResult().getValue().get()).isEqualTo("Infinity");
  }

  @Test
  void canCallFunctionWithMinusInfinityArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value =
        LocalValue.numberValue(PrimitiveProtocolValue.SpecialNumberType.MINUS_INFINITY);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(arg!==-Infinity)\n"
                + "                throw Error(\"Argument should be -Infinity, but was \"+arg);\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((String) successResult.getResult().getValue().get()).isEqualTo("-Infinity");
  }

  @Test
  void canCallFunctionWithNumberArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.numberValue(1.4);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(arg!==1.4)\n"
                + "                throw Error(\"Argument should be 1.4, but was \"+arg);\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((double) successResult.getResult().getValue().get()).isEqualTo(1.4);
  }

  @Test
  void canCallFunctionWithBooleanArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.booleanValue(true);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(arg!==true)\n"
                + "                throw Error(\"Argument should be true, but was \"+arg);\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("boolean");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((boolean) successResult.getResult().getValue().get()).isEqualTo(true);
  }

  @Test
  void canCallFunctionWithBigIntArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.bigIntValue("42");
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(arg!==42n)\n"
                + "                throw Error(\"Argument should be 42n, but was \"+arg);\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("bigint");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((String) successResult.getResult().getValue().get()).isEqualTo("42");
  }

  @Test
  void canCallFunctionWithArrayArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    List<LocalValue> arrayValue = new ArrayList<>();
    arrayValue.add(LocalValue.stringValue("foobar"));
    LocalValue value = LocalValue.arrayValue(arrayValue);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(! (arg instanceof Array))\n"
                + "                throw Error(\"Argument type should be Array, but was \"+\n"
                + "                    Object.prototype.toString.call(arg));\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("array");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    List<RemoteValue> resultValue = (List<RemoteValue>) successResult.getResult().getValue().get();
    assertThat(resultValue.size()).isEqualTo(1);
    assertThat(resultValue.get(0).getType()).isEqualTo("string");
    assertThat((String) resultValue.get(0).getValue().get()).isEqualTo("foobar");
  }

  @Test
  void canCallFunctionWithSetArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    Set<LocalValue> setValue = new HashSet<>();
    setValue.add(LocalValue.stringValue("foobar"));
    LocalValue value = LocalValue.setValue(setValue);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(! (arg instanceof Set))\n"
                + "                throw Error(\"Argument type should be Set, but was \"+\n"
                + "                    Object.prototype.toString.call(arg));\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("set");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    List<RemoteValue> resultValue = (List<RemoteValue>) successResult.getResult().getValue().get();
    assertThat(resultValue.size()).isEqualTo(1);
    assertThat(resultValue.get(0).getType()).isEqualTo("string");
    assertThat((String) resultValue.get(0).getValue().get()).isEqualTo("foobar");
  }

  @Test
  void canCallFunctionWithDateArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.dateValue("2022-05-31T13:47:29.000Z");
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(! (arg instanceof Date))\n"
                + "                throw Error(\"Argument type should be Date, but was \"+\n"
                + "                    Object.prototype.toString.call(arg));\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("date");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(successResult.getResult().getValue().get()).isEqualTo("2022-05-31T13:47:29.000Z");
  }

  @Test
  void canCallFunctionWithMapArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    Map<Object, LocalValue> mapValue = new HashMap<>();
    mapValue.put("foobar", LocalValue.stringValue("foobar"));

    LocalValue value = LocalValue.mapValue(mapValue);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(! (arg instanceof Map))\n"
                + "                throw Error(\"Argument type should be Map, but was \"+\n"
                + "                    Object.prototype.toString.call(arg));\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("map");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();

    Map<Object, RemoteValue> resultValue =
        (Map<Object, RemoteValue>) successResult.getResult().getValue().get();
    assertThat(resultValue.size()).isEqualTo(1);
    assertThat(resultValue.get("foobar").getType()).isEqualTo("string");
  }

  @Test
  void canCallFunctionWithObjectArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    Map<Object, LocalValue> mapValue = new HashMap<>();
    mapValue.put("foobar", LocalValue.stringValue("foobar"));

    LocalValue value = LocalValue.objectValue(mapValue);
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(! (arg instanceof Object))\n"
                + "                throw Error(\"Argument type should be Object, but was \"+\n"
                + "                    Object.prototype.toString.call(arg));\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("object");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();

    Map<Object, RemoteValue> resultValue =
        (Map<Object, RemoteValue>) successResult.getResult().getValue().get();
    assertThat(resultValue.size()).isEqualTo(1);
    assertThat(resultValue.get("foobar").getType()).isEqualTo("string");
  }

  @Test
  void canCallFunctionWithRegExpArgument() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.regExpValue("foo", "g");
    arguments.add(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(arg) => {{\n"
                + "            if(! (arg instanceof RegExp))\n"
                + "                throw Error(\"Argument type should be RegExp, but was \"+\n"
                + "                    Object.prototype.toString.call(arg));\n"
                + "            return arg;\n"
                + "        }}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("regexp");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    RegExpValue resultValue = (RegExpValue) successResult.getResult().getValue().get();
    assertThat(resultValue.getPattern()).isEqualTo("foo");
    assertThat(resultValue.getFlags()).isEqualTo("g");
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
  }
}
