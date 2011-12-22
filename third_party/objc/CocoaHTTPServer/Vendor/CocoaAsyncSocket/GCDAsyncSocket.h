//  
//  GCDAsyncSocket.h
//  
//  This class is in the public domain.
//  Originally created by Robbie Hanson in Q3 2010.
//  Updated and maintained by Deusty LLC and the Mac development community.
//  
//  http://code.google.com/p/cocoaasyncsocket/
//

#import <Foundation/Foundation.h>
#import <Security/Security.h>
#import <dispatch/dispatch.h>

@class GCDAsyncReadPacket;
@class GCDAsyncWritePacket;

extern NSString *const GCDAsyncSocketException;
extern NSString *const GCDAsyncSocketErrorDomain;

#if !TARGET_OS_IPHONE
extern NSString *const GCDAsyncSocketSSLCipherSuites;
extern NSString *const GCDAsyncSocketSSLDiffieHellmanParameters;
#endif

enum GCDAsyncSocketError
{
	GCDAsyncSocketNoError = 0,           // Never used
	GCDAsyncSocketBadConfigError,        // Invalid configuration
	GCDAsyncSocketBadParamError,         // Invalid parameter was passed
	GCDAsyncSocketConnectTimeoutError,   // A connect operation timed out
	GCDAsyncSocketReadTimeoutError,      // A read operation timed out
	GCDAsyncSocketWriteTimeoutError,     // A write operation timed out
	GCDAsyncSocketReadMaxedOutError,     // Reached set maxLength without completing
	GCDAsyncSocketClosedError,           // The remote peer closed the connection
	GCDAsyncSocketOtherError,            // Description provided in userInfo
};
typedef enum GCDAsyncSocketError GCDAsyncSocketError;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@interface GCDAsyncSocket : NSObject
{
	uint32_t flags;
	uint16_t config;
	
	id delegate;
	dispatch_queue_t delegateQueue;
	
	int socket4FD;
	int socket6FD;
	int connectIndex;
	NSData * connectInterface4;
	NSData * connectInterface6;
	
	dispatch_queue_t socketQueue;
	
	dispatch_source_t accept4Source;
	dispatch_source_t accept6Source;
	dispatch_source_t connectTimer;
	dispatch_source_t readSource;
	dispatch_source_t writeSource;
	dispatch_source_t readTimer;
	dispatch_source_t writeTimer;
	
	NSMutableArray *readQueue;
	NSMutableArray *writeQueue;
	
	GCDAsyncReadPacket *currentRead;
	GCDAsyncWritePacket *currentWrite;
	
	unsigned long socketFDBytesAvailable;
	
	NSMutableData *partialReadBuffer;
		
#if TARGET_OS_IPHONE
	CFStreamClientContext streamContext;
	CFReadStreamRef readStream;
	CFWriteStreamRef writeStream;
#else
	SSLContextRef sslContext;
	NSMutableData *sslReadBuffer;
	size_t sslWriteCachedLength;
#endif
	
	id userData;
}

/**
 * GCDAsyncSocket uses the standard delegate paradigm,
 * but executes all delegate callbacks on a given delegate dispatch queue.
 * This allows for maximum concurrency, while at the same time providing easy thread safety.
 * 
 * You MUST set a delegate AND delegate dispatch queue before attempting to
 * use the socket, or you will get an error.
 * 
 * The socket queue is optional.
 * If you pass NULL, GCDAsyncSocket will automatically create it's own socket queue.
 * If you choose to provide a socket queue, the socket queue must not be a concurrent queue.
 * 
 * The delegate queue and socket queue can optionally be the same.
**/
- (id)init;
- (id)initWithSocketQueue:(dispatch_queue_t)sq;
- (id)initWithDelegate:(id)aDelegate delegateQueue:(dispatch_queue_t)dq;
- (id)initWithDelegate:(id)aDelegate delegateQueue:(dispatch_queue_t)dq socketQueue:(dispatch_queue_t)sq;

#pragma mark Configuration

- (id)delegate;
- (void)setDelegate:(id)delegate;
- (void)synchronouslySetDelegate:(id)delegate;

- (dispatch_queue_t)delegateQueue;
- (void)setDelegateQueue:(dispatch_queue_t)delegateQueue;
- (void)synchronouslySetDelegateQueue:(dispatch_queue_t)delegateQueue;

- (void)getDelegate:(id *)delegatePtr delegateQueue:(dispatch_queue_t *)delegateQueuePtr;
- (void)setDelegate:(id)delegate delegateQueue:(dispatch_queue_t)delegateQueue;
- (void)synchronouslySetDelegate:(id)delegate delegateQueue:(dispatch_queue_t)delegateQueue;

