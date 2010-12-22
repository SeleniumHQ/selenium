//
//  Element.m
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


#import "Element.h"
#import "JSONRESTResource.h"
#import "HTTPRedirectResponse.h"
#import "ElementStore.h"
#import "WebDriverResource.h"
#import "HTTPVirtualDirectory+ExecuteScript.h"
#import "HTTPVirtualDirectory+FindElement.h"
#import "Attribute.h"
#import "MainViewController.h"
#import "WebViewController.h"
#import "NSString+SBJSON.h"
#import "NSException+WebDriver.h"
#import "Session.h"
#include "atoms.h"
#import "errorcodes.h"

static NSString* const kElementIdKey = @"ELEMENT";

@implementation Element

@synthesize elementId = elementId_;
@synthesize session = session_;

- (id)initWithId:(NSString *)elementId
      andSession:(Session*)session {
  if (![super init]) {
    return nil;
  }
  
  elementId_ = [elementId copy];
  session_ = session;
  
  [self setResource:[WebDriverResource
                        resourceWithTarget:self
                                 GETAction:NULL
                                POSTAction:@selector(findElement:)]
              withName:@"element"];

  [self setResource:[WebDriverResource
                        resourceWithTarget:self
                                 GETAction:NULL
                                POSTAction:@selector(findElements:)]
              withName:@"elements"];

  [self setMyWebDriverHandlerWithGETAction:NULL
                                POSTAction:@selector(click:)
                                  withName:@"click"];
//  [self setMyWebDriverHandlerWithGETAction:NULL
//                                POSTAction:@selector(clickSimulate:)
//                                  withName:@"click"];
  
  [self setMyWebDriverHandlerWithGETAction:NULL
                                POSTAction:@selector(clear:)
                                  withName:@"clear"];
  
  [self setMyWebDriverHandlerWithGETAction:NULL
                                POSTAction:@selector(submit:)
                                  withName:@"submit"];
  
  [self setMyWebDriverHandlerWithGETAction:@selector(text)
                                POSTAction:NULL
                                  withName:@"text"];
  
  [self setMyWebDriverHandlerWithGETAction:@selector(value)
                                POSTAction:@selector(sendKeys:)
                                  withName:@"value"];
  
  [self setMyWebDriverHandlerWithGETAction:@selector(isChecked)
                                POSTAction:@selector(setChecked:)
                                  withName:@"selected"];
  
  [self setMyWebDriverHandlerWithGETAction:@selector(isEnabled)
                                POSTAction:NULL
                                  withName:@"enabled"];
  
  [self setMyWebDriverHandlerWithGETAction:@selector(isDisplayed)
                                POSTAction:NULL
                                  withName:@"displayed"];
  
  [self setMyWebDriverHandlerWithGETAction:@selector(locationAsDictionary)
                                POSTAction:NULL
                                  withName:@"location"];

  [self setMyWebDriverHandlerWithGETAction:@selector(sizeAsDictionary)
                                POSTAction:NULL
                                  withName:@"size"];
  
  [self setMyWebDriverHandlerWithGETAction:@selector(name) 
                                POSTAction:NULL
                                  withName:@"name"];
    
  [self setResource:[Attribute attributeDirectoryForElement:self]
           withName:@"attribute"];
  
  return self;
}

- (void)dealloc {
  [elementId_ release];
  [super dealloc];
}

+ (Element *)elementWithId:(NSString *)elementId
                andSession:(Session*)session {
  return [[[Element alloc] initWithId:elementId
                           andSession:session] autorelease];
}

- (NSDictionary *)idDictionary {
  return [NSDictionary dictionaryWithObjectsAndKeys:
          [self elementId], kElementIdKey,
          nil];
}

#pragma mark Webdriver methods

-(NSDictionary*) findElement:(NSDictionary*)query {
  return [self findElement:query
                      root:[self idDictionary]
            implicitlyWait:[session_ implicitWait]];
}

-(NSArray*) findElements:(NSDictionary*)query {
  return [self findElements:query
                       root:[self idDictionary]
             implicitlyWait:[session_ implicitWait]];
}

