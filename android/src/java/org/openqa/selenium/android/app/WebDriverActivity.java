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

package org.openqa.selenium.android.app;

import com.google.common.collect.Iterables;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.graphics.Picture;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.view.MotionEvent;
import android.view.Window;
import android.webkit.CookieManager;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.android.Logger;
import org.openqa.selenium.android.events.TouchScreen;
import org.openqa.selenium.android.events.WebViewAction;
import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.android.intents.IntentReceiver;
import org.openqa.selenium.android.intents.IntentReceiver.IntentReceiverListener;
import org.openqa.selenium.android.intents.IntentReceiverRegistrar;
import org.openqa.selenium.android.intents.IntentSender;
import org.openqa.selenium.android.server.JettyService;
import org.openqa.selenium.android.sessions.SessionCookieManager;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Main application activity.
 */
public class WebDriverActivity extends Activity implements IntentReceiverListener {
  private static final String LOG_TAG = WebDriverActivity.class.getName();

  // Use for control redirect, contains the last url loaded (updated after each redirect)
  private volatile String lastUrlLoaded;
  private String currentUrl = "";

  private boolean pageHasStartedLoading = false;
  private SessionCookieManager sessionCookieManager;
  private WebDriverWebView currentView;
  private WebViewManager viewManager = new WebViewManager();  
  private final IntentReceiverRegistrar intentReg;

  private final IntentSender sender = new IntentSender(this);
  private boolean bound;
  
  private ServiceConnection mConnection = new ServiceConnection() {
    public void onServiceConnected(ComponentName className, IBinder service) {
      bound = true;
    }

    public void onServiceDisconnected(ComponentName arg0) {
      bound = false;
    }
  };

  public void sendIntent(String action, Object... args) {
    sender.broadcast(action, args);
  }
  
  public WebDriverActivity() {
    intentReg = new IntentReceiverRegistrar(this);
  }

  public void setCurrentUrl(String url) {
    currentUrl = url;  
  }
  
  public String currentUrl() {
    return currentUrl;
  }
  
  public void setLastUrlLoaded(String url) {
    lastUrlLoaded = url;
  }
  
  public String lastUrlLoaded() {
    return lastUrlLoaded;
  }
  
  public void setPageHasStartedLoading(boolean value) {
    pageHasStartedLoading = value;
  }
  
  public WebViewManager viewManager() {
    return viewManager;
  }
  
  public boolean hasPageStartedLoading() {
    return pageHasStartedLoading;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    displayProgressBar();
    final WebDriverWebView newView = new WebDriverWebView(this);
    currentView = newView;
    
    viewManager.addView(newView);
    
    setContentView(newView);

    // This needs to be initialized after the webview
    sessionCookieManager = new SessionCookieManager(this);
    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.removeAllCookie();
    
    initIntentReceivers();
  }
  
  @Override
  protected void onStart() {
	  super.onStart();
	  Intent intent = new Intent(this, JettyService.class);
	  bindService(intent, mConnection, Context.BIND_AUTO_CREATE);
  }

  @Override
  protected void onStop() {
    super.onStop();
    if (bound) {
    	unbindService(mConnection);
    	bound = false;
	  }
	}

  private void displayProgressBar() {
    // Request the progress bar to be shown in the title and set it to 0
    requestWindowFeature(Window.FEATURE_PROGRESS);
    setProgressBarVisibility(true);
  }

  private void initIntentReceivers() {
    IntentReceiver intentWithResult = new IntentReceiver();
    intentWithResult.setListener(this);
    intentReg.registerReceiver(intentWithResult, Action.GET_TITLE);
    intentReg.registerReceiver(intentWithResult, Action.GET_URL);
    intentReg.registerReceiver(intentWithResult, Action.TAKE_SCREENSHOT);
    intentReg.registerReceiver(intentWithResult, Action.NAVIGATE_BACK);
    intentReg.registerReceiver(intentWithResult, Action.NAVIGATE_FORWARD);
    intentReg.registerReceiver(intentWithResult, Action.REFRESH);
    intentReg.registerReceiver(intentWithResult, Action.NAVIGATE);
    intentReg.registerReceiver(intentWithResult, Action.EXECUTE_JAVASCRIPT);
    intentReg.registerReceiver(intentWithResult, Action.SEND_KEYS);
    intentReg.registerReceiver(intentWithResult, Action.SEND_MOTION_EVENT);
    intentReg.registerReceiver(intentWithResult, Action.ADD_COOKIE);
    intentReg.registerReceiver(intentWithResult, Action.GET_ALL_COOKIES);
    intentReg.registerReceiver(intentWithResult, Action.GET_COOKIE);
    intentReg.registerReceiver(intentWithResult, Action.REMOVE_ALL_COOKIES);
    intentReg.registerReceiver(intentWithResult, Action.REMOVE_COOKIE);
    intentReg.registerReceiver(intentWithResult, Action.ROTATE_SCREEN);
    intentReg.registerReceiver(intentWithResult, Action.GET_SCREEN_ORIENTATION);
    intentReg.registerReceiver(intentWithResult, Action.SWITCH_TO_WINDOW);
    intentReg.registerReceiver(intentWithResult, Action.GET_CURRENT_WINDOW_HANDLE);
    intentReg.registerReceiver(intentWithResult, Action.GET_ALL_WINDOW_HANDLES);
  }

