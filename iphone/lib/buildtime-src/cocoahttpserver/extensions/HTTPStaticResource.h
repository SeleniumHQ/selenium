//
//  HTTPResourceResponseWrapper.h
//  iWebDriver
//
//  Created by Joseph Gentle on 12/5/08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HTTPResource.h"
#import "HTTPResponse.h"

// An HTTPResource which always responds with a particular response.
@interface HTTPStaticResource : NSObject<HTTPResource> {
	id<HTTPResponse,NSObject> response;
}

@property(nonatomic, retain) id<HTTPResponse,NSObject> response;

- (id)initWithResponse:(id<HTTPResponse,NSObject>)theResponse;

+ (HTTPStaticResource *)resourceWithResponse:(id<HTTPResponse,NSObject>)theResponse;

+ (HTTPStaticResource *)redirectWithURL:(NSString *)url;

@end
