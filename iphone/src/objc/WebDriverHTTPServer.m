//
//  WebDriverHTTPServer.m
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

#import "WebDriverHTTPServer.h"


@implementation WebDriverHTTPServer

- (id)init {
  if (![super init])
    return nil;
  
  // Forks connection pool thread.
  [NSThread detachNewThreadSelector:@selector(connectionThread)
                           toTarget:self
                         withObject:self];
  
  return self;
}

// This code is based on the CocoaHTTPServer's ThreadPoolServer example.
- (void)connectionThread {
  NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
  
  // We can't run the run loop unless it has an associated input source or
  // a timer. So we'll just create a timer that will never fire - unless the
  // server runs for 10,000 years.
  [NSTimer scheduledTimerWithTimeInterval:DBL_MAX
                                   target:self
                                 selector:@selector(ignore:)
                                 userInfo:nil
                                  repeats:NO];
  
  runLoop_ = [NSRunLoop currentRunLoop];
  [runLoop_ run];
  
  [pool release];
}

- (NSRunLoop *)onSocket:(AsyncSocket *)sock wantsRunLoopForNewSocket:(AsyncSocket *)newSocket {
  return runLoop_;
}

@end
