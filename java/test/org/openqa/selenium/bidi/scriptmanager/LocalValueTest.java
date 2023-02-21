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

package org.openqa.selenium.bidi.scriptmanager;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.protocolvalue.LocalValue;
import org.openqa.selenium.bidi.protocolvalue.RegExpValue;
import org.openqa.selenium.bidi.protocolvalue.RemoteValue;
import org.openqa.selenium.bidi.script.ArgumentValue;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.bidi.script.ScriptManager;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

class LocalValueTest {

  private FirefoxDriver driver;

  @BeforeEach
  public void setUp() {
    FirefoxOptions options = new FirefoxOptions();
    options.setCapability("webSocketUrl", true);

    driver = new FirefoxDriver(options);
  }

  @Test
  void canCallFunctionWithArrayArgument() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    List<ArgumentValue> arguments = new ArrayList<>();

    List<LocalValue> arrayValue = new ArrayList<>();
    arrayValue.add(LocalValue.createStringValue("foobar"));
    ArgumentValue value =
      new ArgumentValue(LocalValue.createArrayValue(arrayValue));
    arguments.add(value);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
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
    ScriptManager manager = new ScriptManager(id, driver);

    List<ArgumentValue> arguments = new ArrayList<>();

    Set<LocalValue> setValue = new HashSet<>();
    setValue.add(LocalValue.createStringValue("foobar"));
    ArgumentValue value =
      new ArgumentValue(LocalValue.createSetValue(setValue));
    arguments.add(value);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
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
    ScriptManager manager = new ScriptManager(id, driver);

    List<ArgumentValue> arguments = new ArrayList<>();

    ArgumentValue value =
      new ArgumentValue(LocalValue.createDateValue("2022-05-31T13:47:29.000Z"));
    arguments.add(value);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("date");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(successResult.getResult().getValue().get()).isEqualTo("2022-05-31T13:47:29.000Z");
  }

  @Test
  void canCallFunctionWithMapArgument() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    List<ArgumentValue> arguments = new ArrayList<>();

    Map<Object, LocalValue> mapValue = new HashMap<>();
    mapValue.put("foobar", LocalValue.createStringValue("foobar"));

    ArgumentValue value =
      new ArgumentValue(LocalValue.createMapValue(mapValue));
    arguments.add(value);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("map");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();

    Map<Object, RemoteValue>
      resultValue =
      (Map<Object, RemoteValue>) successResult.getResult().getValue().get();
    assertThat(resultValue.size()).isEqualTo(1);
    assertThat(resultValue.get("foobar").getType()).isEqualTo("string");
  }

  @Test
  void canCallFunctionWithObjectArgument() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    List<ArgumentValue> arguments = new ArrayList<>();

    Map<Object, LocalValue> mapValue = new HashMap<>();
    mapValue.put("foobar", LocalValue.createStringValue("foobar"));

    ArgumentValue value =
      new ArgumentValue(LocalValue.createObjectValue(mapValue));
    arguments.add(value);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("object");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();

    Map<Object, RemoteValue>
      resultValue =
      (Map<Object, RemoteValue>) successResult.getResult().getValue().get();
    assertThat(resultValue.size()).isEqualTo(1);
    assertThat(resultValue.get("foobar").getType()).isEqualTo("string");
  }

  @Test
  void canCallFunctionWithRegExpArgument() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    List<ArgumentValue> arguments = new ArrayList<>();

    ArgumentValue value =
      new ArgumentValue(LocalValue.createRegularExpressionValue(new RegExpValue("foo",
                                                                                Optional.of("g"))));
    arguments.add(value);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("regexp");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    RegExpValue resultValue = (RegExpValue) successResult.getResult().getValue().get();
    assertThat(resultValue.getPattern()).isEqualTo("foo");
    assertThat(resultValue.getFlags().get()).isEqualTo("g");
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
  }
}