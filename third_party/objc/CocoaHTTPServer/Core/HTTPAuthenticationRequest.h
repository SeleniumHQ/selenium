#import <Foundation/Foundation.h>

#if TARGET_OS_IPHONE
  // Note: You may need to add the CFNetwork Framework to your project
  #import <CFNetwork/CFNetwork.h>
#endif

@class HTTPMessage;


@interface HTTPAuthenticationRequest : NSObject
{
	BOOL isBasic;
	BOOL isDigest;
	
	NSString *base64Credentials;
	
	NSString *username;
	NSString *realm;
	NSString *nonce;
	NSString *uri;
	NSString *qop;
	NSString *nc;
	NSString *cnonce;
	NSString *response;
}
- (id)initWithRequest:(HTTPMessage *)request;

- (BOOL)isBasic;
- (BOOL)isDigest;

// Basic
- (NSString *)base64Credentials;

// Digest
- (NSString *)username;
- (NSString *)realm;
- (NSString *)nonce;
- (NSString *)uri;
- (NSString *)qop;
- (NSString *)nc;
- (NSString *)cnonce;
- (NSString *)response;

@end
