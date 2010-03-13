//
//  WebViewController.m
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
#import "WebViewController.h"
#import "HTTPServerController.h"
#import "NSException+WebDriver.h"
#import "NSURLRequest+IgnoreSSL.h"
#import "UIResponder+SimulateTouch.h"
#import "WebDriverPreferences.h"
#import "WebDriverRequestFetcher.h"
#import "WebDriverUtilities.h"
#import <objc/runtime.h>
#import "RootViewController.h"
#import <QuartzCore/QuartzCore.h>
#import <QuartzCore/CATransaction.h>

@implementation WebViewController

@dynamic webView;

// Executed after the nib loads the interface.
// Configure the webview to match the mobile safari app.
- (void)viewDidLoad {
  [super viewDidLoad];
  [[self webView] setScalesPageToFit:NO];
  [[self webView] setDelegate:self];

  loadLock_ = [[NSCondition alloc] init];
  lastJSResult_ = nil;
	
  // Creating a new session if auto-create is enabled
  if ([[RootViewController sharedInstance] isAutoCreateSession]) {
    [[HTTPServerController sharedInstance]
      httpResponseForQuery:@"/hub/session"
                    method:@"POST"
                  withData:[@"{\"browserName\":\"firefox\",\"platform\":\"ANY\","
                            "\"javascriptEnabled\":false,\"version\":\"\"}"
                            dataUsingEncoding:NSASCIIStringEncoding]];
  }

  WebDriverPreferences *preferences = [WebDriverPreferences sharedInstance];

  cachePolicy_ = [preferences cache_policy];
  NSURLCache *sharedCache = [NSURLCache sharedURLCache];
  [sharedCache setDiskCapacity:[preferences diskCacheCapacity]];
  [sharedCache setMemoryCapacity:[preferences memoryCacheCapacity]];

  if ([[preferences mode] isEqualToString: @"Server"]) {
    HTTPServerController* serverController = [HTTPServerController sharedInstance];
    [serverController setViewController:self];
    [self describeLastAction:[serverController status]];		
  } else {
    WebDriverRequestFetcher* fetcher = [WebDriverRequestFetcher sharedInstance]; 
    [fetcher setViewController:self];
    [self describeLastAction:[fetcher status]];		
  }
}

- (void)didReceiveMemoryWarning {
  NSLog(@"Memory warning recieved.");
  // TODO(josephg): How can we send this warning to the user? Maybe set the
  // displayed text; though that could be overwritten basically straight away.
  [super didReceiveMemoryWarning];
}

- (void)dealloc {
  [[self webView] setDelegate:nil];
  [loadLock_ release];
  [lastJSResult_ release];
  [super dealloc];
}

- (UIWebView *)webView {
  if (![[self view] isKindOfClass:[UIWebView class]]) {
    NSLog(@"NIB error: WebViewController's view is not a UIWebView.");
    return nil;
  }
  return (UIWebView *)[self view];
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
  NSLog(@"shouldStartLoadWithRequest");
  return YES;
}

- (void)webViewDidStartLoad:(UIWebView *)webView {
  NSLog(@"webViewDidStartLoad");
}

- (void)webViewDidFinishLoad:(UIWebView *)webView {
  NSLog(@"finished loading");
  [loadLock_ signal];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
  // This is a very troubled method. It can be called multiple times (for each
  // frame of webpage). It is sometimes called even when the page seems to have
  // loaded correctly.
  
  // Page loading errors are ignored because that's what WebDriver expects.
  NSLog(@"*** WebView failed to load URL with error %@", error);
  [loadLock_ signal];
}

#pragma mark Web view controls

- (void)performSelectorOnWebView:(SEL)selector withObject:(id)obj {
  [[self webView] performSelector:selector withObject:obj];
}

- (void)waitForLoad {
  // TODO(josephg): Test sleep intervals on the device.
  // This delay should be long enough that the webview has isLoading
  // set correctly (but as short as possible - these delays slow down testing.)
  
  // - The problem with [view isLoading] is that it gets set in a separate
  // worker thread. So, right after asking the webpage to load a URL we need to
  // wait an unspecified amount of time before isLoading will correctly tell us
  // whether the page is loading content.
  
  [NSThread sleepForTimeInterval:0.2f];
  
  while ([[self webView] isLoading]) {
    // Yield.
    [NSThread sleepForTimeInterval:0.01f];
  }  
}

