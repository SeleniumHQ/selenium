#import "DAVConnection.h"
#import "HTTPMessage.h"
#import "HTTPFileResponse.h"
#import "HTTPAsyncFileResponse.h"
#import "PUTResponse.h"
#import "DELETEResponse.h"
#import "DAVResponse.h"
#import "HTTPLogging.h"

#define HTTP_BODY_MAX_MEMORY_SIZE (1024 * 1024)
#define HTTP_ASYNC_FILE_RESPONSE_THRESHOLD (16 * 1024 * 1024)

static const int httpLogLevel = HTTP_LOG_LEVEL_WARN;

@implementation DAVConnection

- (void) dealloc {
  [requestContentStream close];
  [requestContentStream release];
  [requestContentBody release];
  
  [super dealloc];
}

- (BOOL) supportsMethod:(NSString*)method atPath:(NSString*)path {
  // HTTPFileResponse & HTTPAsyncFileResponse
  if ([method isEqualToString:@"GET"]) return YES;
	if ([method isEqualToString:@"HEAD"]) return YES;
  
  // PUTResponse
  if ([method isEqualToString:@"PUT"]) return YES;
  
  // DELETEResponse
  if ([method isEqualToString:@"DELETE"]) return YES;
	
  // DAVResponse
  if ([method isEqualToString:@"OPTIONS"]) return YES;
  if ([method isEqualToString:@"PROPFIND"]) return YES;
  if ([method isEqualToString:@"MKCOL"]) return YES;
  if ([method isEqualToString:@"MOVE"]) return YES;
  if ([method isEqualToString:@"COPY"]) return YES;
  if ([method isEqualToString:@"LOCK"]) return YES;
  if ([method isEqualToString:@"UNLOCK"]) return YES;
  
  return NO;
}

- (BOOL) expectsRequestBodyFromMethod:(NSString*)method atPath:(NSString*)path {
  // PUTResponse
  if ([method isEqualToString:@"PUT"]) {
    return YES;
	}
  
  // DAVResponse
  if ([method isEqual:@"PROPFIND"] || [method isEqual:@"MKCOL"]) {
    return [request headerField:@"Content-Length"] ? YES : NO;
  }
  if ([method isEqual:@"LOCK"]) {
    return YES;
  }
  
  return NO;
}

- (void) prepareForBodyWithSize:(UInt64)contentLength {
  NSAssert(requestContentStream == nil, @"requestContentStream should be nil");
  NSAssert(requestContentBody == nil, @"requestContentBody should be nil");
  
  if (contentLength > HTTP_BODY_MAX_MEMORY_SIZE) {
    requestContentBody = [[NSTemporaryDirectory() stringByAppendingString:[[NSProcessInfo processInfo] globallyUniqueString]] copy];
    requestContentStream = [[NSOutputStream alloc] initToFileAtPath:requestContentBody append:NO];
    [requestContentStream open];
  } else {
    requestContentBody = [[NSMutableData alloc] initWithCapacity:(NSUInteger)contentLength];
    requestContentStream = nil;
  }
}

- (void) processBodyData:(NSData*)postDataChunk {
	NSAssert(requestContentBody != nil, @"requestContentBody should not be nil");
  if (requestContentStream) {
    [requestContentStream write:[postDataChunk bytes] maxLength:[postDataChunk length]];
  } else {
    [(NSMutableData*)requestContentBody appendData:postDataChunk];
  }
}

- (void) finishBody {
  NSAssert(requestContentBody != nil, @"requestContentBody should not be nil");
  if (requestContentStream) {
    [requestContentStream close];
    [requestContentStream release];
    requestContentStream = nil;
  }
}

- (void)finishResponse {
  NSAssert(requestContentStream == nil, @"requestContentStream should be nil");
  [requestContentBody release];
  requestContentBody = nil;
  
  [super finishResponse];
}

- (NSObject<HTTPResponse>*) httpResponseForMethod:(NSString*)method URI:(NSString*)path {
  if ([method isEqualToString:@"HEAD"] || [method isEqualToString:@"GET"]) {
    NSString* filePath = [self filePathForURI:path allowDirectory:NO];
    if (filePath) {
      NSDictionary* fileAttributes = [[NSFileManager defaultManager] attributesOfItemAtPath:filePath error:NULL];
      if (fileAttributes) {
        if ([[fileAttributes objectForKey:NSFileSize] unsignedLongLongValue] > HTTP_ASYNC_FILE_RESPONSE_THRESHOLD) {
          return [[[HTTPAsyncFileResponse alloc] initWithFilePath:filePath forConnection:self] autorelease];
        } else {
          return [[[HTTPFileResponse alloc] initWithFilePath:filePath forConnection:self] autorelease];
        }
      }
    }
  }
	
	if ([method isEqualToString:@"PUT"]) {
    NSString* filePath = [self filePathForURI:path allowDirectory:YES];
    if (filePath) {
      if ([requestContentBody isKindOfClass:[NSString class]]) {
        return [[[PUTResponse alloc] initWithFilePath:filePath headers:[request allHeaderFields] bodyFile:requestContentBody] autorelease];
      } else if ([requestContentBody isKindOfClass:[NSData class]]) {
        return [[[PUTResponse alloc] initWithFilePath:filePath headers:[request allHeaderFields] bodyData:requestContentBody] autorelease];
      } else {
        HTTPLogError(@"Internal error");
      }
    }
  }
	
	if ([method isEqualToString:@"DELETE"]) {
    NSString* filePath = [self filePathForURI:path allowDirectory:YES];
    if (filePath) {
      return [[[DELETEResponse alloc] initWithFilePath:filePath] autorelease];
    }
  }
  
  if ([method isEqualToString:@"OPTIONS"] || [method isEqualToString:@"PROPFIND"] || [method isEqualToString:@"MKCOL"] ||
    [method isEqualToString:@"MOVE"] || [method isEqualToString:@"COPY"] || [method isEqualToString:@"LOCK"] || [method isEqualToString:@"UNLOCK"]) {
    NSString* filePath = [self filePathForURI:path allowDirectory:YES];
    if (filePath) {
      NSString* rootPath = [config documentRoot];
      NSString* resourcePath = [filePath substringFromIndex:([rootPath length] + 1)];
      if (requestContentBody) {
        if ([requestContentBody isKindOfClass:[NSString class]]) {
          requestContentBody = [NSData dataWithContentsOfFile:requestContentBody];
        } else if (![requestContentBody isKindOfClass:[NSData class]]) {
          HTTPLogError(@"Internal error");
          return nil;
        }
      }
      return [[[DAVResponse alloc] initWithMethod:method
                                          headers:[request allHeaderFields]
                                         bodyData:requestContentBody
                                     resourcePath:resourcePath
                                         rootPath:rootPath] autorelease];
    }
  }
  
  return nil;
}

@end
