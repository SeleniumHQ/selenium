#import <Foundation/Foundation.h>
#import "HTTPResponse.h"


@interface HTTPRedirectResponse : NSObject <HTTPResponse>
{
	NSString *redirectPath;
}

- (id)initWithPath:(NSString *)redirectPath;

@end
