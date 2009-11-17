/*
Copyright (C) 2008 Stig Brautaset. All rights reserved.

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

#import "SBJSON.h"

NSString * SBJSONErrorDomain = @"org.brautaset.JSON.ErrorDomain";

@interface SBJSON (Generator)

- (BOOL)appendValue:(id)fragment into:(NSMutableString*)json error:(NSError**)error;
- (BOOL)appendArray:(NSArray*)fragment into:(NSMutableString*)json error:(NSError**)error;
- (BOOL)appendDictionary:(NSDictionary*)fragment into:(NSMutableString*)json error:(NSError**)error;
- (BOOL)appendString:(NSString*)fragment into:(NSMutableString*)json error:(NSError**)error;

- (NSString*)indent;

@end

@interface SBJSON (Scanner)

- (BOOL)scanValue:(NSObject **)o error:(NSError **)error;

- (BOOL)scanRestOfArray:(NSMutableArray **)o error:(NSError **)error;
- (BOOL)scanRestOfDictionary:(NSMutableDictionary **)o error:(NSError **)error;
- (BOOL)scanRestOfNull:(NSNull **)o error:(NSError **)error;
- (BOOL)scanRestOfFalse:(NSNumber **)o error:(NSError **)error;
- (BOOL)scanRestOfTrue:(NSNumber **)o error:(NSError **)error;
- (BOOL)scanRestOfString:(NSMutableString **)o error:(NSError **)error;

// Cannot manage without looking at the first digit
- (BOOL)scanNumber:(NSNumber **)o error:(NSError **)error;

- (BOOL)scanHexQuad:(unichar *)x error:(NSError **)error;
- (BOOL)scanUnicodeChar:(unichar *)x error:(NSError **)error;

- (BOOL)scanIsAtEnd;

@end

#pragma mark Private utilities

#define skipWhitespace(c) while (isspace(*c)) c++
#define skipDigits(c) while (isdigit(*c)) c++

static NSError *err(int code, NSString *str) {
    NSDictionary *ui = [NSDictionary dictionaryWithObject:str forKey:NSLocalizedDescriptionKey];
    return [NSError errorWithDomain:SBJSONErrorDomain code:code userInfo:ui];
}

static NSError *errWithUnderlier(int code, NSError **u, NSString *str) {
    if (!u)
        return err(code, str);
    
    NSDictionary *ui = [NSDictionary dictionaryWithObjectsAndKeys:
                        str, NSLocalizedDescriptionKey,
                        *u, NSUnderlyingErrorKey,
                        nil];
    return [NSError errorWithDomain:SBJSONErrorDomain code:code userInfo:ui];
}


@implementation SBJSON

static char ctrl[0x22];

+ (void)initialize
{
    ctrl[0] = '\"';
    ctrl[1] = '\\';
    for (int i = 1; i < 0x20; i++)
        ctrl[i+1] = i;
    ctrl[0x21] = 0;    
}

- (id)init {
    if (self = [super init]) {
        [self setMaxDepth:512];
    }
    return self;
}

#pragma mark Generator


/**
 Returns a string containing JSON representation of the passed in value, or nil on error.
 If nil is returned and @p error is not NULL, @p *error can be interrogated to find the cause of the error.
 
 @param value any instance that can be represented as a JSON fragment
 @param allowScalar wether to return json fragments for scalar objects
 @param error used to return an error by reference (pass NULL if this is not desired)
 */
- (NSString*)stringWithObject:(id)value allowScalar:(BOOL)allowScalar error:(NSError**)error {
    depth = 0;
    NSMutableString *json = [NSMutableString stringWithCapacity:128];
    
    NSError *err2 = nil;
    if (!allowScalar && ![value isKindOfClass:[NSDictionary class]] && ![value isKindOfClass:[NSArray class]]) {
        err2 = err(EFRAGMENT, @"Not valid type for JSON");        
        
    } else if ([self appendValue:value into:json error:&err2]) {
        return json;
    }
    
    if (error)
        *error = err2;
    return nil;
}

/**
 Returns a string containing JSON representation of the passed in value, or nil on error.
 If nil is returned and @p error is not NULL, @p error can be interrogated to find the cause of the error.
 
 @param value any instance that can be represented as a JSON fragment
 @param error used to return an error by reference (pass NULL if this is not desired)
 */
- (NSString*)stringWithFragment:(id)value error:(NSError**)error {
    return [self stringWithObject:value allowScalar:YES error:error];
}

