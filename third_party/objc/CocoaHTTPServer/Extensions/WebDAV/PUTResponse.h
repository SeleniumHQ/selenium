#import "HTTPResponse.h"

@interface PUTResponse : NSObject <HTTPResponse> {
  NSInteger _status;
}
- (id) initWithFilePath:(NSString*)path headers:(NSDictionary*)headers bodyData:(NSData*)body;
- (id) initWithFilePath:(NSString*)path headers:(NSDictionary*)headers bodyFile:(NSString*)body;
@end
