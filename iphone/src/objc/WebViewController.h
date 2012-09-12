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

#import <sqlite3.h>
#import <UIKit/UIKit.h>

// The WebViewController manages the iWebDriver's WebView.
@interface WebViewController : UIViewController<UIWebViewDelegate>
{
@private
  // Used to track the number of page loads.  The view is considered loaded
  // when there are no pending page loads.
  int numPendingPageLoads_;

  NSString *lastJSResult_;
    
    // Get a screenshot of the page we've loaded
  UIImage *screenshot_;
 
  NSURLRequestCachePolicy cachePolicy_;
  
  // Pointer to the status / activity label.
  IBOutlet UILabel *statusLabel_;
  
  // This is nil if the last operation succeeded.
  NSError *lastError_;
}

@property (retain, readonly) UIWebView *webView;

- (void)waitForLoad;

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

- (void)forward:(NSDictionary*)ignored;
- (void)back:(NSDictionary*)ignored;
- (void)refresh:(NSDictionary*)ignored;

- (void)frame:(NSDictionary*)frameTarget;

// Evaluate a javascript string and return the result.
// Arguments can be passed in in NSFormatter (printf) style.
//
// Variables declared with var are kept between script calls. However, they are
// lost when the page reloads. Check before using any variables which were
// defined during previous events.
- (NSString *)jsEval:(NSString *)format, ...;

// Get the HTML source of the page we've loaded
- (NSString *)source;

// Get a screenshot of the page we've loaded
- (UIImage *)screenshot;

- (void)clickOnPageElementAt:(CGPoint)point;

// Calls the same on the main view controller.
- (void)describeLastAction:(NSString *)status;

// Get geolocation
- (id)location;

// Set geolocation
- (void)setLocation:(NSDictionary *)dict;

// get ss
- (void)getFullPageScreenShot;

// Check if browser connection is alive
- (NSNumber *)isBrowserOnline;

@end