/**
 Returns a string containing JSON representation of the passed in value, or nil on error.
 If nil is returned and @p error is not NULL, @p error can be interrogated to find the cause of the error.
 
 @param value a NSDictionary or NSArray instance
 @param error used to return an error by reference (pass NULL if this is not desired)
 */
- (NSString*)stringWithObject:(id)value error:(NSError**)error {
    return [self stringWithObject:value allowScalar:NO error:error];
}


- (NSString*)indent {
    return [@"\n" stringByPaddingToLength:1 + 2 * depth withString:@" " startingAtIndex:0];
}

- (BOOL)appendValue:(id)fragment into:(NSMutableString*)json error:(NSError**)error {
    if ([fragment isKindOfClass:[NSDictionary class]]) {
        if (![self appendDictionary:fragment into:json error:error])
            return NO;
        
    } else if ([fragment isKindOfClass:[NSArray class]]) {
        if (![self appendArray:fragment into:json error:error])
            return NO;

    } else if ([fragment isKindOfClass:[NSString class]]) {
        if (![self appendString:fragment into:json error:error])
            return NO;

    } else if ([fragment isKindOfClass:[NSNumber class]]) {
        if ('c' == *[fragment objCType])
            [json appendString:[fragment boolValue] ? @"true" : @"false"];
        else
            [json appendString:[fragment stringValue]];

    } else if ([fragment isKindOfClass:[NSNull class]]) {
        [json appendString:@"null"];
        
    } else {
        *error = err(EUNSUPPORTED, [NSString stringWithFormat:@"JSON serialisation not supported for %@", [fragment class]]);
        return NO;
    }
    return YES;
}

- (BOOL)appendArray:(NSArray*)fragment into:(NSMutableString*)json error:(NSError**)error {
    [json appendString:@"["];
    depth++;
    
    BOOL addComma = NO;    
    for (id value in fragment) {
        if (addComma)
            [json appendString:@","];
        else
            addComma = YES;

        if ([self humanReadable])
            [json appendString:[self indent]];
        
        if (![self appendValue:value into:json error:error]) {
            return NO;
        }
    }

    depth--;
    if ([self humanReadable] && [fragment count])
        [json appendString:[self indent]];
    [json appendString:@"]"];
    return YES;
}

- (BOOL)appendDictionary:(NSDictionary*)fragment into:(NSMutableString*)json error:(NSError**)error {
    [json appendString:@"{"];
    depth++;

    NSString *colon = [self humanReadable] ? @" : " : @":";
    BOOL addComma = NO;
    NSArray *keys = [fragment allKeys];
    if (self.sortKeys)
        keys = [keys sortedArrayUsingSelector:@selector(compare:)];
    
    for (id value in keys) {
        if (addComma)
            [json appendString:@","];
        else
            addComma = YES;

        if ([self humanReadable])
            [json appendString:[self indent]];
        
        if (![value isKindOfClass:[NSString class]]) {
            *error = err(EUNSUPPORTED, @"JSON object key must be string");
            return NO;
        }
        
        if (![self appendString:value into:json error:error])
            return NO;

        [json appendString:colon];
        if (![self appendValue:[fragment objectForKey:value] into:json error:error]) {
            *error = err(EUNSUPPORTED, [NSString stringWithFormat:@"Unsupported value for key %@ in object", value]);
            return NO;
        }
    }

    depth--;
    if ([self humanReadable] && [fragment count])
        [json appendString:[self indent]];
    [json appendString:@"}"];
    return YES;    
}

- (BOOL)appendString:(NSString*)fragment into:(NSMutableString*)json error:(NSError**)error {

    static NSMutableCharacterSet *kEscapeChars;
    if( ! kEscapeChars ) {
        kEscapeChars = [[NSMutableCharacterSet characterSetWithRange: NSMakeRange(0,32)] retain];
        [kEscapeChars addCharactersInString: @"\"\\"];
    }
    
    [json appendString:@"\""];
    
    NSRange esc = [fragment rangeOfCharacterFromSet:kEscapeChars];
    if ( !esc.length ) {
        // No special chars -- can just add the raw string:
        [json appendString:fragment];
        
    } else {
        NSUInteger length = [fragment length];
        for (NSUInteger i = 0; i < length; i++) {
            unichar uc = [fragment characterAtIndex:i];
            switch (uc) {
                case '"':   [json appendString:@"\\\""];       break;
                case '\\':  [json appendString:@"\\\\"];       break;
                case '\t':  [json appendString:@"\\t"];        break;
                case '\n':  [json appendString:@"\\n"];        break;
                case '\r':  [json appendString:@"\\r"];        break;
                case '\b':  [json appendString:@"\\b"];        break;
                case '\f':  [json appendString:@"\\f"];        break;
                default:    
                    if (uc < 0x20) {
                        [json appendFormat:@"\\u%04x", uc];
                    } else {
                        [json appendFormat:@"%C", uc];
                    }
                    break;
                    
            }
        }
    }

    [json appendString:@"\""];
    return YES;
}