/**
 * Traditionally sockets are not closed until the conversation is over.
 * However, it is technically possible for the remote enpoint to close its write stream.
 * Our socket would then be notified that there is no more data to be read,
 * but our socket would still be writeable and the remote endpoint could continue to receive our data.
 * 
 * The argument for this confusing functionality stems from the idea that a client could shut down its
 * write stream after sending a request to the server, thus notifying the server there are to be no further requests.
 * In practice, however, this technique did little to help server developers.
 * 
 * To make matters worse, from a TCP perspective there is no way to tell the difference from a read stream close
 * and a full socket close. They both result in the TCP stack receiving a FIN packet. The only way to tell
 * is by continuing to write to the socket. If it was only a read stream close, then writes will continue to work.
 * Otherwise an error will be occur shortly (when the remote end sends us a RST packet).
 * 
 * In addition to the technical challenges and confusion, many high level socket/stream API's provide
 * no support for dealing with the problem. If the read stream is closed, the API immediately declares the
 * socket to be closed, and shuts down the write stream as well. In fact, this is what Apple's CFStream API does.
 * It might sound like poor design at first, but in fact it simplifies development.
 * 
 * The vast majority of the time if the read stream is closed it's because the remote endpoint closed its socket.
 * Thus it actually makes sense to close the socket at this point.
 * And in fact this is what most networking developers want and expect to happen.
 * However, if you are writing a server that interacts with a plethora of clients,
 * you might encounter a client that uses the discouraged technique of shutting down its write stream.
 * If this is the case, you can set this property to NO,
 * and make use of the socketDidCloseReadStream delegate method.
 * 
 * The default value is YES.
**/
- (BOOL)autoDisconnectOnClosedReadStream;
- (void)setAutoDisconnectOnClosedReadStream:(BOOL)flag;

/**
 * By default, both IPv4 and IPv6 are enabled.
 * 
 * For accepting incoming connections, this means GCDAsyncSocket automatically supports both protocols,
 * and can simulataneously accept incoming connections on either protocol.
 * 
 * For outgoing connections, this means GCDAsyncSocket can connect to remote hosts running either protocol.
 * If a DNS lookup returns only IPv4 results, GCDAsyncSocket will automatically use IPv4.
 * If a DNS lookup returns only IPv6 results, GCDAsyncSocket will automatically use IPv6.
 * If a DNS lookup returns both IPv4 and IPv6 results, the preferred protocol will be chosen.
 * By default, the preferred protocol is IPv4, but may be configured as desired.
**/
- (BOOL)isIPv4Enabled;
- (void)setIPv4Enabled:(BOOL)flag;

- (BOOL)isIPv6Enabled;
- (void)setIPv6Enabled:(BOOL)flag;

- (BOOL)isIPv4PreferredOverIPv6;
- (void)setPreferIPv4OverIPv6:(BOOL)flag;

/**
 * User data allows you to associate arbitrary information with the socket.
 * This data is not used internally by socket in any way.
**/
- (id)userData;
- (void)setUserData:(id)arbitraryUserData;

#pragma mark Accepting

/**
 * Tells the socket to begin listening and accepting connections on the given port.
 * When a connection is accepted, a new instance of GCDAsyncSocket will be spawned to handle it,
 * and the socket:didAcceptNewSocket: delegate method will be invoked.
 * 
 * The socket will listen on all available interfaces (e.g. wifi, ethernet, etc)
**/
- (BOOL)acceptOnPort:(uint16_t)port error:(NSError **)errPtr;

/**
 * This method is the same as acceptOnPort:error: with the
 * additional option of specifying which interface to listen on.
 * 
 * For example, you could specify that the socket should only accept connections over ethernet,
 * and not other interfaces such as wifi.
 * 
 * The interface may be specified by name (e.g. "en1" or "lo0") or by IP address (e.g. "192.168.4.34").
 * You may also use the special strings "localhost" or "loopback" to specify that
 * the socket only accept connections from the local machine.
 * 
 * You can see the list of interfaces via the command line utility "ifconfig",
 * or programmatically via the getifaddrs() function.
 * 
 * To accept connections on any interface pass nil, or simply use the acceptOnPort:error: method.
**/
- (BOOL)acceptOnInterface:(NSString *)interface port:(uint16_t)port error:(NSError **)errPtr;

#pragma mark Connecting

/**
 * Connects to the given host and port.
 * 
 * This method invokes connectToHost:onPort:viaInterface:withTimeout:error:
 * and uses the default interface, and no timeout.
**/
- (BOOL)connectToHost:(NSString *)host onPort:(uint16_t)port error:(NSError **)errPtr;

/**
 * Connects to the given host and port with an optional timeout.
 * 
 * This method invokes connectToHost:onPort:viaInterface:withTimeout:error: and uses the default interface.
**/
- (BOOL)connectToHost:(NSString *)host
               onPort:(uint16_t)port
          withTimeout:(NSTimeInterval)timeout
                error:(NSError **)errPtr;

