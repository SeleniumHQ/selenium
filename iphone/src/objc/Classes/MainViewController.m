//
//  MainViewController.m
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

#import "MainViewController.h"
#import "MainView.h"
#import "HTTPServerController.h"

static MainViewController *singleton_;

@implementation MainViewController

@synthesize webView;
@synthesize webViewController;

- (void)viewDidLoad {
  [super viewDidLoad];
  singleton_ = self;
  [webView setScalesPageToFit:NO];
  webViewController = [[WebViewController alloc] init];
  [webView setDelegate:webViewController];
  
  if ([webView respondsToSelector:@selector(mediaPlaybackRequiresUserAction)]) {
    [webView setMediaPlaybackRequiresUserAction:NO];
  }
  [webView loadHTMLString:@"" baseURL:nil];
  [statusLabel_ setAdjustsFontSizeToFitWidth:YES];
  
}

// Override to allow orientations other than the default portrait orientation.
- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
  // We support orientation changes.
  return YES;
}

- (void)didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
}

- (void)dealloc {
  [webView release];
  [webViewController dealloc];
  [super dealloc];
}

- (void)describeLastAction:(NSString *)status {
  [statusLabel_ setText:status];
}

+ (MainViewController *)sharedInstance {
  return singleton_;
}

- (void)viewDidUnload {
    [webView release];
    webView = nil;
    [super viewDidUnload];
}
@end
