/*
 Copyright 2011 Software Freedom Conservancy.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

package org.openqa.selenium.internal.selenesedriver;

import com.google.common.base.Stopwatch;
import com.google.common.collect.Lists;

import com.thoughtworks.selenium.Selenium;

import org.json.JSONException;
import org.json.JSONWriter;
import org.openqa.selenium.remote.ErrorHandler;
import org.openqa.selenium.remote.JsonException;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;

import java.io.StringWriter;
import java.util.List;

class ScriptExecutor {

  private final Selenium selenium;

  private boolean inAppUnderTest = false;

  public ScriptExecutor(Selenium selenium) {
    this.selenium = selenium;
  }

  public ScriptExecutor inContextOfApplicationUnderTest() {
    this.inAppUnderTest = true;
    return this;
  }

  public Object executeScript(String script, Object... args) {
    return executeScript(script, Lists.newArrayList(args));
  }

  public <T> T executeScript(String script, List<Object> args) {

    StringWriter sw = new StringWriter();
    try {
      new JSONWriter(sw)
          .object()
          .key("script").value(script)
          .key("args").value(args)
          .endObject();
    } catch (JSONException e) {
      throw new JsonException(e);
    }

    String evalScript = String.format("core.inject.executeScript(%s, %s);",
        sw, inAppUnderTest ? "selenium.browserbot.getCurrentWindow()" : "null");
    return evaluateScript(evalScript);
  }

  public <T> T executeAsyncScript(String script, List<Object> args, long timeoutMillis) {
    StringWriter sw = new StringWriter();
    try {
      new JSONWriter(sw)
          .object()
          .key("script").value(script)
          .key("args").value(args)
          .key("timeout").value(timeoutMillis)
          .endObject();
    } catch (JSONException e) {
      throw new JsonException(e);
    }

    String evalScript = String.format("core.inject.executeAsyncScript(%s);", sw);
    return evaluateScript(evalScript);
  }

  @SuppressWarnings({"unchecked"})
  private <T> T evaluateScript(String script) {
    Stopwatch stopWatch = new Stopwatch();
    stopWatch.start();
    String result = selenium.getEval(script);
    stopWatch.stop();

    Response response = new JsonToBeanConverter()
        .convert(Response.class, result);
    new ErrorHandler()
        .throwIfResponseFailed(response, stopWatch.elapsedMillis());
    return (T) response.getValue();
  }
}
