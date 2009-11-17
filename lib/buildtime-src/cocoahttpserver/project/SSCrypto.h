/*
 Copyright (c) 2003-2006, Septicus Software All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:
 
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer. 
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution. 
 * Neither the name of Septicus Software nor the names of its contributors
 may be used to endorse or promote products derived from this software
 without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
//
//  SSCrypto.h
//
//  Created by Ed Silva on Sat May 31 2003.
//  Copyright (c) 2003-2006 Septicus Software. All rights reserved.
//


#import <Foundation/Foundation.h>
#import <openssl/evp.h>
#import <openssl/rand.h>
#import <openssl/rsa.h>
#import <openssl/engine.h>
#import <openssl/sha.h>
#import <openssl/pem.h>
#import <openssl/bio.h>
#import <openssl/err.h>
#import <openssl/ssl.h>

@interface NSData (HexDump)
- (NSString *)encodeBase64;
- (NSString *)encodeBase64WithNewlines:(BOOL)encodeWithNewlines;
- (NSData *)decodeBase64;
- (NSData *)decodeBase64WithNewLines:(BOOL)decodeWithNewLines;
- (NSString *)hexval;
- (NSString *)hexdump;
@end

@interface SSCrypto : NSObject
{
    NSData *symmetricKey;
    NSData *cipherText;
    NSData *clearText;
	NSData *publicKey;
	NSData *privateKey;
	
	BOOL isSymmetric;
}

- (id)init;
- (id)initWithSymmetricKey:(NSData *)k;
- (id)initWithPublicKey:(NSData *)pub;
- (id)initWithPrivateKey:(NSData *)priv;
- (id)initWithPublicKey:(NSData *)pub privateKey:(NSData *)priv;

- (BOOL)isSymmetric;
- (void)setIsSymmetric:(BOOL)flag;

- (NSData *)symmetricKey;
- (void)setSymmetricKey:(NSData *)k;

- (NSData *)publicKey;
- (void)setPublicKey:(NSData *)k;

- (NSData *)privateKey;
- (void)setPrivateKey:(NSData *)k;

- (NSData *)clearTextAsData;
- (NSString *)clearTextAsString;
- (void)setClearTextWithData:(NSData *)c;
- (void)setClearTextWithString:(NSString *)c;

- (NSData *)cipherTextAsData;
- (NSString *)cipherTextAsString;
- (void)setCipherText:(NSData *)c;

- (NSData *)decrypt;
- (NSData *)decrypt:(NSString *)cipherName;

- (NSData *)verify;

- (NSData *)encrypt;
- (NSData *)encrypt:(NSString *)cipherName;

- (NSData *)sign;

- (NSData *)digest:(NSString *)digestName;

+ (NSData *)generateRSAPrivateKeyWithLength:(int)length;
+ (NSData *)generateRSAPublicKeyFromPrivateKey:(NSData *)privateKey;
+ (NSData *)getKeyDataWithLength:(int)length;
+ (NSData *)getSHA1ForData:(NSData *)d;
+ (NSData *)getMD5ForData:(NSData *)d;

@end
