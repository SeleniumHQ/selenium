#import "DDKeychain.h"


@implementation DDKeychain

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Server:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieves the password stored in the keychain for the HTTP server.
**/
+ (NSString *)passwordForHTTPServer
{
	NSString *password = nil;
	
	const char *service = [@"HTTP Server" UTF8String];
	const char *account = [@"Deusty" UTF8String];
	
	UInt32 passwordLength = 0;
	void *passwordBytes = nil;
	
	OSStatus status;
	status = SecKeychainFindGenericPassword(NULL,            // default keychain
	                                (UInt32)strlen(service), // length of service name
	                                        service,         // service name
	                                (UInt32)strlen(account), // length of account name
	                                        account,         // account name
	                                        &passwordLength, // length of password
	                                        &passwordBytes,  // pointer to password data
	                                        NULL);           // keychain item reference (NULL if unneeded)
	
	if(status == noErr)
	{
		NSData *passwordData = [NSData dataWithBytesNoCopy:passwordBytes length:passwordLength freeWhenDone:NO];
		password = [[[NSString alloc] initWithData:passwordData encoding:NSUTF8StringEncoding] autorelease];
	}
	
	// SecKeychainItemFreeContent(attrList, data)
	// attrList - previously returned attributes
	// data - previously returned password
	
	if(passwordBytes) SecKeychainItemFreeContent(NULL, passwordBytes);
	
	return password;
}


