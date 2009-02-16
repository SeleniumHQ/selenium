//
//  Attribute.m
//  iWebDriver
//
//  Created by Joseph Gentle on 1/12/09.
//  Copyright 2009 Google Inc. All rights reserved.
//

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

// Get an attribute with the given name.
- (NSString *)attribute:(NSString *)name {
  NSLog(@"attribute query: %@", name);
  NSString *query = [NSString stringWithFormat:
                     @"%@.getAttribute('%@')",
                     [element_ jsLocator],
                     name];
  return [[self viewController] jsEval:query];
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  NSString *queriedAttribute = [query substringFromIndex:1];
  NSString *attribute = [self attribute:queriedAttribute];
  return [HTTPStaticResource
          resourceWithResponse:[WebDriverResponse responseWithValue:attribute]];
}

@end
