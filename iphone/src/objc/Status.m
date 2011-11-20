//
//  Status.m
//  iWebDriver
//
//  Created by Luke Inman-Semerau on 11/17/11.
//  Copyright (c) 2011 Free Software Conservancy. All rights reserved.
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
//

#import "Status.h"
#import "JSONRESTResource.h"

@implementation Status

- (id) init {
  self = [super init];
  if (!self) {
    return nil;
  }
  
  return self;
}

- (NSObject<HTTPResponse> *) httpResponseForQuery: (NSString *)query
                                           method:(NSString *)method
                                         withData:(NSData *)theData {
  NSString *device;
  if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) {
    device = DEVICE_IPAD;
  } else {
    device = DEVICE_IPHONE;
  }
  NSString *dataString = [NSString stringWithFormat:@"{\"value\":"
                          "{\"os\":{\"arch\":\"%@\",\"name\":\"iOS\",\"version\":\"%@\"},"
                          "\"build\":{\"revision\":\"%@\",\"time\":\"%@\",\"version\":\"%@\"}}}",
                          device, @"4.3", @"SVN_REVISION", @"BUILD_TIMESTAMP", @"RELEASE"];
  NSData *data = [dataString dataUsingEncoding:NSUTF8StringEncoding];
  return [[[HTTPDataResponse alloc] initWithData:data] autorelease];
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  return self;
}

@end
