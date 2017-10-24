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

package com.thoughtworks.selenium.webdriven.commands;

import com.google.common.io.Resources;

import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.selenium.webdriven.ElementFinder;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.io.TemporaryFilesystem;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

public class AttachFile extends SeleneseCommand<Void> {
  private final static Logger LOGGER = Logger.getLogger(AttachFile.class.getName());
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
    File outputTo = new File(dir, new File(url.getFile()).getName());

    FileOutputStream fos = null;
    try {
      fos = new FileOutputStream(outputTo);
      Resources.copy(url, fos);
    } catch (IOException e) {
      throw new SeleniumException("Can't access file to upload: " + url, e);
    } finally {
      try {
        if (fos != null) {
          fos.close();
        }
      } catch (IOException e) {
        // Nothing sane to do. Log and continue.
        LOGGER.log(Level.WARNING, "Unable to close stream used for reading file: " + name, e);
      }
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
