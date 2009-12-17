package org.openqa.selenium.iphone;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.internal.SubProcess;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * A {@link CommandExecutor} that communicates with an iPhone Simulator
 * running on localhost in a subprocess. Before executing each command, the
 * {@link IPhoneSimulatorCommandExecutor} will verify that the simulator is
 * still running and throw an {@link IPhoneSimulatorDiedException} if it is
 * not.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class IPhoneSimulatorCommandExecutor implements CommandExecutor {

  private final CommandExecutor delegate;
  private final IPhoneSimulatorBinary binary;
  private final URL appUrl;

  public IPhoneSimulatorCommandExecutor(URL url, IPhoneSimulatorBinary binary) throws Exception {
    this.delegate = new HttpCommandExecutor(url);
    this.binary = binary;
    this.appUrl = url;
  }

  public void startClient() {
    binary.launch();
    waitForServerToRespond(2500);
  }

  private void waitForServerToRespond(long timeoutInMilliseconds) {
    long start = System.currentTimeMillis();
    boolean responding = false;
    while (!responding && (System.currentTimeMillis() - start < timeoutInMilliseconds)) {
      HttpURLConnection connection = null;
      try {
        connection = (HttpURLConnection) appUrl.openConnection();
        connection.setConnectTimeout(500);
        connection.setRequestMethod("TRACE");
        connection.connect();
        responding = true;
      } catch (IOException e) {
        responding = false;
      } finally {
        if (connection != null) {
          connection.disconnect();
        }
      }
    }
  }

  public void stopClient() {
    binary.shutdown();
  }

  public Response execute(Command command) throws Exception {
    if (binary.getState().equals(SubProcess.State.FINISHED)) {
      throw new IPhoneSimulatorDiedException();
    } else if (binary.getState().equals(SubProcess.State.NOT_RUNNING)) {
      throw new IPhoneSimulatorNotStartedException();
    }
    return delegate.execute(command);
  }

  public static class IPhoneSimulatorDiedException extends WebDriverException {
  }

  public static class IPhoneSimulatorNotStartedException extends WebDriverException {
  }
}
