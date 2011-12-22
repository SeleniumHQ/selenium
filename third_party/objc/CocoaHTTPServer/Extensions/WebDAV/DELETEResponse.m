#import "DELETEResponse.h"
#import "HTTPLogging.h"

// HTTP methods: http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
// HTTP headers: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
// HTTP status codes: http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html

static const int httpLogLevel = HTTP_LOG_LEVEL_WARN;

@implementation DELETEResponse

- (id) initWithFilePath:(NSString*)path {
  if ((self = [super init])) {
    BOOL exists = [[NSFileManager defaultManager] fileExistsAtPath:path];
    if ([[NSFileManager defaultManager] removeItemAtPath:path error:NULL]) {
      _status = exists ? 200 : 204;
    } else {
      HTTPLogError(@"Failed deleting \"%@\"", path);
      _status = 404;
    }
  }
  return self;
}

- (UInt64) contentLength {
  return 0;
}

- (UInt64) offset {
  return 0;
}

- (void)setOffset:(UInt64)offset {
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
