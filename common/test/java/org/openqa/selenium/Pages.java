/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium;

import org.openqa.selenium.environment.webserver.AppServer;

public class Pages {
  public String simpleTestPage;
  public String xhtmlTestPage;
  public String formPage;
  public String metaRedirectPage;
  public String redirectPage;
  public String javascriptEnhancedForm;
  public String javascriptPage;
  public String framesetPage;
  public String iframePage;
  public String dragAndDropPage;
  public String chinesePage;
  public String nestedPage;
  public String richTextPage;
  public String rectanglesPage;
  public String childPage;
  public String grandchildPage;
  public String uploadPage;
  public String svgPage;
  public String documentWrite;
  public String sleepingPage;
  public String errorsPage;
  public String dynamicPage;
  public String slowIframes;

  public Pages(AppServer appServer) {
    simpleTestPage = appServer.whereIs("simpleTest.html");
    xhtmlTestPage = appServer.whereIs("xhtmlTest.html");
    formPage = appServer.whereIs("formPage.html");
    metaRedirectPage = appServer.whereIs("meta-redirect.html");
    redirectPage = appServer.whereIs("redirect");
    javascriptEnhancedForm = appServer.whereIs("javascriptEnhancedForm.html");
    javascriptPage = appServer.whereIs("javascriptPage.html");
    framesetPage = appServer.whereIs("frameset.html");
    iframePage = appServer.whereIs("iframes.html");
    dragAndDropPage = appServer.whereIs("dragAndDropTest.html");
    chinesePage = appServer.whereIs("cn-test.html");
    nestedPage = appServer.whereIs("nestedElements.html");
    richTextPage = appServer.whereIs("rich_text.html");
    rectanglesPage = appServer.whereIs("rectangles.html");
    childPage = appServer.whereIs("child/childPage.html");
    grandchildPage = appServer.whereIs("child/grandchild/grandchildPage.html");
    uploadPage = appServer.whereIs("upload.html");
    svgPage = appServer.whereIs("svgPiechart.xhtml");
    documentWrite = appServer.whereIs("document_write_in_onload.html");
    sleepingPage = appServer.whereIs("sleep");
    errorsPage = appServer.whereIs("errors.html");
    dynamicPage = appServer.whereIs("dynamic.html");
    slowIframes = appServer.whereIs("slow_loading_iframes.html");
  }
}
