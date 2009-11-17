//
//  WebDriverResource.m
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

#import "WebDriverResource.h"
#import "WebDriverResponse.h"
#import "NSString+SBJSON.h"
#import "MainViewController.h"

@implementation WebDriverResource

@synthesize session = session_,
  context = context_,
  allowOptionalArguments = allowOptionalArguments_;

- (id)initWithTarget:(id)target
             actions:(NSDictionary *)actionTable
{
  if (![super init])
    return nil;
  
  target_ = [target retain];
  methodActions_ = [actionTable retain];
  allowOptionalArguments_ = NO;
  
  return self;
}

- (id)initWithTarget:(id)target
           GETAction:(SEL)getAction
          POSTAction:(SEL)postAction
           PUTAction:(SEL)putAction
        DELETEAction:(SEL)deleteAction
{
  NSMutableDictionary *actions = [NSMutableDictionary dictionary];
 
  if (getAction != NULL)
    [actions setValue:[NSValue valueWithPointer:getAction] forKey:@"GET"];
  if (postAction != NULL)
    [actions setValue:[NSValue valueWithPointer:postAction] forKey:@"POST"];
  if (putAction != NULL)
    [actions setValue:[NSValue valueWithPointer:putAction] forKey:@"PUT"];
  if (deleteAction != NULL)
    [actions setValue:[NSValue valueWithPointer:deleteAction] forKey:@"DELETE"];
  
  return [self initWithTarget:target actions:actions];
}

+ (WebDriverResource *)resourceWithTarget:(id)target
                                GETAction:(SEL)getAction
                               POSTAction:(SEL)postAction
                                PUTAction:(SEL)putAction
                             DELETEAction:(SEL)deleteAction {
  return [[[self alloc] initWithTarget:target
                             GETAction:getAction
                            POSTAction:postAction
                             PUTAction:putAction
                          DELETEAction:deleteAction] autorelease];
}

// Helper method for people who don't care about put and delete
+ (WebDriverResource *)resourceWithTarget:(id)target
                                GETAction:(SEL)getAction
                               POSTAction:(SEL)postAction {
  return [self resourceWithTarget:target
                        GETAction:getAction
                       POSTAction:postAction
                        PUTAction:NULL
                     DELETEAction:NULL];
}

- (void)dealloc
{
  [target_ release];
  [methodActions_ release];
  [self setSession:nil];
  [self setContext:nil];
  
  [super dealloc];
}


#pragma mark Creating a response

// Set the response's session and context
- (void)configureWebDriverResponse:(WebDriverResponse *)response {
  [response setSessionId:session_];
  [response setContext:context_];
}

// Make an array of objects containing the method arguments. Return nil on
// error.
- (NSArray *)getArgumentListFromData:(NSData *)data {
  id requestData = nil;
  
  if ([data length] > 0) {
    NSString *dataString =
    [[NSString alloc] initWithData:data
                          encoding:NSUTF8StringEncoding];
    
    requestData = [dataString JSONFragmentValue];
    [dataString release];
  }
  
  // The request data should contain an array of arguments.
  if (requestData != nil
      && ![requestData isKindOfClass:[NSArray class]]) {
    NSLog(@"Invalid argument list - Expecting an array but given %@",
          requestData);
    return nil;
  }
  
  return (NSArray *)requestData;
}

// Create and return an invocator for the specified method. Returns nil on
// error.
- (NSInvocation *)createInvocationWithSelector:(SEL)selector
                                     signature:(NSMethodSignature *)method
                                     arguments:(NSArray *)arguments {
  NSInvocation *invocation
    = [NSInvocation invocationWithMethodSignature:method];
  [invocation setSelector:selector];
  [invocation setTarget:target_];
  
  if (arguments != nil) {
    // The first two arguments in the method are the target and selector.
    // NSInvocation will fill them in for us. We start with the 3rd argument.
    for (int i = 2; i < [method numberOfArguments]; i++) {
      id arg;
      if (i - 2 < [arguments count]) {
        arg = [arguments objectAtIndex:i - 2];
      }
      else if (allowOptionalArguments_) {
        arg = nil;
      }
      else {
        NSLog(@"Too many arguments for method %@", method);
        return nil;
      }
      
      // The first 2 arguments are the target and selector.
      [invocation setArgument:&arg atIndex:i];
    }
  }
  
  return invocation;
}

