/*
Copyright 2011 Software Freedom Conservatory.

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

package org.openqa.selenium.android.app;

import static org.openqa.selenium.logging.LogType.DRIVER;
import static org.openqa.selenium.remote.CapabilityType.LOGGING_PREFS;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;

import org.openqa.selenium.android.library.AndroidWebDriver;
import org.openqa.selenium.android.library.Logger;
import org.openqa.selenium.android.server.HttpdService;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.logging.LoggingHandler;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * Main application activity.
 */
public class MainActivity extends Activity {

  private boolean bound;
  private HttpdService httpdService;
  private Intent httpdIntent;
  public static final String DEBUG_MODE_ARG = "debug";
  private static Activity thisActivity;
  private static DesiredCapabilities caps;

  private static AndroidWebDriver driver;

  private ServiceConnection mConnection = new ServiceConnection() {
    public void onServiceConnected(ComponentName className, IBinder service) {
      bound = true;
      httpdService = ((org.openqa.selenium.android.server.WebDriverBinder) service).getService();
    }

    public void onServiceDisconnected(ComponentName arg0) {
      bound = false;
    }
  };

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (getIntent().hasExtra(DEBUG_MODE_ARG)) {
      String debugArg = getIntent().getStringExtra(DEBUG_MODE_ARG);
      Logger.setDebugMode(Boolean.parseBoolean(debugArg));
    }

    new Thread(new Runnable() {
      public void run() {
        httpdIntent = new Intent(MainActivity.this, HttpdService.class);
        bindService(httpdIntent, mConnection, Context.BIND_AUTO_CREATE);
      }
    }).start();
    thisActivity = this;
  }

  @Override
  protected void onDestroy() {
    if (bound) {
      unbindService(mConnection);
      bound = false;
    }
    if (httpdService != null) {
      httpdService.stopService(httpdIntent);
    }
    stopService(httpdIntent);
    this.getWindow().closeAllPanels();
    super.onDestroy();
  }

  public static void setCapabilities(DesiredCapabilities caps) {
    MainActivity.caps = caps;
    if (caps.getCapability(LOGGING_PREFS) != null) {
      LoggingPreferences prefs = (LoggingPreferences) caps.getCapability(LOGGING_PREFS);
      if (prefs.getLevel(DRIVER) != null) {
        Logger.setLevel(prefs.getLevel(DRIVER));
        LoggingHandler.getInstance().attachTo(Logger.getLogger(), prefs.getLevel(DRIVER));
      }
    }
  }

  public static AndroidWebDriver createDriver() {
    driver = new AndroidWebDriver(thisActivity);
    driver.setAcceptSslCerts(caps.is(CapabilityType.ACCEPT_SSL_CERTS));
    return driver;
  }
}