// All method calls on the view need to be done from the main thread to avoid
// synchronization errors. This method calls a given selector in this class
// optionally with an argument.
//
// If called with waitUntilLoad:YES, we wait for a web page to be loaded in the
// view before returning.
- (void)performSelectorOnView:(SEL)selector
                   withObject:(id)value
                waitUntilLoad:(BOOL)wait {

  /* The problem with this method is that the UIWebView never gives us any clear
   * indication of whether or not it's loading and if so, when its done. Asking
   * it to load causes it to begin loading sometime later (isLoading returns NO
   * for awhile.) Even the |webViewDidFinishLoad:| method isn't a sure sign of
   * anything - it will be called multiple times, once for each frame of the
   * loaded page.
   * 
   * The result: The only effective method I can think of is nasty polling.
   */
  
  while ([[self webView] isLoading])
    [NSThread sleepForTimeInterval:0.01f];
  
  [[self webView] performSelectorOnMainThread:selector
                                   withObject:value
                                waitUntilDone:YES];

  NSLog(@"loading %d", [[self webView] isLoading]);
  
  if (wait)
    [self waitForLoad];
}

// Get the specified URL and block until it's finished loading.
- (void)setURL:(NSDictionary *)urlMap {
  NSString *urlString = (NSString*) [urlMap objectForKey:@"url"];
  NSURLRequest *url = [NSURLRequest requestWithURL:[NSURL URLWithString:urlString]
                                       cachePolicy:cachePolicy_
                                   timeoutInterval:60];
  
  [self performSelectorOnView:@selector(loadRequest:)
                   withObject:url
                waitUntilLoad:YES];
}

- (void)back {
  [self describeLastAction:@"back"];
  [self performSelectorOnView:@selector(goBack)
                   withObject:nil
                waitUntilLoad:YES];
}

- (void)forward {
  [self describeLastAction:@"forward"];
  [self performSelectorOnView:@selector(goForward)
                   withObject:nil
                waitUntilLoad:YES];
}

- (void)refresh {
  [self describeLastAction:@"refresh"];
  [self performSelectorOnView:@selector(reload)
                   withObject:nil
                waitUntilLoad:YES];
}

- (id)visible {
  // The WebView is always visible.
  return [NSNumber numberWithBool:YES];  
}

// Ignored.
- (void)setVisible:(NSNumber *)target {
}

// Execute js in the main thread and set lastJSResult_ appropriately.
// This function must be executed on the main thread. Its designed to be called
// using performSelectorOnMainThread:... which doesn't return a value - so
// the return value is passed back through a class parameter.
- (void)jsEvalInternal:(NSString *)script {
  // We wrap the eval command in a CATransaction so that we can explicitly
  // force any UI updates that might occur as a side effect of executing the
  // javascript to finish rendering before we return control back to the HTTP
  // server thread. We actually found some cases where the rendering was
  // finishing before control returned and so the core animation framework would
  // defer committing its implicit transaction until the next iteration of the
  // HTTP server thread's run loop. However, because you're only allowed to
  // update the UI on the main application thread, committing it on the HTTP
  // server thread would cause the whole application to crash.
  // This feels like it shouldn't be necessary but it was the only way we could
  // find to avoid the problem.
  [CATransaction begin];
  [lastJSResult_ release];
  lastJSResult_ = [[[self webView]
                   stringByEvaluatingJavaScriptFromString:script] retain];
  [CATransaction commit];

  NSLog(@"jsEval: %@ -> %@", script, lastJSResult_);
}

// Evaluate the given JS format string & arguments. Argument list is the same
// as [NSString stringWithFormat:...].
- (NSString *)jsEval:(NSString *)format, ... {
  if (format == nil) {
    [NSException raise:@"invalidArguments" format:@"Invalid arguments for jsEval"];
  }
  
  va_list argList;
  va_start(argList, format);
  NSString *script = [[[NSString alloc] initWithFormat:format
                                             arguments:argList]
                      autorelease];
  va_end(argList);

  [self performSelectorOnMainThread:@selector(jsEvalInternal:)
                         withObject:script
                      waitUntilDone:YES];
  
  return [[lastJSResult_ copy] autorelease];
}

- (NSString *)jsEvalAndBlock:(NSString *)format, ... {
  if (format == nil) {
    [NSException raise:@"invalidArguments" format:@"Invalid arguments for jsEval"];
  }
  
  va_list argList;
  va_start(argList, format);
  NSString *script = [[[NSString alloc] initWithFormat:format
                                             arguments:argList]
                      autorelease];
  va_end(argList);
  
  NSString *result = [self jsEval:@"%@", script];
  
  [self waitForLoad];
  
  return result;
}


