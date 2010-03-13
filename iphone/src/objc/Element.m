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
#import "errorcodes.h"

static NSString* const ELEMENT_ID_KEY = @"ELEMENT";

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

+ (NSString *)elementIdKey {
  return ELEMENT_ID_KEY;
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

- (NSDictionary *)idDictionary {
  return [NSDictionary dictionaryWithObjectsAndKeys:
          [self elementId], [Element elementIdKey],
          nil];
}

// Get the element's URL relative to the session.
- (NSString *)url {
  return [NSString stringWithFormat:@"element/%@", [self elementId]];
}

#pragma mark Webdriver methods

- (void)click:(NSDictionary *)dict {
  [self verifyIsDisplayed];
  // TODO: Get the pixel coordinates and simulate a tap. Wait for page to
  // load before continuing.
  NSString *locator = [self jsLocator];
  [[self viewController] jsEvalAndBlock:
   @"(function(element) {\n"
    "  function triggerMouseEvent(element, eventType) {\n"
    "    var event = element.ownerDocument.createEvent('MouseEvents');\n"
    "    var view = element.ownerDocument.defaultView;\n"
    "    event.initMouseEvent(eventType, true, true, view, 1, 0, 0, 0, 0,\n"
    "        false, false, false, false, 0, element);\n"
    "    element.dispatchEvent(event);\n"
    "  }\n"
    "  triggerMouseEvent(element, 'mouseover');\n"
    "  triggerMouseEvent(element, 'mousemove');\n"
    "  triggerMouseEvent(element, 'mousedown');\n"
    "  document.title = 'checking focus';\n"
    "  if (element.ownerDocument.activeElement != element) {\n"
    "    if (element.ownerDocument.activeElement) {\n"
    "      element.ownerDocument.activeElement.blur();\n"
    "    }\n"
    "    element.focus();\n"
    "  }\n"
    "  triggerMouseEvent(element, 'mouseup');\n"
    "  triggerMouseEvent(element, 'click');\n"
    "})(%@);\n", locator];
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
  [self verifyIsDisplayed];
  NSString *locator = [self jsLocator];
  [[self viewController] jsEval:
   [NSString stringWithFormat:
    @"(function(elem) {\n"
     "  if (((elem instanceof HTMLInputElement && elem.type == 'text') ||\n"
     "       elem instanceof HTMLTextAreaElement) && elem.value) {\n"
     "    elem.value = '';\n"
     "    var e = elem.ownerDocument.createEvent('HTMLEvents');\n"
     "    e.initEvent('change', true, true);\n"
     "    elem.dispatchEvent(e);\n"
     "  }\n"
     "})(%@);", locator]];
}

- (void)clearWrapper:(NSDictionary *)ignored {
  return [self clear];
}

- (void)submit {
  [self verifyIsDisplayed];
  NSString *locator = [self jsLocator];
  [[self viewController] jsEvalAndBlock:
   [NSString stringWithFormat:
    @"(function(elem) {\n"
    "  var current = elem;\n"
    "  while (current && current != elem.ownerDocument.body) {\n"
    "    if (current.tagName.toLowerCase() == 'form') {\n"
    "      var e = current.ownerDocument.createEvent('HTMLEvents');\n"
    "      e.initEvent('submit', true, true);\n"
    "      if (current.dispatchEvent(e)) {\n"
    "        current.submit();\n"
    "      }\n"
    "      return;\n"
    "    }\n"
    "    current = current.parentNode;\n"
    "  }\n"
    "})(%@);", locator]];
}
- (void)submitWrapper:(NSDictionary *)ignored {
  return [self submit];
}

- (NSString *)text {
  // TODO(webdriver-eng): Fix nbsp handling and hidden divs.
  return [[[self viewController] jsEval:[NSString stringWithFormat:
      @"%@.innerText.\r"
       "    replace(new RegExp(String.fromCharCode(160), 'gm'), ' ').\r"
       "    replace(/[\\f\\r\\t\\v\\u00A0\\u2028\\u2029]+/g, ' ').\r"
       "    replace(/\\n+/g, '\\n')", [self jsLocator]]]
          stringByTrimmingCharactersInSet:
            [NSCharacterSet whitespaceAndNewlineCharacterSet]];
}

- (void)sendKeys:(NSDictionary *)dict {
  [self verifyIsDisplayed];
  [[self viewController]
   jsEval:[NSString stringWithFormat:@"%@.value=\"%@\"", [self jsLocator], [[dict objectForKey:@"value"] componentsJoinedByString:@""]]];	
}

- (NSString *)value {
  return [[self viewController]
          jsEval:[NSString stringWithFormat:@"%@.value", [self jsLocator]]];
}

// This method is only valid on option elements, checkboxes and radio buttons.
- (NSNumber *)isChecked {
  BOOL isSelectable = [[[self viewController]
                        jsEval:[NSString stringWithFormat:
                                @"var elem = %@;\n"
                                 "elem instanceof HTMLOptionElement ||\n"
                                 "(elem instanceof HTMLInputElement &&\n"
                                 " elem.type in {'checkbox':0, 'radio':0});",
                                [self jsLocator]]] isEqualToString:@"true"];
  if (!isSelectable) {
    return [NSNumber numberWithBool:NO];
  }

  BOOL selected = [[[self viewController] jsEval:
   [NSString stringWithFormat:
    @"(function(elem) {\n"
     "  if (elem.tagName.toLowerCase() == 'option') {\n"
     "    return elem.selected;\n"
     "  } else {\n"
     "    return elem.checked;\n"
     "  }\n"
     "})(%@)", [self jsLocator]]] isEqualToString:@"true"];
  
  return [NSNumber numberWithBool:selected];
}

// This method is only valid on option elements, checkboxes and radio buttons.
- (void)setChecked:(NSNumber *)numValue {
  NSString* name = [self name];
  if (![name isEqualToString:@"option"] && ![name isEqualToString:@"input"]) {
    @throw [NSException
            webDriverExceptionWithMessage:@"You may not select an unselectable "
                                           "element"
            andStatusCode:EELEMENTNOTSELECTED];
  }

  if ([self isEnabled] == [NSNumber numberWithBool:NO]) {
    @throw [NSException
            webDriverExceptionWithMessage:@"You may not select a disabled "
                                           "element"
            andStatusCode:EELEMENTNOTENABLED];
  }

  NSString* locator = [self jsLocator];
  if ([name isEqualToString:@"input"]) {
    BOOL isSelectable = [[[self viewController]
                         jsEval:@"%@.type in {'checkbox':1, 'radio':1}",
                          locator] isEqualToString:@"true"];
    if (!isSelectable) {
      @throw [NSException
              webDriverExceptionWithMessage:@"You may not select an "
                                             "unselectable element"
              andStatusCode:EELEMENTNOTSELECTED];
    }
  }
  
  [self verifyIsDisplayed];
  [[self viewController] jsEval:
   [NSString stringWithFormat:
    @"(function(elem) {\n"
     "  var changed = false;\n"
     "  if (elem.tagName.toLowerCase() == 'option') {\n"
     "    if (!elem.selected) {\n"
     "      elem.selected = changed = true;\n"
     "    }\n"
     "  } else {\n"
     "    if (!elem.checked) {\n"
     "      elem.checked = changed = true;\n"
     "    }\n"
     "  }\n"
     "  if (changed) {\n"
     "    var e = elem.ownerDocument.createEvent('HTMLEvents');\n"
     "    e.initEvent('change', true, true);\n"
     "    elem.dispatchEvent(e);\n"
     "  }\n"
     "})(%@)", locator]];
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
                  jsEval:[NSString stringWithFormat:@"!!%@.disabled",
                          [self jsLocator]]] isEqualToString:@"false"];
  
  return [NSNumber numberWithBool:enabled];
}

