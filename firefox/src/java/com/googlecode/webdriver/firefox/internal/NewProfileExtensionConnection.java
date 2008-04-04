package com.googlecode.webdriver.firefox.internal;

import com.googlecode.webdriver.firefox.Command;
import com.googlecode.webdriver.firefox.FirefoxLauncher;
import com.googlecode.webdriver.firefox.FirefoxProfile;
import com.googlecode.webdriver.internal.OperatingSystem;

import java.io.IOException;
import java.net.BindException;
import java.net.InetSocketAddress;
import java.net.Socket;

public class NewProfileExtensionConnection extends AbstractExtensionConnection {
  private static long TIMEOUT_IN_SECONDS = 20;
  private static long MILLIS_IN_SECONDS = 1000;
  private FirefoxBinary process;
  private Socket lockSocket;

    public NewProfileExtensionConnection(FirefoxProfile profile, String host, int port) throws IOException {
        getLock(port);
        try {
          int portToUse = determineNextFreePort(host, port);

          process = new FirefoxLauncher().startProfile(profile, portToUse);

          setAddress(host, portToUse);

          connectToBrowser(TIMEOUT_IN_SECONDS * MILLIS_IN_SECONDS);
        } finally {
          releaseLock();
        }
    }

  protected void getLock(int port) throws IOException {
    int lockPort = port - 1;
    lockSocket = new Socket();
    InetSocketAddress address = new InetSocketAddress("localhost", lockPort);

    long maxWait = System.currentTimeMillis() + 45000;  // 45 seconds

    while (System.currentTimeMillis() < maxWait && isLockTaken(address)) {
      try {
        Thread.sleep(500);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
    }
  }

  private boolean isLockTaken(InetSocketAddress address) throws IOException {
    try {
      lockSocket.bind(address);
      return false;
    } catch (BindException e) {
      return true;
    }
  }

  private void releaseLock() throws IOException {
    if (lockSocket != null && lockSocket.isBound())
      lockSocket.close();
  }  

  protected int determineNextFreePort(String host, int port) throws IOException {
    // Attempt to connect to the given port on the host
    // If we can't connect, then we're good to use it
    int newport;

    for (newport = port; newport < port + 200; newport++) {
      Socket socket = new Socket();
      InetSocketAddress address = new InetSocketAddress(host, newport);

      try {
        socket.bind(address);
        return newport;
      } catch (BindException e) {
        // Port is already bound. Skip it and continue
      } finally {
        socket.close();
      }
    }

    throw new RuntimeException(String.format("Cannot find free port in the range %d to %d ", port, newport));
  }

  public void quit() {
        try {
            sendMessageAndWaitForResponse(RuntimeException.class, new Command(null, "quit"));
        } catch (NullPointerException e) {
            // this is expected
        }

        if (OperatingSystem.WINDOWS.equals(OperatingSystem.getCurrentPlatform())) {
        	quitOnWindows();
        } else {
            quitOnOtherPlatforms();
        }
    }

	private void quitOnOtherPlatforms() {
		// Wait for process to die and return
		try {
		    process.waitFor();
		} catch (InterruptedException e) {
		    throw new RuntimeException(e);
		} catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

	private void quitOnWindows() {
		try {
			Thread.sleep(200);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
	}
}