- (BOOL)testJsExpression:(NSString *)format, ... {
  if (format == nil) {
    [NSException raise:@"invalidArguments" format:@"Invalid arguments for jsEval"];
  }
  
  va_list argList;
  va_start(argList, format);
  NSString *script = [[[NSString alloc] initWithFormat:format
                                             arguments:argList]
                      autorelease];
  va_end(argList);
  
  return [[self jsEval:@"!!(%@)", script] isEqualToString:@"true"];
}

- (float)floatProperty:(NSString *)property ofObject:(NSString *)jsObject {
  return [[self jsEval:@"%@.%@", jsObject, property] floatValue];
}

- (BOOL)jsElementIsNullOrUndefined:(NSString *)expression {
  NSString *isNull = [self jsEval:@"%@ === null || %@ === undefined",
                                   expression, expression];
  return [isNull isEqualToString:@"true"];
}

- (NSString *)currentTitle {
  return [self jsEval:@"document.title"];
}

- (NSString *)source {
  return [self jsEval:@"(function() {\n"
                       "  var div = document.createElement('div');\n"
                       "  div.appendChild(document.documentElement.cloneNode(true));\n"
                       "  return div.innerHTML;\n"
                       "})();"];
}

// Takes a screenshot.
- (UIImage *)screenshot {
  UIGraphicsBeginImageContext([[self webView] bounds].size);
  [[self webView].layer renderInContext:UIGraphicsGetCurrentContext()];
  UIImage *viewImage = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
  
  // dump the screenshot into a file for debugging
  //NSString *path = [[[NSSearchPathForDirectoriesInDomains
  //   (NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0]
  //  stringByAppendingPathComponent:@"screenshot.png"] retain];
  //[UIImagePNGRepresentation(viewImage) writeToFile:path atomically:YES];
  
  return viewImage;
}

- (NSString *)URL {
  return [self jsEval:@"window.location.href"];
}

- (void)describeLastAction:(NSString *)status {
  [statusLabel_ setText:status];
}

- (CGRect)viewableArea {
  CGRect area;
  area.origin.x = [[self jsEval:@"window.pageXOffset"] intValue];
  area.origin.y = [[self jsEval:@"window.pageYOffset"] intValue];
  area.size.width = [[self jsEval:@"window.innerWidth"] intValue];
  area.size.height = [[self jsEval:@"window.innerHeight"] intValue];
  return area;
}

- (BOOL)pointIsViewable:(CGPoint)point {
//  NSLog(@"bounds: %@", NSStringFromCGRect([[self webView] bounds]));
  return CGRectContainsPoint([self viewableArea], point);
}

// Scroll to make the given point centered on the screen (if possible).
- (void)scrollIntoView:(CGPoint)point {
  // Webkit will clip the given point if it lies outside the window.
  // It may be necessary at some stage to do this using touches.
  [self jsEval:@"window.scroll(%f - window.innerWidth / 2, %f - window.innerHeight / 2);", point.x, point.y];
}

// Translate pixels in webpage-space to pixels in view space.
- (CGPoint)translatePageCoordinateToView:(CGPoint)point {
  CGRect viewBounds = [[self webView] bounds];
  CGRect pageBounds = [self viewableArea];
  
  // ... And then its just a linear transformation.
  float scale = viewBounds.size.width / pageBounds.size.width;
  CGPoint transformedPoint;
  transformedPoint.x = (point.x - pageBounds.origin.x) * scale;
  transformedPoint.y = (point.y - pageBounds.origin.y) * scale;
  
  NSLog(@"%@ -> %@",
        NSStringFromCGPoint(point),
        NSStringFromCGPoint(transformedPoint));
  
  return transformedPoint;
}

- (void)clickOnPageElementAt:(CGPoint)point {
  if (![self pointIsViewable:point]) {
    [self scrollIntoView:point];
  }
  
  CGPoint pointInViewSpace = [self translatePageCoordinateToView:point];
  
  NSLog(@"simulating a click at %@", NSStringFromCGPoint(pointInViewSpace));
  [[self webView] simulateTapAt:pointInViewSpace];
}

// I don't know why, but this doesn't work in the current version of
// mobile safari. (2.2 firmware)
- (void)addFirebug {
  // This is the http://getfirebug.com/lite.html bookmarklet
  [self jsEval:
  @"var firebug=document.createElement('script');\r"
   "firebug.setAttribute('src','http://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js');\r"
   "document.body.appendChild(firebug);\r"
   "(function() {\r"
   "  if(window.firebug.version) {\r"
   "    firebug.init();\r"
   "  } else {\r"
   "  setTimeout(arguments.callee);\r"
   "  }\r"
   "})();"];
}

@end
