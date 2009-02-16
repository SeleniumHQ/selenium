//
//  HTTPResource.h
//  iWebDriver
//
//  Created by Joseph Gentle on 12/5/08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HTTPResponse.h"

// An HTTPResource is an element which can respond to queries. It represents
// an element in a virtual subdirectory; eg /foo/bar
@protocol HTTPResource<NSObject>

// Get the HTTP response to this request
- (id<HTTPResponse,NSObject>)httpResponseForQuery:(NSString *)query
										   method:(NSString *)method
										 withData:(NSData *)theData;

// Fetch the sub-resource for this relative query string. This may be
// recursively called on contents of subdirectories. The query string is
// relative to the reciever; so if the string is empty you should probably
// return self.
- (id<HTTPResource>)elementWithQuery:(NSString *)query;

@end
