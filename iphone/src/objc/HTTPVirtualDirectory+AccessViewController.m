//
//  VirtualDirectory+AccessViewController.m
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

#import "HTTPVirtualDirectory+AccessViewController.h"
#import "HTTPServerController.h"

@implementation HTTPVirtualDirectory (AccessViewController)

- (WebViewController *)viewController {
  // This is a somewhat ugly implementation. It is implemented like this so
  // if we have multiple view controllers (eg, tabs), all VirtualDirectory
  // access of the viewController can be easily changed.
  return [[HTTPServerController sharedInstance] viewController];
}

@end