- (void)click:(NSDictionary*)ignored {
  [self executeAtom:webdriver::CLICK
           withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

// This returns the pixel position of the element on the page in page
// coordinates.
- (CGPoint)location {
  NSDictionary* result = (NSDictionary*)
      [self executeAtom:webdriver::GET_LOCATION
               withArgs:[NSArray arrayWithObject:[self idDictionary]]];

  NSNumber* x = [result objectForKey:@"x"];
  NSNumber* y = [result objectForKey:@"y"];

  return CGPointMake([x floatValue], [y floatValue]);
}

// Fetches the size of the element in page coordinates.
- (CGSize)size {
  NSDictionary* result = (NSDictionary*) [self
      executeJsFunction:@"function(){return {width:arguments[0].offsetWidth,"
                         "height:arguments[0].offsetHeight};}"
               withArgs:[NSArray arrayWithObject:[self idDictionary]]];

  NSNumber* width = [result objectForKey:@"width"];
  NSNumber* height = [result objectForKey:@"height"];

  return CGSizeMake([width floatValue], [height floatValue]);
}

// Fetches the bounds of the element in page coordinates. This is built from
// |size| and |location|.
- (CGRect)bounds {
  CGRect bounds;
  bounds.origin = [self location];
  bounds.size = [self size];
  return bounds;
}

- (void)clickSimulate:(NSDictionary *)dict {
  CGRect currentPosition = [self bounds];
  CGPoint midpoint = CGPointMake(CGRectGetMidX(currentPosition),
                                 CGRectGetMidY(currentPosition));
  [[[MainViewController sharedInstance] webViewController]
   clickOnPageElementAt:midpoint];
}

- (void)clear:(NSDictionary*)ignored {
  [self executeAtom:webdriver::CLEAR
           withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

- (void)submit:(NSDictionary*)ignored {
  [self executeAtom:webdriver::SUBMIT
           withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

- (NSString *)text {
  return (NSString*) [self
      executeAtom:webdriver::GET_TEXT
         withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

- (void)sendKeys:(NSDictionary *)dict {
  NSString* stringToType =
      [[dict objectForKey:@"value"] componentsJoinedByString:@""];
  [self executeAtom:webdriver::TYPE
           withArgs:[NSArray arrayWithObjects:[self idDictionary],
                                              stringToType, nil]];
}

- (NSString *)value {
  return (NSString*) [self
      executeJsFunction:@"function(){return arguments[0].value;}"
               withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

// This method is only valid on option elements, checkboxes and radio buttons.
- (NSNumber *)isChecked {
  return (NSNumber*) [self
      executeAtom:webdriver::IS_SELECTED
         withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

// This method is only valid on option elements, checkboxes and radio buttons.
- (void)setChecked:(NSDictionary*)ignored {
  [self executeAtom:webdriver::SET_SELECTED
           withArgs:[NSArray arrayWithObjects:
               [self idDictionary], [NSNumber numberWithBool:YES], nil]];
}

// Like |checked| above, we should check that the element is valid.
- (void)toggleSelected {
  [self executeAtom:webdriver::TOGGLE
           withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

- (NSNumber *)isEnabled {
  return (NSNumber*) [self
      executeAtom:webdriver::IS_ENABLED
         withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

- (NSNumber *)isDisplayed {
  return (NSNumber*) [self
      executeAtom:webdriver::IS_DISPLAYED
         withArgs:[NSArray arrayWithObject:[self idDictionary]]];
}

- (NSDictionary *)locationAsDictionary {
  CGPoint location = [self location];
  return [NSDictionary dictionaryWithObjectsAndKeys:
          [NSNumber numberWithFloat:location.x], @"x",
          [NSNumber numberWithFloat:location.y], @"y",
          nil];
}

- (NSDictionary *)sizeAsDictionary {
  CGSize size = [self size];
  return [NSDictionary dictionaryWithObjectsAndKeys:
          [NSNumber numberWithFloat:size.width], @"width",
          [NSNumber numberWithFloat:size.height], @"height",
          nil];  
}

// Get an attribute with the given name.
-(id) attribute:(NSString *)name {
  return [self executeAtom:webdriver::GET_ATTRIBUTE
                  withArgs:[NSArray arrayWithObjects:
                      [self idDictionary], name, nil]];
}

// Get the tag name of this element, not the value of the name attribute:
// will return "input" for the element <input name="foo">
- (NSString *)name {
  NSString* name = [self
      executeJsFunction:@"function(){return arguments[0].tagName;}"
               withArgs:[NSArray arrayWithObject:[self idDictionary]]];
  return [name lowercaseString];
}

@end
