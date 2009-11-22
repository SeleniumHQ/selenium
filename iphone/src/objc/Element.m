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
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "Element+FindElement.h"
#import "Attribute.h"
#import "MainViewController.h"
#import "WebViewController.h"
#import "NSString+SBJSON.h"
#import "NSException+WebDriver.h"

@implementation Element

@synthesize elementId = elementId_;

- (id)initWithId:(NSString *)elementId inStore:(ElementStore *)store {
  if (![super init])
    return nil;
  
  elementId_ = [elementId copy];
  
  // Note that this is not retained as per delegate pattern.
  elementStore_ = store;

  [self setMyWebDriverHandlerWithGETAction:NULL
                                POSTAction:@selector(click:)
                                  withName:@"click"];
//  [self setMyWebDriverHandlerWithGETAction:NULL
//                                POSTAction:@selector(clickSimulate:)
//                                  withName:@"click"];
  
  [self setMyWebDriverHandlerWithGETAction:NULL
                                POSTAction:@selector(clearWrapper:)
                                  withName:@"clear"];
  
  [self setMyWebDriverHandlerWithGETAction:NULL
                                POSTAction:@selector(submitWrapper:)
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
    
  [self addSearchSubdirs];
  
  [self setResource:[Attribute attributeDirectoryForElement:self]
           withName:@"attribute"];
  
  return self;
}

- (void)dealloc {
  [elementId_ release];
  [super dealloc];
}

+ (Element *)elementFromJSObject:(NSString *)object
                         inStore:(ElementStore *)store {
  return [store elementFromJSObject:object];
}

// Same as |elementFromJSObject:inStore:| above, but using the element's store.
- (Element *)elementFromJSObject:(NSString *)object {
  return [Element elementFromJSObject:object inStore:elementStore_];
}

// This method returns the string representation of a javascript object.
- (NSString *)jsLocator {
  return [elementStore_ jsLocatorForElement:self];
}

// Is this element a (/the) document?
- (BOOL)isDocumentElement {
  if ([elementId_ isEqualToString:@"0"]) {
    return YES;
  } else {
  // I have no idea how to clean this indenting - It looks like lisp.
    return [[[self viewController]
             jsEval:@"%@ instanceof HTMLDocument", [self jsLocator]]
            isEqualToString:@"true"];
  }
}

// Get the element's URL relative to the context.
- (NSString *)url {
  return [NSString stringWithFormat:@"element/%@", [self elementId]];
}

#pragma mark Webdriver methods

- (void)click:(NSDictionary *)dict {
  // TODO: Get the pixel coordinates and simulate a tap. Wait for page to
  // load before continuing.
  NSString *locator = [self jsLocator];
  [[self viewController] jsEvalAndBlock:
   @"if (%@['click'])\r"
    "%@.click();\r"
    "var event = document.createEvent('MouseEvents');\r"
    "event.initMouseEvent('click', true, true, null, 1, 0, 0, 0, 0, false,"
         "false, false, false, 0, null);\r"
    "%@.dispatchEvent(event);\r",
                       locator, locator, locator];
}

// This returns the pixel position of the element on the page in page
// coordinates.
- (CGPoint)location {
  NSString *container = @"_WEBDRIVER_pos";
  [[self viewController] jsEval:
  @"var locate = function(elem) {\r"
  "  var x = 0, y = 0;\r"
  "  while (elem && elem.offsetParent) {\r"
  "    x += elem.offsetLeft;\r"
  "    y += elem.offsetTop;\r"
  "    elem = elem.offsetParent;\r"
  "  }\r"
  "  return {x: x, y: y};\r"
  "};\r"
  "var %@ = locate(%@);", container, [self jsLocator]];

  float x = [[self viewController] floatProperty:@"x" ofObject:container];
  float y = [[self viewController] floatProperty:@"y" ofObject:container];
  
  return CGPointMake(x, y);
}

// Fetches the size of the element in page coordinates.
- (CGSize)size {
  float width = [[[self viewController] jsEval:@"%@.offsetWidth",
                  [self jsLocator]] 
                 floatValue];
  float height = [[[self viewController] jsEval:@"%@.offsetHeight",
                   [self jsLocator]] 
                  floatValue];
 
  return CGSizeMake(width, height);
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

- (void)clear {
  NSString *locator = [self jsLocator];
  [[self viewController] jsEval:[NSString stringWithFormat:
  @"if (%@['value']) { %@.value = ''; }\r"
   "else { %@.setAttribute('value', ''); }",
                                 locator, locator, locator]];
}

- (void)clearWrapper:(NSDictionary *)ignored {
  return [self clear];
}

- (void)submit {
  NSString *locator = [self jsLocator];
  [[self viewController] jsEvalAndBlock:[NSString stringWithFormat:
    @"if (%@ instanceof HTMLFormElement) %@.submit(); else %@.form.submit();",
                                 locator, locator, locator]];
}
- (void)submitWrapper:(NSDictionary *)ignored {
  return [self submit];
}

- (NSString *)text {
  return [[[self viewController] jsEval:[NSString stringWithFormat:
                                        @"%@.innerText", [self jsLocator]]]
          stringByTrimmingCharactersInSet:
            [NSCharacterSet whitespaceAndNewlineCharacterSet]];
}

- (void)sendKeys:(NSDictionary *)dict {
  [[self viewController] 
   jsEval:[NSString stringWithFormat:@"%@.value=\"%@\"", [self jsLocator], [[dict objectForKey:@"value"] componentsJoinedByString:@""]]];	
}

- (NSString *)value {
  return [[self viewController]
          jsEval:[NSString stringWithFormat:@"%@.value", [self jsLocator]]];
}

// This method is only valid on checkboxes and radio buttons.
// TODO(josephg): Check that the element is a checkbox or radio button
- (NSNumber *)isChecked {
  BOOL checked = [[[self viewController]
                   jsEval:[NSString stringWithFormat:@"%@.checked",
                           [self jsLocator]]] isEqualToString:@"true"];
  
  return [NSNumber numberWithBool:checked];
}

// This method is only valid on option elements, checkboxes and radio buttons.
- (void)setChecked:(NSNumber *)numValue {
  NSString *locator = [self jsLocator];
  
  [[self viewController] jsEval:[NSString stringWithFormat:
      @"if (%@ instanceof HTMLOptionElement) {\r"
          "%@.selected = true;\r"
          "%@.parentNode.onchange();\r"
       "} else {\r"
          "%@.checked = true;\r"
       "}",
      locator, locator, locator, locator]];
}

// Like |checked| above, we should check that the element is valid.
- (void)toggleSelected {
  NSString *jsLocator = [self jsLocator];
  [[self viewController] jsEval:[NSString
                stringWithFormat:@"%@.focus(); %@.checked = !%@.checked",
                                 jsLocator, jsLocator, jsLocator]];
}

- (NSNumber *)isEnabled {
  BOOL enabled = [[[self viewController]
                  jsEval:[NSString stringWithFormat:@"%@.disabled",
                          [self jsLocator]]] isEqualToString:@"false"];
  
  return [NSNumber numberWithBool:enabled];
}

- (NSNumber *)isDisplayed {
  @throw [NSException webDriverExceptionWithMessage:@"Not Implemented"
                                     webDriverClass:nil];
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
- (NSString *)attribute:(NSString *)name {
  return [[self viewController] jsEval:
          @"%@.getAttribute('%@')",
          [self jsLocator],
          name];
}

// Get the tag name of this element, not the value of the name attribute:
// will return "input" for the element <input name="foo">
- (NSString *)name {
  return [[[self viewController] jsEval:
          @"%@.nodeName",
          [self jsLocator]] lowercaseString];
}

@end
