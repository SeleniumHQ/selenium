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
package org.openqa.selenium.bidi.browsingcontext;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.bidi.script.LocalValue;
import org.openqa.selenium.bidi.script.NodeProperties;
import org.openqa.selenium.bidi.script.RemoteReference;
import org.openqa.selenium.bidi.script.RemoteValue;
import org.openqa.selenium.bidi.script.ResultOwnership;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

public class LocateNodesTest extends JupiterTestBase {
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canLocateNodes() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();

    driver.get(pages.xhtmlTestPage);

    LocateNodeParameters parameters = new LocateNodeParameters(Locator.css("div"));

    List<RemoteValue> elements = browsingContext.locateNodes(parameters);
    assertThat(elements.size()).isEqualTo(13);
  }

  @Test
  void canLocateNodesWithJustLocator() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();

    driver.get(pages.xhtmlTestPage);

    List<RemoteValue> elements = browsingContext.locateNodes(Locator.css("div"));
    assertThat(elements.size()).isEqualTo(13);
  }

  @Test
  void canLocateNode() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();

    driver.get(pages.xhtmlTestPage);

    RemoteValue element = browsingContext.locateNode(Locator.css("div"));
    assertThat(element.getType()).isEqualTo("node");
  }

  @Test
  void canLocateNodesWithCSSLocator() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();

    driver.get(pages.xhtmlTestPage);

    LocateNodeParameters parameters =
        new LocateNodeParameters(Locator.css("div.extraDiv, div.content")).setMaxNodeCount(1);

    List<RemoteValue> elements = browsingContext.locateNodes(parameters);
    assertThat(elements.size()).isGreaterThanOrEqualTo(1);

    RemoteValue value = elements.get(0);
    assertThat(value.getType()).isEqualTo("node");
    assertThat(value.getValue().isPresent()).isTrue();
    NodeProperties properties = (NodeProperties) value.getValue().get();
    assertThat(properties.getLocalName().get()).isEqualTo("div");
    assertThat(properties.getAttributes().get().size()).isEqualTo(1);
    assertThat(properties.getAttributes().get().get("class")).isEqualTo("content");
  }

  @Test
  void canLocateNodesWithXPathLocator() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();

    driver.get(pages.xhtmlTestPage);

    LocateNodeParameters parameters =
        new LocateNodeParameters(Locator.xpath("/html/body/div[2]")).setMaxNodeCount(1);

    List<RemoteValue> elements = browsingContext.locateNodes(parameters);
    assertThat(elements.size()).isGreaterThanOrEqualTo(1);

    RemoteValue value = elements.get(0);
    assertThat(value.getType()).isEqualTo("node");
    assertThat(value.getValue().isPresent()).isTrue();
    NodeProperties properties = (NodeProperties) value.getValue().get();
    assertThat(properties.getLocalName().get()).isEqualTo("div");
    assertThat(properties.getAttributes().get().size()).isEqualTo(1);
    assertThat(properties.getAttributes().get().get("class")).isEqualTo("content");
  }

  @Test
  @NotYetImplemented(FIREFOX)
  void canLocateNodesWithInnerText() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();

    driver.get(pages.xhtmlTestPage);

    LocateNodeParameters parameters =
        new LocateNodeParameters(Locator.innerText("Spaced out")).setMaxNodeCount(1);

    List<RemoteValue> elements = browsingContext.locateNodes(parameters);
    assertThat(elements.size()).isGreaterThanOrEqualTo(1);

    RemoteValue value = elements.get(0);
    assertThat(value.getType()).isEqualTo("node");
    assertThat(value.getValue().isPresent()).isTrue();
  }

  @Test
  void canLocateNodesWithMaxNodeCount() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();

    driver.get(pages.xhtmlTestPage);

    LocateNodeParameters parameters =
        new LocateNodeParameters(Locator.css("div")).setMaxNodeCount(4);

    List<RemoteValue> elements = browsingContext.locateNodes(parameters);
    assertThat(elements.size()).isEqualTo(4);
  }

  @Test
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  void canLocateNodesGivenStartNodes() {
    String handle = driver.getWindowHandle();
    BrowsingContext browsingContext = new BrowsingContext(driver, handle);
    assertThat(browsingContext.getId()).isNotEmpty();

    driver.get(pages.formPage);

    Script script = new Script(driver);
    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            handle,
            "document.querySelectorAll(\"form\")",
            false,
            Optional.of(ResultOwnership.ROOT));

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

    EvaluateResultSuccess resultSuccess = (EvaluateResultSuccess) result;
    List<RemoteReference> startNodes = new ArrayList<>();

    RemoteValue remoteValue = resultSuccess.getResult();
    List<RemoteValue> remoteValues = (List<RemoteValue>) remoteValue.getValue().get();

    remoteValues.forEach(
        value ->
            startNodes.add(
                new RemoteReference(RemoteReference.Type.SHARED_ID, value.getSharedId().get())));

    LocateNodeParameters parameters =
        new LocateNodeParameters(Locator.css("input"))
            .setStartNodes(startNodes)
            .setMaxNodeCount(50);

    List<RemoteValue> elements = browsingContext.locateNodes(parameters);
    assertThat(elements.size()).isEqualTo(35);
  }

  @Test
  void canLocateNodesInAGivenSandbox() {
    String sandbox = "sandbox";
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();

    browsingContext.navigate(pages.xhtmlTestPage, ReadinessState.COMPLETE);

    LocateNodeParameters parameters =
        new LocateNodeParameters(Locator.css("div")).setSandbox(sandbox).setMaxNodeCount(1);

    List<RemoteValue> elements = browsingContext.locateNodes(parameters);
    assertThat(elements.size()).isEqualTo(1);

    String nodeId = elements.get(0).getSharedId().get();

    List<LocalValue> arguments = new ArrayList<>();

    LocalValue value = LocalValue.mapValue(Map.of("sharedId", LocalValue.stringValue(nodeId)));
    arguments.add(value);

    Script script = new Script(driver);

    // Since the node was present in the sandbox, the script run in the same sandbox should be able
    // to retrieve it
    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            driver.getWindowHandle(),
            sandbox,
            "function(){ return arguments[0]; }",
            true,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    Map<String, Object> sharedIdMap =
        (Map<String, Object>) ((EvaluateResultSuccess) result).getResult().getValue().get();

    String sharedId = (String) ((RemoteValue) sharedIdMap.get("sharedId")).getValue().get();
    assertThat(sharedId).isEqualTo(nodeId);
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
