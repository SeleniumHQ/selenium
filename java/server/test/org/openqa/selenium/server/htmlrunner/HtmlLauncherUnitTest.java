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


package org.openqa.selenium.server.htmlrunner;

public class HtmlLauncherUnitTest {

//  private SeleniumServer remoteControl;
//  private RemoteControlConfiguration configuration;
//  private File outputFile;
//  private HTMLTestResults results;
//  private HTMLLauncher launcher;
//
//  @Before
//  public void setUp() throws Exception {
//    remoteControl = mock(SeleniumServer.class);
//    configuration = mock(RemoteControlConfiguration.class);
//    results = mock(HTMLTestResults.class);
//    launcher = new HTMLLauncher(remoteControl) {
//      final BrowserLauncher browserLauncher = mock(BrowserLauncher.class);
//
//      @Override
//      protected BrowserLauncher getBrowserLauncher(String browser, String sessionId,
//          RemoteControlConfiguration configuration, Capabilities browserOptions) {
//        return browserLauncher;
//      }
//
//      @Override
//      protected void sleepTight(long timeoutInMs) {
//      }
//
//      @Override
//      protected void writeResults(File outputFile) throws IOException {
//      }
//
//    };
//    when(remoteControl.getConfiguration()).thenReturn(configuration);
//  }
//
//  private void expectOutputFileBehavior() throws Exception {
//    // Expecting behavior on strict mock
//    outputFile = mock(File.class);
//    when(outputFile.createNewFile()).thenReturn(true);
//    when(outputFile.canWrite()).thenReturn(true);
//  }
//
//  @Test(expected = IOException.class)
//  public void runHTMLSuite_throwsExceptionPriorToExecutionWhenOutputFileDoesntExist()
//      throws Exception {
//    // Expecting behavior on strict mock
//    outputFile = mock(File.class);
//    when(outputFile.createNewFile()).thenReturn(true);
//    when(outputFile.canWrite()).thenReturn(false);
//    when(outputFile.getAbsolutePath()).thenReturn("");
//
//    executeAndVerify();
//  }
//
//  @Test
//  public void runHTMLSuite_copiesRemoteControlConfigurationToBrowserOptions() throws Exception {
//    expectOutputFileBehavior();
//    executeAndVerify();
//    verify(configuration).copySettingsIntoBrowserOptions(any(Capabilities.class));
//  }
//
//  @Test
//  public void runHTMLSuite_writesTestResultsWithFileWriter() throws Exception {
//    expectOutputFileBehavior();
//
//    launcher = new HTMLLauncher(remoteControl) {
//      final BrowserLauncher browserLauncher = mock(BrowserLauncher.class);
//      final FileWriter writer = mock(FileWriter.class);
//
//      @Override
//      protected BrowserLauncher getBrowserLauncher(String browser, String sessionId,
//          RemoteControlConfiguration configuration, Capabilities browserOptions) {
//        return browserLauncher;
//      }
//
//      @Override
//      protected void sleepTight(long timeoutInMs) {
//      }
//
//      @Override
//      protected FileWriter getFileWriter(File outputFile)
//          throws IOException {
//        return writer;
//      }
//
//    };
//
//    executeAndVerify();
//    verify(results).write(any(FileWriter.class));
//  }
//
//  private void executeAndVerify() throws Exception {
//    when(results.getResult()).thenReturn("");
//
//    launcher.setResults(results);
//    launcher.runHTMLSuite("", "", "", outputFile, 5, true);
//  }

}
