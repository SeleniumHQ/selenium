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
import static org.mockito.Mockito.stub;

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;
import com.google.gson.Gson;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.ErrorHandler;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.ActiveSession;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@RunWith(JUnit4.class)
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
    stub(session.getId()).toReturn(new SessionId("1234567"));
    stub(session.getFileSystem()).toReturn(tempFs);
    stub(session.getDownstreamDialect()).toReturn(Dialect.OSS);

    File tempFile = touch(null, "foo");
    String encoded = Zip.zip(tempFile);

    Gson gson = new Gson();
    UploadFile uploadFile = new UploadFile(new JsonToBeanConverter(), session);
    Map<String, Object> args = ImmutableMap.of("file", (Object) encoded);
    HttpRequest request = new HttpRequest(HttpMethod.POST, "/session/%d/se/file");
    request.setContent(gson.toJson(args).getBytes(UTF_8));
    HttpResponse response = new HttpResponse();
    uploadFile.execute(request, response);

    String path = (String) new JsonToBeanConverter()
        .convert(Response.class, response.getContentString())
        .getValue();
    assertTrue(new File(path).exists());
    assertTrue(path.endsWith(tempFile.getName()));
  }

  @Test
  public void shouldThrowAnExceptionIfMoreThanOneFileIsSent() throws Exception {
    ActiveSession session = mock(ActiveSession.class);
    stub(session.getId()).toReturn(new SessionId("1234567"));
    stub(session.getFileSystem()).toReturn(tempFs);
    stub(session.getDownstreamDialect()).toReturn(Dialect.OSS);

    File baseDir = Files.createTempDir();
    touch(baseDir, "example");
    touch(baseDir, "unwanted");
    String encoded = Zip.zip(baseDir);

    Gson gson = new Gson();
    UploadFile uploadFile = new UploadFile(new JsonToBeanConverter(), session);
    Map<String, Object> args = ImmutableMap.of("file", (Object) encoded);
    HttpRequest request = new HttpRequest(HttpMethod.POST, "/session/%d/se/file");
    request.setContent(gson.toJson(args).getBytes(UTF_8));
    HttpResponse response = new HttpResponse();
    uploadFile.execute(request, response);

    try {
      new ErrorHandler(false).throwIfResponseFailed(
          new JsonToBeanConverter().convert(Response.class, response.getContentString()),
          100);
      fail("Should not get this far");
    } catch (WebDriverException ignored) {
      // Expected
    }
  }

  private File touch(File baseDir, String stem) throws IOException {
    File tempFile = File.createTempFile(stem, ".txt", baseDir);
    tempFile.deleteOnExit();
    Files.write("I like cheese", tempFile, Charsets.UTF_8);
    return tempFile;
  }
}