// Validate the arguments are valid for this HTTP method + signature. Return
// a |WebDriverResponse| containing the error if we encountered one.
- (WebDriverResponse *)validateArgumentList:(NSArray *)arguments
                              forHTTPMethod:(NSString *)method
                                  signature:(NSMethodSignature *)signature {
  
  // If it was a PUT or POST, POST data is required (though an empty array list
  // may still be allowed).
  if (([method isEqualToString:@"PUT"] || [method isEqualToString:@"POST"])
      && arguments == nil) {
    return [WebDriverResponse responseWithError:@"Invalid argument list"];
  }
    
  // The argument lists should match in number.
  // (Note: the method signature assumes the first two arguments are self
  // and selector - so we need to subtract 2.)
  if (!allowOptionalArguments_ && 
      [arguments count] != ([signature numberOfArguments] - 2)) {
    return [WebDriverResponse responseWithError:
              [NSString stringWithFormat:
                 @"Incorrect number of arguments for method %@ - expected %d",
                 signature, [signature numberOfArguments] - 2]];
  }
    
  // TODO(josephg): check argument type as well as number.
  
  return nil;
}

// Invoke the given invocation and create a WebDriver response from it.
- (WebDriverResponse *)createResponseFromInvocation:(NSInvocation *)invocation {
  WebDriverResponse *response;
  
  @try {
    [invocation invoke];
    if ([[invocation methodSignature] methodReturnLength] == 0) {
      response = [WebDriverResponse responseWithValue:nil];
    } else {
      id result;
      [invocation getReturnValue:&result];
      response = [WebDriverResponse responseWithValue:result];
    }
  }
  @catch (NSException * e) {
    NSLog(@"Method invocation error: %@", e);
    response = [WebDriverResponse responseWithError:e];
    
    // For easy debugging with Xcode, rethrow the exception here.
  }
  
  return response;
}

// Get the HTTP response to this request. This method is part of the
// |HTTPResource| protocol. It is the local entrypoint for creating a response.
- (id<HTTPResponse,NSObject>)httpResponseForQuery:(NSString *)query
                                           method:(NSString *)method
                                         withData:(NSData *)theData {
  SEL selector = [[methodActions_ objectForKey:method] pointerValue];
  NSMethodSignature *methodSignature = [target_ methodSignatureForSelector:selector];
  WebDriverResponse *response = nil;
	
  if (methodSignature == nil) {
    response = [WebDriverResponse responseWithError:
                [NSString stringWithFormat:@"Invalid method for resource: %@",
                 method]];
    [self configureWebDriverResponse:response];
    return response;
  }
  
  NSArray *arguments = [self getArgumentListFromData:theData];
  
  response = [self validateArgumentList:arguments
                          forHTTPMethod:method
                              signature:methodSignature];
  
  // response != nil if validation failed.
  if (response != nil) {
    [self configureWebDriverResponse:response];
    return response;
  }
  
  NSInvocation *invocation = [self createInvocationWithSelector:selector
                                                      signature:methodSignature
                                                      arguments:arguments];

  [[MainViewController sharedInstance]
   describeLastAction:NSStringFromSelector(selector)];
  
  // Finally call the invocation and create a response from it.
  response = [self createResponseFromInvocation:invocation];
  [self configureWebDriverResponse:response];
  return response;
}

// This is part of the |HTTPResource| protocol.
- (id<HTTPResource>)elementWithQuery:(NSString *)query { 
  return self;
}

@end


@implementation HTTPVirtualDirectory (WebDriverResource)

// Helper method to set JSON resources.
- (void)setMyWebDriverHandlerWithGETAction:(SEL)getAction
                                POSTAction:(SEL)postAction
                                 PUTAction:(SEL)putAction
                              DELETEAction:(SEL)deleteAction
                                  withName:(NSString *)name {
  [self setResource:[WebDriverResource resourceWithTarget:self
                                                GETAction:getAction
                                               POSTAction:postAction
                                                PUTAction:putAction
                                             DELETEAction:deleteAction]
           withName:name];  
}

// Calls above, but without put and delete.
- (void)setMyWebDriverHandlerWithGETAction:(SEL)getAction
                                POSTAction:(SEL)postAction
                                  withName:(NSString *)name {
  [self setMyWebDriverHandlerWithGETAction:getAction
                                POSTAction:postAction
                                 PUTAction:NULL
                              DELETEAction:NULL
                                  withName:name];
}

@end
