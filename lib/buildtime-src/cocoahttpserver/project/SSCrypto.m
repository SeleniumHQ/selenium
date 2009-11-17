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
//  SSCrypto.m
//  SimpleWebCam
//
//  Created by Ed Silva on Sat May 31 2003.
//  Copyright (c) 2003-2006 Septicus Software. All rights reserved.
//

#import "SSCrypto.h"

@implementation NSData (HexDump)

/**
 * Encodes the current data in base64, and creates and returns an NSString from the result.
 * This is the same as piping data through "... | openssl enc -base64" on the command line.
 *
 * Code courtesy of DaveDribin (http://www.dribin.org/dave/)
 * Taken from http://www.cocoadev.com/index.pl?BaseSixtyFour
**/
- (NSString *)encodeBase64
{
    return [self encodeBase64WithNewlines: YES];
}

/**
 * Encodes the current data in base64, and creates and returns an NSString from the result.
 * This is the same as piping data through "... | openssl enc -base64" on the command line.
 *
 * Code courtesy of DaveDribin (http://www.dribin.org/dave/)
 * Taken from http://www.cocoadev.com/index.pl?BaseSixtyFour
**/
- (NSString *)encodeBase64WithNewlines:(BOOL)encodeWithNewlines
{
    // Create a memory buffer which will contain the Base64 encoded string
    BIO * mem = BIO_new(BIO_s_mem());
    
    // Push on a Base64 filter so that writing to the buffer encodes the data
    BIO * b64 = BIO_new(BIO_f_base64());
    if (!encodeWithNewlines)
        BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
    mem = BIO_push(b64, mem);
    
    // Encode all the data
    BIO_write(mem, [self bytes], [self length]);
    BIO_flush(mem);
    
    // Create a new string from the data in the memory buffer
    char * base64Pointer;
    long base64Length = BIO_get_mem_data(mem, &base64Pointer);
    NSString * base64String = [NSString stringWithCString:base64Pointer length:base64Length];

    // Clean up and go home
    BIO_free_all(mem);
    return base64String;
}

- (NSData *)decodeBase64
{
    return [self decodeBase64WithNewLines:YES];
}

- (NSData *)decodeBase64WithNewLines:(BOOL)encodedWithNewlines
{
    // Create a memory buffer containing Base64 encoded string data
    BIO * mem = BIO_new_mem_buf((void *) [self bytes], [self length]);

    // Push a Base64 filter so that reading from the buffer decodes it
    BIO * b64 = BIO_new(BIO_f_base64());
    if (!encodedWithNewlines)
        BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
    mem = BIO_push(b64, mem);

    // Decode into an NSMutableData
    NSMutableData * data = [NSMutableData data];
    char inbuf[512];
    int inlen;
    while ((inlen = BIO_read(mem, inbuf, sizeof(inbuf))) > 0)
        [data appendBytes: inbuf length: inlen];

    // Clean up and go home
    BIO_free_all(mem);
    return data;
}

- (NSString *)hexval
{
    NSMutableString *hex = [NSMutableString string];
    unsigned char *bytes = (unsigned char *)[self bytes];
    char temp[3];
    int i = 0;

    for (i = 0; i < [self length]; i++) {
        temp[0] = temp[1] = temp[2] = 0;
        (void)sprintf(temp, "%02x", bytes[i]);
        [hex appendString:[NSString stringWithUTF8String:temp]];
    }

    return hex;
}

