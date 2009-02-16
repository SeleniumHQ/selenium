//
//  HTTPRedirectResponse.h
//  iWebDriver
//
//  Created by Joseph Gentle on 12/5/08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HTTPResponse.h"

// This is a response which redirects the user to the specified relative URL.
@interface HTTPRedirectResponse : HTTPDataResponse {
	NSString *destination;
}

@property (nonatomic, copy) NSString *destination;

- (id)initWithDestination:(NSString *)url;
- (id)initWithDestination:(NSString *)url data:(NSData *)messageData;

+ (HTTPRedirectResponse *)redirectToURL:(NSString *)url;

// Expand destination (if needed) to be an absolute URL relative to base
- (void)expandRelativeUrlWithBase:(NSURL *)base;

@end
