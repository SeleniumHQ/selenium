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

package org.openqa.selenium.remote.server;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.events.AbstractWebDriverEventListener;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;

import javax.imageio.ImageIO;

class SnapshotScreenListener extends AbstractWebDriverEventListener {

  private final Session session;

  public SnapshotScreenListener(Session session) {
    this.session = session;
  }

  @Override
  public void onException(Throwable throwable, WebDriver driver) {
    if (Platform.getCurrent().is(Platform.ANDROID)) {
      // Android Java APIs do not support java.awt
      return;
    }
    String encoded;
    try {
      workAroundD3dBugInVista();

      Rectangle size = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
      BufferedImage image = new Robot().createScreenCapture(size);

      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      ImageIO.write(image, "png", outputStream);

      encoded = Base64.getEncoder().encodeToString(outputStream.toByteArray());

      session.attachScreenshot(encoded);
    } catch (Throwable e) {
      // Alright. No screen shot. Propogate the original exception
    }
  }

  private void workAroundD3dBugInVista() {
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      System.setProperty("sun.java2d.d3d", "false");
    }
  }
}
