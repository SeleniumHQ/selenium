//
//  ElementStore+FindElement.m
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

#import "ElementStore+FindElement.h"
#import "Element+FindElement.h"
#import "NSException+WebDriver.h"

@implementation ElementStore (FindElement)

- (NSArray *)findElementsByMethod:(NSString *)method query:(NSString *)query {
  // Just forward the request to the document element.
  return [[self document] findElementsByMethod:method query:query];
}

// This method is the same as above, but it only returns one value.
// I'm not sure why it returns that single value in an array, but thats the
// spec.
- (NSArray *)findElementByMethod:(NSString *)method query:(NSString *)query {
  NSArray *allElements = [self findElementsByMethod:method query:query];
  if (allElements != nil && [allElements count] >= 1)
    return [NSArray arrayWithObject:[allElements objectAtIndex:0]];
  else
    @throw([NSException webDriverExceptionWithMessage:@"Unable to locate element"
                                       webDriverClass:@"org.openqa.selenium.NoSuchElementException"]);
}

@end