/**
 * Connects to the given host & port, via the optional interface, with an optional timeout.
 * 
 * The host may be a domain name (e.g. "deusty.com") or an IP address string (e.g. "192.168.0.2").
 * The host may also be the special strings "localhost" or "loopback" to specify connecting
 * to a service on the local machine.
 * 
 * The interface may be a name (e.g. "en1" or "lo0") or the corresponding IP address (e.g. "192.168.4.35").
 * The interface may also be used to specify the local port (see below).
 * 
 * To not time out use a negative time interval.
 * 
 * This method will return NO if an error is detected, and set the error pointer (if one was given).
 * Possible errors would be a nil host, invalid interface, or socket is already connected.
 * 
 * If no errors are detected, this method will start a background connect operation and immediately return YES.
 * The delegate callbacks are used to notify you when the socket connects, or if the host was unreachable.
 * 
 * Since this class supports queued reads and writes, you can immediately start reading and/or writing.
 * All read/write operations will be queued, and upon socket connection,
 * the operations will be dequeued and processed in order.
 * 
 * The interface may optionally contain a port number at the end of the string, separated by a colon.
 * This allows you to specify the local port that should be used for the outgoing connection. (read paragraph to end)
 * To specify both interface and local port: "en1:8082" or "192.168.4.35:2424".
 * To specify only local port: ":8082".
 * Please note this is an advanced feature, and is somewhat hidden on purpose.
 * You should understand that 99.999% of the time you should NOT specify the local port for an outgoing connection.
 * If you think you need to, there is a very good chance you have a fundamental misunderstanding somewhere.
 * Local ports do NOT need to match remote ports. In fact, they almost never do.
 * This feature is here for networking professionals using very advanced techniques.
**/
- (BOOL)connectToHost:(NSString *)host
               onPort:(uint16_t)port
         viaInterface:(NSString *)interface
          withTimeout:(NSTimeInterval)timeout
                error:(NSError **)errPtr;

/**
 * Connects to the given address, specified as a sockaddr structure wrapped in a NSData object.
 * For example, a NSData object returned from NSNetService's addresses method.
 * 
 * If you have an existing struct sockaddr you can convert it to a NSData object like so:
 * struct sockaddr sa  -> NSData *dsa = [NSData dataWithBytes:&remoteAddr length:remoteAddr.sa_len];
 * struct sockaddr *sa -> NSData *dsa = [NSData dataWithBytes:remoteAddr length:remoteAddr->sa_len];
 * 
 * This method invokes connectToAdd
**/
- (BOOL)connectToAddress:(NSData *)remoteAddr error:(NSError **)errPtr;

/**
 * This method is the same as connectToAddress:error: with an additional timeout option.
 * To not time out use a negative time interval, or simply use the connectToAddress:error: method.
**/
- (BOOL)connectToAddress:(NSData *)remoteAddr withTimeout:(NSTimeInterval)timeout error:(NSError **)errPtr;

/**
 * Connects to the given address, using the specified interface and timeout.
 * 
 * The address is specified as a sockaddr structure wrapped in a NSData object.
 * For example, a NSData object returned from NSNetService's addresses method.
 * 
 * If you have an existing struct sockaddr you can convert it to a NSData object like so:
 * struct sockaddr sa  -> NSData *dsa = [NSData dataWithBytes:&remoteAddr length:remoteAddr.sa_len];
 * struct sockaddr *sa -> NSData *dsa = [NSData dataWithBytes:remoteAddr length:remoteAddr->sa_len];
 * 
 * The interface may be a name (e.g. "en1" or "lo0") or the corresponding IP address (e.g. "192.168.4.35").
 * The interface may also be used to specify the local port (see below).
 * 
 * The timeout is optional. To not time out use a negative time interval.
 * 
 * This method will return NO if an error is detected, and set the error pointer (if one was given).
 * Possible errors would be a nil host, invalid interface, or socket is already connected.
 * 
 * If no errors are detected, this method will start a background connect operation and immediately return YES.
 * The delegate callbacks are used to notify you when the socket connects, or if the host was unreachable.
 * 
 * Since this class supports queued reads and writes, you can immediately start reading and/or writing.
 * All read/write operations will be queued, and upon socket connection,
 * the operations will be dequeued and processed in order.
 * 
 * The interface may optionally contain a port number at the end of the string, separated by a colon.
 * This allows you to specify the local port that should be used for the outgoing connection. (read paragraph to end)
 * To specify both interface and local port: "en1:8082" or "192.168.4.35:2424".
 * To specify only local port: ":8082".
 * Please note this is an advanced feature, and is somewhat hidden on purpose.
 * You should understand that 99.999% of the time you should NOT specify the local port for an outgoing connection.
 * If you think you need to, there is a very good chance you have a fundamental misunderstanding somewhere.
 * Local ports do NOT need to match remote ports. In fact, they almost never do.
 * This feature is here for networking professionals using very advanced techniques.
**/
- (BOOL)connectToAddress:(NSData *)remoteAddr
            viaInterface:(NSString *)interface
             withTimeout:(NSTimeInterval)timeout
                   error:(NSError **)errPtr;

#pragma mark Disconnecting

/**
 * Disconnects immediately (synchronously). Any pending reads or writes are dropped.
 * 
 * If the socket is not already disconnected, an invocation to the socketDidDisconnect:withError: delegate method
 * will be queued onto the delegateQueue asynchronously (behind any previously queued delegate methods).
 * In other words, the disconnected delegate method will be invoked sometime shortly after this method returns.
 * 
 * Please note the recommended way of releasing a GCDAsyncSocket instance (e.g. in a dealloc method)
 * [asyncSocket setDelegate:nil];
 * [asyncSocket disconnect];
 * [asyncSocket release];
 * 
 * If you plan on disconnecting the socket, and then immediately asking it to connect again,
 * you'll likely want to do so like this:
 * [asyncSocket setDelegate:nil];
 * [asyncSocket disconnect];
 * [asyncSocket setDelegate:self];
 * [asyncSocket connect...];
**/
- (void)disconnect;

