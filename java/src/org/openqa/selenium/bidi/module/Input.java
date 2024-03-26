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

package org.openqa.selenium.bidi.module;

import java.lang.reflect.InvocationTargetException;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.script.RemoteReference;
import org.openqa.selenium.interactions.Sequence;

public class Input {
  private final BiDi bidi;

  public Input(WebDriver driver) {
    this.bidi = ((HasBiDi) driver).getBiDi();
  }

  // This will make porting from W3C WebDriver classic to BiDi seamless for Actions
  public void perform(String browsingContext, Collection<Sequence> actions) {

    // This step is needed to map the origin if it's an element to the key expected by BiDi
    List<Map<String, Object>> encodedActions =
        actions.stream().map(Sequence::encode).collect(Collectors.toList());

    encodedActions.forEach(
        encodedAction -> {
          String type = (String) encodedAction.get("type");
          // Element as origin is only possible for input pointer or wheel
          if (type.equals("pointer") || type.equals("wheel")) {
            List<Map<String, Object>> actionList =
                (List<Map<String, Object>>) encodedAction.get("actions");

            actionList.stream()
                .filter(
                    action ->
                        // For pointer only pointMove action can have element as origin
                        action.get("type").equals("pointerMove")
                            || action.get("type").equals("scroll"))
                .filter(action -> action.get("origin") instanceof WebElement)
                .forEach(
                    action -> {
                      Object element = action.get("origin");
                      try {
                        // Using reflection because adding RemoteWebElement as a dependency creates
                        // a circular dependency in Bazel
                        String id = (String) element.getClass().getMethod("getId").invoke(element);
                        // sharedId is required by BiDi, the reason for this step
                        action.put(
                            "origin", Map.of("type", "element", "element", Map.of("sharedId", id)));
                      } catch (NoSuchMethodException
                          | InvocationTargetException
                          | IllegalAccessException e) {
                        throw new RuntimeException(e);
                      }
                    });
          }
        });
    bidi.send(
        new Command<>(
            "input.performActions",
            Map.of(
                "context", browsingContext,
                "actions", encodedActions)));
  }

  public void release(String browsingContext) {
    bidi.send(new Command<>("input.releaseActions", Map.of("context", browsingContext)));
  }

  public void setFiles(String browsingContext, RemoteReference element, List<String> files) {
    bidi.send(
        new Command<>(
            "input.setFiles",
            Map.of("context", browsingContext, "element", element.toJson(), "files", files)));
  }

  public void setFiles(String browsingContext, String elementId, List<String> files) {
    bidi.send(
        new Command<>(
            "input.setFiles",
            Map.of(
                "context",
                browsingContext,
                "element",
                new RemoteReference(RemoteReference.Type.SHARED_ID, elementId).toJson(),
                "files",
                files)));
  }

  public void setFiles(String browsingContext, RemoteReference element, String file) {
    setFiles(browsingContext, element, Collections.singletonList(file));
  }

  public void setFiles(String browsingContext, String elementId, String file) {
    setFiles(browsingContext, elementId, Collections.singletonList(file));
  }
}
