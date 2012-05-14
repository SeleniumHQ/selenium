/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.internal.seleniumemulation;

import com.google.common.io.Resources;

import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.io.TemporaryFilesystem;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

public class AttachFile extends SeleneseCommand<Void> {
  private final ElementFinder finder;

  public AttachFile(ElementFinder finder) {
    this.finder = finder;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    File file = downloadFile(value);

    WebElement element = finder.findElement(driver, locator);
    element.clear();
    element.sendKeys(file.getAbsolutePath());

    return null;
  }

  private File downloadFile(String name) {
    URL url = getUrl(name);

    File dir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("attachFile", "dir");
    File outputTo = new File(dir, url.getFile());
    if (!outputTo.getParentFile().mkdirs()) {
      throw new SeleniumException("Cannot create file for upload: " + outputTo);
    }

    FileOutputStream fos = null;
    try {
      fos = new FileOutputStream(outputTo);
      Resources.copy(url, fos);
    } catch (IOException e) {

    }

    return outputTo;
  }

  private URL getUrl(String name) {
    try {
      return new URL(name);
    } catch (MalformedURLException e) {
      throw new SeleniumException("Malformed URL: " + name);
    }
  }
}