/**
 * Disconnects after all pending reads have completed.
 * After calling this, the read and write methods will do nothing.
 * The socket will disconnect even if there are still pending writes.
**/
- (void)disconnectAfterReading;

/**
 * Disconnects after all pending writes have completed.
 * After calling this, the read and write methods will do nothing.
 * The socket will disconnect even if there are still pending reads.
**/
- (void)disconnectAfterWriting;

/**
 * Disconnects after all pending reads and writes have completed.
 * After calling this, the read and write methods will do nothing.
**/
- (void)disconnectAfterReadingAndWriting;

#pragma mark Diagnostics

/**
 * Returns whether the socket is disconnected or connected.
 * 
 * A disconnected socket may be recycled.
 * That is, it can used again for connecting or listening.
 * 
 * If a socket is in the process of connecting, it may be neither disconnected nor connected.
**/
- (BOOL)isDisconnected;
- (BOOL)isConnected;

/**
 * Returns the local or remote host and port to which this socket is connected, or nil and 0 if not connected.
 * The host will be an IP address.
**/
- (NSString *)connectedHost;
- (uint16_t)connectedPort;

- (NSString *)localHost;
- (uint16_t)localPort;

/**
 * Returns the local or remote address to which this socket is connected,
 * specified as a sockaddr structure wrapped in a NSData object.
 * 
 * See also the connectedHost, connectedPort, localHost and localPort methods.
**/
- (NSData *)connectedAddress;
- (NSData *)localAddress;

/**
 * Returns whether the socket is IPv4 or IPv6.
 * An accepting socket may be both.
**/
- (BOOL)isIPv4;
- (BOOL)isIPv6;

/**
 * Returns whether or not the socket has been secured via SSL/TLS.
 * 
 * See also the startTLS method.
**/
- (BOOL)isSecure;

#pragma mark Reading

// The readData and writeData methods won't block (they are asynchronous).
// 
// When a read is complete the socket:didReadData:withTag: delegate method is dispatched on the delegateQueue.
// When a write is complete the socket:didWriteDataWithTag: delegate method is dispatched on the delegateQueue.
// 
// You may optionally set a timeout for any read/write operation. (To not timeout, use a negative time interval.)
// If a read/write opertion times out, the corresponding "socket:shouldTimeout..." delegate method
// is called to optionally allow you to extend the timeout.
// Upon a timeout, the "socket:didDisconnectWithError:" method is called
// 
// The tag is for your convenience.
// You can use it as an array index, step number, state id, pointer, etc.

/**
 * Reads the first available bytes that become available on the socket.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
**/
- (void)readDataWithTimeout:(NSTimeInterval)timeout tag:(long)tag;

/**
 * Reads the first available bytes that become available on the socket.
 * The bytes will be appended to the given byte buffer starting at the given offset.
 * The given buffer will automatically be increased in size if needed.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
 * If the buffer if nil, the socket will create a buffer for you.
 * 
 * If the bufferOffset is greater than the length of the given buffer,
 * the method will do nothing, and the delegate will not be called.
 * 
 * If you pass a buffer, you must not alter it in any way while the socket is using it.
 * After completion, the data returned in socket:didReadData:withTag: will be a subset of the given buffer.
 * That is, it will reference the bytes that were appended to the given buffer via
 * the method [NSData dataWithBytesNoCopy:length:freeWhenDone:NO].
**/
- (void)readDataWithTimeout:(NSTimeInterval)timeout
					 buffer:(NSMutableData *)buffer
			   bufferOffset:(NSUInteger)offset
						tag:(long)tag;

/**
 * Reads the first available bytes that become available on the socket.
 * The bytes will be appended to the given byte buffer starting at the given offset.
 * The given buffer will automatically be increased in size if needed.
 * A maximum of length bytes will be read.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
 * If the buffer if nil, a buffer will automatically be created for you.
 * If maxLength is zero, no length restriction is enforced.
 * 
 * If the bufferOffset is greater than the length of the given buffer,
 * the method will do nothing, and the delegate will not be called.
 * 
 * If you pass a buffer, you must not alter it in any way while the socket is using it.
 * After completion, the data returned in socket:didReadData:withTag: will be a subset of the given buffer.
 * That is, it will reference the bytes that were appended to the given buffer  via
 * the method [NSData dataWithBytesNoCopy:length:freeWhenDone:NO].
**/
- (void)readDataWithTimeout:(NSTimeInterval)timeout
                     buffer:(NSMutableData *)buffer
               bufferOffset:(NSUInteger)offset
                  maxLength:(NSUInteger)length
                        tag:(long)tag;

/**
 * Reads the given number of bytes.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
 * 
 * If the length is 0, this method does nothing and the delegate is not called.
**/
- (void)readDataToLength:(NSUInteger)length withTimeout:(NSTimeInterval)timeout tag:(long)tag;

