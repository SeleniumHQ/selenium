//
//  Css.m
//  iWebDriver
//
//  Copyright 2011 Google Inc.
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

#import "Css.h"
#import "WebDriverResource.h"
#import "Element.h"
#import "WebDriverResponse.h"
#import "HTTPVirtualDirectory+ExecuteScript.h"
#import "HTTPStaticResource.h"
#import "WebViewController.h"

@implementation Css

- (id)initForElement:(Element *)element {
  if (![super init])
    return nil;
  
  // Not retained as per delegate pattern - avoids circular dependancies.
  element_ = element;
  
  return self;
}

+ (Css *)cssDirectoryForElement:(Element *)element {
  return [[[Css alloc] initForElement:element] autorelease];
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  if ([query length] > 0) {
    NSString *queriedAttribute = [query substringFromIndex:1];
    id<HTTPResource> resource = [contents objectForKey:queriedAttribute];
    if (resource == nil) {
      resource = [NamedCssProperty
                  namedCssPropertyDirectoryForElement:element_
                  andName:queriedAttribute];
      [self setResource:resource withName:queriedAttribute];
    }
  }
  // Need to delegate back to |super| so |Session| can set the session ID on
  // the response.
  return [super elementWithQuery:query];
}

@end

@implementation NamedCssProperty

- (id) initForElement:(Element *)element
              andName:(NSString *)name {
  if (![super init]) {
    return nil;
  }
  // Not retained as per delegate pattern - avoids circular dependancies.
  element_ = element;
  name_ = name;
  
  [self setIndex:
   [WebDriverResource resourceWithTarget:self
                               GETAction:@selector(getProperty)
                              POSTAction:NULL
                               PUTAction:NULL
                            DELETEAction:NULL]];
  return self;
}

+ (NamedCssProperty *)namedCssPropertyDirectoryForElement:(Element *)element
                                                  andName:(NSString *)name {
  return [[[NamedCssProperty alloc] initForElement:element andName:name]
          autorelease];
}

- (NSString*)getProperty {
  return [element_ css:name_];
}

@end