- (NSString *)hexdump
{
    NSMutableString *ret=[NSMutableString stringWithCapacity:[self length]*2];
    /* dumps size bytes of *data to string. Looks like:
    * [0000] 75 6E 6B 6E 6F 77 6E 20
    *                  30 FF 00 00 00 00 39 00 unknown 0.....9.
    * (in a single line of course)
    */
    unsigned int size= [self length];
    const unsigned char *p = [self bytes];
    unsigned char c;
    int n;
    char bytestr[4] = {0};
    char addrstr[10] = {0};
    char hexstr[ 16*3 + 5] = {0};
    char charstr[16*1 + 5] = {0};
    for(n=1;n<=size;n++) {
        if (n%16 == 1) {
            /* store address for this line */
            snprintf(addrstr, sizeof(addrstr), "%.4x",
                     (unsigned int)((long)p-(long)self) );
        }
        
        c = *p;
        if (isalnum(c) == 0) {
            c = '.';
        }
        
        /* store hex str (for left side) */
        snprintf(bytestr, sizeof(bytestr), "%02X ", *p);
        strncat(hexstr, bytestr, sizeof(hexstr)-strlen(hexstr)-1);
        
        /* store char str (for right side) */
        snprintf(bytestr, sizeof(bytestr), "%c", c);
        strncat(charstr, bytestr, sizeof(charstr)-strlen(charstr)-1);
        
        if(n%16 == 0) {
            /* line completed */
            //printf("[%4.4s]   %-50.50s  %s\n", addrstr, hexstr, charstr);
            [ret appendString:[NSString stringWithFormat:@"[%4.4s]   %-50.50s  %s\n",
                addrstr, hexstr, charstr]];
            hexstr[0] = 0;
            charstr[0] = 0;
        } else if(n%8 == 0) {
            /* half line: add whitespaces */
            strncat(hexstr, "  ", sizeof(hexstr)-strlen(hexstr)-1);
            strncat(charstr, " ", sizeof(charstr)-strlen(charstr)-1);
        }
        p++; /* next byte */
    }
    
    if (strlen(hexstr) > 0) {
        /* print rest of buffer if not empty */
        //printf("[%4.4s]   %-50.50s  %s\n", addrstr, hexstr, charstr);
        [ret appendString:[NSString stringWithFormat:@"[%4.4s]   %-50.50s  %s\n",
            addrstr, hexstr, charstr]];
    }
    return ret;
}

@end

@interface SSCrypto (PrivateAPI)
- (void)setupOpenSSL;
- (void)cleanupOpenSSL;
@end

// SSCrypto object
@implementation SSCrypto

/**
 * Generic constructor.
 * Simply configures internal OpenSSL setup.
**/
- (id)init
{
    if(self = [super init])
	{
        // Call private method to handle the setup for internal OpenSSL stuff
		[self setupOpenSSL];
    }
    return self;
}

/**
 * Symmetric key constructor.
 * Configures the instance to use symmetric encryption/decryption using the given symmetric key.
**/
- (id)initWithSymmetricKey:(NSData *)k
{
    if(self = [super init])
	{
        // Call private method to handle the setup for internal OpenSSL stuff
		[self setupOpenSSL];
		
        [self setSymmetricKey:k];
        [self setIsSymmetric:YES];
    }
    return self;
}

/**
 * Public key only constructor.
 * Configures the instance to use non-symmetric encryption/decryption, and to use the given public key.
**/
- (id)initWithPublicKey:(NSData *)pub
{
    return [self initWithPublicKey:pub privateKey:nil];
}

/**
 * Private key only constructor.
 * Configures the instance to use non-symmetric encryption/decryption, and to use the given private key.
**/
- (id)initWithPrivateKey:(NSData *)priv
{
    return [self initWithPublicKey:nil privateKey:priv];
}

/**
 * Public and Private key constructor.
 * Configures the instance to use non-symmetric encryption/decryption, and to use the given public and private keys.
**/
- (id)initWithPublicKey:(NSData *)pub privateKey:(NSData *)priv;
{
    if(self = [super init])
	{
		// Call private method to handle the setup for internal OpenSSL stuff
		[self setupOpenSSL];
		
		// Store the publicKey variable (if not nil)
		if(pub != nil)
			[self setPublicKey:pub];
		
		// Store the privateKey variable (if not nil)
		if(priv != nil)
			[self setPrivateKey:priv];
		
		// Since we're using public and private keys, we can assume we're not using symmetric encryption
		[self setIsSymmetric:NO];
    }
    return self;
}

/**
 * This method sets up everything needed to use the OpenSSL libraries later within the code.
 * This method should be called by every constructor.
**/
- (void)setupOpenSSL
{
	// OpenSSL keeps an internal table of digest algorithms and ciphers.
	// It uses this table to lookup ciphers via functions such as EVP_get_cipher_byname().
	// OpenSSL_add_all_digests() adds all digest algorithms to the table.
	// OpenSSL_add_all_ciphers() adds all cipher algorithms to the table.
	// OpenSSL_add_all_algorithms() adds all algorithms to the table (digests and ciphers).
	// EVP_cleanup() removes all ciphers and digests from the table.
	// 
	// A typical application will call OpenSSL_add_all_algorithms() initially and EVP_cleanup() before exiting.
	
	OpenSSL_add_all_algorithms();
	
	// ERR_load_crypto_strings() registers the error strings for all libcrypto functions.
	// SSL_load_error_strings() does the same, but also registers the libssl error strings.
	// ERR_free_strings() frees all previously loaded error strings.
	//
	// One of these functions should be called before generating textual error messages.
	// However, this is not required when memory usage is an issue.
	
	ERR_load_crypto_strings();
}