/**
 * Reads the given number of bytes.
 * The bytes will be appended to the given byte buffer starting at the given offset.
 * The given buffer will automatically be increased in size if needed.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
 * If the buffer if nil, a buffer will automatically be created for you.
 * 
 * If the length is 0, this method does nothing and the delegate is not called.
 * If the bufferOffset is greater than the length of the given buffer,
 * the method will do nothing, and the delegate will not be called.
 * 
 * If you pass a buffer, you must not alter it in any way while AsyncSocket is using it.
 * After completion, the data returned in socket:didReadData:withTag: will be a subset of the given buffer.
 * That is, it will reference the bytes that were appended to the given buffer via
 * the method [NSData dataWithBytesNoCopy:length:freeWhenDone:NO].
**/
- (void)readDataToLength:(NSUInteger)length
             withTimeout:(NSTimeInterval)timeout
                  buffer:(NSMutableData *)buffer
            bufferOffset:(NSUInteger)offset
                     tag:(long)tag;

/**
 * Reads bytes until (and including) the passed "data" parameter, which acts as a separator.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
 * 
 * If you pass nil or zero-length data as the "data" parameter,
 * the method will do nothing (except maybe print a warning), and the delegate will not be called.
 * 
 * To read a line from the socket, use the line separator (e.g. CRLF for HTTP, see below) as the "data" parameter.
 * If you're developing your own custom protocol, be sure your separator can not occur naturally as
 * part of the data between separators.
 * For example, imagine you want to send several small documents over a socket.
 * Using CRLF as a separator is likely unwise, as a CRLF could easily exist within the documents.
 * In this particular example, it would be better to use a protocol similar to HTTP with
 * a header that includes the length of the document.
 * Also be careful that your separator cannot occur naturally as part of the encoding for a character.
 * 
 * The given data (separator) parameter should be immutable.
 * For performance reasons, the socket will retain it, not copy it.
 * So if it is immutable, don't modify it while the socket is using it.
**/
- (void)readDataToData:(NSData *)data withTimeout:(NSTimeInterval)timeout tag:(long)tag;

/**
 * Reads bytes until (and including) the passed "data" parameter, which acts as a separator.
 * The bytes will be appended to the given byte buffer starting at the given offset.
 * The given buffer will automatically be increased in size if needed.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
 * If the buffer if nil, a buffer will automatically be created for you.
 * 
 * If the bufferOffset is greater than the length of the given buffer,
 * the method will do nothing (except maybe print a warning), and the delegate will not be called.
 * 
 * If you pass a buffer, you must not alter it in any way while the socket is using it.
 * After completion, the data returned in socket:didReadData:withTag: will be a subset of the given buffer.
 * That is, it will reference the bytes that were appended to the given buffer via
 * the method [NSData dataWithBytesNoCopy:length:freeWhenDone:NO].
 * 
 * To read a line from the socket, use the line separator (e.g. CRLF for HTTP, see below) as the "data" parameter.
 * If you're developing your own custom protocol, be sure your separator can not occur naturally as
 * part of the data between separators.
 * For example, imagine you want to send several small documents over a socket.
 * Using CRLF as a separator is likely unwise, as a CRLF could easily exist within the documents.
 * In this particular example, it would be better to use a protocol similar to HTTP with
 * a header that includes the length of the document.
 * Also be careful that your separator cannot occur naturally as part of the encoding for a character.
 * 
 * The given data (separator) parameter should be immutable.
 * For performance reasons, the socket will retain it, not copy it.
 * So if it is immutable, don't modify it while the socket is using it.
**/
- (void)readDataToData:(NSData *)data
           withTimeout:(NSTimeInterval)timeout
                buffer:(NSMutableData *)buffer
          bufferOffset:(NSUInteger)offset
                   tag:(long)tag;

/**
 * Reads bytes until (and including) the passed "data" parameter, which acts as a separator.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
 * 
 * If maxLength is zero, no length restriction is enforced.
 * Otherwise if maxLength bytes are read without completing the read,
 * it is treated similarly to a timeout - the socket is closed with a GCDAsyncSocketReadMaxedOutError.
 * The read will complete successfully if exactly maxLength bytes are read and the given data is found at the end.
 * 
 * If you pass nil or zero-length data as the "data" parameter,
 * the method will do nothing (except maybe print a warning), and the delegate will not be called.
 * If you pass a maxLength parameter that is less than the length of the data parameter,
 * the method will do nothing (except maybe print a warning), and the delegate will not be called.
 * 
 * To read a line from the socket, use the line separator (e.g. CRLF for HTTP, see below) as the "data" parameter.
 * If you're developing your own custom protocol, be sure your separator can not occur naturally as
 * part of the data between separators.
 * For example, imagine you want to send several small documents over a socket.
 * Using CRLF as a separator is likely unwise, as a CRLF could easily exist within the documents.
 * In this particular example, it would be better to use a protocol similar to HTTP with
 * a header that includes the length of the document.
 * Also be careful that your separator cannot occur naturally as part of the encoding for a character.
 * 
 * The given data (separator) parameter should be immutable.
 * For performance reasons, the socket will retain it, not copy it.
 * So if it is immutable, don't modify it while the socket is using it.
**/
- (void)readDataToData:(NSData *)data withTimeout:(NSTimeInterval)timeout maxLength:(NSUInteger)length tag:(long)tag;

