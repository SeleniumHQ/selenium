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

package com.thoughtworks.selenium.corebased;

import com.google.common.io.Files;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import com.thoughtworks.selenium.SeleniumException;

import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class TestAttachFile extends InternalSelenseTestBase {

  private static final String LOREM_IPSUM_TEXT = "lorem ipsum dolor sit amet";
  private static final String FILE_HTML = "<div>" + LOREM_IPSUM_TEXT + "</div>";

  private File testFile;

  @Override
  @Before
  public void setUp() throws Exception {
    testFile = createTmpFile(FILE_HTML);
  }

  private File createTmpFile(String content) throws IOException {
    File f = File.createTempFile("webdriver", "tmp");
    f.deleteOnExit();
    Files.asCharSink(f, StandardCharsets.UTF_8).write(content);
    return f;
  }

  @Test
  public void testAttachFile() throws Exception {
    selenium.open("/common/upload.html");
    selenium.attachFile("upload", testFile.toURI().toURL().toString());
    selenium.click("go");
    selenium.waitForPageToLoad("30000");
    selenium.selectFrame("upload_target");
    assertEquals(selenium.getText("//body"), LOREM_IPSUM_TEXT);
  }

  @Test
  public void testAttachNonExistingFile() throws Exception {
    selenium.open("/common/upload.html");
    try {
      selenium.attachFile("upload", testFile.toURI().toURL().toString() + "-missing");
    } catch (SeleniumException expected) {
      assertTrue(expected.getCause() instanceof IOException);
      return;
    }
    fail("Exception expected");
  }
}
