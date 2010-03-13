//
//  Element+FindElement.m
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

#import "Element+FindElement.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "ElementStore.h"
#import "WebDriverResource.h"
#import "NSException+WebDriver.h"
#import "WebViewController.h"
#import "errorcodes.h"

@implementation Element (FindElement)

- (void)addSearchSubdirs {
  // This represents the element/ subdirectory of the element.
  HTTPVirtualDirectory *findElement = [HTTPVirtualDirectory virtualDirectory];
  // And this represents the elements/
  HTTPVirtualDirectory *findElements = [HTTPVirtualDirectory virtualDirectory];
  
  [findElement setIndex:[WebDriverResource
                         resourceWithTarget:self
                         GETAction:NULL
                         POSTAction:@selector(findElementUsing:)
                         PUTAction:NULL
                         DELETEAction:NULL]];

  [findElements setIndex:[WebDriverResource
                          resourceWithTarget:self
                          GETAction:NULL
                          POSTAction:@selector(findElementsUsing:)
                          PUTAction:NULL
                          DELETEAction:NULL]];
  
  [self setResource:findElement withName:@"element"];
  [self setResource:findElements withName:@"elements"];
}

// This function takes an array of Element* and returns an array of NSStrings
// of the form "element/$ID". This is needed for |findElementsByMethod:query:|
// below.
- (NSArray *)elementsToElementIds:(NSArray *)array {
  if (array == nil)
    return nil;
  
  NSMutableArray *output = [NSMutableArray arrayWithCapacity:[array count]];
  for (Element *elem in array) {
    [output addObject:[elem idDictionary]];
  }
  return output;
}

// Do a search by xpath. |elementsByXPath:to:| will escape any quote characters
// in your string.
- (NSArray *)elementsByXPath:(NSString *)xpath to:(NSString *)container {
  // If the xpath expression is invalid, calling elemsByXpath (below) will fail
  // silently. To detect it, we'll first set container to null and then check
  // its value afterwards and throw an exception.
  [[self viewController] jsEval:@"var %@ = null;", container];
  
  // Sanitise quotes in the input
  xpath = [xpath stringByReplacingOccurrencesOfString:@"'" withString:@"\\'"];
  
  NSString *query = [NSString stringWithFormat:
   @"var elemsByXpath = function(xpath, context) {\r"
    "  var result = document.evaluate(\r"
    "    xpath, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);\r"
    "  var arr = new Array();\r"
    "  var element = result.iterateNext();\r"
    "  while (element) {\r"
    "    arr.push(element);\r"
    "    element = result.iterateNext();\r"
    "  }\r"
    "  return arr;\r"
    "};\r"
    "%@ = elemsByXpath('%@', %@);", container, xpath, [self jsLocator]];
  
  [[self viewController] jsEval:query];
  
  if ([[self viewController] jsElementIsNullOrUndefined:container]) {
    @throw [NSException webDriverExceptionWithMessage:
            [NSString stringWithFormat:@"Invalid xpath expression: %@", xpath]
                                        andStatusCode:EUNEXPECTEDJSERROR];
  }
  
  return [elementStore_ elementsFromJSArray:container];
}

// Search for elements by their name= attribute.
- (NSArray *)elementsByName:(NSString *)name to:(NSString *)container {
  if ([self isDocumentElement]) {
    // Searching in the whole DOM we can use document.getElementsByName.
    [[self viewController] jsEval:
                 @"var %@ = document.getElementsByName('%@');",
                 container,
                 name];
    return [elementStore_ elementsFromJSArray:container];
  } else {
    // We only want to search the subtree of this element in the DOM. Since
    // there's no builtin element.getElementsByName, we use xpath.
    return [self elementsByXPath:
            [NSString stringWithFormat:@".//*[@name = '%@']", name]
                              to:container];
  }
}

// Is this element a direct or indirect descendant of the given element?
- (BOOL)elementIsDescendantOfElement:(Element *)element {
  NSString *result = [[self viewController] jsEval:
    @"var elementIsDecendant = function(element, parent) {\r"
     "  var tmp = element;\r"
     "  while (tmp != null) {\r"
     "    if (tmp == parentElement)\r"
     "      return true;\r"
     "    tmp = tmp.parentNode;\r"
     "  }\r"
     "  return false;\r"
     "}; elementIsDecendant(%@, %@)", [self jsLocator], [element jsLocator]];
  return [result isEqualToString:@"true"];
}