/**
 * Reads bytes until (and including) the passed "data" parameter, which acts as a separator.
 * The bytes will be appended to the given byte buffer starting at the given offset.
 * The given buffer will automatically be increased in size if needed.
 * 
 * If the timeout value is negative, the read operation will not use a timeout.
 * If the buffer if nil, a buffer will automatically be created for you.
 * 
 * If maxLength is zero, no length restriction is enforced.
 * Otherwise if maxLength bytes are read without completing the read,
 * it is treated similarly to a timeout - the socket is closed with a GCDAsyncSocketReadMaxedOutError.
 * The read will complete successfully if exactly maxLength bytes are read and the given data is found at the end.
 * 
 * If you pass a maxLength parameter that is less than the length of the data (separator) parameter,
 * the method will do nothing (except maybe print a warning), and the delegate will not be called.
 * If the bufferOffset is greater than the length of the given buffer,
 * the method will do nothing (except maybe print a warning), and the delegate will not be called.
 * 
 * If you pass a buffer, you must not alter it in any way while the socket is using it.
 * After completion, the data returned in socket:didReadData:withTag: will be a subset of the given buffer.
 * That is, it will reference the bytes that were appended to the given buffer via
 * the method [NSData dataWithBytesNoCopy:length:freeWhenDone:NO].
 * 
 * To read a line from the socket, use the line separator (e.g. CRLF for HTTP, see below) as the "data" parameter.
 * If you're developing your own custom protocol, be sure your separator can not occur naturally as
 * part of the data between separators.
 * For example, imagine you want to send several small documents over a socket.
 * Using CRLF as a separator is likely unwise, as a CRLF could easily exist within the documents.
 * In this particular example, it would be better to use a protocol similar to HTTP with
 * a header that includes the length of the document.
 * Also be careful that your separator cannot occur naturally as part of the encoding for a character.
 * 
 * The given data (separator) parameter should be immutable.
 * For performance reasons, the socket will retain it, not copy it.
 * So if it is immutable, don't modify it while the socket is using it.
**/
- (void)readDataToData:(NSData *)data
           withTimeout:(NSTimeInterval)timeout
                buffer:(NSMutableData *)buffer
          bufferOffset:(NSUInteger)offset
             maxLength:(NSUInteger)length
                   tag:(long)tag;

#pragma mark Writing

/**
 * Writes data to the socket, and calls the delegate when finished.
 * 
 * If you pass in nil or zero-length data, this method does nothing and the delegate will not be called.
 * If the timeout value is negative, the write operation will not use a timeout.
 * 
 * Thread-Safety Note:
 * If the given data parameter is mutable (NSMutableData) then you MUST NOT alter the data while
 * the socket is writing it. In other words, it's not safe to alter the data until after the delegate method
 * socket:didWriteDataWithTag: is invoked signifying that this particular write operation has completed.
 * This is due to the fact that GCDAsyncSocket does NOT copy the data. It simply retains it.
 * This is for performance reasons. Often times, if NSMutableData is passed, it is because
 * a request/response was built up in memory. Copying this data adds an unwanted/unneeded overhead.
 * If you need to write data from an immutable buffer, and you need to alter the buffer before the socket
 * completes writing the bytes (which is NOT immediately after this method returns, but rather at a later time
 * when the delegate method notifies you), then you should first copy the bytes, and pass the copy to this method.
**/
- (void)writeData:(NSData *)data withTimeout:(NSTimeInterval)timeout tag:(long)tag;

#pragma mark Security

/**
 * Secures the connection using SSL/TLS.
 * 
 * This method may be called at any time, and the TLS handshake will occur after all pending reads and writes
 * are finished. This allows one the option of sending a protocol dependent StartTLS message, and queuing
 * the upgrade to TLS at the same time, without having to wait for the write to finish.
 * Any reads or writes scheduled after this method is called will occur over the secured connection.
 * 
 * The possible keys and values for the TLS settings are well documented.
 * Some possible keys are:
 * - kCFStreamSSLLevel
 * - kCFStreamSSLAllowsExpiredCertificates
 * - kCFStreamSSLAllowsExpiredRoots
 * - kCFStreamSSLAllowsAnyRoot
 * - kCFStreamSSLValidatesCertificateChain
 * - kCFStreamSSLPeerName
 * - kCFStreamSSLCertificates
 * - kCFStreamSSLIsServer
 * 
 * Please refer to Apple's documentation for associated values, as well as other possible keys.
 * 
 * If you pass in nil or an empty dictionary, the default settings will be used.
 * 
 * The default settings will check to make sure the remote party's certificate is signed by a
 * trusted 3rd party certificate agency (e.g. verisign) and that the certificate is not expired.
 * However it will not verify the name on the certificate unless you
 * give it a name to verify against via the kCFStreamSSLPeerName key.
 * The security implications of this are important to understand.
 * Imagine you are attempting to create a secure connection to MySecureServer.com,
 * but your socket gets directed to MaliciousServer.com because of a hacked DNS server.
 * If you simply use the default settings, and MaliciousServer.com has a valid certificate,
 * the default settings will not detect any problems since the certificate is valid.
 * To properly secure your connection in this particular scenario you
 * should set the kCFStreamSSLPeerName property to "MySecureServer.com".
 * If you do not know the peer name of the remote host in advance (for example, you're not sure
 * if it will be "domain.com" or "www.domain.com"), then you can use the default settings to validate the
 * certificate, and then use the X509Certificate class to verify the issuer after the socket has been secured.
 * The X509Certificate class is part of the CocoaAsyncSocket open source project.
 **/
