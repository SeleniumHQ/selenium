//
//  WebViewController.h
//  iWebDriver
//
//  Copyright 2009 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

#import <UIKit/UIKit.h>

// The WebViewController manages the iWebDriver's WebView.
@interface WebViewController : UIViewController<UIWebViewDelegate>
{
 @private
  // The spec states that the GET message shouldn't return until the new page
  // is loaded. We need to lock the main thread to implement that. That'll
  // happen by polling [view isLoaded] but we can break early if the delegate
  // methods are fired. Note that subframes may still be being loaded.
  NSCondition *loadLock_;
  
  NSString *lastJSResult_;
	
  NSURLRequestCachePolicy cachePolicy_;
  
  // Pointer to the status / activity label.
  IBOutlet UILabel *statusLabel_;
  
  // This is nil if the last operation succeeded.
  NSError *lastError_;
}

@property (retain, readonly) UIWebView *webView;

- (CGRect)viewableArea;
- (BOOL)pointIsViewable:(CGPoint)point;

// Some webdriver stuff.
- (id)visible;
- (void)setVisible:(NSNumber *)target;

// Get the current page title
- (NSString *)currentTitle;

// Get the URL of the page we're looking at
- (NSString *)URL;

// Navigate to a URL.
// The URL should be specified by the |url| key in the |urlMap|.
- (void)setURL:(NSDictionary *)urlMap;

- (void)forward;
- (void)back;
- (void)refresh;

// Evaluate a javascript string and return the result.
// Arguments can be passed in in NSFormatter (printf) style.
//
// Variables declared with var are kept between script calls. However, they are
// lost when the page reloads. Check before using any variables which were
// defined during previous events.
- (NSString *)jsEval:(NSString *)format, ...;

// Evaluate a javascript string and return the result. Block if the evaluation
// results in a page reload.
// Arguments can be passed in in NSFormatter (printf) style.
- (NSString *)jsEvalAndBlock:(NSString *)format, ...;

// Test if a JS expression evaluates to true
- (BOOL)testJsExpression:(NSString *)format, ...;

// Get a float property of a javascript object
- (float)floatProperty:(NSString *)property ofObject:(NSString *)jsObject;

// Test if a JS object is equal to null
- (BOOL)jsElementIsNullOrUndefined:(NSString *)expression;

// Get the HTML source of the page we've loaded
- (NSString *)source;

// Get a screenshot of the page we've loaded
- (UIImage *)screenshot;

- (void)clickOnPageElementAt:(CGPoint)point;

- (void)addFirebug;

// Calls the same on the main view controller.
- (void)describeLastAction:(NSString *)status;

@end
