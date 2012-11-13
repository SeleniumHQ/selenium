/*
 Copyright (C) 2011 Stig Brautaset. All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 
 * Neither the name of the author nor the names of its contributors
 may be used to endorse or promote products derived from this
 software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 */

#import "JsonTestCase.h"



@implementation JsonTestCase

- (void)setUp {
    count = 0;
    parser = [[SBJsonParser alloc] init];
    writer = [[SBJsonWriter alloc] init];
}

- (NSString*)otherFileName {
    return @"output";
}

+ (NSString *)pathForSuite:(NSString *)suite {
    // First, can we just find the files from a relative path (Mac OSX tests)
    NSFileManager *manager = [NSFileManager new];
    BOOL isDir = NO;
    if ([manager fileExistsAtPath:suite isDirectory:&isDir] && YES == isDir) {
        return suite;
    } else {
        // Fall back to checking to see if the files are found in a bundle (fix for iOS tests)
        for (NSBundle *bundle in [NSBundle allBundles]) {
            NSString *path = [NSString stringWithFormat:@"%@/%@", [bundle resourcePath], suite];
            isDir = YES;
            if (NO == [manager fileExistsAtPath:path isDirectory:&isDir] || NO == isDir)
                continue;
            
            NSLog(@"Valid bundle path for suite '%@' : %@", suite, path);
            return path;
        }
    }
    
    return nil;
}

- (void)foreachTestInSuite:(NSString *)suite apply:(JsonTestCaseBlock)block {
    NSFileManager *manager = [NSFileManager new];
    NSString *rootPath = [[self class] pathForSuite:suite];
    NSEnumerator *enumerator = [manager enumeratorAtPath:rootPath];
    
    for (NSString *file in enumerator) {
        NSString *path = [rootPath stringByAppendingPathComponent:file];
        NSString *inpath = [path stringByAppendingPathComponent:@"input"];
        
        if ([manager isReadableFileAtPath:inpath]) {
            NSString *outpath = [path stringByAppendingPathComponent:[self otherFileName]];
            STAssertTrue([manager isReadableFileAtPath:outpath], nil);
            block(inpath, outpath);
            count++;
        }
    }
}

@end
