//
//  iWebDriverAppDelegate.m
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

#import "iWebDriverAppDelegate.h"
#import "RootViewController.h"

@implementation iWebDriverAppDelegate

@synthesize window = window_;
@synthesize rootViewController = rootViewController_;

- (void)applicationDidFinishLaunching:(UIApplication *)application {
  CGRect rect = [[UIScreen mainScreen] bounds];
  [window_ setFrame:rect];
  [window_ setRootViewController:rootViewController_];
  [window_ makeKeyAndVisible];
}

- (void)dealloc {
  [rootViewController_ release];
  [window_ release];
  [super dealloc];
}

@end
