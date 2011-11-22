//
//  HTTPVirtualDirectory+ExecuteScript.m
//  iWebDriver
//
//  Copyright 2010 WebDriver committers
//  Copyright 2010 Google Inc.
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

#import "HTTPVirtualDirectory+ExecuteScript.h"

#include <string>
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "NSException+WebDriver.h"
#import "NSObject+SBJSON.h"
#import "WebViewController.h"
#include "atoms.h"
#include "errorcodes.h"


@interface SimpleObserver : NSObject {
  NSDictionary* data_;
}

+(SimpleObserver*) simpleObserverForAction:(NSString*) action
                                 andSender:(id)notificationSender;

-(id) initObserverForAction:(NSString*)action
                  andSender:(id)notificationSender;

-(void) onNotification:(NSNotification*)notification;
-(NSDictionary*) waitForData;

@end

@implementation SimpleObserver

-(id) initObserverForAction:(NSString*)action
                  andSender:(id)notificationSender {
  if (![super init]) {
    return nil;
  }
  data_ = nil;
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(onNotification:)
                                               name:action
                                             object:notificationSender];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(onPageLoad:)
                                               name:@"webdriver:pageLoad"
                                             object:notificationSender];
  return self;
}

- (void) dealloc {
  [data_ release];
  [super dealloc];
}


+(SimpleObserver*) simpleObserverForAction:(NSString*) action
                                 andSender:(id)sender {
  return [[[SimpleObserver alloc] initObserverForAction:action
                                              andSender:sender] autorelease];
}

-(void) onPageLoad:(NSNotification*)notification {
  @synchronized(self) {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    NSLog(@"[SimpleObserver onPageLoad:]");
    NSDictionary* value = [NSDictionary
        dictionaryWithObject:@"Page load detected; async scripts did not work "
                              "across page loads"
        forKey:@"message"];
    data_ = [NSDictionary dictionaryWithObjectsAndKeys:
        [NSNumber numberWithInt:EUNHANDLEDERROR], @"status",
        value, @"value",
        nil];
    [data_ retain];
  }
}

-(void) onNotification:(NSNotification*)notification {
  @synchronized(self) {
    NSLog(@"[SimpleObserver onNotification:]");
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    data_ = [[notification userInfo] retain];
  }
}

-(NSDictionary*) waitForData {
  while (true) {
    @synchronized(self) {
      if (data_ != nil) {
        // If data_ is not nil, then we've already removed ourselves as an
        // observer.
        return data_;
      }
    }
    [NSThread sleepForTimeInterval:0.25];
  }
}

@end


@implementation HTTPVirtualDirectory (ExecuteScript)

-(id) executeAtom:(const char* const[])atom
         withArgs:(NSArray*) args {
  std::string compiled("");
  for (size_t i = 0; atom[i] != NULL; i++) {
    compiled.append(atom[i]);
  }
  
	return [self executeJsFunction:[NSString stringWithCString:compiled.c_str() encoding:NSUTF8StringEncoding]
                        withArgs:args];
}

-(id) verifyResult:(NSDictionary*)resultDict {
  int status = [(NSNumber*) [resultDict objectForKey:@"status"] intValue];
  if (status != SUCCESS) {
    NSDictionary* value = (NSDictionary*) [resultDict objectForKey:@"value"];
    NSString* message = (NSString*) [value objectForKey:@"message"];
    @throw [NSException webDriverExceptionWithMessage:message
                                        andStatusCode:status];
  }
  return [resultDict objectForKey:@"value"];
}

-(id) executeScript:(NSString*)script
           withArgs:(NSArray*)args {
  std::string compiled("");
  for (size_t i = 0; webdriver::atoms::EXECUTE_SCRIPT[i] != NULL; i++) {
    compiled.append(webdriver::atoms::EXECUTE_SCRIPT[i]);
  }
	
  NSString* result = [[self viewController] jsEval:@"(%@)(%@,%@,true)",
      [NSString stringWithCString:compiled.c_str() encoding:NSUTF8StringEncoding],
      script,
      [args JSONRepresentation]];
  NSLog(@"Got result: %@", result);

  NSDictionary* resultDict = (NSDictionary*) [result JSONValue];
  return [self verifyResult:resultDict];
}

-(id) executeJsFunction:(NSString*)script
               withArgs:(NSArray*)args {
  return [self executeScript:script withArgs:args];
}

-(id) executeAsyncJsFunction:(NSString*)script
                    withArgs:(NSArray*)args
                 withTimeout:(NSTimeInterval)timeout {
  // The |WebViewController| will broadcast a |webdriver:executeAsyncScript|
  // notification when the web view tries to load a URL of the form:
  // webdriver://executeAsyncScript?query.
  // The |EXECUTE_ASYNC_SCRIPT| loads this URL to notify that it has finished,
  // encoding its response in the query string.
  SimpleObserver* observer =
      [SimpleObserver simpleObserverForAction:@"webdriver:executeAsyncScript"
                                    andSender:[self viewController]];

  std::string compiled("");
  for (size_t i = 0; webdriver::atoms::EXECUTE_ASYNC_SCRIPT[i] != NULL; i++) {
    compiled.append(webdriver::atoms::EXECUTE_ASYNC_SCRIPT[i]);
  }
	
  [[self viewController] jsEval:@"(%@)(function(){%@\n},%@,%@)",
       [NSString stringWithCString:compiled.c_str() encoding:NSUTF8StringEncoding],
       script,
       [args JSONRepresentation],
       [NSNumber numberWithDouble:timeout * 1000]];

  NSDictionary* resultDict = [observer waitForData];

  NSLog(@"Got result: %@", [resultDict JSONRepresentation]);
  return [self verifyResult:resultDict];
}

@end