- (NSNumber *)isDisplayed {
  // iteratively walk up the DOM tree and see if the given element or any of
  // it's parents are currently hidden.  We check for "visibility=hidden" and
  // "display=none".  We will also try and use the getComputedStyle to deal
  // with style applied to the element in an external style sheet. If, while
  // traversing up the tree, we encounter a node with "visibility=visible", the
  // visibility style for all other ancestors will be ignored. Once we determine
  // whether the element has been hidden by CSS, we make one final check that it
  // has width and height.
  NSString *visibleTest =
      [[self viewController] jsEval:
       @"(function(obj) {\n"
       "  var ownerDoc = obj.ownerDocument;\n"
       "  var win = ownerDoc.defaultView;\n"
       "  var current = obj;\n"
       "  var explicitlyVisible = false;\n"
       "  while(current && current != ownerDoc) {\n"
       "    if(current.style) {\n"
       "      if (current.style.display == 'none') return false;\n"
       "      explicitlyVisible = explicitlyVisible ||\n"
       "          current.style.visibility == 'visible';\n"
       "      if (!explicitlyVisible && current.style.visibility == 'hidden')\n"
       "          return false;\n"
       "    }\n"
       "    var computedStyle = win.getComputedStyle(current, null);\n"
       "    if (computedStyle.display == 'none') return false;\n"
       "    explicitlyVisible = explicitlyVisible ||\n"
       "        computedStyle.visibility == 'visible';\n"
       "    if (!explicitlyVisible && computedStyle.visibility == 'hidden')\n"
       "      return false;\n"
       "    current = current.parentNode;\n"
       "  }\n"
       // Option elements may not have width and height if they aren't currently
       // visible in the select, but we should still count them as visible.
       "  return obj.nodeName == 'OPTION' ||\n"
       "      obj.offsetWidth > 0 && obj.offsetHeight > 0;\n"
       "})(%@)", [self jsLocator]];

  BOOL visible = [visibleTest isEqualToString:@"true"];
  return [NSNumber numberWithBool:visible];
}

