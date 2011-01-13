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

import android.os.Message;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.android.intents.Action;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Subscriber class to be notified when the underlying WebView loads new content or changes
 * title.
 */
final class WebDriverWebChromeClient extends WebChromeClient {
  private ExecutorService executor = Executors.newSingleThreadExecutor();
  private final WebDriverActivity context;
  
  public WebDriverWebChromeClient(WebDriverActivity context) {
    this.context = context;  
  }
  
  @Override
  public void onCloseWindow(WebView window) {
    context.viewManager().removeView((WebDriverWebView) window);
    super.onCloseWindow(window);
  }

  @Override
  public boolean onCreateWindow(
      WebView view, boolean dialog, boolean userGesture, Message resultMsg) {
    WebDriverWebView newView = new WebDriverWebView(context);
    WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
    transport.setWebView(newView);
    resultMsg.sendToTarget();
    context.viewManager().addView(newView);
    return true;
  }

  @Override
  public void onProgressChanged(WebView view, int newProgress) {
    context.setProgress(newProgress * 100);  
    if (newProgress == 100 && context.lastUrlLoaded() != null
        && context.lastUrlLoaded().equals(view.getUrl())) {
      context.setPageHasStartedLoading(false);
      executor.submit(new PageLoaderManager());
    }
  }
  
  class PageLoaderManager implements Runnable {      
    public void run() {
      ExecutorService thread = Executors.newSingleThreadExecutor();
      Future<Void> future = thread.submit(new Callable<Void>() {
        public Void call() throws Exception {
          while (!context.hasPageStartedLoading()) {
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
        context.sendIntent(Action.PAGE_LOADED);
      }
    }
  }
}