#pragma mark Parser

/**
 Returns the object represented by the passed-in string or nil on error. The returned object can be
 a string, number, boolean, null, array or dictionary.
 
 @param repr the json string to parse
 @param allowScalar whether to return objects for JSON fragments
 @param error used to return an error by reference (pass NULL if this is not desired)
 */
- (id)objectWithString:(id)repr allowScalar:(BOOL)allowScalar error:(NSError**)error {

    if (!repr) {
        if (error)
            *error = err(EINPUT, @"Input was 'nil'");
        return nil;
    }
    
    depth = 0;
    c = [repr UTF8String];
    
    id o;
    NSError *err2 = nil;
    if (![self scanValue:&o error:&err2]) {
        if (error)
            *error = err2;
        return nil;
    }
        
    // We found some valid JSON. But did it also contain something else?
    if (![self scanIsAtEnd]) {
        if (error)
            *error = err(ETRAILGARBAGE, @"Garbage after JSON");
        return nil;
    }

    // If we don't allow scalars, check that the object we've found is a valid JSON container.
    if (!allowScalar && ![o isKindOfClass:[NSDictionary class]] && ![o isKindOfClass:[NSArray class]]) {
        if (error)
            *error = err(EFRAGMENT, @"Valid fragment, but not JSON");
        return nil;
    }

    NSAssert1(o, @"Should have a valid object from %@", repr);
    return o;
}

/**
 Returns the object represented by the passed-in string or nil on error. The returned object can be
 a string, number, boolean, null, array or dictionary.
 
 @param repr the json string to parse
 @param error used to return an error by reference (pass NULL if this is not desired)
 */
- (id)fragmentWithString:(NSString*)repr error:(NSError**)error {
    return [self objectWithString:repr allowScalar:YES error:error];
}

/**
 Returns the object represented by the passed-in string or nil on error. The returned object
 will be either a dictionary or an array.
 
 @param repr the json string to parse
 @param error used to return an error by reference (pass NULL if this is not desired)
 */
- (id)objectWithString:(NSString*)repr error:(NSError**)error {
    return [self objectWithString:repr allowScalar:NO error:error];
}

/*
 In contrast to the public methods, it is an error to omit the error parameter here.
 */
- (BOOL)scanValue:(NSObject **)o error:(NSError **)error
{
    skipWhitespace(c);
    
    switch (*c++) {
        case '{':
            return [self scanRestOfDictionary:(NSMutableDictionary **)o error:error];
            break;
        case '[':
            return [self scanRestOfArray:(NSMutableArray **)o error:error];
            break;
        case '"':
            return [self scanRestOfString:(NSMutableString **)o error:error];
            break;
        case 'f':
            return [self scanRestOfFalse:(NSNumber **)o error:error];
            break;
        case 't':
            return [self scanRestOfTrue:(NSNumber **)o error:error];
            break;
        case 'n':
            return [self scanRestOfNull:(NSNull **)o error:error];
            break;
        case '-':
        case '0'...'9':
            c--; // cannot verify number correctly without the first character
            return [self scanNumber:(NSNumber **)o error:error];
            break;
        case '+':
            *error = err(EPARSENUM, @"Leading + disallowed in number");
            return NO;
            break;
        case 0x0:
            *error = err(EEOF, @"Unexpected end of string");
            return NO;
            break;
        default:
            *error = err(EPARSE, @"Unrecognised leading character");
            return NO;
            break;
    }
    
    NSAssert(0, @"Should never get here");
    return NO;
}

- (BOOL)scanRestOfTrue:(NSNumber **)o error:(NSError **)error
{
    if (!strncmp(c, "rue", 3)) {
        c += 3;
        *o = [NSNumber numberWithBool:YES];
        return YES;
    }
    *error = err(EPARSE, @"Expected 'true'");
    return NO;
}