- (void)startTLS:(NSDictionary *)tlsSettings;

#pragma mark Advanced

/**
 * It's not thread-safe to access certain variables from outside the socket's internal queue.
 * 
 * For example, the socket file descriptor.
 * File descriptors are simply integers which reference an index in the per-process file table.
 * However, when one requests a new file descriptor (by opening a file or socket),
 * the file descriptor returned is guaranteed to be the lowest numbered unused descriptor.
 * So if we're not careful, the following could be possible:
 * 
 * - Thread A invokes a method which returns the socket's file descriptor.
 * - The socket is closed via the socket's internal queue on thread B.
 * - Thread C opens a file, and subsequently receives the file descriptor that was previously the socket's FD.
 * - Thread A is now accessing/altering the file instead of the socket.
 * 
 * In addition to this, other variables are not actually objects,
 * and thus cannot be retained/released or even autoreleased.
 * An example is the sslContext, of type SSLContextRef, which is actually a malloc'd struct.
 * 
 * Although there are internal variables that make it difficult to maintain thread-safety,
 * it is important to provide access to these variables
 * to ensure this class can be used in a wide array of environments.
 * This method helps to accomplish this by invoking the current block on the socket's internal queue.
 * The methods below can be invoked from within the block to access
 * those generally thread-unsafe internal variables in a thread-safe manner.
 * The given block will be invoked synchronously on the socket's internal queue.
 * 
 * If you save references to any protected variables and use them outside the block, you do so at your own peril.
**/
- (void)performBlock:(dispatch_block_t)block;

/**
 * These methods are only available from within the context of a performBlock: invocation.
 * See the documentation for the performBlock: method above.
 * 
 * Provides access to the socket's file descriptor(s).
 * If the socket is a server socket (is accepting incoming connections),
 * it might actually have multiple internal socket file descriptors - one for IPv4 and one for IPv6.
**/
- (int)socketFD;
- (int)socket4FD;
- (int)socket6FD;

#if TARGET_OS_IPHONE

/**
 * These methods are only available from within the context of a performBlock: invocation.
 * See the documentation for the performBlock: method above.
 * 
 * Provides access to the socket's internal CFReadStream/CFWriteStream.
 * 
 * These streams are only used as workarounds for specific iOS shortcomings:
 * 
 * - Apple has decided to keep the SecureTransport framework private is iOS.
 *   This means the only supplied way to do SSL/TLS is via CFStream or some other API layered on top of it.
 *   Thus, in order to provide SSL/TLS support on iOS we are forced to rely on CFStream,
 *   instead of the preferred and faster and more powerful SecureTransport.
 * 
 * - If a socket doesn't have backgrounding enabled, and that socket is closed while the app is backgrounded,
 *   Apple only bothers to notify us via the CFStream API.
 *   The faster and more powerful GCD API isn't notified properly in this case.
 * 
 * See also: (BOOL)enableBackgroundingOnSocket
**/
- (CFReadStreamRef)readStream;
- (CFWriteStreamRef)writeStream;

/**
 * This method is only available from within the context of a performBlock: invocation.
 * See the documentation for the performBlock: method above.
 * 
 * Configures the socket to allow it to operate when the iOS application has been backgrounded.
 * In other words, this method creates a read & write stream, and invokes:
 * 
 * CFReadStreamSetProperty(readStream, kCFStreamNetworkServiceType, kCFStreamNetworkServiceTypeVoIP);
 * CFWriteStreamSetProperty(writeStream, kCFStreamNetworkServiceType, kCFStreamNetworkServiceTypeVoIP);
 * 
 * Returns YES if successful, NO otherwise.
 * 
 * Note: Apple does not officially support backgrounding server sockets.
 * That is, if your socket is accepting incoming connections, Apple does not officially support
 * allowing iOS applications to accept incoming connections while an app is backgrounded.
 * 
 * Example usage:
 * 
 * - (void)socket:(GCDAsyncSocket *)sock didConnectToHost:(NSString *)host port:(uint16_t)port
 * {
 *     [asyncSocket performBlock:^{
 *         [asyncSocket enableBackgroundingOnSocket];
 *     }];
 * }
**/
- (BOOL)enableBackgroundingOnSocket;

#else

/**
 * This method is only available from within the context of a performBlock: invocation.
 * See the documentation for the performBlock: method above.
 * 
 * Provides access to the socket's SSLContext, if SSL/TLS has been started on the socket.
**/
- (SSLContextRef)sslContext;

#endif

#pragma mark Utilities

/**
 * Extracting host and port information from raw address data.
**/
+ (NSString *)hostFromAddress:(NSData *)address;
+ (uint16_t)portFromAddress:(NSData *)address;
+ (BOOL)getHost:(NSString **)hostPtr port:(uint16_t *)portPtr fromAddress:(NSData *)address;

/**
 * A few common line separators, for use with the readDataToData:... methods.
**/
+ (NSData *)CRLFData;   // 0x0D0A
+ (NSData *)CRData;     // 0x0D
+ (NSData *)LFData;     // 0x0A
+ (NSData *)ZeroData;   // 0x00

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@protocol GCDAsyncSocketDelegate
@optional