/**
 * Standard deallocation method.
**/
- (void)dealloc
{
    // Cleanup all OpenSSL stuff
	[self cleanupOpenSSL];
	
	// Release all instance variables
	[symmetricKey release];
	[cipherText release];
	[clearText release];
	[publicKey release];
	[privateKey release];
	
	// Move up the inheritance chain
    [super dealloc];
}

- (void)cleanupOpenSSL
{
	// EVP_cleanup() removes all ciphers and digests from the table.
	EVP_cleanup();
	
	// ERR_free_strings() frees all previously loaded error strings.
    ERR_free_strings();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Getter, Setter Methods:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Returns whether or not symmetric encryption is to be used.
 * If symmetric encryption is in use, then calls to encrypt or decrypt operate using symmetric encryption/decryption.
 * Otherwise, it is assumed that asymmetric encryption/decryption is to be used.
**/
- (BOOL)isSymmetric
{
    return isSymmetric;
}

- (void)setIsSymmetric:(BOOL)flag
{
    isSymmetric = flag;
}

- (NSData *)symmetricKey
{
    return symmetricKey;
}

- (void)setSymmetricKey:(NSData *)k
{
    [k retain];
    [symmetricKey release];
    symmetricKey = k;
}

/**
 * Returns the public key currently in use.
**/
- (NSData *)publicKey
{
    return publicKey;
}

/**
 * Sets the public key to use.
 * Public keys are used to verify signed data, or to encrypt data. (ToDo)
**/
- (void)setPublicKey:(NSData *)k
{
    [k retain];
    [publicKey release];
    publicKey = k;
}

/**
 * Returns the private key currently in use.
**/
- (NSData *)privateKey
{
    return privateKey;
}

/**
 * Sets the private key to use.
 * Private keys are used to sign data, or to decrypt data. (ToDo)
 * 
 * The data that is provided should from a file (such as private.pem) that was generated by openssl.
**/
- (void)setPrivateKey:(NSData *)k
{
    [k retain];
    [privateKey release];
    privateKey = k;
}

/**
 * Returns the clear text as plain NSData.
 * The plain text contains the text that was previously set.
 * It's the known text, which is to be encrypted, decrypted, etc.
**/
- (NSData *)clearTextAsData
{
    return clearText;
}

/**
 * Returns the clear text formatted as an NSString.
 * The plain text contains the text that was previously set.
 * It's the known text, which is to be encrypted, decrypted, etc.
**/
- (NSString *)clearTextAsString
{
    return [[[NSString alloc] initWithData:[self clearTextAsData] encoding:[NSString defaultCStringEncoding]] autorelease];
}

/**
 * Sets the clear text using the given data.
 * The clear text will be used for encryption, decryption, etc.
 *
 * Note that the given data reference is retained and later used, so it shouldn't be externally modified.
**/
- (void)setClearTextWithData:(NSData *)c
{
    [c retain];
    [clearText release];
    clearText = c;
}

/**
 * Sets the clear text using the given string.
 * The clear text will be used for encryption, signing, and digests.
**/
- (void)setClearTextWithString:(NSString *)c
{
	[clearText release];
	clearText = [[NSData alloc] initWithBytes:[c UTF8String] length:[c length]];
}

/**
 * Returns the cipher text as plain NSData.
 * The cipher text contains the most recent encrypted data.  (Result of call to encrypt)
**/
- (NSData *)cipherTextAsData
{
    return cipherText;
}

/**
 * Returns the ciper text formatted as an NSString.
 * The ciper text contains the most recent encrypted data.  (Result of call to encrypt)
**/
- (NSString *)cipherTextAsString
{
    return [[[NSString alloc] initWithData:[self cipherTextAsData] encoding:[NSString defaultCStringEncoding]] autorelease];
}

/**
 * Sets the cipher text using the given data.
 * The cipher text will be used for decryption and verifying.
**/
- (void)setCipherText:(NSData *)c
{
    [c retain];
    [cipherText release];
    cipherText = c;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Decryption methods:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Peforms decryption, and returns resulting clear text data.
 * If symmetric decryption is being used, performs symmetric decryption using aes128.
 * Otherwise, performs decryption using the private key.
**/
- (NSData *)decrypt
{
    if([self isSymmetric] && [self symmetricKey])
	{
        return [self decrypt:@"aes128"];
    }
	else if([self privateKey])
	{
        return [self decrypt:nil];
    }
	else
	{
        NSLog(@"No symmetric key or private key is set!");
        return nil;
    }
}

/**
 * Decrypts the cipher text data.
 * If symmetric decryption is being used, then the decryption is done using the given cipher.
 * Otherwise, asymmetric decryptions is used, and the data is encrypted using the private key.
 *
 * Returns the clear text data that is the result of the decryption.
 * The resulting clear text data may also be later retrieved with the clearTextAsData or clearTextAsString methods.
**/
- (NSData *)decrypt:(NSString *)cipherName
{
	// If there is no cipher text set, or the cipher text is an empty string (zero length data)
	// then there is nothing to decrypt, and we may as well return nil
    if(cipherText == nil || [cipherText length] == 0)
	{
        return nil;
    }
    
    unsigned char *outbuf, iv[EVP_MAX_IV_LENGTH];
    int outlen, templen, inlen;
    inlen = [cipherText length];
    unsigned char *input = (unsigned char *)[cipherText bytes];
    
    if([self isSymmetric])
	{
		// Use symmetric decryption...
		
        unsigned char evp_key[EVP_MAX_KEY_LENGTH] = {"\0"};
        EVP_CIPHER_CTX cCtx;
        const EVP_CIPHER *cipher;

        if(cipherName)
		{
            cipher = EVP_get_cipherbyname((const char *)[cipherName UTF8String]);
            if(!cipher)
			{
				NSLog(@"cannot get cipher with name %@", cipherName);
				return nil;
			}
        }
		else
		{
            cipher = EVP_bf_cbc();
            if(!cipher)
			{
                NSLog(@"cannot get cipher with name %@", @"EVP_bf_cbc");
                return nil;
            }
        }
        
        EVP_BytesToKey(cipher, EVP_md5(), NULL,
                       [[self symmetricKey] bytes], [[self symmetricKey] length], 1, evp_key, iv);
        EVP_CIPHER_CTX_init(&cCtx);

        if (!EVP_DecryptInit(&cCtx, cipher, evp_key, iv)) {
            NSLog(@"EVP_DecryptInit() failed!");
            EVP_CIPHER_CTX_cleanup(&cCtx);
            return nil;
        }
        EVP_CIPHER_CTX_set_key_length(&cCtx, EVP_MAX_KEY_LENGTH);

        // add a couple extra blocks to the outbuf to be safe
        outbuf = (unsigned char *)calloc(inlen+32, sizeof(unsigned char));
        NSAssert(outbuf, @"Cannot allocate memory for buffer!");
        
        if (!EVP_DecryptUpdate(&cCtx, outbuf, &outlen, input, inlen)){
            NSLog(@"EVP_DecryptUpdate() failed!");
            EVP_CIPHER_CTX_cleanup(&cCtx);
            return nil;
        }
        
        if (!EVP_DecryptFinal(&cCtx, outbuf + outlen, &templen)){
            NSLog(@"EVP_DecryptFinal() failed!");
            EVP_CIPHER_CTX_cleanup(&cCtx);
            return nil;
        }
        
        outlen += templen;
        EVP_CIPHER_CTX_cleanup(&cCtx);
        
    }
	else
	{
		// Use asymmetric decryption...
		
        if([self privateKey] == nil)
		{
            NSLog(@"Cannot decrypt without the private key, which is currently nil");
            return nil;
        }
        
        BIO *privateBIO = NULL;
		RSA *privateRSA = NULL;
		
		if(!(privateBIO = BIO_new_mem_buf((unsigned char*)[[self privateKey] bytes], [[self privateKey] length])))
		{
			NSLog(@"BIO_new_mem_buf() failed!");
			return nil;
		}
		
		if(!PEM_read_bio_RSAPrivateKey(privateBIO, &privateRSA, NULL, NULL))
		{
			NSLog(@"PEM_read_bio_RSAPrivateKey() failed!");
			return nil;
		}
		
		// RSA_check_key() returns 1 if rsa is a valid RSA key, and 0 otherwise.
		
		unsigned long check = RSA_check_key(privateRSA);
		if(check != 1)
		{
			NSLog(@"RSA_check_key() failed with result %d!", check);
			return nil;
		}			
		
		// RSA_size() returns the RSA modulus size in bytes.
		// It can be used to determine how much memory must be allocated for an RSA encrypted value.
		
		outbuf = (unsigned char *)malloc(RSA_size(privateRSA));
        
        if(!(outlen = RSA_private_decrypt(inlen, input, outbuf, privateRSA, RSA_PKCS1_PADDING)))
		{
            NSLog(@"RSA_private_decrypt() failed!");
            return nil;
        }
        
        if(outlen == -1)
		{
            NSLog(@"Decrypt error: %s (%s)",
                  ERR_error_string(ERR_get_error(), NULL),
                  ERR_reason_error_string(ERR_get_error()));
            return nil;
        }
		
		if (privateBIO) BIO_free(privateBIO);
		if (privateRSA) RSA_free(privateRSA);
    }
	
	// Store the decrypted data as the clear text
    [self setClearTextWithData:[NSData dataWithBytes:outbuf length:outlen]];
    
	// Release the outbuf, since it was malloc'd
    if (outbuf) {
        free(outbuf);
    }
    
    return [self clearTextAsData];
}

/**
 * Verifies (decrypts) the cipher text data using the public key.
 * The resulting clear text data is returned.
 *
 * The resulting clear text data may also be later retrieved with the clearTextAsData or clearTextAsString methods.
 **/
- (NSData *)verify
{
	// If there is no cipher text set, or the cipher text is an empty string (zero length data)
	// then there is nothing to decrypt, and we may as well return nil
	if(cipherText == nil || [cipherText length] == 0)
	{
		return nil;
	}
	
	unsigned char *outbuf;
	int outlen, inlen;
	inlen = [cipherText length];
	unsigned char *input = (unsigned char *)[cipherText bytes];
	
	if([self publicKey] == nil)
	{
		NSLog(@"Cannot verify (decrypt) without the public key, which is currently nil");
		return nil;
	}
	
	BIO *publicBIO = NULL;
	RSA *publicRSA = NULL;
	
	if(!(publicBIO = BIO_new_mem_buf((unsigned char *)[[self publicKey] bytes], [[self publicKey] length])))
	{
		NSLog(@"BIO_new_mem_buf() failed!");
		return nil;
	}
	
	if(!PEM_read_bio_RSA_PUBKEY(publicBIO, &publicRSA, NULL, NULL))
	{
		NSLog(@"PEM_read_bio_RSA_PUBKEY() failed!");
		return nil;
	}
	
	// RSA_size() returns the RSA modulus size in bytes.
	// It can be used to determine how much memory must be allocated for an RSA encrypted value.
	
	outbuf = (unsigned char *)malloc(RSA_size(publicRSA));
	
	if(!(outlen = RSA_public_decrypt(inlen, input, outbuf, publicRSA, RSA_PKCS1_PADDING)))
	{
		NSLog(@"RSA_public_decrypt() failed!");
		return nil;
	}
	
	if(outlen == -1)
	{
		NSLog(@"Decrypt error: %s (%s)",
			  ERR_error_string(ERR_get_error(), NULL),
			  ERR_reason_error_string(ERR_get_error()));
		return nil;
	}
	
	if (publicBIO) BIO_free(publicBIO);
	if (publicRSA) RSA_free(publicRSA);
	
	// Store the decrypted data as the clear text
    [self setClearTextWithData:[NSData dataWithBytes:outbuf length:outlen]];
    
	// Release the outbuf, since it was malloc'd
    if (outbuf) {
        free(outbuf);
    }
    
    return [self clearTextAsData];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Encryption methods:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Peforms encryption, and returns resulting ciper text data.
 * If symmetric encryption is being used, performs symmetric encryption using aes128.
 * Otherwise, performs encryption using the public key.
**/
- (NSData *)encrypt
{
    if([self isSymmetric] && [self symmetricKey])
	{
        return [self encrypt:@"aes128"];
    }
	else if([self publicKey])
	{
        return [self encrypt:nil];
    }
	else
	{
        NSLog(@"No symmetric key or public key is set!");
        return nil;
    }
}

/**
 * Encrypts the clear text data.
 * If symmetric encryption is being used, then the encryption is done using the given cipher.
 * Otherwise, asymmetric encryption is used, and the data is encrypted using the public key.
 *
 * Returns the cipher text data that is the result of the encryption.
 * The resulting cipher text data may also be later retrieved with the cipherTextAsData or cipherTextAsString methods.
**/
- (NSData *)encrypt:(NSString *)cipherName
{
	// If there is no clear text set, or the clear text is an empty string (zero length data)
	// then there is nothing to encrypt, and we may as well return nil
    if(clearText == nil || [clearText length] == 0)
	{
		return nil;
    }

    unsigned char *input = (unsigned char *)[clearText bytes];
    unsigned char *outbuf, iv[EVP_MAX_IV_LENGTH];
    int outlen, templen, inlen;
    inlen = [clearText length];
    
    if([self isSymmetric])
	{
		// Perform symmetric encryption...
		
        unsigned char evp_key[EVP_MAX_KEY_LENGTH] = {"\0"};
        EVP_CIPHER_CTX cCtx;
        const EVP_CIPHER *cipher;
        
        if (cipherName){
            cipher = EVP_get_cipherbyname((const char *)[cipherName UTF8String]);
            if (!cipher){
                NSLog(@"cannot get cipher with name %@", cipherName);
                return nil;
            }
        } else {
            cipher = EVP_bf_cbc();
            if (!cipher){
                NSLog(@"cannot get cipher with name %@", @"EVP_bf_cbc");
                return nil;
            }
        }

        EVP_BytesToKey(cipher, EVP_md5(), NULL,
                       [[self symmetricKey] bytes], [[self symmetricKey] length], 1, evp_key, iv);
        EVP_CIPHER_CTX_init(&cCtx);

        if (!EVP_EncryptInit(&cCtx, cipher, evp_key, iv)) {
            NSLog(@"EVP_EncryptInit() failed!");
            EVP_CIPHER_CTX_cleanup(&cCtx);
            return nil;
        }
        EVP_CIPHER_CTX_set_key_length(&cCtx, EVP_MAX_KEY_LENGTH);

        // add a couple extra blocks to the outbuf to be safe
        outbuf = (unsigned char *)calloc(inlen + EVP_CIPHER_CTX_block_size(&cCtx), sizeof(unsigned char));
        NSAssert(outbuf, @"Cannot allocate memory for buffer!");
        
        if (!EVP_EncryptUpdate(&cCtx, outbuf, &outlen, input, inlen)){
            NSLog(@"EVP_EncryptUpdate() failed!");
            EVP_CIPHER_CTX_cleanup(&cCtx);
            return nil;
        }
        if (!EVP_EncryptFinal(&cCtx, outbuf + outlen, &templen)){
            NSLog(@"EVP_EncryptFinal() failed!");
            EVP_CIPHER_CTX_cleanup(&cCtx);
            return nil;
        }
        outlen += templen;
        EVP_CIPHER_CTX_cleanup(&cCtx);
        
    }
	else
	{
		// Perform asymmetric encryption...
		
        if([self publicKey] == nil)
		{
            NSLog(@"Cannot encrypt without the public key, which is currently nil");
            return nil;
        }
        
        BIO *publicBIO = NULL;
        RSA *publicRSA = NULL;
        
        if(!(publicBIO = BIO_new_mem_buf((unsigned char*)[[self publicKey] bytes], [[self publicKey] length])))
		{
            NSLog(@"BIO_new_mem_buf() failed!");
            return nil;
        }
        
        if(!PEM_read_bio_RSA_PUBKEY(publicBIO, &publicRSA, NULL, NULL))
		{
            NSLog(@"PEM_read_bio_RSA_PUBKEY() failed!");
            return nil;
        }
        
		// RSA_size() returns the RSA modulus size in bytes.
		// It can be used to determine how much memory must be allocated for an RSA encrypted value.
		
        outbuf = (unsigned char *)malloc(RSA_size(publicRSA));
        
        if(!(outlen = RSA_public_encrypt(inlen, input, (unsigned char*)outbuf, publicRSA, RSA_PKCS1_PADDING)))
		{
            NSLog(@"RSA_public_encrypt failed!");
            return nil;
        }
        
        if(outlen == -1)
		{
            NSLog(@"Encrypt error: %s (%s)",
				  ERR_error_string(ERR_get_error(), NULL),
				  ERR_reason_error_string(ERR_get_error()));
            return nil;
        }
		
		if (publicBIO) BIO_free(publicBIO);
		if (publicRSA) RSA_free(publicRSA);
    }
	
	// Store the encrypted data as the cipher text
    [self setCipherText:[NSData dataWithBytes:outbuf length:outlen]];
    
	// Release the outbuf, since it was malloc'd
    if(outbuf) {
        free(outbuf);
    }
    
    return [self cipherTextAsData];
}

/**
 * Signs (encrypts) the clear text data using the private key.
 * The resulting cipher text data is returned, and may later be verified (decrypted) using the public key.
 *
 * The resulting cipher text data may also be later retrieved with the cipherTextAsData or cipherTextAsString methods.
**/
- (NSData *)sign
{
	// If there is no clear text set, or the clear text is an empty string (zero length data)
	// then there is nothing to encrypt, and we may as well return nil
    if(clearText == nil || [clearText length] == 0)
	{
		return nil;
    }
	
    unsigned char *input = (unsigned char *)[clearText bytes];
    unsigned char *outbuf;
    int outlen, inlen;
    inlen = [clearText length];
	
	if([self privateKey] == nil)
	{
		NSLog(@"Cannot sign (encrypt) without the private key, which is currently nil");
		return nil;
	}
	
	BIO *privateBIO = NULL;
	RSA *privateRSA = NULL;
	
	if(!(privateBIO = BIO_new_mem_buf((unsigned char*)[[self privateKey] bytes], [[self privateKey] length])))
	{
		NSLog(@"BIO_new_mem_buf() failed!");
		return nil;
	}
	
	if(!PEM_read_bio_RSAPrivateKey(privateBIO, &privateRSA, NULL, NULL))
	{
		NSLog(@"PEM_read_bio_RSAPrivateKey() failed!");
		return nil;
	}
	
	// RSA_check_key() returns 1 if rsa is a valid RSA key, and 0 otherwise.
	
	unsigned long check = RSA_check_key(privateRSA);
	if(check != 1)
	{
		NSLog(@"RSA_check_key() failed with result %d!", check);
		return nil;
	}			
	
	// RSA_size() returns the RSA modulus size in bytes.
	// It can be used to determine how much memory must be allocated for an RSA encrypted value.
	
	outbuf = (unsigned char *)malloc(RSA_size(privateRSA));
	
	if(!(outlen = RSA_private_encrypt(inlen, input, (unsigned char*)outbuf, privateRSA, RSA_PKCS1_PADDING)))
	{
		NSLog(@"RSA_private_encrypt failed!");
		return nil;
	}
	
	if(outlen == -1)
	{
		NSLog(@"Encrypt error: %s (%s)",
			  ERR_error_string(ERR_get_error(), NULL),
			  ERR_reason_error_string(ERR_get_error()));
		return nil;
	}
	
	if (privateBIO) BIO_free(privateBIO);
	if (privateRSA) RSA_free(privateRSA);
	
	// Store the encrypted data as the cipher text
    [self setCipherText:[NSData dataWithBytes:outbuf length:outlen]];
    
	// Release the outbuf, since it was malloc'd
    if(outbuf) {
        free(outbuf);
    }
    
    return [self cipherTextAsData];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Other methods:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Description forthcoming...
**/
- (NSData *)digest:(NSString *)digestName
{
    if(clearText == nil) {
        return nil;
    }

    unsigned char outbuf[EVP_MAX_MD_SIZE];
    unsigned int templen, inlen;
    unsigned char *input=(unsigned char*)[clearText bytes];
    EVP_MD_CTX ctx;
    const EVP_MD *digest = NULL;
    
    inlen = [clearText length];
    
    if(inlen==0)
        return nil;
    if(digestName) {
        digest = EVP_get_digestbyname((const char*)[digestName UTF8String]);        
        if (!digest) {
            NSLog(@"cannot get digest with name %@",digestName);
            return nil;
        }
    } else {
        digest=EVP_md5();
        if(!digest) {
            NSLog(@"cannot get digest with name %@",@"MD5");
            return nil;
        }
    }

    EVP_MD_CTX_init(&ctx);
    EVP_DigestInit(&ctx,digest);
    if(!EVP_DigestUpdate(&ctx,input,inlen)) {
        NSLog(@"EVP_DigestUpdate() failed!");
        EVP_MD_CTX_cleanup(&ctx);
        return nil;			
    }
    if (!EVP_DigestFinal(&ctx, outbuf, &templen)) {
        NSLog(@"EVP_DigesttFinal() failed!");
        EVP_MD_CTX_cleanup(&ctx);
        return nil;
    }
    EVP_MD_CTX_cleanup(&ctx);
    
    return [NSData dataWithBytes:outbuf length:templen];
}

- (NSString *)description
{
    NSString *format = @"clearText: %@, cipherText: %@, symmetricKey: %@, publicKey: %@, privateKey: %@";
    NSString *desc = [NSString stringWithFormat:format, [clearText hexdump], [cipherText hexdump],
        [symmetricKey hexdump], [publicKey hexdump], [privateKey hexdump]];
    return desc;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Class methods:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

+ (NSData *)generateRSAPrivateKeyWithLength:(int)length
{
    RSA *key = NULL;
    do {
        key = RSA_generate_key(length, RSA_F4, NULL, NULL);
    } while (1 != RSA_check_key(key));

    BIO *bio = BIO_new(BIO_s_mem());

    if (!PEM_write_bio_RSAPrivateKey(bio, key, NULL, NULL, 0, NULL, NULL))
    {
        NSLog(@"cannot write private key to memory");
        return nil;
    }
    if (key) RSA_free(key);

    char *pbio_data = NULL;
    int data_len = BIO_get_mem_data(bio, &pbio_data);
    NSData *result = [NSData dataWithBytes:pbio_data length:data_len];
    
    if (bio)
        BIO_free(bio);

    return result;
}

+ (NSData *)generateRSAPublicKeyFromPrivateKey:(NSData *)privateKey
{
    BIO *privateBIO = NULL;
	RSA *privateRSA = NULL;
	
	if (!(privateBIO = BIO_new_mem_buf((unsigned char*)[privateKey bytes], [privateKey length])))
	{
		NSLog(@"BIO_new_mem_buf() failed!");
		return nil;
	}
	
	if (!PEM_read_bio_RSAPrivateKey(privateBIO, &privateRSA, NULL, NULL))
	{
		NSLog(@"PEM_read_bio_RSAPrivateKey() failed!");
		return nil;
	}
	
	// RSA_check_key() returns 1 if rsa is a valid RSA key, and 0 otherwise.
	
	unsigned long check = RSA_check_key(privateRSA);
	if (check != 1)
	{
		NSLog(@"RSA_check_key() failed with result %d!", check);
		return nil;
	}			

    BIO *bio = BIO_new(BIO_s_mem());

    if (!PEM_write_bio_RSA_PUBKEY(bio, privateRSA))
    {
        NSLog(@"cannot write public key to memory");
        return nil;
    }
    if (privateRSA) RSA_free(privateRSA);

    char *pbio_data = NULL;
    int data_len = BIO_get_mem_data(bio, &pbio_data);
    NSData *result = [NSData dataWithBytes:pbio_data length:data_len];
    
    if (bio)
        BIO_free(bio);

    return result;
}

+ (NSData *)getKeyDataWithLength:(int)length
{
    NSData *randData = nil;
    unsigned char *buffer;
    
    buffer = (unsigned char *)calloc(length*4, sizeof(unsigned char));
    NSAssert((buffer != NULL), @"Cannot calloc memory for buffer.");
    
    if (!RAND_bytes(buffer, length)){
        free(buffer);
    }

    randData = [NSData dataWithBytes:buffer length:length];
    free(buffer);
    
    return randData;
}

+ (NSData *)getSHA1ForData:(NSData *)d
{
    unsigned length = [d length];
    const void *buffer = [d bytes];
    unsigned char *md = (unsigned char *)calloc(SHA_DIGEST_LENGTH, sizeof(unsigned char));
    NSAssert((md != NULL), @"Cannot calloc memory for buffer.");

    (void)SHA1(buffer, length, md);

    return [NSData dataWithBytesNoCopy:md length:SHA_DIGEST_LENGTH freeWhenDone:YES];
}

+ (NSData *)getMD5ForData:(NSData *)d
{
	unsigned length = [d length];
    const void *buffer = [d bytes];
    unsigned char *md = (unsigned char *)calloc(MD5_DIGEST_LENGTH, sizeof(unsigned char));
    NSAssert((md != NULL), @"Cannot calloc memory for buffer.");
	
	(void)MD5(buffer, length, md);
	
    return [NSData dataWithBytesNoCopy:md length:MD5_DIGEST_LENGTH freeWhenDone:YES];
}

@end
