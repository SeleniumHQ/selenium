#import <Foundation/Foundation.h>
#import "HTTPConnection.h"

@class MyWebSocket;

@interface MyHTTPConnection : HTTPConnection
{
	MyWebSocket *ws;
}

@end
