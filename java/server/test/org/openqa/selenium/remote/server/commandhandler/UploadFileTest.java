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

package org.openqa.selenium.remote.server.commandhandler;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.ErrorHandler;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.File;
import java.io.IOException;
import java.util.Map;

public class UploadFileTest {

  private TemporaryFilesystem tempFs;
  private File tempDir;

  @Before
  public void setUp() {
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
    ActiveSession session = mock(ActiveSession.class);
    when(session.getId()).thenReturn(new SessionId("1234567"));
    when(session.getFileSystem()).thenReturn(tempFs);
    when(session.getDownstreamDialect()).thenReturn(Dialect.OSS);

    File tempFile = touch(null, "foo");
    String encoded = Zip.zip(tempFile);

    Json json = new Json();
    UploadFile uploadFile = new UploadFile(new Json(), session);
    Map<String, Object> args = ImmutableMap.of("file", encoded);
    HttpRequest request = new HttpRequest(HttpMethod.POST, "/session/%d/se/file");
    request.setContent(utf8String(json.toJson(args)));
    HttpResponse response = uploadFile.execute(request);

    Response res = new Json().toType(string(response), Response.class);
    String path = (String) res.getValue();
    assertTrue(new File(path).exists());
    assertTrue(path.endsWith(tempFile.getName()));
  }

  @Test
  public void shouldThrowAnExceptionIfMoreThanOneFileIsSent() throws Exception {
    ActiveSession session = mock(ActiveSession.class);
    when(session.getId()).thenReturn(new SessionId("1234567"));
    when(session.getFileSystem()).thenReturn(tempFs);
    when(session.getDownstreamDialect()).thenReturn(Dialect.OSS);

    File baseDir = Files.createTempDir();
    touch(baseDir, "example");
    touch(baseDir, "unwanted");
    String encoded = Zip.zip(baseDir);

    Json json = new Json();
    UploadFile uploadFile = new UploadFile(new Json(), session);
    Map<String, Object> args = ImmutableMap.of("file", encoded);
    HttpRequest request = new HttpRequest(HttpMethod.POST, "/session/%d/se/file");
    request.setContent(utf8String(json.toJson(args)));
    HttpResponse response = uploadFile.execute(request);

    try {
      new ErrorHandler(false).throwIfResponseFailed(
          new Json().toType(string(response), Response.class),
          100);
      fail("Should not get this far");
    } catch (WebDriverException ignored) {
      // Expected
    }
  }

  private File touch(File baseDir, String stem) throws IOException {
    File tempFile = File.createTempFile(stem, ".txt", baseDir);
    tempFile.deleteOnExit();
    Files.asCharSink(tempFile, UTF_8).write("I like cheese");
    return tempFile;
  }
}