- (BOOL)scanRestOfFalse:(NSNumber **)o error:(NSError **)error
{
    if (!strncmp(c, "alse", 4)) {
        c += 4;
        *o = [NSNumber numberWithBool:NO];
        return YES;
    }
    *error = err(EPARSE, @"Expected 'false'");
    return NO;
}

- (BOOL)scanRestOfNull:(NSNull **)o error:(NSError **)error
{
    if (!strncmp(c, "ull", 3)) {
        c += 3;
        *o = [NSNull null];
        return YES;
    }
    *error = err(EPARSE, @"Expected 'null'");
    return NO;
}

- (BOOL)scanRestOfArray:(NSMutableArray **)o error:(NSError **)error
{
    if (maxDepth && ++depth > maxDepth) {
        *error = err(EDEPTH, @"Nested too deep");
        return NO;
    }
    
    *o = [NSMutableArray arrayWithCapacity:8];
    
    for (; *c ;) {
        id v;
        
        skipWhitespace(c);
        if (*c == ']' && c++) {
            depth--;
            return YES;
        }
        
        if (![self scanValue:&v error:error]) {
            *error = errWithUnderlier(EPARSE, error, @"Expected value while parsing array");
            return NO;
        }
        
        [*o addObject:v];
        
        skipWhitespace(c);
        if (*c == ',' && c++) {
            skipWhitespace(c);
            if (*c == ']') {
                *error = err(ETRAILCOMMA, @"Trailing comma disallowed in array");
                return NO;
            }
        }        
    }
    
    *error = err(EEOF, @"End of input while parsing array");
    return NO;
}

- (BOOL)scanRestOfDictionary:(NSMutableDictionary **)o error:(NSError **)error
{
    if (maxDepth && ++depth > maxDepth) {
        *error = err(EDEPTH, @"Nested too deep");
        return NO;
    }
    
    *o = [NSMutableDictionary dictionaryWithCapacity:7];
    
    for (; *c ;) {
        id k, v;
        
        skipWhitespace(c);
        if (*c == '}' && c++) {
            depth--;
            return YES;
        }    
        
        if (!(*c == '\"' && c++ && [self scanRestOfString:&k error:error])) {
            *error = errWithUnderlier(EPARSE, error, @"Object key string expected");
            return NO;
        }
        
        skipWhitespace(c);
        if (*c != ':') {
            *error = err(EPARSE, @"Expected ':' separating key and value");
            return NO;
        }
        
        c++;
        if (![self scanValue:&v error:error]) {
            NSString *string = [NSString stringWithFormat:@"Object value expected for key: %@", k];
            *error = errWithUnderlier(EPARSE, error, string);
            return NO;
        }
        
        [*o setObject:v forKey:k];
        
        skipWhitespace(c);
        if (*c == ',' && c++) {
            skipWhitespace(c);
            if (*c == '}') {
                *error = err(ETRAILCOMMA, @"Trailing comma disallowed in object");
                return NO;
            }
        }        
    }
    
    *error = err(EEOF, @"End of input while parsing object");
    return NO;
}

- (BOOL)scanRestOfString:(NSMutableString **)o error:(NSError **)error
{
    *o = [NSMutableString stringWithCapacity:16];
    do {
        // First see if there's a portion we can grab in one go. 
        // Doing this caused a massive speedup on the long string.
        size_t len = strcspn(c, ctrl);
        if (len) {
            // check for 
            id t = [[NSString alloc] initWithBytesNoCopy:(char*)c
                                                  length:len
                                                encoding:NSUTF8StringEncoding
                                            freeWhenDone:NO];
            if (t) {
                [*o appendString:t];
                [t release];
                c += len;
            }
        }
        
        if (*c == '"') {
            c++;
            return YES;
            
        } else if (*c == '\\') {
            unichar uc = *++c;
            switch (uc) {
                case '\\':
                case '/':
                case '"':
                    break;
                    
                case 'b':   uc = '\b';  break;
                case 'n':   uc = '\n';  break;
                case 'r':   uc = '\r';  break;
                case 't':   uc = '\t';  break;
                case 'f':   uc = '\f';  break;                    
                    
                case 'u':
                    c++;
                    if (![self scanUnicodeChar:&uc error:error]) {
                        *error = errWithUnderlier(EUNICODE, error, @"Broken unicode character");
                        return NO;
                    }
                    c--; // hack.
                    break;
                default:
                    *error = err(EESCAPE, [NSString stringWithFormat:@"Illegal escape sequence '0x%x'", uc]);
                    return NO;
                    break;
            }
            [*o appendFormat:@"%C", uc];
            c++;
            
        } else if (*c < 0x20) {
            *error = err(ECTRL, [NSString stringWithFormat:@"Unescaped control character '0x%x'", *c]);
            return NO;
            
        } else {
            NSLog(@"should not be able to get here");
        }
    } while (*c);
    
    *error = err(EEOF, @"Unexpected EOF while parsing string");
    return NO;
}