/**
 * This method is called immediately prior to socket:didAcceptNewSocket:.
 * It optionally allows a listening socket to specify the socketQueue for a new accepted socket.
 * If this method is not implemented, or returns NULL, the new accepted socket will create its own default queue.
 * 
 * Since you cannot autorelease a dispatch_queue,
 * this method uses the "new" prefix in its name to specify that the returned queue has been retained.
 * 
 * Thus you could do something like this in the implementation:
 * return dispatch_queue_create("MyQueue", NULL);
 * 
 * If you are placing multiple sockets on the same queue,
 * then care should be taken to increment the retain count each time this method is invoked.
 * 
 * For example, your implementation might look something like this:
 * dispatch_retain(myExistingQueue);
 * return myExistingQueue;
**/
- (dispatch_queue_t)newSocketQueueForConnectionFromAddress:(NSData *)address onSocket:(GCDAsyncSocket *)sock;

/**
 * Called when a socket accepts a connection.
 * Another socket is automatically spawned to handle it.
 * 
 * You must retain the newSocket if you wish to handle the connection.
 * Otherwise the newSocket instance will be released and the spawned connection will be closed.
 * 
 * By default the new socket will have the same delegate and delegateQueue.
 * You may, of course, change this at any time.
**/
- (void)socket:(GCDAsyncSocket *)sock didAcceptNewSocket:(GCDAsyncSocket *)newSocket;

/**
 * Called when a socket connects and is ready for reading and writing.
 * The host parameter will be an IP address, not a DNS name.
**/
- (void)socket:(GCDAsyncSocket *)sock didConnectToHost:(NSString *)host port:(uint16_t)port;

/**
 * Called when a socket has completed reading the requested data into memory.
 * Not called if there is an error.
**/
- (void)socket:(GCDAsyncSocket *)sock didReadData:(NSData *)data withTag:(long)tag;

/**
 * Called when a socket has read in data, but has not yet completed the read.
 * This would occur if using readToData: or readToLength: methods.
 * It may be used to for things such as updating progress bars.
**/
- (void)socket:(GCDAsyncSocket *)sock didReadPartialDataOfLength:(NSUInteger)partialLength tag:(long)tag;

/**
 * Called when a socket has completed writing the requested data. Not called if there is an error.
**/
- (void)socket:(GCDAsyncSocket *)sock didWriteDataWithTag:(long)tag;

/**
 * Called when a socket has written some data, but has not yet completed the entire write.
 * It may be used to for things such as updating progress bars.
**/
- (void)socket:(GCDAsyncSocket *)sock didWritePartialDataOfLength:(NSUInteger)partialLength tag:(long)tag;

/**
 * Called if a read operation has reached its timeout without completing.
 * This method allows you to optionally extend the timeout.
 * If you return a positive time interval (> 0) the read's timeout will be extended by the given amount.
 * If you don't implement this method, or return a non-positive time interval (<= 0) the read will timeout as usual.
 * 
 * The elapsed parameter is the sum of the original timeout, plus any additions previously added via this method.
 * The length parameter is the number of bytes that have been read so far for the read operation.
 * 
 * Note that this method may be called multiple times for a single read if you return positive numbers.
**/
- (NSTimeInterval)socket:(GCDAsyncSocket *)sock shouldTimeoutReadWithTag:(long)tag
                                                                 elapsed:(NSTimeInterval)elapsed
                                                               bytesDone:(NSUInteger)length;

/**
 * Called if a write operation has reached its timeout without completing.
 * This method allows you to optionally extend the timeout.
 * If you return a positive time interval (> 0) the write's timeout will be extended by the given amount.
 * If you don't implement this method, or return a non-positive time interval (<= 0) the write will timeout as usual.
 * 
 * The elapsed parameter is the sum of the original timeout, plus any additions previously added via this method.
 * The length parameter is the number of bytes that have been written so far for the write operation.
 * 
 * Note that this method may be called multiple times for a single write if you return positive numbers.
**/
- (NSTimeInterval)socket:(GCDAsyncSocket *)sock shouldTimeoutWriteWithTag:(long)tag
                                                                  elapsed:(NSTimeInterval)elapsed
                                                                bytesDone:(NSUInteger)length;

/**
 * Conditionally called if the read stream closes, but the write stream may still be writeable.
 * 
 * This delegate method is only called if autoDisconnectOnClosedReadStream has been set to NO.
 * See the discussion on the autoDisconnectOnClosedReadStream method for more information.
**/
- (void)socketDidCloseReadStream:(GCDAsyncSocket *)sock;

/**
 * Called when a socket disconnects with or without error.
 * 
 * If you call the disconnect method, and the socket wasn't already disconnected,
 * this delegate method will be called before the disconnect method returns.
**/
- (void)socketDidDisconnect:(GCDAsyncSocket *)sock withError:(NSError *)err;

/**
 * Called after the socket has successfully completed SSL/TLS negotiation.
 * This method is not called unless you use the provided startTLS method.
 * 
 * If a SSL/TLS negotiation fails (invalid certificate, etc) then the socket will immediately close,
 * and the socketDidDisconnect:withError: delegate method will be called with the specific SSL error code.
**/
- (void)socketDidSecure:(GCDAsyncSocket *)sock;

@end
