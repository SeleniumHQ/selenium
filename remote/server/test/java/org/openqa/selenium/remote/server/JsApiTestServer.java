package org.openqa.selenium.remote.server;

import org.openqa.selenium.environment.webserver.Jetty6AppServer;

import java.io.File;

/**
 * Deploys a {@link Jetty6AppServer} configured to serve the JS API test files
 * on {@code http://localhost:3000/remote}.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class JsApiTestServer extends Jetty6AppServer {

  private static File rootDirectory = null;

  public JsApiTestServer() {
    File path = getRootDirectory();
    if (null == path) {
      throw new IllegalStateException("Unable to locate remote/server/src/web");
    }
    addAdditionalWebApplication("/remote", path.getAbsolutePath());
  }

  public static synchronized File getRootDirectory() {
    if (rootDirectory != null) {
      return rootDirectory;
    }
    String[] possiblePaths = {
        "remote/server/src/web",
        "../remote/server/src/web",
        "../../remote/server/src/web",
    };

    for (String potential : possiblePaths) {
      File current = new File(potential);
      if (current.exists()) {
        rootDirectory = current;
        return rootDirectory;
      }
    }
    return null;
  }

  public static void main(String[] args) {
    JsApiTestServer server = new JsApiTestServer();
    server.start();
  }
}
