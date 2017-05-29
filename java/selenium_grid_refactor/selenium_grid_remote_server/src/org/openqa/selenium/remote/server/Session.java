/*
Copyright 2007-2011 Selenium committers

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

package org.openqa.selenium.remote.server;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.SessionId;

import java.util.concurrent.FutureTask;

public interface Session {

  void close();

  <X> X execute(FutureTask<X> future) throws Exception;

  WebDriver getDriver();

  KnownElements getKnownElements();

  Capabilities getCapabilities();

  void attachScreenshot(String base64EncodedImage);

  String getAndClearScreenshot();

  boolean isTimedOut(long timeout);

    /**
     * Indicates that the session is in use at this moment (being forwarded to browser)
     * @return  true if the session is active inside the browser
     */
  boolean isInUse();

  void interrupt();

  void updateLastAccessTime();

  SessionId getSessionId();

  TemporaryFilesystem getTemporaryFileSystem();
}
