//
//  FrameContext.m
//  iWebDriver
//
//  Created by Luke Inman-Semerau on 1/20/12.
//  Copyright (c) 2012 Software Freedom Conservancy
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

#import "FrameContext.h"

@implementation FrameContext

// Apologies to all those who know Obj-C way better.
// This was to have a global variable that's an NSMutableArray
// I would much prefer this to be on the Session object and then fetched
// via WebViewController, but alas WVC doesn't have access to the Session
// object and it would be a significant effort to make it available.
static FrameContext *singleton = nil;

+(FrameContext*) sharedInstance {
  if (singleton == nil) {
    singleton = [[NSMutableArray alloc] init];
  }
  
  return singleton;
}

@end