- (void)verifyIsDisplayed {
  if ([self isDisplayed] == [NSNumber numberWithBool:NO]) {
    @throw [NSException
            webDriverExceptionWithMessage:@"Element is not visible"
            andStatusCode:EELEMENTNOTDISPLAYED];
  }
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
  NSString* locator = [self jsLocator];
  BOOL hasAttribute = [[[self viewController] jsEval:
                        @"%@.hasAttribute('%@')", locator, name]
                       isEqualToString:@"true"];
  if (hasAttribute) {
    NSString* result = [[self viewController] jsEval:@"%@.getAttribute('%@')",
                        locator, name];
    if ([name isEqualToString:@"selected"]) {
      result = [result isEqualToString:name] ? @"true" : @"false";
    }
    return result;
  }
  
  if ([name isEqualToString:@"disabled"]) {
    return [[self viewController] jsEval:@"%@.disabled", locator];
  } else if (([name isEqualToString:@"checked"]
              || [name isEqualToString:@"selected"])
             && [[self name] isEqualToString:@"input"]) {
    return [[self viewController] jsEval:@"%@.checked", locator];
  } else if ([name isEqualToString:@"selected"]
             && [[self name] isEqualToString:@"option"]) {
    return [[self viewController] jsEval:@"%@.selected", locator];
  } else if ([name isEqualToString:@"index"]
             && [[self name] isEqualToString:@"option"]) {
    return [[self viewController] jsEval:@"%@.index", locator];
  }
  
  return nil;
}

// Get the tag name of this element, not the value of the name attribute:
// will return "input" for the element <input name="foo">
- (NSString *)name {
  return [[[self viewController] jsEval:
          @"%@.nodeName",
          [self jsLocator]] lowercaseString];
}

@end
