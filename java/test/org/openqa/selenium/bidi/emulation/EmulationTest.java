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

package org.openqa.selenium.bidi.emulation;

import static java.lang.Math.abs;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.bidi.module.Permission;
import org.openqa.selenium.bidi.permissions.PermissionState;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NeedsSecureServer;

@NeedsSecureServer
class EmulationTest extends JupiterTestBase {
  Object getBrowserGeolocation(WebDriver driver, String userContext, String origin) {
    JavascriptExecutor executor = (JavascriptExecutor) driver;
    Permission permission = new Permission(driver);

    permission.setPermission(
        Map.of("name", "geolocation"), PermissionState.GRANTED, origin, userContext);

    return executor.executeAsyncScript(
        "const callback = arguments[arguments.length - 1];\n"
            + "        navigator.geolocation.getCurrentPosition(\n"
            + "            position => {\n"
            + "                const coords = position.coords;\n"
            + "                callback({\n"
            + "                    latitude: coords.latitude,\n"
            + "                    longitude: coords.longitude,\n"
            + "                    accuracy: coords.accuracy,\n"
            + "                    altitude: coords.altitude,\n"
            + "                    altitudeAccuracy: coords.altitudeAccuracy,\n"
            + "                    heading: coords.heading,\n"
            + "                    speed: coords.speed,\n"
            + "                    timestamp: position.timestamp\n"
            + "                });\n"
            + "            },\n"
            + "            error => {\n"
            + "                callback({ error: error.message });\n"
            + "            },\n"
            + "            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }\n"
            + "        );");
  }

  @Test
  @NeedsFreshDriver
  void canSetGeolocationOverrideWithCoordinatesInContext() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    String url = appServer.whereIsSecure("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);
    driver.switchTo().window(context.getId());

    String origin =
        (String) ((JavascriptExecutor) driver).executeScript("return window.location.origin;");

    Emulation emul = new Emulation(driver);
    GeolocationCoordinates coords = new GeolocationCoordinates(37.7749, -122.4194);
    emul.setGeolocationOverride(
        new SetGeolocationOverrideParameters(coords).contexts(List.of(contextId)));

    Object result = getBrowserGeolocation(driver, null, origin);
    Map<String, Object> r = ((Map<String, Object>) result);

    assert !r.containsKey("error") : "Geolocation failed with error: " + r.get("error");

    double latitude = ((Number) r.get("latitude")).doubleValue();
    double longitude = ((Number) r.get("longitude")).doubleValue();
    double accuracy = ((Number) r.get("accuracy")).doubleValue();

    assert abs(latitude - coords.getLatitude()) < 0.0001
        : "Latitude mismatch: expected " + coords.getLatitude() + ", got " + latitude;
    assert abs(longitude - coords.getLongitude()) < 0.0001
        : "Longitude mismatch: expected " + coords.getLongitude() + ", got " + longitude;
    assert abs(accuracy - coords.getAccuracy()) < 0.0001
        : "Accuracy mismatch: expected " + coords.getAccuracy() + ", got " + accuracy;
  }

  @Test
  void canSetGeolocationOverrideWithMultipleUserContexts() {
    Browser browser = new Browser(driver);
    String userContext1 = browser.createUserContext();
    String userContext2 = browser.createUserContext();

    BrowsingContext context1 =
        new BrowsingContext(
            driver, new CreateContextParameters(WindowType.TAB).userContext(userContext1));
    BrowsingContext context2 =
        new BrowsingContext(
            driver, new CreateContextParameters(WindowType.TAB).userContext(userContext2));

    GeolocationCoordinates coords = new GeolocationCoordinates(45.5, -122.4194);

    Emulation emulation = new Emulation(driver);
    emulation.setGeolocationOverride(
        new SetGeolocationOverrideParameters(coords)
            .userContexts(List.of(userContext1, userContext2)));

    driver.switchTo().window(context1.getId());
    String url1 = appServer.whereIsSecure("blank.html");
    context1.navigate(url1, ReadinessState.COMPLETE);

    String origin1 =
        (String) ((JavascriptExecutor) driver).executeScript("return window.location.origin;");

    Map<String, Object> r =
        (Map<String, Object>) getBrowserGeolocation(driver, userContext1, origin1);

    assert !r.containsKey("error") : "Context1 geolocation failed with error: " + r.get("error");

    double latitude1 = ((Number) r.get("latitude")).doubleValue();
    double longitude1 = ((Number) r.get("longitude")).doubleValue();
    double accuracy1 = ((Number) r.get("accuracy")).doubleValue();

    assert abs(latitude1 - coords.getLatitude()) < 0.0001 : "Context1 latitude mismatch";
    assert abs(longitude1 - coords.getLongitude()) < 0.0001 : "Context1 longitude mismatch";
    assert abs(accuracy1 - coords.getAccuracy()) < 0.0001 : "Context1 accuracy mismatch";

    driver.switchTo().window(context2.getId());
    String url2 = appServer.whereIsSecure("blank.html");
    context2.navigate(url2, ReadinessState.COMPLETE);

    String origin2 =
        (String) ((JavascriptExecutor) driver).executeScript("return window.location.origin;");

    Map<String, Object> r2 =
        (Map<String, Object>) getBrowserGeolocation(driver, userContext2, origin2);

    assert !r2.containsKey("error") : "Context2 geolocation failed with error: " + r2.get("error");

    double latitude2 = ((Number) r2.get("latitude")).doubleValue();
    double longitude2 = ((Number) r2.get("longitude")).doubleValue();
    double accuracy2 = ((Number) r2.get("accuracy")).doubleValue();

    assert abs(latitude2 - coords.getLatitude()) < 0.0001 : "Context2 latitude mismatch";
    assert abs(longitude2 - coords.getLongitude()) < 0.0001 : "Context2 longitude mismatch";
    assert abs(accuracy2 - coords.getAccuracy()) < 0.0001 : "Context2 accuracy mismatch";

    context1.close();
    context2.close();
    browser.removeUserContext(userContext1);
    browser.removeUserContext(userContext2);
  }

  @Test
  @Ignore(FIREFOX)
  void canSetGeolocationOverrideWithError() {

    BrowsingContext context = new BrowsingContext(driver, WindowType.TAB);
    String contextId = context.getId();

    String url = appServer.whereIsSecure("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);
    driver.switchTo().window(contextId);

    String origin =
        (String) ((JavascriptExecutor) driver).executeScript("return window.location.origin;");

    GeolocationPositionError error = new GeolocationPositionError();
    Emulation emul = new Emulation(driver);
    emul.setGeolocationOverride(
        new SetGeolocationOverrideParameters(error).contexts(List.of(contextId)));

    Object result = getBrowserGeolocation(driver, null, origin);
    Map<String, Object> r = ((Map<String, Object>) result);

    assert r.containsKey("error") : "Expected geolocation to fail with error, but got: " + r;

    context.close();
  }
}
