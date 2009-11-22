//
//  RESTServiceHandler.h
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
#import "HTTPVirtualDirectory.h"
#import "HTTPResource.h"

/* A JSONRestResource is a resource which calls a method when its accessed.
 * The method's return value is then turned back into JSON and sent over the
 * wire.
 */
@interface JSONRESTResource : NSObject<HTTPResource> {
 @private
  id target_;
  SEL action_;
}

@property (nonatomic, retain) id target;
@property (nonatomic, assign) SEL action;

- (id)initWithTarget:(id)target action:(SEL)action;
+ (JSONRESTResource *)JSONResourceWithTarget:(id)theTarget
                                      action:(SEL)theAction;

@end


// This is an extension to VirtualDirectory to allow easy resource additions
@interface HTTPVirtualDirectory (JSONResource)

// This is a helper method for subclasses. It sets a resource to a JSON handler
// implemented by the specified selector. The target is the virtualdirectory
// subclass.
// The selector should take 2 arguments: The JSON object sent in POST data and
// the HTTP method called as an NSString. It returns a (NSObject<HTTPResponse>*)
- (void)setMyJSONHandler:(SEL)selector withName:(NSString *)name;

@end
