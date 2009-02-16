//
//  Attribute.h
//  iWebDriver
//
//  Created by Joseph Gentle on 1/12/09.
//  Copyright 2009 Google Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HTTPVirtualDirectory.h"

@class Element;

// This represents the element/:elementId/attribute virtual directory.
@interface Attribute : HTTPVirtualDirectory {
  Element *element_;
}

+ (Attribute *)attributeDirectoryForElement:(Element *)element;

// Designated initialiser. Does not retain the element as per
// parent retain pattern.
- (id)initForElement:(Element *)element;

@end
