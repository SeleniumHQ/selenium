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

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.android.intents.Action.PAGE_LOADED;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Picture;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Bitmap.Config;
import android.os.Bundle;
import android.util.Log;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import org.openqa.selenium.android.RunnableWithArgs;
import org.openqa.selenium.android.intents.CommandExecutedIntent;
import org.openqa.selenium.android.intents.CookieIntentReceiver;
import org.openqa.selenium.android.intents.DoActionIntentReceiver;
import org.openqa.selenium.android.intents.DoNativeActionIntentReceiver;
import org.openqa.selenium.android.intents.IntentBroadcasterWithResultReceiver;
import org.openqa.selenium.android.intents.IntentReceiverRegistrar;
import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.android.intents.NavigationIntentReceiver;
import org.openqa.selenium.android.intents.PageLoadedIntent;
import org.openqa.selenium.android.intents.PageLoadedIntentReceiver;
import org.openqa.selenium.android.intents.PageStartedLoadingIntent;
import org.openqa.selenium.android.intents.SetProxyIntentReceiver;
import org.openqa.selenium.android.intents.TakeScreenshotIntentReceiver;
import org.openqa.selenium.android.intents.DoActionIntentReceiver.ActionRequestListener;
import org.openqa.selenium.android.intents.DoNativeActionIntentReceiver.NativeActionExecutorListener;
import org.openqa.selenium.android.intents.IntentBroadcasterWithResultReceiver.BroadcasterWithResultListener;
import org.openqa.selenium.android.intents.NavigationIntentReceiver.NavigateRequestListener;
import org.openqa.selenium.android.intents.PageLoadedIntentReceiver.PageLoadedListener;
import org.openqa.selenium.android.intents.TakeScreenshotIntentReceiver.TakeScreenshotListener;
import org.openqa.selenium.android.sessions.SessionCookieManager;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Main view of a single-session application mode.
 */