- (BOOL)scanUnicodeChar:(unichar *)x error:(NSError **)error
{
    unichar hi, lo;
    
    if (![self scanHexQuad:&hi error:error]) {
        *error = err(EUNICODE, @"Missing hex quad");
        return NO;        
    }
    
    if (hi >= 0xd800) {     // high surrogate char?
        if (hi < 0xdc00) {  // yes - expect a low char
            
            if (!(*c == '\\' && ++c && *c == 'u' && ++c && [self scanHexQuad:&lo error:error])) {
                *error = errWithUnderlier(EUNICODE, error, @"Missing low character in surrogate pair");
                return NO;
            }
            
            if (lo < 0xdc00 || lo >= 0xdfff) {
                *error = err(EUNICODE, @"Invalid low surrogate char");
                return NO;
            }
            
            hi = (hi - 0xd800) * 0x400 + (lo - 0xdc00) + 0x10000;
            
        } else if (hi < 0xe000) {
            *error = err(EUNICODE, @"Invalid high character in surrogate pair");
            return NO;
        }
    }
    
    *x = hi;
    return YES;
}

- (BOOL)scanHexQuad:(unichar *)x error:(NSError **)error
{
    *x = 0;
    for (int i = 0; i < 4; i++) {
        unichar uc = *c;
        c++;
        int d = (uc >= '0' && uc <= '9')
        ? uc - '0' : (uc >= 'a' && uc <= 'f')
        ? (uc - 'a' + 10) : (uc >= 'A' && uc <= 'F')
        ? (uc - 'A' + 10) : -1;
        if (d == -1) {
            *error = err(EUNICODE, @"Missing hex digit in quad");
            return NO;
        }
        *x *= 16;
        *x += d;
    }
    return YES;
}

- (BOOL)scanNumber:(NSNumber **)o error:(NSError **)error
{
    const char *ns = c;
    
    // The logic to test for validity of the number formatting is relicensed
    // from JSON::XS with permission from its author Marc Lehmann.
    // (Available at the CPAN: http://search.cpan.org/dist/JSON-XS/ .)
    
    if ('-' == *c)
        c++;
    
    if ('0' == *c && c++) {        
        if (isdigit(*c)) {
            *error = err(EPARSENUM, @"Leading 0 disallowed in number");
            return NO;
        }
        
    } else if (!isdigit(*c) && c != ns) {
        *error = err(EPARSENUM, @"No digits after initial minus");
        return NO;
        
    } else {
        skipDigits(c);
    }
    
    // Fractional part
    if ('.' == *c && c++) {
        
        if (!isdigit(*c)) {
            *error = err(EPARSENUM, @"No digits after decimal point");
            return NO;
        }        
        skipDigits(c);
    }
    
    // Exponential part
    if ('e' == *c || 'E' == *c) {
        c++;
        
        if ('-' == *c || '+' == *c)
            c++;
        
        if (!isdigit(*c)) {
            *error = err(EPARSENUM, @"No digits after exponent");
            return NO;
        }
        skipDigits(c);
    }
    
    id str = [[NSString alloc] initWithBytesNoCopy:(char*)ns
                                            length:c - ns
                                          encoding:NSUTF8StringEncoding
                                      freeWhenDone:NO];
    [str autorelease];
    if (str && (*o = [NSDecimalNumber decimalNumberWithString:str]))
        return YES;
    
    *error = err(EPARSENUM, @"Failed creating decimal instance");
    return NO;
}

- (BOOL)scanIsAtEnd
{
    skipWhitespace(c);
    return !*c;
}



#pragma mark Properties

@synthesize humanReadable;
@synthesize sortKeys;
@synthesize maxDepth;

@end
