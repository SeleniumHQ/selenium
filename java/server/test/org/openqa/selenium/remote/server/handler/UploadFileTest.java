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

package org.openqa.selenium.remote.server.handler;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.DefaultSession;
import org.openqa.selenium.remote.server.DriverFactory;
import org.openqa.selenium.remote.server.Session;

import java.io.File;
import java.io.IOException;
import java.util.Map;

public class UploadFileTest {

  private DriverFactory driverFactory;
  private TemporaryFilesystem tempFs;
  private File tempDir;

  @Before
  public void setUp() {
    driverFactory = mock(DriverFactory.class);
    when(driverFactory.newInstance(any(Capabilities.class))).thenReturn(mock(WebDriver.class));
    tempDir = Files.createTempDir();
    tempFs = TemporaryFilesystem.getTmpFsBasedOn(tempDir);
  }

  @After
  public void cleanUp() {
    tempFs.deleteTemporaryFiles();
    tempDir.delete();
  }

  @Test
  public void shouldWriteABase64EncodedZippedFileToDiskAndKeepName() throws Exception {
    Session session = DefaultSession.createSession(
        driverFactory,
        tempFs,
        new DesiredCapabilities(BrowserType.FIREFOX, "10", Platform.ANY));

    File tempFile = touch(null, "foo");
    String encoded = Zip.zip(tempFile);

    UploadFile uploadFile = new UploadFile(session);
    Map<String, Object> args = ImmutableMap.of("file", encoded);
    uploadFile.setJsonParameters(args);
    String path = uploadFile.call();

    assertTrue(new File(path).exists());
    assertTrue(path.endsWith(tempFile.getName()));
  }

  @Test
  public void shouldThrowAnExceptionIfMoreThanOneFileIsSent() throws Exception {
    Session session = DefaultSession.createSession(
        driverFactory,
        tempFs,
        new DesiredCapabilities(BrowserType.FIREFOX, "10", Platform.ANY));
    File baseDir = Files.createTempDir();

    touch(baseDir, "example");
    touch(baseDir, "unwanted");
    String encoded = Zip.zip(baseDir);

    UploadFile uploadFile = new UploadFile(session);
    Map<String, Object> args = ImmutableMap.of("file", encoded);
    uploadFile.setJsonParameters(args);

    try {
      uploadFile.call();
      fail("Should not get this far");
    } catch (WebDriverException ignored) {
    }
  }

  private File touch(File baseDir, String stem) throws IOException {
    File tempFile = File.createTempFile(stem, ".txt", baseDir);
    tempFile.deleteOnExit();
    Files.asCharSink(tempFile, UTF_8).write("I like cheese");
    return tempFile;
  }
}
