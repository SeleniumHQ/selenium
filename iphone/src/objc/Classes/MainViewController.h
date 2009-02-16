//
//  MainViewController.h
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
#import "WebViewController.h"

// |MainViewController| is the |UIViewController| responsible for the main
// view. The view contains a |UIWebView and a |UILabel| for status display.
// The class is singleton. The singleton instance can be accessed with
// [MainViewController sharedInstance];
// The UI element definitions are contained in MainView.xib.
@interface MainViewController : UIViewController {
  IBOutlet WebViewController *webViewController;
  IBOutlet UILabel *statusLabel_;
}

@property (nonatomic, retain) WebViewController *webViewController;

// Set the current status text.
- (void)describeLastAction:(NSString *)status;

// Access the singleton object.
+ (MainViewController *)sharedInstance;

@end
