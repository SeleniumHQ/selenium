/*
 Copyright (C) 2009-2011 Stig Brautaset. All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 
 * Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
 
 * Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
 
 * Neither the name of the author nor the names of its contributors may be used
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

/**
 @page json2objc JSON to Objective-C
 
 JSON is mapped to Objective-C types in the following way:
 
 @li null    -> NSNull
 @li string  -> NSString
 @li array   -> NSMutableArray
 @li object  -> NSMutableDictionary
 @li true    -> NSNumber's -numberWithBool:YES
 @li false   -> NSNumber's -numberWithBool:NO
 @li integer up to 19 digits -> NSNumber's -numberWithLongLong:
 @li all other numbers       -> NSDecimalNumber
 
 Since Objective-C doesn't have a dedicated class for boolean values,
 these turns into NSNumber instances. However, since these are
 initialised with the -initWithBool: method they round-trip back to JSON
 properly. In other words, they won't silently suddenly become 0 or 1;
 they'll be represented as 'true' and 'false' again.
 
 As an optimisation integers up to 19 digits in length (the max length
 for signed long long integers) turn into NSNumber instances, while
 complex ones turn into NSDecimalNumber instances. We can thus avoid any
 loss of precision as JSON allows ridiculously large numbers.

 @page objc2json Objective-C to JSON
 
 Objective-C types are mapped to JSON types in the following way:
 
 @li NSNull        -> null
 @li NSString      -> string
 @li NSArray       -> array
 @li NSDictionary  -> object
 @li NSNumber's -initWithBool:YES -> true
 @li NSNumber's -initWithBool:NO  -> false
 @li NSNumber      -> number
 
 @note In JSON the keys of an object must be strings. NSDictionary
 keys need not be, but attempting to convert an NSDictionary with
 non-string keys into JSON will throw an exception.
 
 NSNumber instances created with the -numberWithBool: method are
 converted into the JSON boolean "true" and "false" values, and vice
 versa. Any other NSNumber instances are converted to a JSON number the
 way you would expect.

 */

#import "SBJsonParser.h"
#import "SBJsonWriter.h"
#import "SBJsonStreamParser.h"
#import "SBJsonStreamParserAdapter.h"
#import "SBJsonStreamWriter.h"
#import "NSObject+SBJson.h"