/**
 * This method sets the password for the HTTP server.
**/
+ (BOOL)setPasswordForHTTPServer:(NSString *)password
{
	const char *service = [@"HTTP Server" UTF8String];
	const char *account = [@"Deusty" UTF8String];
	const char *kind    = [@"Deusty password" UTF8String];
	const char *passwd  = [password UTF8String];
	
	SecKeychainItemRef itemRef = NULL;
	
	// The first thing we need to do is check to see a password for the library already exists in the keychain
	OSStatus status;
	status = SecKeychainFindGenericPassword(NULL,            // default keychain
	                                (UInt32)strlen(service), // length of service name
	                                        service,         // service name
	                                (UInt32)strlen(account), // length of account name
	                                        account,         // account name
	                                        NULL,            // length of password (NULL if unneeded)
	                                        NULL,            // pointer to password data (NULL if unneeded)
	                                        &itemRef);       // the keychain item reference
	
	if(status == errSecItemNotFound)
	{
		// Setup the attributes the for the keychain item
		SecKeychainAttribute attrs[] = {
			{ kSecServiceItemAttr,     (UInt32)strlen(service), (char *)service },
			{ kSecAccountItemAttr,     (UInt32)strlen(account), (char *)account },
			{ kSecDescriptionItemAttr, (UInt32)strlen(kind),    (char *)kind    }
		};
		SecKeychainAttributeList attributes = { sizeof(attrs) / sizeof(attrs[0]), attrs };
		
		status = SecKeychainItemCreateFromContent(kSecGenericPasswordItemClass, // class of item to create
		                                          &attributes,                  // pointer to the list of attributes
		                                  (UInt32)strlen(passwd),               // length of password
		                                          passwd,                       // pointer to password data
		                                          NULL,                         // default keychain
		                                          NULL,                         // access list (NULL if this app only)
		                                          &itemRef);                    // the keychain item reference
	}
	else if(status == noErr)
	{
		// A keychain item for the library already exists
		// All we need to do is update it with the new password
		status = SecKeychainItemModifyAttributesAndData(itemRef,        // the keychain item reference
		                                                NULL,           // no change to attributes
		                                        (UInt32)strlen(passwd), // length of password
		                                                passwd);        // pointer to password data
	}
	
	// Don't forget to release anything we create
	if(itemRef)    CFRelease(itemRef);
	
	return (status == noErr);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Identity:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This method creates a new identity, and adds it to the keychain.
 * An identity is simply a certificate (public key and public information) along with a matching private key.
 * This method generates a new private key, and then uses the private key to generate a new self-signed certificate.
**/
+ (void)createNewIdentity
{
	// Declare any Carbon variables we may create
	// We do this here so it's easier to compare to the bottom of this method where we release them all
	SecKeychainRef keychain = NULL;
	CFArrayRef outItems = NULL;
	
	// Configure the paths where we'll create all of our identity files
	NSString *basePath = [DDKeychain applicationTemporaryDirectory];
	
	NSString *privateKeyPath  = [basePath stringByAppendingPathComponent:@"private.pem"];
	NSString *reqConfPath     = [basePath stringByAppendingPathComponent:@"req.conf"];
	NSString *certificatePath = [basePath stringByAppendingPathComponent:@"certificate.crt"];
	NSString *certWrapperPath = [basePath stringByAppendingPathComponent:@"certificate.p12"];
	
	// You can generate your own private key by running the following command in the terminal:
	// openssl genrsa -out private.pem 1024
	//
	// Where 1024 is the size of the private key.
	// You may used a bigger number.
	// It is probably a good recommendation to use at least 1024...
	
	NSArray *privateKeyArgs = [NSArray arrayWithObjects:@"genrsa", @"-out", privateKeyPath, @"1024", nil];
	
	NSTask *genPrivateKeyTask = [[[NSTask alloc] init] autorelease];
	
	[genPrivateKeyTask setLaunchPath:@"/usr/bin/openssl"];
	[genPrivateKeyTask setArguments:privateKeyArgs];
    [genPrivateKeyTask launch];
	
	// Don't use waitUntilExit - I've had too many problems with it in the past
	do {
		[NSThread sleepUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
	} while([genPrivateKeyTask isRunning]);
	
	// Now we want to create a configuration file for our certificate
	// This is an optional step, but we do it so people who are browsing their keychain
	// know exactly where the certificate came from, and don't delete it.
	
	NSMutableString *mStr = [NSMutableString stringWithCapacity:500];
	[mStr appendFormat:@"%@\n", @"[ req ]"];
	[mStr appendFormat:@"%@\n", @"distinguished_name  = req_distinguished_name"];
	[mStr appendFormat:@"%@\n", @"prompt              = no"];
	[mStr appendFormat:@"%@\n", @""];
	[mStr appendFormat:@"%@\n", @"[ req_distinguished_name ]"];
	[mStr appendFormat:@"%@\n", @"C                   = US"];
	[mStr appendFormat:@"%@\n", @"ST                  = Missouri"];
	[mStr appendFormat:@"%@\n", @"L                   = Springfield"];
	[mStr appendFormat:@"%@\n", @"O                   = Deusty Designs, LLC"];
	[mStr appendFormat:@"%@\n", @"OU                  = Open Source"];
	[mStr appendFormat:@"%@\n", @"CN                  = SecureHTTPServer"];
	[mStr appendFormat:@"%@\n", @"emailAddress        = robbiehanson@deusty.com"];
	
	[mStr writeToFile:reqConfPath atomically:NO encoding:NSUTF8StringEncoding error:nil];
	
	// You can generate your own certificate by running the following command in the terminal:
	// openssl req -new -x509 -key private.pem -out certificate.crt -text -days 365 -batch
	// 
	// You can optionally create a configuration file, and pass an extra command to use it:
	// -config req.conf
	
	NSArray *certificateArgs = [NSArray arrayWithObjects:@"req", @"-new", @"-x509",
														 @"-key", privateKeyPath,
	                                                     @"-config", reqConfPath,
	                                                     @"-out", certificatePath,
	                                                     @"-text", @"-days", @"365", @"-batch", nil];
	
	NSTask *genCertificateTask = [[[NSTask alloc] init] autorelease];
	
	[genCertificateTask setLaunchPath:@"/usr/bin/openssl"];
	[genCertificateTask setArguments:certificateArgs];
    [genCertificateTask launch];
	
	// Don't use waitUntilExit - I've had too many problems with it in the past
	do {
		[NSThread sleepUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
	} while([genCertificateTask isRunning]);
	
	// Mac OS X has problems importing private keys, so we wrap everything in PKCS#12 format
	// You can create a p12 wrapper by running the following command in the terminal:
	// openssl pkcs12 -export -in certificate.crt -inkey private.pem
	//   -passout pass:password -out certificate.p12 -name "Open Source"
	
	NSArray *certWrapperArgs = [NSArray arrayWithObjects:@"pkcs12", @"-export", @"-export",
														 @"-in", certificatePath,
	                                                     @"-inkey", privateKeyPath,
	                                                     @"-passout", @"pass:password",
	                                                     @"-out", certWrapperPath,
	                                                     @"-name", @"SecureHTTPServer", nil];
	
	NSTask *genCertWrapperTask = [[[NSTask alloc] init] autorelease];
	
	[genCertWrapperTask setLaunchPath:@"/usr/bin/openssl"];
	[genCertWrapperTask setArguments:certWrapperArgs];
    [genCertWrapperTask launch];
	
	// Don't use waitUntilExit - I've had too many problems with it in the past
	do {
		[NSThread sleepUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
	} while([genCertWrapperTask isRunning]);
	
	// At this point we've created all the identity files that we need
	// Our next step is to import the identity into the keychain
	// We can do this by using the SecKeychainItemImport() method.
	// But of course this method is "Frozen in Carbonite"...
	// So it's going to take us 100 lines of code to build up the parameters needed to make the method call
	NSData *certData = [NSData dataWithContentsOfFile:certWrapperPath];
	
	/* SecKeyImportExportFlags - typedef uint32_t
	 * Defines values for the flags field of the import/export parameters.
	 * 
	 * enum 
	 * {
	 *    kSecKeyImportOnlyOne        = 0x00000001,
	 *    kSecKeySecurePassphrase     = 0x00000002,
	 *    kSecKeyNoAccessControl      = 0x00000004
	 * };
	 * 
	 * kSecKeyImportOnlyOne
	 *     Prevents the importing of more than one private key by the SecKeychainItemImport function.
	 *     If the importKeychain parameter is NULL, this bit is ignored. Otherwise, if this bit is set and there is
	 *     more than one key in the incoming external representation,
	 *     no items are imported to the specified keychain and the error errSecMultipleKeys is returned.
	 * kSecKeySecurePassphrase
	 *     When set, the password for import or export is obtained by user prompt. Otherwise, you must provide the
	 *     password in the passphrase field of the SecKeyImportExportParameters structure.
	 *     A user-supplied password is preferred, because it avoids having the cleartext password appear in the
	 *     applicationÕs address space at any time.
	 * kSecKeyNoAccessControl
	 *     When set, imported private keys have no access object attached to them. In the absence of both this bit and
	 *     the accessRef field in SecKeyImportExportParameters, imported private keys are given default access controls
	**/
	
	SecKeyImportExportFlags importFlags = kSecKeyImportOnlyOne;
	
	/* SecKeyImportExportParameters - typedef struct
	 *
	 * FOR IMPORT AND EXPORT:
	 * uint32_t version
	 *     The version of this structure; the current value is SEC_KEY_IMPORT_EXPORT_PARAMS_VERSION.
	 * SecKeyImportExportFlags flags
	 *     A set of flag bits, defined in "Keychain Item Import/Export Parameter Flags".
	 * CFTypeRef passphrase
	 *     A password, used for kSecFormatPKCS12 and kSecFormatWrapped formats only...
	 *     IE - kSecFormatWrappedOpenSSL, kSecFormatWrappedSSH, or kSecFormatWrappedPKCS8
	 * CFStringRef alertTitle
	 *     Title of secure password alert panel.
	 *     When importing or exporting a key, if you set the kSecKeySecurePassphrase flag bit,
	 *     you can optionally use this field to specify a string for the password panelÕs title bar.
	 * CFStringRef alertPrompt
	 *     Prompt in secure password alert panel.
	 *     When importing or exporting a key, if you set the kSecKeySecurePassphrase flag bit,
	 *     you can optionally use this field to specify a string for the prompt that appears in the password panel.
	 *
	 * FOR IMPORT ONLY:
	 * SecAccessRef accessRef
	 *     Specifies the initial access controls of imported private keys.
	 *     If more than one private key is being imported, all private keys get the same initial access controls.
	 *     If this field is NULL when private keys are being imported, then the access object for the keychain item
	 *     for an imported private key depends on the kSecKeyNoAccessControl bit in the flags parameter.
	 *     If this bit is 0 (or keyParams is NULL), the default access control is used.
	 *     If this bit is 1, no access object is attached to the keychain item for imported private keys.
	 * CSSM_KEYUSE keyUsage
	 *     A word of bits constituting the low-level use flags for imported keys as defined in cssmtype.h.
	 *     If this field is 0 or keyParams is NULL, the default value is CSSM_KEYUSE_ANY.
	 * CSSM_KEYATTR_FLAGS keyAttributes
	 *     The following are valid values for these flags:
	 *     CSSM_KEYATTR_PERMANENT, CSSM_KEYATTR_SENSITIVE, and CSSM_KEYATTR_EXTRACTABLE.
	 *     The default value is CSSM_KEYATTR_SENSITIVE | CSSM_KEYATTR_EXTRACTABLE
	 *     The CSSM_KEYATTR_SENSITIVE bit indicates that the key can only be extracted in wrapped form.
	 *     Important: If you do not set the CSSM_KEYATTR_EXTRACTABLE bit,
	 *     you cannot extract the imported key from the keychain in any form, including in wrapped form.
	**/
	
	SecKeyImportExportParameters importParameters;
	importParameters.version = SEC_KEY_IMPORT_EXPORT_PARAMS_VERSION;
	importParameters.flags = importFlags;
	importParameters.passphrase = CFSTR("password");
	importParameters.accessRef = NULL;
	importParameters.keyUsage = CSSM_KEYUSE_ANY;
	importParameters.keyAttributes = CSSM_KEYATTR_SENSITIVE | CSSM_KEYATTR_EXTRACTABLE;
	
	/* SecKeychainItemImport - Imports one or more certificates, keys, or identities and adds them to a keychain.
	 * 
	 * Parameters:
	 * CFDataRef importedData
	 *     The external representation of the items to import.
	 * CFStringRef fileNameOrExtension
	 *     The name or extension of the file from which the external representation was obtained.
	 *     Pass NULL if you donÕt know the name or extension.
	 * SecExternalFormat *inputFormat
	 *     On input, points to the format of the external representation.
	 *     Pass kSecFormatUnknown if you do not know the exact format.
	 *     On output, points to the format that the function has determined the external representation to be in.
	 *     Pass NULL if you donÕt know the format and donÕt want the format returned to you.
	 * SecExternalItemType *itemType
	 *     On input, points to the item type of the item or items contained in the external representation.
	 *     Pass kSecItemTypeUnknown if you do not know the item type.
	 *     On output, points to the item type that the function has determined the external representation to contain.
	 *     Pass NULL if you donÕt know the item type and donÕt want the type returned to you.
	 * SecItemImportExportFlags flags
	 *     Unused; pass in 0.
	 * const SecKeyImportExportParameters *keyParams
	 *     A pointer to a structure containing a set of input parameters for the function.
	 *     If no key items are being imported, these parameters are optional
	 *     and you can set the keyParams parameter to NULL.
	 * SecKeychainRef importKeychain
	 *     A keychain object indicating the keychain to which the key or certificate should be imported.
	 *     If you pass NULL, the item is not imported.
	 *     Use the SecKeychainCopyDefault function to get a reference to the default keychain.
	 *     If the kSecKeyImportOnlyOne bit is set and there is more than one key in the
	 *     incoming external representation, no items are imported to the specified keychain and the
	 *     error errSecMultiplePrivKeys is returned.
	 * CFArrayRef *outItems
	 *     On output, points to an array of SecKeychainItemRef objects for the imported items.
	 *     You must provide a valid pointer to a CFArrayRef object to receive this information.
	 *     If you pass NULL for this parameter, the function does not return the imported items.
	 *     Release this object by calling the CFRelease function when you no longer need it.
	**/
	
	SecExternalFormat inputFormat = kSecFormatPKCS12;
	SecExternalItemType itemType = kSecItemTypeUnknown;
	
	SecKeychainCopyDefault(&keychain);
	
	OSStatus err = 0;
	err = SecKeychainItemImport((CFDataRef)certData,   // CFDataRef importedData
								NULL,                  // CFStringRef fileNameOrExtension
								&inputFormat,          // SecExternalFormat *inputFormat
								&itemType,             // SecExternalItemType *itemType
								0,                     // SecItemImportExportFlags flags (Unused)
								&importParameters,     // const SecKeyImportExportParameters *keyParams
								keychain,              // SecKeychainRef importKeychain
								&outItems);            // CFArrayRef *outItems
	
	NSLog(@"OSStatus: %i", err);
	
	NSLog(@"SecExternalFormat: %@", [DDKeychain stringForSecExternalFormat:inputFormat]);
	NSLog(@"SecExternalItemType: %@", [DDKeychain stringForSecExternalItemType:itemType]);
	
	NSLog(@"outItems: %@", (NSArray *)outItems);
	
	// Don't forget to delete the temporary files
	[[NSFileManager defaultManager] removeItemAtPath:privateKeyPath  error:nil];
	[[NSFileManager defaultManager] removeItemAtPath:reqConfPath     error:nil];
	[[NSFileManager defaultManager] removeItemAtPath:certificatePath error:nil];
	[[NSFileManager defaultManager] removeItemAtPath:certWrapperPath error:nil];
	
	// Don't forget to release anything we may have created
	if(keychain)   CFRelease(keychain);
	if(outItems)   CFRelease(outItems);
}

/**
 * Returns an array of SecCertificateRefs except for the first element in the array, which is a SecIdentityRef.
 * Currently this method is designed to return the identity created in the method above.
 * You will most likely alter this method to return a proper identity based on what it is you're trying to do.
**/
+ (NSArray *)SSLIdentityAndCertificates
{
	// Declare any Carbon variables we may create
	// We do this here so it's easier to compare to the bottom of this method where we release them all
	SecKeychainRef keychain = NULL;
	SecIdentitySearchRef searchRef = NULL;
	
	// Create array to hold the results
	NSMutableArray *result = [NSMutableArray array];
	
	/* SecKeychainAttribute - typedef struct
	 * Contains keychain attributes.
	 *
	 * struct SecKeychainAttribute
	 * {
	 *   SecKeychainAttrType tag;
	 *   UInt32 length;
	 *   void *data;
	 * };
	 *
	 * Fields:
	 * tag
	 *     A 4-byte attribute tag. See ÒKeychain Item Attribute ConstantsÓ for valid attribute types.
	 * length
	 *     The length of the buffer pointed to by data.
	 * data
	 *     A pointer to the attribute data.
	**/

	/* SecKeychainAttributeList - typedef struct
	 * Represents a list of keychain attributes.
	 * 
	 * struct SecKeychainAttributeList
	 * {
	 *   UInt32 count;
	 *   SecKeychainAttribute *attr;
	 * };
	 *
	 * Fields:
	 * count
	 *     An unsigned 32-bit integer that represents the number of keychain attributes in the array.
	 * attr
	 *     A pointer to the first keychain attribute in the array.
	**/
	
	SecKeychainCopyDefault(&keychain);
	
	SecIdentitySearchCreate(keychain, CSSM_KEYUSE_ANY, &searchRef);
	
	SecIdentityRef currentIdentityRef = NULL;
	while(searchRef && (SecIdentitySearchCopyNext(searchRef, &currentIdentityRef) != errSecItemNotFound))
	{
		// Extract the private key from the identity, and examine it to see if it will work for us
		SecKeyRef privateKeyRef = NULL;
		SecIdentityCopyPrivateKey(currentIdentityRef, &privateKeyRef);
		
		if(privateKeyRef)
		{
			// Get the name attribute of the private key
			// We're looking for a private key with the name of "Mojo User"
			
			SecItemAttr itemAttributes[] = {kSecKeyPrintName};
			
			SecExternalFormat externalFormats[] = {kSecFormatUnknown};
			
			int itemAttributesSize  = sizeof(itemAttributes) / sizeof(*itemAttributes);
			int externalFormatsSize = sizeof(externalFormats) / sizeof(*externalFormats);
			NSAssert(itemAttributesSize == externalFormatsSize, @"Arrays must have identical counts!");
			
			SecKeychainAttributeInfo info = {itemAttributesSize, (void *)&itemAttributes, (void *)&externalFormats};
			
			SecKeychainAttributeList *privateKeyAttributeList = NULL;
			SecKeychainItemCopyAttributesAndData((SecKeychainItemRef)privateKeyRef,
			                                     &info, NULL, &privateKeyAttributeList, NULL, NULL);
			
			if(privateKeyAttributeList)
			{
				SecKeychainAttribute nameAttribute = privateKeyAttributeList->attr[0];
				
				NSString *name = [[[NSString alloc] initWithBytes:nameAttribute.data
														   length:(nameAttribute.length)
														 encoding:NSUTF8StringEncoding] autorelease];
				
				// Ugly Hack
				// For some reason, name sometimes contains odd characters at the end of it
				// I'm not sure why, and I don't know of a proper fix, thus the use of the hasPrefix: method
				if([name hasPrefix:@"SecureHTTPServer"])
				{
					// It's possible for there to be more than one private key with the above prefix
					// But we're only allowed to have one identity, so we make sure to only add one to the array
					if([result count] == 0)
					{
						[result addObject:(id)currentIdentityRef];
					}
				}
				
				SecKeychainItemFreeAttributesAndData(privateKeyAttributeList, NULL);
			}
			
			CFRelease(privateKeyRef);
		}
		
		CFRelease(currentIdentityRef);
	}
	
	if(keychain)  CFRelease(keychain);
	if(searchRef) CFRelease(searchRef);
	
	return result;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark Utilities:
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates (if necessary) and returns a temporary directory for the application.
 *
 * A general temporary directory is provided for each user by the OS.
 * This prevents conflicts between the same application running on multiple user accounts.
 * We take this a step further by putting everything inside another subfolder, identified by our application name.
**/
+ (NSString *)applicationTemporaryDirectory
{
	NSString *userTempDir = NSTemporaryDirectory();
	NSString *appTempDir = [userTempDir stringByAppendingPathComponent:@"SecureHTTPServer"];
	
	NSFileManager *fileManager = [NSFileManager defaultManager];
	if([fileManager fileExistsAtPath:appTempDir] == NO)
	{
		[fileManager createDirectoryAtPath:appTempDir withIntermediateDirectories:YES attributes:nil error:nil];
	}
	
	return appTempDir;
}

/**
 * Simple utility class to convert a SecExternalFormat into a string suitable for printing/logging.
**/
+ (NSString *)stringForSecExternalFormat:(SecExternalFormat)extFormat
{
	switch(extFormat)
	{
		case kSecFormatUnknown              : return @"kSecFormatUnknown";
			
		/* Asymmetric Key Formats */
		case kSecFormatOpenSSL              : return @"kSecFormatOpenSSL";
		case kSecFormatSSH                  : return @"kSecFormatSSH - Not Supported";
		case kSecFormatBSAFE                : return @"kSecFormatBSAFE";
			
		/* Symmetric Key Formats */
		case kSecFormatRawKey               : return @"kSecFormatRawKey";
			
		/* Formats for wrapped symmetric and private keys */
		case kSecFormatWrappedPKCS8         : return @"kSecFormatWrappedPKCS8";
		case kSecFormatWrappedOpenSSL       : return @"kSecFormatWrappedOpenSSL";
		case kSecFormatWrappedSSH           : return @"kSecFormatWrappedSSH - Not Supported";
		case kSecFormatWrappedLSH           : return @"kSecFormatWrappedLSH - Not Supported";
			
		/* Formats for certificates */
		case kSecFormatX509Cert             : return @"kSecFormatX509Cert";
			
		/* Aggregate Types */
		case kSecFormatPEMSequence          : return @"kSecFormatPEMSequence";
		case kSecFormatPKCS7                : return @"kSecFormatPKCS7";
		case kSecFormatPKCS12               : return @"kSecFormatPKCS12";
		case kSecFormatNetscapeCertSequence : return @"kSecFormatNetscapeCertSequence";
			
		default                             : return @"Unknown";
	}
}

/**
 * Simple utility class to convert a SecExternalItemType into a string suitable for printing/logging.
**/
+ (NSString *)stringForSecExternalItemType:(SecExternalItemType)itemType
{
	switch(itemType)
	{
		case kSecItemTypeUnknown     : return @"kSecItemTypeUnknown";
			
		case kSecItemTypePrivateKey  : return @"kSecItemTypePrivateKey";
		case kSecItemTypePublicKey   : return @"kSecItemTypePublicKey";
		case kSecItemTypeSessionKey  : return @"kSecItemTypeSessionKey";
		case kSecItemTypeCertificate : return @"kSecItemTypeCertificate";
		case kSecItemTypeAggregate   : return @"kSecItemTypeAggregate";
		
		default                      : return @"Unknown";
	}
}

/**
 * Simple utility class to convert a SecKeychainAttrType into a string suitable for printing/logging.
**/
+ (NSString *)stringForSecKeychainAttrType:(SecKeychainAttrType)attrType
{
	switch(attrType)
	{
		case kSecCreationDateItemAttr       : return @"kSecCreationDateItemAttr";
		case kSecModDateItemAttr            : return @"kSecModDateItemAttr";
		case kSecDescriptionItemAttr        : return @"kSecDescriptionItemAttr";
		case kSecCommentItemAttr            : return @"kSecCommentItemAttr";
		case kSecCreatorItemAttr            : return @"kSecCreatorItemAttr";
		case kSecTypeItemAttr               : return @"kSecTypeItemAttr";
		case kSecScriptCodeItemAttr         : return @"kSecScriptCodeItemAttr";
		case kSecLabelItemAttr              : return @"kSecLabelItemAttr";
		case kSecInvisibleItemAttr          : return @"kSecInvisibleItemAttr";
		case kSecNegativeItemAttr           : return @"kSecNegativeItemAttr";
		case kSecCustomIconItemAttr         : return @"kSecCustomIconItemAttr";
		case kSecAccountItemAttr            : return @"kSecAccountItemAttr";
		case kSecServiceItemAttr            : return @"kSecServiceItemAttr";
		case kSecGenericItemAttr            : return @"kSecGenericItemAttr";
		case kSecSecurityDomainItemAttr     : return @"kSecSecurityDomainItemAttr";
		case kSecServerItemAttr             : return @"kSecServerItemAttr";
		case kSecAuthenticationTypeItemAttr : return @"kSecAuthenticationTypeItemAttr";
		case kSecPortItemAttr               : return @"kSecPortItemAttr";
		case kSecPathItemAttr               : return @"kSecPathItemAttr";
		case kSecVolumeItemAttr             : return @"kSecVolumeItemAttr";
		case kSecAddressItemAttr            : return @"kSecAddressItemAttr";
		case kSecSignatureItemAttr          : return @"kSecSignatureItemAttr";
		case kSecProtocolItemAttr           : return @"kSecProtocolItemAttr";
		case kSecCertificateType            : return @"kSecCertificateType";
		case kSecCertificateEncoding        : return @"kSecCertificateEncoding";
		case kSecCrlType                    : return @"kSecCrlType";
		case kSecCrlEncoding                : return @"kSecCrlEncoding";
		case kSecAlias                      : return @"kSecAlias";
		default                             : return @"Unknown";
	}
}

@end
