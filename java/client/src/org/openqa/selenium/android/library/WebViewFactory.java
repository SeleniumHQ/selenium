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

package org.openqa.selenium.android.library;

import android.app.Activity;
import android.webkit.WebView;

/**
 * This interface should be implemented when using WebDriver with custom WebViews.
 * WebDriver will call the createNewView method to create new WebViews when needed,
 * for instance when cliking on a link that opens a new window.
 */
public interface WebViewFactory {

  public WebView createNewView(Activity activity);
}