- (NSArray *)elementsById:(NSString *)anId to:(NSString *)container {
  // We can't use getElementById() because there might be multiple elements with
  // the same id. xpath should find them all correctly.
  return [self elementsByXPath:[NSString stringWithFormat:@".//*[@id = '%@']",
                                anId]
                            to:container];
}

// Returns an array of the links in the DOM subtree from this element.
- (NSArray *)links {
  NSString *container = @"_WEBDRIVER_links";
  [[self viewController] jsEval:@"var %@ = %@.getElementsByTagName('A');",
    container, [self jsLocator]];
  return [elementStore_ elementsFromJSArray:container];
}

- (NSArray *)findElementsByLinkText:(NSString *)text
                                 to:(NSString *)container {
  NSArray *links = [self links];
  
  NSMutableArray *result = [NSMutableArray array];
  for (Element *elem in links) {
    // I'm going to do a straight comparison. The documentation isn't clear if
    // this search should be case sensitive. I'll assume it is. If it shouldn't
    // be case sensitive, this should be changed to use |NSString|'s
    // compare:options:range:
    if ([[elem text] isEqualToString:text]) {
      [result addObject:elem];
    }
  }
  
  return result;
}

- (NSArray *)findElementsByPartialLinkText:(NSString *)text
                                        to:(NSString *)container {
  NSArray *links = [self links];
  
  NSMutableArray *result = [NSMutableArray array];
  for (Element *elem in links) {
    NSRange range = [[elem text] rangeOfString:text];
    if (range.location != NSNotFound)
      [result addObject:elem];
  }
  
  return result;
}

- (NSArray *)findElementsByClassName:(NSString *)class
                                  to:(NSString *)container {
  [[self viewController] jsEval:@"var %@ = %@.getElementsByClassName('%@');",
   container, [self jsLocator], class];
  return [elementStore_ elementsFromJSArray:container];
}

- (NSArray *)findElementsByTagName:(NSString *)tagName
                                to:(NSString *)container {
  [[self viewController] jsEval:@"var %@ = %@.getElementsByTagName('%@');",
   container, [self jsLocator], [tagName uppercaseString]];
  return [elementStore_ elementsFromJSArray:container];
}

// Find elements by the given method passed in as a string.
- (NSArray *)findElementsByMethod:(NSString *)method query:(NSString *)query {
  NSString *tempStore = @"_WEBDRIVER_elems";
  
  NSArray *result = nil;
  
  // This could be rewritten to use a dictionary of selectors keyed by the
  // method, but I think it's more obvious what this is doing.
  if ([method isEqualToString:@"id"]) {
    result = [self elementsById:query to:tempStore];
  }
  else if ([method isEqualToString:@"xpath"]) {
    result = [self elementsByXPath:query to:tempStore];
  }
  else if ([method isEqualToString:@"name"]) {
    result = [self elementsByName:query to:tempStore];
  }
  else if ([method isEqualToString:@"link text"]) {
    result = [self findElementsByLinkText:query to:tempStore];
  }
  else if ([method isEqualToString:@"partial link text"]) {
    result = [self findElementsByPartialLinkText:query to:tempStore];
  }
  else if ([method isEqualToString:@"class name"]) {
    result = [self findElementsByClassName:query to:tempStore];
  }
  else if ([method isEqualToString:@"tag name"]) {
    result = [self findElementsByTagName:query to:tempStore];
  }
  else {
    NSLog(@"Cannot search by method %@", method);
    return nil;
  }
  
  result = [self elementsToElementIds:result];
  return result;
}

- (NSArray *)findElementsUsing:(NSDictionary *)dict {
  // This maps the /element/id/element/method to findElementsByMethod.
  NSString *query = [dict objectForKey:@"value"];
  NSString *method = [dict objectForKey:@"using"];
  return [self findElementsByMethod:method query:query];
}

- (NSDictionary *)findElementUsing:(NSDictionary *)dict {
  NSLog(@"findElementUsing:%@", [dict description]);
  NSArray *results = [self findElementsUsing:dict];
  if (results && [results count] > 0)
    return [results objectAtIndex:0];
  else
    @throw([NSException
            webDriverExceptionWithMessage:@"Unable to locate element"
            andStatusCode:ENOSUCHELEMENT]);
}
@end
