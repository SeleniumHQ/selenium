//
//  WebDriverResource.h
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

#import <Foundation/Foundation.h>
#import "JSONRESTResource.h"

// This class wraps a standard obj-c method into a method which webdriver can
// call. Method arguments are passed in through PUT/POST data. The data is
// a JSON array. The array elements sequentially match the method arguments.
// The return value from the method is passed back through a |WebDriverResponse|
// object.
//
// For example, the client (WebDriver) might POST to /session/1001/foo/element
// with data ["name","form2"] . The |Element| virtual directory maps
// /element to a |WebDriverResource| using the method:
// -(NSArray *)findElementBy:(NSString)method withQuery:(NSString *)query;
// |WebDriverResource| calls the method as:
//   [target findElementBy:@"name" withQuery:@"form2"];
// The method returns an array of strings. |WebDriverResource| (with help from
// |WebDriverResponse| and |JSONRESTResource|) converts that
// return value back into JSON and wraps it in a |WebDriverResponse|:
// {
//   value:["element/1"],
//   context:"foo",
//   sessionId:"1001",
//   error:false
// }
// This is then sent back to the client in response.
//
// Methods can throw exceptions to signal errors. These exceptions are sent back
// to WebDriver. If the method throws an exception, the value property in the
// response is the exception object (or details of the exception object) and
// error: is set to true.
//
// For more details of the protocol see:
//   http://code.google.com/p/webdriver/wiki/JsonWireProtocol
@interface WebDriverResource : NSObject<HTTPResource> {
  id target_;
  NSDictionary *methodActions_;
  
  // These two fields are needed for when we make |WebDriverResponse|s.
  // Due to the architecture of |VirtualDirectory|, we have to cache the
  // session and context like this.
  NSString *session_;
  NSString *context_;
  
  BOOL allowOptionalArguments_;
}

@property (nonatomic, copy) NSString *session;
@property (nonatomic, copy) NSString *context;

// Allow some of the method's arguments to be optional. If optional arguments
// are not specified, nil is passed in in their place.
// Defaults to NO.
@property (nonatomic, assign) BOOL allowOptionalArguments;

// Designated initialiser. The dictionary should map the strings 'GET', 'PUT',
// 'POST', 'DELETE' to selectors to be called on the target. Do not set
// dictionary entries for methods you do not want to handle.
- (id)initWithTarget:(id)target
             actions:(NSDictionary *)actionTable;

// Create a resource which will call these selectors on the target when the
// appropriate method is called.
//
// Send NULL for any method you don't intend to handle.
- (id)initWithTarget:(id)target
           GETAction:(SEL)getAction
          POSTAction:(SEL)postAction
           PUTAction:(SEL)putAction
        DELETEAction:(SEL)deleteAction;

// A helper method to create and autorelease |WebDriverResource|. See
// |initWithTarget:GETAction:POSTAction:PUTAction:DELETEAction:|.
+ (WebDriverResource *)resourceWithTarget:(id)target
                                GETAction:(SEL)getAction
                               POSTAction:(SEL)postAction
                                PUTAction:(SEL)putAction
                             DELETEAction:(SEL)deleteAction;

// A helper method to create and autorelease |WebDriverResource| objects with
// no PUT or DELETE actions. See
// |initWithTarget:GETAction:POSTAction:PUTAction:DELETEAction:|.
+ (WebDriverResource *)resourceWithTarget:(id)target
                                GETAction:(SEL)getAction
                               POSTAction:(SEL)postAction;  
@end

// This is an extension to VirtualDirectory to allow easy resource additions
@interface HTTPVirtualDirectory (WebDriverResource)

// This helper method for |HTTPVirtualDirectory| sets a selector of the current
// object to be a WebDriver method. See |WebDriverResource|'s
// |initWithTarget:GETAction:POSTAction:PUTAction:DELETEAction:|.
// The target is self.
- (void)setMyWebDriverHandlerWithGETAction:(SEL)getAction
                                POSTAction:(SEL)postAction
                                 PUTAction:(SEL)putAction
                              DELETEAction:(SEL)deleteAction
                                  withName:(NSString *)name;

// Same as above, but without handlers for PUT and DELETE.
- (void)setMyWebDriverHandlerWithGETAction:(SEL)getAction
                                POSTAction:(SEL)postAction
                                  withName:(NSString *)name;
  
@end
