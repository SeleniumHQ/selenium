#import "PUTResponse.h"
#import "HTTPLogging.h"

// HTTP methods: http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
// HTTP headers: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
// HTTP status codes: http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html

static const int httpLogLevel = HTTP_LOG_LEVEL_WARN;

@implementation PUTResponse

- (id) initWithFilePath:(NSString*)path headers:(NSDictionary*)headers body:(id)body {
  if ((self = [super init])) {
    if ([headers objectForKey:@"Content-Range"]) {
      HTTPLogError(@"Content-Range not supported for upload to \"%@\"", path);
      _status = 400;
    } else {
      BOOL overwrite = [[NSFileManager defaultManager] fileExistsAtPath:path];
      BOOL success;
      if ([body isKindOfClass:[NSString class]]) {
        [[NSFileManager defaultManager] removeItemAtPath:path error:NULL];
        success = [[NSFileManager defaultManager] moveItemAtPath:body toPath:path error:NULL];
      } else {
        success = [body writeToFile:path atomically:YES];
      }
      if (success) {
        _status = overwrite ? 200 : 201;
      } else {
        HTTPLogError(@"Failed writing upload to \"%@\"", path);
        _status = 403;
      }
    }
  }
  return self;
}

- (id) initWithFilePath:(NSString*)path headers:(NSDictionary*)headers bodyData:(NSData*)body {
  return [self initWithFilePath:path headers:headers body:body];
}

- (id) initWithFilePath:(NSString*)path headers:(NSDictionary*)headers bodyFile:(NSString*)body {
  return [self initWithFilePath:path headers:headers body:body];
}

- (UInt64) contentLength {
  return 0;
}

- (UInt64) offset {
  return 0;
}

- (void) setOffset:(UInt64)offset {
  ;
}

- (NSData*) readDataOfLength:(NSUInteger)length {
  return nil;
}

- (BOOL) isDone {
  return YES;
}

- (NSInteger) status {
  return _status;
}

@end
