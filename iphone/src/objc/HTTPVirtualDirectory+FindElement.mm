//
//  HTTPVirtualDirectory+FindElement.h
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

#import "HTTPVirtualDirectory+FindElement.h"

#import "HTTPVirtualDirectory+ExecuteScript.h"
#import "NSObject+SBJSON.h"
#import "NSException+WebDriver.h"
#include "atoms.h"
#include "errorcodes.h"

@implementation HTTPVirtualDirectory (FindElement)

// Converts an element |query| understood by the WebDriver wire protocol to a
// locator strategy supported by the browser automation atoms.
-(NSDictionary*) buildLocator:(NSDictionary*)query {
  NSString* wireStrategy = [query objectForKey:@"using"];
  NSString* value = [query objectForKey:@"value"];

  const NSDictionary* const wireProtocolToAtomStrategy =
      [NSDictionary dictionaryWithObjectsAndKeys:
          @"className", @"class name",
          @"css", @"css selector",
          @"linkText", @"link text",
          @"partialLinkText", @"partial link text",
          @"tagName", @"tag name",
          nil];

  NSString* atomsStrategy =
      [wireProtocolToAtomStrategy objectForKey:wireStrategy];
  if (atomsStrategy == nil) {
    atomsStrategy = wireStrategy;
  }
  return [NSDictionary dictionaryWithObject:value forKey:atomsStrategy];
}

-(NSDictionary*) findElement:(NSDictionary*)query
                        root:(NSDictionary*)elementId
              implicitlyWait:(NSTimeInterval)implicitWait {
  NSArray* args = [NSArray arrayWithObjects:[self buildLocator:query],
      elementId, nil];

  NSDate* startTime = [NSDate dateWithTimeIntervalSinceNow:0];
  while (true) {
    id result = [self executeAtom:webdriver::atoms::FIND_ELEMENT withArgs:args];

    if (![result isKindOfClass:[NSNull class]]) {
      return result;
    }

    NSDate* now = [NSDate dateWithTimeIntervalSinceNow:0];
    NSTimeInterval elapsedTime = [now timeIntervalSinceDate:startTime];
    if (elapsedTime > implicitWait) {
      @throw([NSException
          webDriverExceptionWithMessage:@"Unable to locate element"
          andStatusCode:ENOSUCHELEMENT]);
    } else {
      [NSThread sleepForTimeInterval:0.25];
    }
  }
}

-(NSArray*) findElements:(NSDictionary*)query
                    root:(NSDictionary*)elementId
          implicitlyWait:(NSTimeInterval)implicitWait {
  NSArray* args = [NSArray arrayWithObjects:[self buildLocator:query],
      elementId, nil];

  NSDate* startTime = [NSDate dateWithTimeIntervalSinceNow:0];

  while (true) {
    NSArray* result =
        (NSArray*) [self executeAtom:webdriver::atoms::FIND_ELEMENTS
                            withArgs:args];
    if ([result count] > 0) {
      return result;
    }

    NSDate* now = [NSDate dateWithTimeIntervalSinceNow:0];
    NSTimeInterval elapsedTime = [now timeIntervalSinceDate:startTime];
    if (elapsedTime > implicitWait) {
      return result;
    } else {
      [NSThread sleepForTimeInterval:0.25];
    }
  }
}


@end
