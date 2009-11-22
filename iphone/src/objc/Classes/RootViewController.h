//
//  RootViewController.h
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

@class MainViewController;
@class FlipsideViewController;

// |RootViewController| manages the two views and controllers. It is mostly
// standard apple template code.
@interface RootViewController : UIViewController {
  // The button which switches views
  UIButton *infoButton;
  MainViewController *mainViewController;
  FlipsideViewController *flipsideViewController;
  UINavigationBar *flipsideNavigationBar;
  UISwitch *swAuto;
  UILabel *lblAutoSession;
}

@property (nonatomic, retain) IBOutlet UIButton *infoButton;
@property (nonatomic, retain) MainViewController *mainViewController;
@property (nonatomic, retain) UINavigationBar *flipsideNavigationBar;
@property (nonatomic, retain) FlipsideViewController *flipsideViewController;
@property (nonatomic, retain) UISwitch *swAuto;
@property (nonatomic, retain) UILabel *lblAutoSession;

- (IBAction)toggleView;
- (IBAction)toggleAutoCreateSession;

// Access the singleton object.
+ (RootViewController *)sharedInstance;

- (BOOL) isAutoCreateSession;

@end
