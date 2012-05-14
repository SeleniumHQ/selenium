/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.remote.server.handler;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DefaultSession;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.StubDriverFactory;

import java.io.File;
import java.io.IOException;
import java.util.Map;

public class UploadFileTest {

  private StubDriverFactory driverFactory;
  private TemporaryFilesystem tempFs;
  private SessionId sessionId;
  private File tempDir;

  @Before
  public void setUp() {
    driverFactory = new StubDriverFactory();
    tempDir = Files.createTempDir();
    sessionId = new SessionId("foo");
    tempFs = TemporaryFilesystem.getTmpFsBasedOn(tempDir);
  }

  @After
  public void cleanUp() {
    tempFs.deleteTemporaryFiles();
    tempDir.delete();
  }

  @Test
  public void shouldWriteABase64EncodedZippedFileToDiskAndKeepName() throws Exception {
    Session session = DefaultSession.createSession(driverFactory, tempFs, sessionId, DesiredCapabilities.firefox());

    File tempFile = touch(null, "foo");
    String encoded = new Zip().zipFile(tempFile.getParentFile(), tempFile);

    UploadFile uploadFile = new UploadFile(session);
    Map<String, Object> args = ImmutableMap.of("file", (Object) encoded);
    uploadFile.setJsonParameters(args);
    uploadFile.call();
    String path = (String) uploadFile.getResponse().getValue();

    assertTrue(new File(path).exists());
    assertTrue(path.endsWith(tempFile.getName()));
  }

  @Test
  public void shouldThrowAnExceptionIfMoreThanOneFileIsSent() throws Exception {
    Session session = DefaultSession.createSession(driverFactory, tempFs, sessionId, DesiredCapabilities.firefox());
    File baseDir = Files.createTempDir();

    touch(baseDir, "example");
    touch(baseDir, "unwanted");
    String encoded = new Zip().zip(baseDir);

    UploadFile uploadFile = new UploadFile(session);
    Map<String, Object> args = ImmutableMap.of("file", (Object) encoded);
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
    Files.write("I like cheese", tempFile, Charsets.UTF_8);
    return tempFile;
  }
}
