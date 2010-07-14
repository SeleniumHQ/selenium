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

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Picture;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Bitmap.Config;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.android.RunnableWithArgs;
import org.openqa.selenium.android.events.TouchScreen;
import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.android.intents.IntentReceiver;
import org.openqa.selenium.android.intents.IntentReceiverRegistrar;
import org.openqa.selenium.android.intents.IntentSender;
import org.openqa.selenium.android.intents.IntentReceiver.IntentReceiverListener;
import org.openqa.selenium.android.sessions.SessionCookieManager;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Main view of a single-session application mode.
 */
public class SingleSessionActivity extends Activity implements IntentReceiverListener {

  private static final String LOG_TAG = SingleSessionActivity.class.getName();
  private boolean pageHasStartedLoading = false;

  // Use for control redirect, contains the last url loaded (updated after each redirect)
  private volatile String lastUrlLoaded;
  private String currentUrl = "";

  private WebView webView;
  
  private SessionCookieManager sessionCookieManager;

  private final IntentReceiverRegistrar intentReg;
  private final SimpleWebViewJSExecutor jsExecutor;
  private final SimpleWebChromeClient  chromeClient;

  public SingleSessionActivity() {
    intentReg = new IntentReceiverRegistrar(this);
    jsExecutor = new SimpleWebViewJSExecutor();
    chromeClient = new SimpleWebChromeClient();
  }
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    initAppLayout();
    initWebViewSettings();
    // This needs to be initialized after the webview
    sessionCookieManager = new SessionCookieManager(this);
    initIntentReceivers();
    Log.d(LOG_TAG, "WebView Initialized.");
  }

  private void initWebViewSettings() {
    // Gets a handle on the webview
    webView = (WebView) findViewById(R.id.webview);
    
    // Sets custom webview behavior
    webView.setWebViewClient(new SimpleWebViewClient());
    webView.setWebChromeClient(chromeClient);
    webView.addJavascriptInterface(new CustomJavaScriptInterface(), "webdriver");

    // Webview settings
    webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
    webView.getSettings().setBuiltInZoomControls(true);
    webView.getSettings().setJavaScriptEnabled(true);
  }

  private void initAppLayout() {
    // Request the progress bar to be shown in the title and set it to 0
    requestWindowFeature(Window.FEATURE_PROGRESS);
    setProgressBarVisibility(false);
    setProgress(0);

    setContentView(R.layout.single_session_layout);

    this.setTitle("WebDriver");
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
    intentReg.registerReceiver(intentWithResult, Action.CLEAR_TEXT);
    intentReg.registerReceiver(intentWithResult, Action.ADD_COOKIE);
    intentReg.registerReceiver(intentWithResult, Action.GET_ALL_COOKIES);
    intentReg.registerReceiver(intentWithResult, Action.GET_COOKIE);
    intentReg.registerReceiver(intentWithResult, Action.REMOVE_ALL_COOKIES);
    intentReg.registerReceiver(intentWithResult, Action.REMOVE_COOKIE);
  }

  @Override
  protected void onDestroy() {
    intentReg.unregisterAllReceivers();
    super.onDestroy();
  }
  
  /**
   * Navigates WebView to a new URL.
   *
   * @param url URL to navigate to.
   */
  public void navigateTo(String url) {
    Log.d(LOG_TAG, "navigateTo URL : " + url);
    if (url == null) {
      sendIntent(Action.PAGE_LOADED);
      return;
    }
    //use for redirect control
    lastUrlLoaded = null;

    if (url.equals(currentUrl)) {
      webView.reload();
    }
    else if (url.length() > 0) {
      if (url.startsWith("http") || url.startsWith("www")) {
        webView.loadUrl(url); // This is a URL
      } else {
        webView.loadData(url, "text/html", "utf-8"); // This is HTML
      }
    }
  }

  /**
   * Sets status message of the single-mode view.
   *
   * @param status Status message to set.
   */
  public void setStatus(String status) {
    ((TextView) findViewById(R.id.status)).setText(status);
  }
  
  public Object onReceiveBroadcast(String action, Object... args) {
    if (Action.GET_URL.equals(action)) {
      return webView.getUrl();
    } else if (Action.GET_TITLE.equals(action)) {
      return webView.getTitle();
    } else if (Action.TAKE_SCREENSHOT.equals(action)) {
      return takeScreenshot();
    } else if (Action.NAVIGATE.equals(action)) {
      navigateTo((String) args[0]);
    } else if (Action.NAVIGATE_BACK.equals(action)) {
      webView.goBackOrForward(-1);
    } else if (Action.NAVIGATE_FORWARD.equals(action)) {
      webView.goBackOrForward(1);
    } else if (Action.REFRESH.equals(action)) {
      webView.reload();
    } else if (Action.EXECUTE_JAVASCRIPT.equals(action)) {
      if (args.length == 1) {
        jsExecutor.executeJS((String) args[0]); 
      } else {
        throw new IllegalArgumentException("Error while trying to execute Javascript." +
        "SingleSessionActivity.executeJS takes one argument, but received: "
            + (args == null ? 0 : args.length));
      }
    } else if (Action.ADD_COOKIE.equals(action)) {
      Cookie cookie = new Cookie((String) args[0], (String) args[1], (String) args[2]);
      sessionCookieManager.addCookie(webView.getUrl(), cookie);
    } else if (Action.GET_ALL_COOKIES.equals(action)) {
      return sessionCookieManager.getAllCookiesAsString(webView.getUrl());
    } else if (Action.GET_COOKIE.equals(action)) {
      return sessionCookieManager.getCookie(webView.getUrl(), (String) args[0]);
    } else if (Action.REMOVE_ALL_COOKIES.equals(action)) {
      sessionCookieManager.removeAllCookies(webView.getUrl());
    } else if (Action.REMOVE_COOKIE.equals(action)) {
      sessionCookieManager.remove(webView.getUrl(), (String) args[0]);
    } else if (Action.SEND_MOTION_EVENT.equals(action)) {
      TouchScreen.sendMotion(webView, (MotionEvent) args[0], (MotionEvent) args[1]);
    } else if (Action.SEND_KEYS.equals(action)) {
      // TODO (berrada): Implement me!
    } else if (Action.CLEAR_TEXT.equals(action)) {
      // TODO (berrada): Implement me!
    }
    return null;
  }
  
  public void executeNativeAction(final RunnableWithArgs r) {
    try {
      r.run(webView);
    } catch (InterruptedException e) {
      Log.e(LOG_TAG, "executeNativeAction Exception", e);
    }
  }
  
  public byte[] takeScreenshot() {
    Picture pic = webView.capturePicture();
    Bitmap bitmap = Bitmap.createBitmap(
        webView.getWidth() - webView.getVerticalScrollbarWidth(),
        webView.getHeight(), Config.RGB_565);
    Canvas cv = new Canvas(bitmap);
    cv.drawPicture(pic);
    ByteArrayOutputStream stream = new ByteArrayOutputStream();
    
    if (!bitmap.compress(CompressFormat.PNG, 100, stream)) {
      Log.e(LOG_TAG, "Error while compressing screenshot image.");
    }
    try {
      stream.flush();
      stream.close();
    } catch (IOException e) {
      Log.e(LOG_TAG, "Error while capturing screenshot: " + e.getMessage());
    }
    byte[] rawPng = stream.toByteArray();
    Log.d(LOG_TAG, "Captured Screenshot. Image size: " + rawPng.length);
    return rawPng;
  }
  
  private void sendIntent(String action, Object... args) {
    IntentSender.getInstance().broadcast(this, action, args);
  }

  /**
   * Custom module that is added to the WebView's JavaScript engine to enable callbacks to java
   * code. This is required since WebView doesn't expose the underlying DOM.
   */
  final class CustomJavaScriptInterface {

    /**
     * A callback from JavaScript to Java that passes execution result as a parameter.
     *
     * This method is accessible from WebView's JS DOM as windows.webdriver.resultMethod().
     *
     * @param result Result that should be returned to Java code from WebView.
     */
    public void resultMethod(String result) {
      jsExecutor.resultAvailable(result);
    }
  }
  
  /**
   * Class that wraps synchronization housekeeping of execution of JavaScript code within WebView.
   */
  class SimpleWebViewJSExecutor {

    @SuppressWarnings("hiding")
    private final String logTag = SimpleWebViewJSExecutor.class.getName();

    /**
     * Executes a given JavaScript code within WebView and returns execution result. <p/> Note:
     * execution is limited in time to AndroidDriver.INTENT_TIMEOUT to prevent "application
     * not responding" alerts.
     *
     * @param jsCode JavaScript code to execute.
     */
    public void executeJS(String jsCode) {
      webView.loadUrl("javascript:" + jsCode);
    }

    /**
     * Callback to report results of JavaScript code execution.
     *
     * @param result Results (if returned) or an empty string.
     */
    public void resultAvailable(String result) {
      Log.d(logTag, "Script finished with result: " + result);
      sendIntent(Action.JAVASCRIPT_RESULT_AVAILABLE, result);
    }
  }

  /**
   * This class overrides WebView default behavior when loading new URL. It makes sure that the URL
   * is always loaded by the WebView and updates progress bar according to the page loading
   * progress.
   */
  final class SimpleWebViewClient extends WebViewClient {
    private final String logTag = SimpleWebViewClient.class.getName();

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
      super.onPageStarted(view, url, favicon);
      Log.d(logTag, "onPageStarted  Loading: " + url);
      setProgressBarVisibility(true); // Showing progress bar in title
      setProgress(0);
      currentUrl = url;
      lastUrlLoaded = url;
      pageHasStartedLoading = true;
      sendIntent(Action.PAGE_STARTED_LOADING);
    }

    @Override
    public void onPageFinished(WebView view, String url) {
      super.onPageFinished(view, url);
      setProgressBarVisibility(false); // Hiding progress bar in title
      lastUrlLoaded = url;
      
      // If it is a html fragment or the current url loaded, the page is
      // not reloaded and the onProgessChanged function is not called.
      if (url.contains("#") && currentUrl.equals(url.split("#")[0])) {
        Log.d(logTag, "This is an html fragment for an already loaded page.");
        sendIntent(Action.PAGE_LOADED);
      }
    }
  }
  
  /**
   * Subscriber class to be notified when the underlying WebView loads new content or changes
   * title.
   */
  final class SimpleWebChromeClient extends WebChromeClient {
    private final String log_tag = SimpleWebChromeClient.class.getName();
    private ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
      setStatus(view.getUrl());
      setProgress(newProgress * 100);

      Log.d(log_tag, String.format("onProgressChanged url : %s, progress: %s, lastUrlLoaded: %s",
          view.getUrl(), newProgress, lastUrlLoaded));
      
      if (newProgress == 100 && lastUrlLoaded != null && lastUrlLoaded.equals(view.getUrl())) {
        Log.d(log_tag, "Probably finished loading url in webview: " + view.getUrl());
        pageHasStartedLoading = false;
        executor.submit(new PageLoaderManager());
      }
    }
    
    class PageLoaderManager implements Runnable {
      private final String logTag = PageLoaderManager.class.getName();
      
      public void run() {
        ExecutorService thread = Executors.newSingleThreadExecutor();
        Future<Void> future = thread.submit(new Callable<Void>() {
          public Void call() throws Exception {
            while (!pageHasStartedLoading) {
              continue;
            }
            return null;
          }
        });
        try {
          future.get(500, TimeUnit.MILLISECONDS); // If the future does not time
          // out, this is a meta redirect, and a page just started loading.
        } catch (InterruptedException cause) {
          Thread.currentThread().interrupt();
        } catch (ExecutionException cause) {
          executor.shutdown();
          throw new WebDriverException("Future task interupted.", cause.getCause());
        } catch (TimeoutException e) {
          sendIntent(Action.PAGE_LOADED);
          Log.d(logTag, "Future timed out because this is not a meta-redirect.");
        }
      }
    }
  }
}
