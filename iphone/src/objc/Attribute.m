//
//  Attribute.m
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

#import "Attribute.h"
#import "WebDriverResource.h"
#import "Element.h"
#import "WebDriverResponse.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "HTTPStaticResource.h"
#import "WebViewController.h"

@implementation Attribute

- (id)initForElement:(Element *)element {
  if (![super init])
    return nil;
  
  // Not retained as per delegate pattern - avoids circular dependancies.
  element_ = element;
  
  return self;
}

+ (Attribute *)attributeDirectoryForElement:(Element *)element {
  return [[[Attribute alloc] initForElement:element] autorelease];
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  NSString *queriedAttribute = [query substringFromIndex:1];
  id<HTTPResource> resource;
  @try {
    NSString *attribute = [element_ attribute:queriedAttribute];
    resource = [HTTPStaticResource resourceWithResponse:
                [WebDriverResponse responseWithValue:attribute]];
  }
  @catch (NSException* e) {
    resource = [HTTPStaticResource resourceWithResponse:
                [WebDriverResponse responseWithError:e]];
  }
  return resource;
}

@end
