package org.openqa.selenium.server.htmlrunner;

import static org.easymock.classextension.EasyMock.anyObject;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.createNiceMock;
import static org.easymock.classextension.EasyMock.createStrictMock;
import static org.easymock.classextension.EasyMock.expect;
import static org.easymock.classextension.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncher;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class HtmlLauncherUnitTest {
	
	private SeleniumServer remoteControl;
	private RemoteControlConfiguration configuration;
	private File outputFile;
	private HTMLTestResults results;
	private HTMLLauncher launcher;

	@Before
	public void setUp() throws Exception {
		remoteControl = createNiceMock(SeleniumServer.class);
		configuration = createNiceMock(RemoteControlConfiguration.class);
		results = createNiceMock(HTMLTestResults.class);
		launcher = new HTMLLauncher(remoteControl) {
			final BrowserLauncher browserLauncher = createNiceMock(BrowserLauncher.class);
			
			@Override
			protected BrowserLauncher getBrowserLauncher(String browser, String sessionId, RemoteControlConfiguration configuration, BrowserConfigurationOptions browserOptions) {
				return browserLauncher;
			}
			
			@Override
			protected void sleepTight(long timeoutInMs) {
			}
			
			@Override
			protected void writeResults(File outputFile) throws IOException {
			}
			
		};
		expect(remoteControl.getConfiguration()).andReturn(configuration);
	}
	
	private void expectOutputFileBehavior() throws Exception {
		// Expecting behavior on strict mock
		outputFile = createStrictMock(File.class);
		expect(outputFile.createNewFile()).andReturn(true);
		expect(outputFile.canWrite()).andReturn(true);
		replay(outputFile);
	}
	
	@Test(expected=IOException.class)
	public void runHTMLSuite_throwsExceptionPriorToExecutionWhenOutputFileDoesntExist() throws Exception {
		// Expecting behavior on strict mock
		outputFile = createStrictMock(File.class);
		expect(outputFile.createNewFile()).andReturn(true);
		expect(outputFile.canWrite()).andReturn(false);
		expect(outputFile.getAbsolutePath()).andReturn("");
		replay(outputFile);
		
		executeAndVerify();
	}

	@Test
	public void runHTMLSuite_copiesRemoteControlConfigurationToBrowserOptions() throws Exception {
		expectOutputFileBehavior();
		
		// Expect copying options
		configuration.copySettingsIntoBrowserOptions((BrowserConfigurationOptions)anyObject());
		expectLastCall().once();
		
		executeAndVerify();
		
	}
	
	@Test
	public void runHTMLSuite_writesTestResultsWithFileWriter() throws Exception {
		expectOutputFileBehavior();
		
		launcher = new HTMLLauncher(remoteControl) {
			final BrowserLauncher browserLauncher = createNiceMock(BrowserLauncher.class);
			final FileWriter writer = createMock(FileWriter.class);
			
			@Override
			protected BrowserLauncher getBrowserLauncher(String browser, String sessionId, RemoteControlConfiguration configuration, BrowserConfigurationOptions browserOptions) {
				return browserLauncher;
			}
			
			@Override
			protected void sleepTight(long timeoutInMs) {
			}
			
			@Override
			protected FileWriter getFileWriter(File outputFile)
					throws IOException {
				return writer;
			}
			
		};
		
		// Expect writing results
		results.write((FileWriter)anyObject());
		expectLastCall().once();
	
		executeAndVerify();
		
	}
	
	private void executeAndVerify() throws Exception {
		
		expect(results.getResult()).andReturn("");
		replay(results);
		
		launcher.setResults(results);
		replay(configuration);
		replay(remoteControl);
		
		launcher.runHTMLSuite("", "", "", outputFile, 5, true);

		verify(results);
		verify(configuration);
		verify(remoteControl);
		verify(outputFile);
	}

}
