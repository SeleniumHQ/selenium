package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;

public class FirefoxChromeLauncherUnitTest extends TestCase {
	
	public void testInvalidBrowserStringCausesChromeLauncherToThrowException() {
		
		try {			
			new FirefoxChromeLauncher(null,null,"invalid");
			fail("No exception thrown");
		} catch(InvalidBrowserExecutableException ibee) {
			assertEquals("The specified path to the browser executable is invalid.", ibee.getMessage());
		}
	}
	
	public void testNullBrowserInstallationDoesntCauseChromeLauncherToThrowException() {
		BrowserInstallation bi = null;
		FirefoxChromeLauncher fcl = new FirefoxChromeLauncher(null,null,bi);
		assertNotNull(fcl);
	}
	
    public void testShouldAbleToCreateChromeUrlWithNormalUrl() throws Exception {
        String httpUrl = "http://www.my.com/folder/endname.html?a=aaa&b=bbb";
        String chromeUrl = new FirefoxChromeLauncher.ChromeUrlConvert().convert(httpUrl);
        assertEquals("chrome://src/content/endname.html?a=aaa&b=bbb",
                chromeUrl);
    }
    
    public void testProfileRemovedWhenProcessNull() {
      FirefoxChromeLauncherStubbedForShutdown launcher = new FirefoxChromeLauncherStubbedForShutdown();
      launcher.setCustomProfileDir(new File("testdir"));
      launcher.close();
      assertFalse(launcher.wasKillFirefoxProcessCalled());
      assertTrue(launcher.wasRemoveCustomProfileCalled());
    }
    
    public void testProfileRemovedWhenProcessKillFails() {
      FirefoxChromeLauncherStubbedForShutdown launcher = new FirefoxChromeLauncherStubbedForShutdown();
      launcher.haveProcessKillThrowException(false);
      launcher.setCustomProfileDir(new File("testdir"));
      launcher.setProcess(new TestProcess());
      launcher.close();
      assertTrue(launcher.wasKillFirefoxProcessCalled());
      assertTrue(launcher.wasRemoveCustomProfileCalled());
    }
    
    public void testProfileRemovedWhenProcessNotNull() {
      FirefoxChromeLauncherStubbedForShutdown launcher = new FirefoxChromeLauncherStubbedForShutdown();
      launcher.setCustomProfileDir(new File("testdir"));
      launcher.setProcess(new TestProcess());
      launcher.close();
      assertTrue(launcher.wasKillFirefoxProcessCalled());
      assertTrue(launcher.wasRemoveCustomProfileCalled());
    }
    
    public void testNothingRemovedIfAlreadyNull() {
      FirefoxChromeLauncherStubbedForShutdown launcher = new FirefoxChromeLauncherStubbedForShutdown();
      launcher.close();
      assertFalse(launcher.wasKillFirefoxProcessCalled());
      assertFalse(launcher.wasRemoveCustomProfileCalled());
    }
    
    public void testSecondCloseIsNoOp() {
      FirefoxChromeLauncherStubbedForShutdown launcher = new FirefoxChromeLauncherStubbedForShutdown();
      launcher.setCustomProfileDir(new File("testdir"));
      launcher.close();
      assertTrue(launcher.wasRemoveCustomProfileCalled());
      launcher.reset();
      launcher.close();
      assertFalse(launcher.wasRemoveCustomProfileCalled());
    }
    
    public static class FirefoxChromeLauncherStubbedForShutdown extends FirefoxChromeLauncher {

      private boolean killFirefoxProcessCalled = false;
      private boolean removeCustomProfileDirCalled = false;
      private boolean throwProcessKillException = true;
      
      public FirefoxChromeLauncherStubbedForShutdown() {
        super(new RemoteControlConfiguration(), "testsession");
      }
      
      public void haveProcessKillThrowException(boolean doThrow) {
        this.throwProcessKillException = doThrow;
      }
      
      public void reset() {
        killFirefoxProcessCalled = false;
        removeCustomProfileDirCalled = false;
        throwProcessKillException = true;
      }
      
      public boolean wasKillFirefoxProcessCalled() {
        return killFirefoxProcessCalled;
      }
      
      public boolean wasRemoveCustomProfileCalled() {
        return removeCustomProfileDirCalled;
      }

      @Override
      protected void killFirefoxProcess() throws FileLockRemainedException {
        killFirefoxProcessCalled = true;
        if (!throwProcessKillException) {
          throw new FileLockRemainedException("test exception");
        }
      }

      @Override
      protected void removeCustomProfileDir() throws RuntimeException {
        removeCustomProfileDirCalled = true;
      }
    }
    
    public static class TestProcess extends Process {

      @Override
      public void destroy() {
        // TODO Auto-generated method stub
        
      }

      @Override
      public int exitValue() {
        // TODO Auto-generated method stub
        return 0;
      }

      @Override
      public InputStream getErrorStream() {
        // TODO Auto-generated method stub
        return null;
      }

      @Override
      public InputStream getInputStream() {
        // TODO Auto-generated method stub
        return null;
      }

      @Override
      public OutputStream getOutputStream() {
        // TODO Auto-generated method stub
        return null;
      }

      @Override
      public int waitFor() throws InterruptedException {
        // TODO Auto-generated method stub
        return 0;
      }
      
    }
}
