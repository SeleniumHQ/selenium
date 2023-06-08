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

package org.openqa.selenium.testing;

import org.openqa.selenium.environment.webserver.AppServer;

public class Pages {
  public String ajaxyPage;
  public String alertsPage;
  public String blankPage;
  public String bodyTypingPage;
  public String booleanAttributes;
  public String childPage;
  public String chinesePage;
  public String clickEventPage;
  public String clickJacker;
  public String clicksPage;
  public String colorPage;
  public String documentWrite;
  public String dragDropOverflow;
  public String draggableLists;
  public String dragAndDropPage;
  public String droppableItems;
  public String dynamicallyModifiedPage;
  public String dynamicPage;
  public String echoPage;
  public String errorsPage;
  public String formPage;
  public String formSelectionPage;
  public String framesetPage;
  public String grandchildPage;
  public String html5Page;
  public String iframePage;
  public String javascriptEnhancedForm;
  public String javascriptPage;
  public String linkedImage;
  public String longContentPage;
  public String macbethPage;
  public String mapVisibilityPage;
  public String metaRedirectPage;
  public String missedJsReferencePage;
  public String mouseInteractionPage;
  public String mouseOverPage;
  public String mouseTrackerPage;
  public String nestedPage;
  public String pointerActionsPage;
  public String printPage;
  public String readOnlyPage;
  public String rectanglesPage;
  public String redirectPage;
  public String richTextPage;
  public String selectableItemsPage;
  public String selectPage;
  public String shadowRootPage;
  public String simpleTestPage;
  public String simpleXmlDocument;
  public String sleepingPage;
  public String slowIframes;
  public String slowLoadingAlertPage;
  public String svgPage;
  public String svgTestPage;
  public String tables;
  public String underscorePage;
  public String unicodeLtrPage;
  public String uploadPage;
  public String userDefinedProperty;
  public String veryLargeCanvas;
  public String xhtmlFormPage;
  public String xhtmlTestPage;

  public Pages(AppServer appServer) {
    ajaxyPage = appServer.whereIs("ajaxy_page.html");
    alertsPage = appServer.whereIs("alerts.html");
    blankPage = appServer.whereIs("blank.html");
    bodyTypingPage = appServer.whereIs("bodyTypingTest.html");
    booleanAttributes = appServer.whereIs("booleanAttributes.html");
    childPage = appServer.whereIs("child/childPage.html");
    chinesePage = appServer.whereIs("cn-test.html");
    clickJacker = appServer.whereIs("click_jacker.html");
    clickEventPage = appServer.whereIs("clickEventPage.html");
    clicksPage = appServer.whereIs("clicks.html");
    colorPage = appServer.whereIs("colorPage.html");
    dragDropOverflow = appServer.whereIs("dragDropOverflow.html");
    draggableLists = appServer.whereIs("draggableLists.html");
    dragAndDropPage = appServer.whereIs("dragAndDropTest.html");
    droppableItems = appServer.whereIs("droppableItems.html");
    documentWrite = appServer.whereIs("document_write_in_onload.html");
    dynamicallyModifiedPage = appServer.whereIs("dynamicallyModifiedPage.html");
    dynamicPage = appServer.whereIs("dynamic.html");
    echoPage = appServer.whereIs("echo");
    errorsPage = appServer.whereIs("errors.html");
    xhtmlFormPage = appServer.whereIs("xhtmlFormPage.xhtml");
    formPage = appServer.whereIs("formPage.html");
    formSelectionPage = appServer.whereIs("formSelectionPage.html");
    framesetPage = appServer.whereIs("frameset.html");
    grandchildPage = appServer.whereIs("child/grandchild/grandchildPage.html");
    html5Page = appServer.whereIs("html5Page.html");
    iframePage = appServer.whereIs("iframes.html");
    javascriptEnhancedForm = appServer.whereIs("javascriptEnhancedForm.html");
    javascriptPage = appServer.whereIs("javascriptPage.html");
    linkedImage = appServer.whereIs("linked_image.html");
    longContentPage = appServer.whereIs("longContentPage.html");
    macbethPage = appServer.whereIs("macbeth.html");
    mapVisibilityPage = appServer.whereIs("map_visibility.html");
    metaRedirectPage = appServer.whereIs("meta-redirect.html");
    missedJsReferencePage = appServer.whereIs("missedJsReference.html");
    mouseInteractionPage = appServer.whereIs("mouse_interaction.html");
    mouseOverPage = appServer.whereIs("mouseOver.html");
    mouseTrackerPage = appServer.whereIs("mousePositionTracker.html");
    nestedPage = appServer.whereIs("nestedElements.html");
    pointerActionsPage = appServer.whereIs("pointerActionsPage.html");
    printPage = appServer.whereIs("printPage.html");
    readOnlyPage = appServer.whereIs("readOnlyPage.html");
    rectanglesPage = appServer.whereIs("rectangles.html");
    redirectPage = appServer.whereIs("redirect");
    richTextPage = appServer.whereIs("rich_text.html");
    selectableItemsPage = appServer.whereIs("selectableItems.html");
    selectPage = appServer.whereIs("selectPage.html");
    simpleTestPage = appServer.whereIs("simpleTest.html");
    simpleXmlDocument = appServer.whereIs("simple.xml");
    shadowRootPage = appServer.whereIs("shadowRootPage.html");
    sleepingPage = appServer.whereIs("sleep");
    slowIframes = appServer.whereIs("slow_loading_iframes.html");
    slowLoadingAlertPage = appServer.whereIs("slowLoadingAlert.html");
    svgPage = appServer.whereIs("svgPiechart.xhtml");
    svgTestPage = appServer.whereIs("svgTest.svg");
    tables = appServer.whereIs("tables.html");
    underscorePage = appServer.whereIs("underscore.html");
    unicodeLtrPage = appServer.whereIs("utf8/unicode_ltr.html");
    uploadPage = appServer.whereIs("upload.html");
    userDefinedProperty = appServer.whereIs("userDefinedProperty.html");
    veryLargeCanvas = appServer.whereIs("veryLargeCanvas.html");
    xhtmlTestPage = appServer.whereIs("xhtmlTest.html");
  }
}