public class SingleSessionActivity extends Activity implements ActionRequestListener,
    NavigateRequestListener, NativeActionExecutorListener, TakeScreenshotListener,
    BroadcasterWithResultListener {

  private static final String LOG_TAG = SingleSessionActivity.class.getName();
  private String currentUrl = "";
  // Variable used for detecting meta redirect
  private boolean lastValueSeen = false;
  private boolean toggle = false;
  // Use for control redirect, contains the last url loaded (updated after each redirect)
  private volatile String lastUrlLoaded;
  private WebView webView;
  private final IntentReceiverRegistrar intentReg;
  private final SimpleWebViewJSExecutor jsExecutor = new SimpleWebViewJSExecutor();

  public SingleSessionActivity() {
    intentReg = new IntentReceiverRegistrar(this);
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Request the progress bar to be shown in the title and set it to 0
    requestWindowFeature(Window.FEATURE_PROGRESS);
    setProgressBarVisibility(false);
    setProgress(0);

    setContentView(R.layout.single_session_layout);

    this.setTitle("WebDriver");

    // Configure WebView
    webView = (WebView) findViewById(R.id.webview);
    webView.setWebViewClient(new LocalWebViewClient());
    webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
    webView.getSettings().setBuiltInZoomControls(true);
    webView.getSettings().setJavaScriptEnabled(true);
    
    LocalWebChromeClient chromeClient = new LocalWebChromeClient();
    webView.setWebChromeClient(chromeClient);

    webView.addJavascriptInterface(new CustomJavaScriptInterface(), "webdriver");

    // Registering all intent receivers
    NavigationIntentReceiver navIR = new NavigationIntentReceiver();
    navIR.setNavigateRequestListener(this);
    intentReg.registerReceiver(navIR, Action.NAVIGATE);

    PageLoadedIntentReceiver pageLoadedReceiver = new PageLoadedIntentReceiver();
    pageLoadedReceiver.setPageLoadedListener(chromeClient);
    intentReg.registerReceiver(pageLoadedReceiver, PAGE_LOADED);

    DoActionIntentReceiver doActIR = new DoActionIntentReceiver();
    doActIR.setActionRequestListener(this);
    intentReg.registerReceiver(doActIR, Action.DO_ACTION);

    IntentBroadcasterWithResultReceiver intentWithResult =
      new IntentBroadcasterWithResultReceiver();
    intentWithResult.setListener(this);
    intentReg.registerReceiver(intentWithResult, Action.GET_TITLE);
    intentReg.registerReceiver(intentWithResult, Action.GET_URL);
    intentReg.registerReceiver(intentWithResult, Action.GET_PAGESOURCE);
    
    TakeScreenshotIntentReceiver screenshotIR = new TakeScreenshotIntentReceiver();
    screenshotIR.setListener(this);
    intentReg.registerReceiver(screenshotIR, Action.TAKE_SCREENSHOT);

    intentReg.registerReceiver(new SetProxyIntentReceiver(), Action.SET_PROXY);

    DoNativeActionIntentReceiver nativeActionReceiver = new DoNativeActionIntentReceiver();
    nativeActionReceiver.setTitleRequestListener(this);
    intentReg.registerReceiver(nativeActionReceiver, Action.DO_NATIVE_ACTION);

    SessionCookieManager.createInstance(this);
    CookieIntentReceiver cookieIntentReceiverLite = new CookieIntentReceiver();
    cookieIntentReceiverLite.setListener(this);
    intentReg.registerReceiver(cookieIntentReceiverLite, Action.GET_COOKIES);

    Log.d(LOG_TAG, "Single-session mode loaded.");
  }

  @Override
  protected void onStop() {
    for (BroadcastReceiver r : intentReg.getReceivers()) {
      this.unregisterReceiver(r);
    }
    super.onStop();
  }
  
  /**
   * Navigates WebView to a new URL.
   *
   * @param url URL to navigate to.
   */
  public void navigateTo(String url) {
    Log.d(LOG_TAG, "navigateTo URL : " + url);
    toggle = !toggle;
    if (url == null) {
      PageLoadedIntent.getInstance().broadcast(SingleSessionActivity.this, false);
      return;
    }
    //use for redirect control
    lastUrlLoaded = null;

    if (url.equals(currentUrl)) {
      reload();
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
   * Returns the URL/HTML that was loaded into WebView last.
   *
   * @return URL or HTML string as appeared in {@link #navigateTo(String)}.
   */
  public String getCurrentUrl() {
    return webView.getUrl();
  }

  /**
   * Returns an active title from the WebView.
   *
   * @return Title string.
   */
  public String getWebViewTitle() {
    return webView.getTitle();
  }

  /**
   * Executed a given JavaScript code and returns string result.
   *
   * @param script JavaScript code to execute.
   */
  public void executeJS(String script) {
    jsExecutor.executeJS(script);
  }

  /**
   * Navigates back or forward within browser's history.
   *
   * @param steps How many steps to go (use negative numbers for navigation back in the history).
   */
  public void navigateBackOrForward(int steps) {
    webView.goBackOrForward(steps);
  }

  /**
   * Reload the current page in the WebView.
   */
  public void reload() {
    webView.reload();
  }

  /**
   * Sets status message of the single-mode view.
   *
   * @param status Status message to set.
   */
  public void setStatus(String status) {
    ((TextView) findViewById(R.id.status)).setText(status);
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
      Log.d(logTag, "Script finished");
      CommandExecutedIntent.getInstance().broadcast(SingleSessionActivity.this, result);
    }
  }

  /**
   * This class overrides WebView default behavior when loading new URL. It makes sure that the URL
   * is always loaded by the WebView and updates progress bar according to the page loading
   * progress.
   */
  final class LocalWebViewClient extends WebViewClient {
    private final String logTag = LocalWebViewClient.class.getName();

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
      super.onPageStarted(view, url, favicon);
      Log.d(logTag, "onPageStarted  Loading: " + url);
      setProgressBarVisibility(true); // Showing progress bar in title
      setProgress(0);
      currentUrl = url;
      lastUrlLoaded = url;
      PageStartedLoadingIntent.getInstance().broadcast(SingleSessionActivity.this, true);
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
        PageLoadedIntent.getInstance().broadcast(SingleSessionActivity.this, true);
      }
    }
  }

  
  /**
   * Subscriber class to be notified when the underlying WebView loads new content or changes
   * title.
   */
  final class LocalWebChromeClient extends WebChromeClient implements PageLoadedListener {
    private final String log_tag = LocalWebChromeClient.class.getName();
    private ExecutorService executor = Executors.newSingleThreadExecutor();
    private CountDownLatch loaderLock;
    boolean success = false;

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
      setStatus(view.getUrl());
      setProgress(newProgress * 100);

      Log.d(log_tag, "outside onProgressChanged url : "
          + view.getUrl() + ", progress: " + newProgress + ", realCurrentUrl: " + lastUrlLoaded);
      
      if (newProgress == 100 && lastUrlLoaded != null && lastUrlLoaded.equals(view.getUrl())) {
        Log.d(log_tag, "onProgressChanged url : " + view.getUrl());
        lastValueSeen = toggle;
        loaderLock = new CountDownLatch(1);
        executor.submit(new PageLoaderManager());
      }
    }
    
    class PageLoaderManager implements Runnable {
      private final String logTag = PageLoaderManager.class.getName();
      public void run() {
        try {
          success = loaderLock.await(500, MILLISECONDS);
        } catch (InterruptedException e) {
          Log.d(logTag, "Lock interupted", e);
        }
        if (!success || (lastValueSeen != toggle)) { // No meta redirect
          PageLoadedIntent.getInstance().broadcast(SingleSessionActivity.this, true);
        } else {
          Log.d(logTag, "This is a meta-redirect, no intent sent.");
        }
      }
    }

    public void onPageLoaded() {
      Log.d(log_tag, "onPageLoaded unlocking.");
      loaderLock.countDown();
    }
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

  public Object onActionRequest(String action, Object... args) {
    String actionRes = null;

    if (action.equals(Action.EXECUTE_JAVASCRIPT)) {
      Log.e("ONACTIONREQUEST SSA", "ARGS: " + args.toString());
      if (args.length == 1) {
        this.executeJS(args[0].toString());
      } else {
        Log.d(LOG_TAG, "onActionRequest Incorrect arguments for action: "
            + action.toString());
      }
    } else if (action.equals(Action.GET_PAGESOURCE)) {
      this.executeJS("window.webdriver.resultMethod(document.documentElement.outerHTML);");
    } else if (action.equals(Action.NAVIGATE_BACK)) {
      this.navigateBackOrForward(-1);
    } else if (action.equals(Action.NAVIGATE_FORWARD)) {
      this.navigateBackOrForward(1);
    } else if (action.equals(Action.REFRESH)) {
      this.reload();
    }
    return actionRes;
  }

  public void onNavigateRequest(String url) {
    this.navigateTo(url);
  }
  
  public String onBroadcastWithResult(String action) {
    if (action.equals(Action.GET_URL)) {
      return getCurrentUrl();
    } else if (action.equals(Action.GET_TITLE)) {
      return getWebViewTitle();
    } else if (action.equals(Action.GET_PAGESOURCE)) {
      executeJS("window.webdriver.resultMethod(document.documentElement.outerHTML);");
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
}
