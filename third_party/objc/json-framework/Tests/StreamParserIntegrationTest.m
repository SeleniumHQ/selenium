/*
 Copyright (c) 2010, Stig Brautaset.
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:
 
   Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
  
   Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
 
   Neither the name of the the author nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


#import <SenTestingKit/SenTestingKit.h>
#import <SBJson/SBJson.h>

@interface StreamParserIntegrationTest : SenTestCase < SBJsonStreamParserAdapterDelegate> {
	SBJsonStreamParser *parser;
	SBJsonStreamParserAdapter *adapter;
	NSUInteger arrayCount, objectCount;
	NSDirectoryEnumerator *files;
	NSString *path;
}
@end

@implementation StreamParserIntegrationTest

- (void)setUp {
	adapter = [SBJsonStreamParserAdapter new];
	adapter.delegate = self;
	
	parser = [SBJsonStreamParser new];
	parser.delegate = adapter;
	parser.supportMultipleDocuments = YES;
	
	arrayCount = objectCount = 0u;

	path = @"Tests/Stream";
	files = [[NSFileManager defaultManager] enumeratorAtPath:path];

}

- (void)parser:(SBJsonStreamParser *)parser foundArray:(NSArray *)array {
	arrayCount++;
}

- (void)parser:(SBJsonStreamParser *)parser foundObject:(NSDictionary *)dict {
	objectCount++;
}

/*
 This test reads a 100k chunk of data downloaded from 
 http://stream.twitter.com/1/statuses/sample.json 
 and split into 1k files. It simulates streaming by parsing
 this data incrementally.
 */
- (void)testMultipleDocuments {
	NSString *fileName;
    while ((fileName = [files nextObject])) {
		NSString *file = [path stringByAppendingPathComponent:fileName];
		NSLog(@"Parsing file: %@", file);
		
		NSData *data = [NSData dataWithContentsOfMappedFile:file];
		STAssertNotNil(data, nil);
	
		STAssertEquals([parser parse:data], SBJsonStreamParserWaitingForData, @"%@ - %@", file, parser.error);
	}
	STAssertEquals(arrayCount, (NSUInteger)0, nil);
	STAssertEquals(objectCount, (NSUInteger)98, nil);
}

- (void)parseArrayOfObjects {
	[parser parse:[NSData dataWithBytes:"[" length:1]];
	for (int i = 1;; i++) {
		char *utf8 = "{\"foo\":[],\"bar\":[]}";
		[parser parse:[NSData dataWithBytes:utf8 length:strlen(utf8)]];
		if (i == 100)
			break;
		[parser parse:[NSData dataWithBytes:"," length:1]];
	}
	[parser parse:[NSData dataWithBytes:"]" length:1]];
}

- (void)testSingleArray {
	[self parseArrayOfObjects];
	STAssertEquals(arrayCount, (NSUInteger)1, nil);
	STAssertEquals(objectCount, (NSUInteger)0, nil);
}

- (void)testSkipArray {
	adapter.levelsToSkip = 1;
	[self parseArrayOfObjects];
	STAssertEquals(arrayCount, (NSUInteger)0, nil);
	STAssertEquals(objectCount, (NSUInteger)100, nil);	
}

- (void)testSkipArrayAndObject {
	adapter.levelsToSkip = 2;
	[self parseArrayOfObjects];
	STAssertEquals(arrayCount, (NSUInteger)200, nil);
	STAssertEquals(objectCount, (NSUInteger)0, nil);	
}


@end