  @Override
  protected void onDestroy() {
    intentReg.unregisterAllReceivers();
    this.getWindow().closeAllPanels();
    super.onDestroy();
  }
  
  public Object onReceiveBroadcast(String action, Object... args) {
    if (Action.GET_URL.equals(action)) {
      return currentView.getUrl();
    } else if (Action.GET_TITLE.equals(action)) {
      return currentView.getTitle();
    } else if (Action.TAKE_SCREENSHOT.equals(action)) {
      return takeScreenshot();
    } else if (Action.NAVIGATE.equals(action)) {
      currentView.navigateTo((String) args[0]);
    } else if (Action.NAVIGATE_BACK.equals(action)) {
      currentView.goBackOrForward(-1);
    } else if (Action.NAVIGATE_FORWARD.equals(action)) {
      currentView.goBackOrForward(1);
    } else if (Action.REFRESH.equals(action)) {
      currentView.reload();
    } else if (Action.EXECUTE_JAVASCRIPT.equals(action)) {
      if (args.length == 1) {
        currentView.executeJavascript((String) args[0]);
      } else {
        throw new IllegalArgumentException("Error while trying to execute Javascript." +
        "SingleSessionActivity.executeJS takes one argument, but received: "
            + (args == null ? 0 : args.length));
      }
    } else if (Action.ADD_COOKIE.equals(action)) {
      Cookie cookie = new Cookie((String) args[0], (String) args[1], (String) args[2]);
      sessionCookieManager.addCookie(currentView.getUrl(), cookie);
    } else if (Action.GET_ALL_COOKIES.equals(action)) {
      return sessionCookieManager.getAllCookiesAsString(currentView.getUrl());
    } else if (Action.GET_COOKIE.equals(action)) {
      return sessionCookieManager.getCookie(currentView.getUrl(), (String) args[0]);
    } else if (Action.REMOVE_ALL_COOKIES.equals(action)) {
      sessionCookieManager.removeAllCookies(currentView.getUrl());
    } else if (Action.REMOVE_COOKIE.equals(action)) {
      sessionCookieManager.remove(currentView.getUrl(), (String) args[0]);
    } else if (Action.SEND_MOTION_EVENT.equals(action)) {
      TouchScreen.sendMotion(currentView, (MotionEvent) args[0], (MotionEvent) args[1]);
      return true;
    } else if (Action.SEND_KEYS.equals(action)) {
      CharSequence[] inputKeys = new CharSequence[args.length];
      for (int i = 0; i < inputKeys.length; i++) {
        inputKeys[i] = args[i].toString();
      }
      WebViewAction.sendKeys(currentView, inputKeys);
    } else if (Action.ROTATE_SCREEN.equals(action)) {
      this.setRequestedOrientation(getAndroidScreenOrientation((ScreenOrientation) args[0]));
    } else if (Action.GET_SCREEN_ORIENTATION.equals(action)) {
      return getScreenOrientation();
    } else if (Action.SWITCH_TO_WINDOW.equals(action)) {
      return switchToWebView(viewManager.getView((String) args[0]));
    } else if (Action.GET_CURRENT_WINDOW_HANDLE.equals(action)) {
      return currentView.getWindowHandle();
    } else if (Action.GET_ALL_WINDOW_HANDLES.equals(action)) {
      return  Iterables.toString(viewManager.getAllHandles());
    }
    return null;
  }
  
  private boolean switchToWebView(WebDriverWebView webview) {
    if (webview == null) {
      return false;
    }
    currentView = webview;
    setContentView(webview);
    return true;
  }
  
  private int getAndroidScreenOrientation(ScreenOrientation orientation) {
    if (ScreenOrientation.LANDSCAPE.equals(orientation)) {
      return 0;
    }
    return 1;
  }
  
  /**
   * @return the current layout orientation of webview.
   */
  private ScreenOrientation getScreenOrientation() {
    int width = currentView.getWidth();
    int height = currentView.getHeight();
    if (width > height) {
      return ScreenOrientation.LANDSCAPE;
    } else {
      return ScreenOrientation.PORTRAIT;
    }
  }
  
  public byte[] takeScreenshot() {
    Picture pic = currentView.capturePicture();
    Bitmap bitmap = Bitmap.createBitmap(
        currentView.getWidth() - currentView.getVerticalScrollbarWidth(),
        currentView.getHeight(), Config.RGB_565);
    Canvas cv = new Canvas(bitmap);
    cv.drawPicture(pic);
    ByteArrayOutputStream stream = new ByteArrayOutputStream();
    
    if (!bitmap.compress(CompressFormat.PNG, 100, stream)) {
      Logger.log(Log.ERROR, LOG_TAG,
          "Error while compressing screenshot image.");
    }
    try {
      stream.flush();
      stream.close();
    } catch (IOException e) {
      Logger.log(Log.ERROR, LOG_TAG,
          "Error while capturing screenshot: " + e.getMessage());
    }
    byte[] rawPng = stream.toByteArray();
    return rawPng;
  }
}
