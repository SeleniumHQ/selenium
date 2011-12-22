#import <Foundation/Foundation.h>


@protocol HTTPResponse

/**
 * Returns the length of the data in bytes.
 * If you don't know the length in advance, implement the isChunked method and have it return YES.
**/
- (UInt64)contentLength;

/**
 * The HTTP server supports range requests in order to allow things like
 * file download resumption and optimized streaming on mobile devices.
**/
- (UInt64)offset;
- (void)setOffset:(UInt64)offset;

/**
 * Returns the data for the response.
 * You do not have to return data of the exact length that is given.
 * You may optionally return data of a lesser length.
 * However, you must never return data of a greater length than requested.
 * Doing so could disrupt proper support for range requests.
 * 
 * To support asynchronous responses, read the discussion at the bottom of this header.
**/
- (NSData *)readDataOfLength:(NSUInteger)length;

/**
 * Should only return YES after the HTTPConnection has read all available data.
 * That is, all data for the response has been returned to the HTTPConnection via the readDataOfLength method.
**/
- (BOOL)isDone;

@optional

/**
 * If you need time to calculate any part of the HTTP response headers (status code or header fields),
 * this method allows you to delay sending the headers so that you may asynchronously execute the calculations.
 * Simply implement this method and return YES until you have everything you need concerning the headers.
 * 
 * This method ties into the asynchronous response architecture of the HTTPConnection.
 * You should read the full discussion at the bottom of this header.
 * 
 * If you return YES from this method,
 * the HTTPConnection will wait for you to invoke the responseHasAvailableData method.
 * After you do, the HTTPConnection will again invoke this method to see if the response is ready to send the headers.
 * 
 * You should only delay sending the headers until you have everything you need concerning just the headers.
 * Asynchronously generating the body of the response is not an excuse to delay sending the headers.
 * Instead you should tie into the asynchronous response architecture, and use techniques such as the isChunked method.
 * 
 * Important: You should read the discussion at the bottom of this header.
**/
- (BOOL)delayResponeHeaders;

/**
 * Status code for response.
 * Allows for responses such as redirect (301), etc.
**/
- (NSInteger)status;

/**
 * If you want to add any extra HTTP headers to the response,
 * simply return them in a dictionary in this method.
**/
- (NSDictionary *)httpHeaders;

/**
 * If you don't know the content-length in advance,
 * implement this method in your custom response class and return YES.
 * 
 * Important: You should read the discussion at the bottom of this header.
**/
- (BOOL)isChunked;

/**
 * This method is called from the HTTPConnection class when the connection is closed,
 * or when the connection is finished with the response.
 * If your response is asynchronous, you should implement this method so you know not to
 * invoke any methods on the HTTPConnection after this method is called (as the connection may be deallocated).
**/
- (void)connectionDidClose;

@end


/**
 * Important notice to those implementing custom asynchronous and/or chunked responses:
 * 
 * HTTPConnection supports asynchronous responses.  All you have to do in your custom response class is
 * asynchronously generate the response, and invoke HTTPConnection's responseHasAvailableData method.
 * You don't have to wait until you have all of the response ready to invoke this method.  For example, if you
 * generate the response in incremental chunks, you could call responseHasAvailableData after generating
 * each chunk.  Please see the HTTPAsyncFileResponse class for an example of how to do this.
 * 
 * The normal flow of events for an HTTPConnection while responding to a request is like this:
 *  - Send http resopnse headers
 *  - Get data from response via readDataOfLength method.
 *  - Add data to asyncSocket's write queue.
 *  - Wait for asyncSocket to notify it that the data has been sent.
 *  - Get more data from response via readDataOfLength method.
 *  - ... continue this cycle until the entire response has been sent.
 * 
 * With an asynchronous response, the flow is a little different.
 * 
 * First the HTTPResponse is given the opportunity to postpone sending the HTTP response headers.
 * This allows the response to asynchronously execute any code needed to calculate a part of the header.
 * An example might be the response needs to generate some custom header fields,
 * or perhaps the response needs to look for a resource on network-attached storage.
 * Since the network-attached storage may be slow, the response doesn't know whether to send a 200 or 404 yet.
 * In situations such as this, the HTTPResponse simply implements the delayResponseHeaders method and returns YES.
 * After returning YES from this method, the HTTPConnection will wait until the response invokes its
 * responseHasAvailableData method. After this occurs, the HTTPConnection will again query the delayResponseHeaders
 * method to see if the response is ready to send the headers.
 * This cycle will continue until the delayResponseHeaders method returns NO.
 * 
 * You should only delay sending the response headers until you have everything you need concerning just the headers.
 * Asynchronously generating the body of the response is not an excuse to delay sending the headers.
 * 
 * After the response headers have been sent, the HTTPConnection calls your readDataOfLength method.
 * You may or may not have any available data at this point. If you don't, then simply return nil.
 * You should later invoke HTTPConnection's responseHasAvailableData when you have data to send.
 * 
 * You don't have to keep track of when you return nil in the readDataOfLength method, or how many times you've invoked
 * responseHasAvailableData. Just simply call responseHasAvailableData whenever you've generated new data, and
 * return nil in your readDataOfLength whenever you don't have any available data in the requested range.
 * HTTPConnection will automatically detect when it should be requesting new data and will act appropriately.
 * 
 * It's important that you also keep in mind that the HTTP server supports range requests.
 * The setOffset method is mandatory, and should not be ignored.
 * Make sure you take into account the offset within the readDataOfLength method.
 * You should also be aware that the HTTPConnection automatically sorts any range requests.
 * So if your setOffset method is called with a value of 100, then you can safely release bytes 0-99.
 * 
 * HTTPConnection can also help you keep your memory footprint small.
 * Imagine you're dynamically generating a 10 MB response.  You probably don't want to load all this data into
 * RAM, and sit around waiting for HTTPConnection to slowly send it out over the network.  All you need to do
 * is pay attention to when HTTPConnection requests more data via readDataOfLength.  This is because HTTPConnection
 * will never allow asyncSocket's write queue to get much bigger than READ_CHUNKSIZE bytes.  You should
 * consider how you might be able to take advantage of this fact to generate your asynchronous response on demand,
 * while at the same time keeping your memory footprint small, and your application lightning fast.
 * 
 * If you don't know the content-length in advanced, you should also implement the isChunked method.
 * This means the response will not include a Content-Length header, and will instead use "Transfer-Encoding: chunked".
 * There's a good chance that if your response is asynchronous and dynamic, it's also chunked.
 * If your response is chunked, you don't need to worry about range requests.
**/
