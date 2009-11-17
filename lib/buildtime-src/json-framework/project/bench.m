/*
Copyright (C) 25/04/2008 Stig Brautaset. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

  Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

  Neither the name of the author nor the names of its contributors may be used
  to endorse or promote products derived from this software without specific
  prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

#import <stdio.h>
#import "JSON.h"

#define COUNT 500

int main(int argc, char **argv) {
    NSAutoreleasePool *outer = [NSAutoreleasePool new];
    
    if (argc != 2) {
        printf("Usage: %s file-containing-json\n", argv[0]);
        return 1;
    }

    SBJSON *json = [SBJSON new];
    NSString *filename = [NSString stringWithCString:argv[1]];
    NSString *repr = [NSString stringWithContentsOfFile:filename];
    
    NSAutoreleasePool *inner = [NSAutoreleasePool new];
    NSDate *start = [NSDate date];
    for (int i = 0; i < COUNT; i++) {
        [json objectWithString:repr error:NULL];
        [json objectWithString:repr error:NULL];
        [json objectWithString:repr error:NULL];
        [json objectWithString:repr error:NULL];
        [json objectWithString:repr error:NULL];
    }
    double duration = -[start timeIntervalSinceNow];
    printf("Decode: %f\n", 5 * COUNT / duration);
    [inner release];
    
    id object = [repr JSONValue];
    inner = [NSAutoreleasePool new];
    start = [NSDate date];
    for (int i = 0; i < COUNT; i++) {
        [json stringWithObject:object error:NULL];
        [json stringWithObject:object error:NULL];
        [json stringWithObject:object error:NULL];
        [json stringWithObject:object error:NULL];
        [json stringWithObject:object error:NULL];
    }
    duration = -[start timeIntervalSinceNow];
    printf("Encode: %f\n", 5 * COUNT / duration);
    [inner release];
    
    [outer release];
    return 0;
}