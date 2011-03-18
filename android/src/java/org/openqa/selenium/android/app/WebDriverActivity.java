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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.android.Logger;
import org.openqa.selenium.android.ActivityController;
import org.openqa.selenium.android.events.TouchScreen;
import org.openqa.selenium.android.events.WebViewAction;
import org.openqa.selenium.android.server.JettyService;
import org.openqa.selenium.android.server.WebDriverBinder;
import org.openqa.selenium.android.sessions.SessionCookieManager;

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
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.util.Log;
import android.view.MotionEvent;
import android.view.Window;
import android.webkit.CookieManager;

/**
 * Main application activity.
 */
public class WebDriverActivity extends Activity {
  private static final String LOG_TAG = WebDriverActivity.class.getName();

  // Use for control redirect, contains the last url loaded (updated after each redirect)
  private volatile String lastUrlLoaded;
  private String currentUrl = "";

  private boolean pageHasStartedLoading = false;
  private SessionCookieManager sessionCookieManager;
  private WebDriverWebView currentView;
  private WebViewManager viewManager = new WebViewManager();  

  private boolean bound;
  private JettyService jettyService;
  private Intent jettyIntent;
  
  private static final int CMD_SEND_KEYS = 1;
  private static final int CMD_NAVIGATE_TO = 2;
  private static final int CMD_EXECUTE_SCRIPT = 3;
  private static final int CMD_SWITCH_TO_VIEW = 4;
  private static final int CMD_NAVIGATE_DIRECTION = 5;
  private static final int CMD_RELOAD = 6;
  private static final int CMD_SEND_TOUCH = 7;
  
  private final Handler handler = new Handler() {
    @Override
    public void handleMessage(Message msg) {
      if (msg.what == CMD_SEND_KEYS) {
        WebViewAction.sendKeys(currentView, (CharSequence[]) msg.obj);
      } else if (msg.what == CMD_NAVIGATE_TO) {
        currentView.navigateTo((String) msg.obj);
      } else if (msg.what == CMD_EXECUTE_SCRIPT) {
        currentView.executeJavascript((String) msg.obj);
      } else if (msg.what == CMD_SWITCH_TO_VIEW) {
        switchToWebView(viewManager.getView((String) msg.obj));
      } else if (msg.what == CMD_NAVIGATE_DIRECTION) {
        currentView.goBackOrForward((Integer) msg.obj);
      } else if (msg.what == CMD_RELOAD) {
        currentView.reload();
      } else if (msg.what == CMD_SEND_TOUCH) {
        MotionEvent[] events = (MotionEvent[]) msg.obj;
        TouchScreen.sendMotion(currentView, events[0], events[1]);
      }
    }
  };
  
  private ServiceConnection mConnection = new ServiceConnection() {
    public void onServiceConnected(ComponentName className, IBinder service) {
      bound = true;
      jettyService = ((WebDriverBinder) service).getService();
    }

    public void onServiceDisconnected(ComponentName arg0) {
      bound = false;
    }
  };

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
    new Thread(new Runnable() {
      public void run() {
        jettyIntent = new Intent(WebDriverActivity.this, JettyService.class);
        bindService(jettyIntent, mConnection, Context.BIND_AUTO_CREATE);
        ActivityController s = ActivityController.getInstance();
        s.setActivity(WebDriverActivity.this);
      }
    }).start();
    
    displayProgressBar();
    final WebDriverWebView newView = new WebDriverWebView(this);
    currentView = newView;
    
    viewManager.addView(newView);
    
    setContentView(newView);

    // This needs to be initialized after the webview
    sessionCookieManager = new SessionCookieManager(this);
    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.removeAllCookie();
  }

  private void displayProgressBar() {
    // Request the progress bar to be shown in the title and set it to 0
    requestWindowFeature(Window.FEATURE_PROGRESS);
    setProgressBarVisibility(true);
  }

  @Override
  protected void onDestroy() {
    if (bound) {
      jettyService.stopService(jettyIntent);
      unbindService(mConnection);
      bound = false;
    }
    this.getWindow().closeAllPanels();
    super.onDestroy();
  }
  
  public void navigateTo(String url) {
    Message msg = handler.obtainMessage(CMD_NAVIGATE_TO);
    msg.obj = url;
    handler.sendMessage(msg);
  }
  
  public String getCurrentUrl() {
    return currentView.getUrl();
  }
  
  public String getPageTitle() {
    return currentView.getTitle();
  }
  
  public void injectScript(final String script) {
    Message msg = handler.obtainMessage(CMD_EXECUTE_SCRIPT);
    msg.obj = script;
    handler.sendMessage(msg);  }
  
  public Set<String> getAllWindowHandles() {
    return  viewManager.getAllHandles();
  }
  
  public String getWindowHandle() {
    return currentView.getWindowHandle();   
  }
  
  public void switchToWindow(final String name) {
    Message msg = handler.obtainMessage(CMD_SWITCH_TO_VIEW);
    msg.obj = name;
    handler.sendMessage(msg);  }
  
  public void addCookie(final String name, final String value, final String path) {
    Cookie cookie = new Cookie(name, value, path);
    sessionCookieManager.addCookie(currentView.getUrl(), cookie);
  }
  
  public void removeCookie(final String name) {
    sessionCookieManager.remove(currentView.getUrl(), name);
  }
  
  public void removeAllCookies() {
    sessionCookieManager.removeAllCookies(currentView.getUrl());
  }
  
  public Set<Cookie> getCookies() {
    return sessionCookieManager.getAllCookies(currentView.getUrl());
  }
  
  public Cookie getCookie(final String name) {
    return sessionCookieManager.getCookie(currentView.getUrl(), name);
  }
  
  public void rotate(ScreenOrientation orientation) {
    setRequestedOrientation(getAndroidScreenOrientation(orientation));
  }
  
  public void navigateBackOrForward(int direction) {
    Message msg = handler.obtainMessage(CMD_NAVIGATE_DIRECTION);
    msg.obj = direction;
    handler.sendMessage(msg);  }
  
  public void refresh() {
    Message msg = handler.obtainMessage(CMD_RELOAD);
    handler.sendMessage(msg); 
  }
  
  public void sendMotionToScreen(MotionEvent down, MotionEvent up) {
    Message msg = handler.obtainMessage(CMD_SEND_TOUCH);
    msg.obj = new MotionEvent[]{down, up};
    handler.sendMessage(msg);  }
  
  public void sendKeys(CharSequence[] inputKeys) {
    Message msg = handler.obtainMessage(CMD_SEND_KEYS);
    msg.obj = inputKeys;
    handler.sendMessage(msg);  
  }
  
  private void switchToWebView(WebDriverWebView webview) {
    if (webview == null) {
      throw new NoSuchWindowException("No Such window");
    }
    currentView = webview;
    setContentView(webview);
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
  public ScreenOrientation getScreenOrientation() {
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
