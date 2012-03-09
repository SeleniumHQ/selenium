/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android.server;

import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.os.PowerManager;
import android.widget.Toast;

import org.openqa.selenium.android.Platform;
import org.openqa.selenium.android.app.R;
import org.openqa.selenium.android.library.Logger;
import org.seleniumhq.jetty7.http.HttpGenerator;
import org.seleniumhq.jetty7.server.Server;
import org.seleniumhq.jetty7.server.handler.DefaultHandler;
import org.seleniumhq.jetty7.server.handler.HandlerList;
import org.seleniumhq.jetty7.server.nio.SelectChannelConnector;
import org.seleniumhq.jetty7.servlet.ServletHolder;

import java.util.logging.Level;

public class HttpdService extends Service {
  private static final String LOG_TAG = HttpdService.class.getName();
  private NotificationManager notificationManager;
  private Server server;
  private int port = 8080;

  private PowerManager.WakeLock wakeLock;

  private IBinder binder;
  
  @Override
  public void onCreate() {
    binder = new WebDriverBinder(this);
    startServer();
    super.onCreate();
  }

  @Override
  public IBinder onBind(Intent intent) {
    return binder;
  }
  
  /**
   * Android Service Start
   * 
   * @see android.app.Service#onStart(android.content.Intent, int)
   */
  @Override
  public void onStart(Intent intent, int startId) {
    super.onStart(intent, startId);
  }
  
  /**
   * Android Service destroy
   * 
   * @see android.app.Service#onDestroy()
   */
  @Override
  public void onDestroy() {
    try {
      if (wakeLock != null) {
        wakeLock.release();
        wakeLock = null;
      }

      if (server != null) {
        stopJetty();
        // Cancel the persistent notification.
        notificationManager.cancel(R.string.jetty_started);
        // Tell the user we stopped.
        Toast.makeText(this, getText(R.string.jetty_stopped), Toast.LENGTH_SHORT).show();
        Logger.log(Level.INFO, LOG_TAG, "onDestroy", "Jetty stopped");
      } else {
        Toast.makeText(HttpdService.this, R.string.jetty_not_running, Toast.LENGTH_SHORT).show();
      }
    } catch (Exception e) {
      Logger.log(Level.INFO, LOG_TAG, "onDestroy", "Error stopping jetty" + e.getMessage());
      Toast.makeText(this, getText(R.string.jetty_not_stopped), Toast.LENGTH_SHORT).show();
    }
  }

  @Override
  public void onLowMemory() {
    Logger.log(Level.INFO, LOG_TAG, "onLowMemory", "Low on memory");
    super.onLowMemory();
  }

  /**
   * Get a reference to the Jetty Server instance
   */
  public Server getServer() {
    return server;
  }

  protected void configureConnectors() {
    if (server != null) {
      // Workaround a Froyo bug
      // http://code.google.com/p/android/issues/detail?id=9431
      if (Platform.FROYO == Platform.sdk()) {
        System.setProperty("java.net.preferIPv6Addresses", "false");
      }
      SelectChannelConnector nioConnector = new SelectChannelConnector();
      nioConnector.setUseDirectBuffers(false);
      nioConnector.setPort(port);
      nioConnector.setAcceptors(1);
      nioConnector.setHost(null);
      server.addConnector(nioConnector);
    }
  }

  protected void configureHandlers() {
    if (server != null) {
      org.seleniumhq.jetty7.servlet.ServletContextHandler root =
          new org.seleniumhq.jetty7.servlet.ServletContextHandler(server, "/wd/hub",
              org.seleniumhq.jetty7.servlet.ServletContextHandler.SESSIONS);
      root.addServlet(new ServletHolder(new AndroidDriverServlet()), "/*");
      
      org.seleniumhq.jetty7.servlet.ServletContextHandler healthz =
        new org.seleniumhq.jetty7.servlet.ServletContextHandler(server, "/wd/hub/status",
            org.seleniumhq.jetty7.servlet.ServletContextHandler.SESSIONS);
      healthz.addServlet(new ServletHolder(new HealthzServlet()), "/*");
      
      HandlerList handlers = new HandlerList();
      handlers.setHandlers(
          new org.seleniumhq.jetty7.server.Handler[] {healthz, root, new DefaultHandler()});
      server.setHandler(handlers);

    }
  }

  public void startServer() {
    if (server != null && server.isRunning()) {
      Toast.makeText(HttpdService.this, R.string.jetty_already_started, Toast.LENGTH_SHORT).show();
      return;
    }

    try {
      // Get a wake lock to stop the cpu going to sleep
      PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
      wakeLock = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK, "IJetty");
      wakeLock.acquire();

      //AndroidApkDriver.setContext(this);

      System.setProperty("org.mortbay.log.class", "org.mortbay.log.AndroidLog");
      server = new Server();

      configureConnectors();
      configureHandlers();

      server.start();

      HttpGenerator.setServerVersion("WebDriver jetty");

      notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
      Toast.makeText(HttpdService.this, R.string.jetty_started, Toast.LENGTH_SHORT).show();

      Logger.log(Level.INFO, LOG_TAG, "startServer", "Jetty started");
    } catch (Exception e) {
      Logger.log(Level.WARNING, LOG_TAG, "startServer", "Error starting jetty" + e);
      Toast.makeText(this, getText(R.string.jetty_not_started), Toast.LENGTH_SHORT).show();
      throw new RuntimeException("Jetty failed to start!");
    }
  }

  protected void stopJetty() throws Exception {
    Logger.log(Level.FINE, LOG_TAG, "stopJetty", "Jetty stopping");
    server.stop();
    server.join();
    server = null;
  }
}
