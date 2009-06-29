/*
 * Various and sundry protocol constants. DON'T CHANGE THESE. These values 
 * are mostly defined by the SSL2, SSL3, or TLS protocol specifications.
 * Cipher kinds and ciphersuites are part of the public API.
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Netscape security libraries.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1994-2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Dr Vipul Gupta <vipul.gupta@sun.com>, Sun Microsystems Laboratories
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
/* $Id: sslproto.h,v 1.12 2007/02/28 19:47:38 rrelyea%redhat.com Exp $ */

#ifndef __sslproto_h_
#define __sslproto_h_

/* All versions less than 3_0 are treated as SSL version 2 */
#define SSL_LIBRARY_VERSION_2			0x0002
#define SSL_LIBRARY_VERSION_3_0			0x0300
#define SSL_LIBRARY_VERSION_3_1_TLS		0x0301

/* Header lengths of some of the messages */
#define SSL_HL_ERROR_HBYTES			3
#define SSL_HL_CLIENT_HELLO_HBYTES		9
#define SSL_HL_CLIENT_MASTER_KEY_HBYTES		10
#define SSL_HL_CLIENT_FINISHED_HBYTES		1
#define SSL_HL_SERVER_HELLO_HBYTES		11
#define SSL_HL_SERVER_VERIFY_HBYTES		1
#define SSL_HL_SERVER_FINISHED_HBYTES		1
#define SSL_HL_REQUEST_CERTIFICATE_HBYTES	2
#define SSL_HL_CLIENT_CERTIFICATE_HBYTES	6

/* Security handshake protocol codes */
#define SSL_MT_ERROR				0
#define SSL_MT_CLIENT_HELLO			1
#define SSL_MT_CLIENT_MASTER_KEY		2
#define SSL_MT_CLIENT_FINISHED			3
#define SSL_MT_SERVER_HELLO			4
#define SSL_MT_SERVER_VERIFY			5
#define SSL_MT_SERVER_FINISHED			6
#define SSL_MT_REQUEST_CERTIFICATE		7
#define SSL_MT_CLIENT_CERTIFICATE		8

/* Certificate types */
#define SSL_CT_X509_CERTIFICATE			0x01
#if 0 /* XXX Not implemented yet */
#define SSL_PKCS6_CERTIFICATE			0x02
#endif
#define SSL_AT_MD5_WITH_RSA_ENCRYPTION		0x01

/* Error codes */
#define SSL_PE_NO_CYPHERS			0x0001
#define SSL_PE_NO_CERTIFICATE			0x0002
#define SSL_PE_BAD_CERTIFICATE			0x0004
#define SSL_PE_UNSUPPORTED_CERTIFICATE_TYPE	0x0006

/* Cypher kinds (not the spec version!) */
#define SSL_CK_RC4_128_WITH_MD5			0x01
#define SSL_CK_RC4_128_EXPORT40_WITH_MD5	0x02
#define SSL_CK_RC2_128_CBC_WITH_MD5		0x03
#define SSL_CK_RC2_128_CBC_EXPORT40_WITH_MD5	0x04
#define SSL_CK_IDEA_128_CBC_WITH_MD5		0x05
#define SSL_CK_DES_64_CBC_WITH_MD5		0x06
#define SSL_CK_DES_192_EDE3_CBC_WITH_MD5	0x07

/* Cipher enables.  These are used only for SSL_EnableCipher 
 * These values define the SSL2 suites, and do not colide with the 
 * SSL3 Cipher suites defined below.
 */
#define SSL_EN_RC4_128_WITH_MD5			0xFF01
#define SSL_EN_RC4_128_EXPORT40_WITH_MD5	0xFF02
#define SSL_EN_RC2_128_CBC_WITH_MD5		0xFF03
#define SSL_EN_RC2_128_CBC_EXPORT40_WITH_MD5	0xFF04
#define SSL_EN_IDEA_128_CBC_WITH_MD5		0xFF05
#define SSL_EN_DES_64_CBC_WITH_MD5		0xFF06
#define SSL_EN_DES_192_EDE3_CBC_WITH_MD5	0xFF07

/* SSL v3 Cipher Suites */
#define SSL_NULL_WITH_NULL_NULL			0x0000

#define SSL_RSA_WITH_NULL_MD5			0x0001
#define SSL_RSA_WITH_NULL_SHA			0x0002
#define SSL_RSA_EXPORT_WITH_RC4_40_MD5		0x0003
#define SSL_RSA_WITH_RC4_128_MD5		0x0004
#define SSL_RSA_WITH_RC4_128_SHA		0x0005
#define SSL_RSA_EXPORT_WITH_RC2_CBC_40_MD5	0x0006
#define SSL_RSA_WITH_IDEA_CBC_SHA		0x0007
#define SSL_RSA_EXPORT_WITH_DES40_CBC_SHA	0x0008
#define SSL_RSA_WITH_DES_CBC_SHA		0x0009
#define SSL_RSA_WITH_3DES_EDE_CBC_SHA		0x000a
						       
#define SSL_DH_DSS_EXPORT_WITH_DES40_CBC_SHA	0x000b
#define SSL_DH_DSS_WITH_DES_CBC_SHA		0x000c
#define SSL_DH_DSS_WITH_3DES_EDE_CBC_SHA	0x000d
#define SSL_DH_RSA_EXPORT_WITH_DES40_CBC_SHA	0x000e
#define SSL_DH_RSA_WITH_DES_CBC_SHA		0x000f
#define SSL_DH_RSA_WITH_3DES_EDE_CBC_SHA	0x0010
						       
#define SSL_DHE_DSS_EXPORT_WITH_DES40_CBC_SHA	0x0011
#define SSL_DHE_DSS_WITH_DES_CBC_SHA		0x0012
#define SSL_DHE_DSS_WITH_3DES_EDE_CBC_SHA	0x0013
#define SSL_DHE_RSA_EXPORT_WITH_DES40_CBC_SHA	0x0014
#define SSL_DHE_RSA_WITH_DES_CBC_SHA		0x0015
#define SSL_DHE_RSA_WITH_3DES_EDE_CBC_SHA	0x0016
						       
#define SSL_DH_ANON_EXPORT_WITH_RC4_40_MD5	0x0017
#define SSL_DH_ANON_WITH_RC4_128_MD5		0x0018
#define SSL_DH_ANON_EXPORT_WITH_DES40_CBC_SHA	0x0019
#define SSL_DH_ANON_WITH_DES_CBC_SHA		0x001a
#define SSL_DH_ANON_WITH_3DES_EDE_CBC_SHA	0x001b

#define SSL_FORTEZZA_DMS_WITH_NULL_SHA		0x001c /* deprecated */
#define SSL_FORTEZZA_DMS_WITH_FORTEZZA_CBC_SHA	0x001d /* deprecated */
#define SSL_FORTEZZA_DMS_WITH_RC4_128_SHA	0x001e /* deprecated */

/* New TLS cipher suites */
#define TLS_RSA_WITH_AES_128_CBC_SHA      	0x002F
#define TLS_DH_DSS_WITH_AES_128_CBC_SHA   	0x0030
#define TLS_DH_RSA_WITH_AES_128_CBC_SHA   	0x0031
#define TLS_DHE_DSS_WITH_AES_128_CBC_SHA  	0x0032
#define TLS_DHE_RSA_WITH_AES_128_CBC_SHA  	0x0033
#define TLS_DH_ANON_WITH_AES_128_CBC_SHA  	0x0034

#define TLS_RSA_WITH_AES_256_CBC_SHA      	0x0035
#define TLS_DH_DSS_WITH_AES_256_CBC_SHA   	0x0036
#define TLS_DH_RSA_WITH_AES_256_CBC_SHA   	0x0037
#define TLS_DHE_DSS_WITH_AES_256_CBC_SHA  	0x0038
#define TLS_DHE_RSA_WITH_AES_256_CBC_SHA  	0x0039
#define TLS_DH_ANON_WITH_AES_256_CBC_SHA  	0x003A

#define TLS_RSA_WITH_CAMELLIA_128_CBC_SHA      	0x0041
#define TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA   	0x0042
#define TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA   	0x0043
#define TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA  	0x0044
#define TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA  	0x0045
#define TLS_DH_ANON_WITH_CAMELLIA_128_CBC_SHA  	0x0046

#define TLS_RSA_EXPORT1024_WITH_DES_CBC_SHA     0x0062
#define TLS_RSA_EXPORT1024_WITH_RC4_56_SHA      0x0064

#define TLS_DHE_DSS_EXPORT1024_WITH_DES_CBC_SHA 0x0063
#define TLS_DHE_DSS_EXPORT1024_WITH_RC4_56_SHA  0x0065
#define TLS_DHE_DSS_WITH_RC4_128_SHA            0x0066

#define TLS_RSA_WITH_CAMELLIA_256_CBC_SHA      	0x0084
#define TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA   	0x0085
#define TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA   	0x0086
#define TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA  	0x0087
#define TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA  	0x0088
#define TLS_DH_ANON_WITH_CAMELLIA_256_CBC_SHA  	0x0089

#define TLS_ECDH_ECDSA_WITH_NULL_SHA            0xC001
#define TLS_ECDH_ECDSA_WITH_RC4_128_SHA         0xC002
#define TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA    0xC003
#define TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA     0xC004
#define TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA     0xC005

#define TLS_ECDHE_ECDSA_WITH_NULL_SHA           0xC006
#define TLS_ECDHE_ECDSA_WITH_RC4_128_SHA        0xC007
#define TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA   0xC008
#define TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA    0xC009
#define TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA    0xC00A

#define TLS_ECDH_RSA_WITH_NULL_SHA              0xC00B
#define TLS_ECDH_RSA_WITH_RC4_128_SHA           0xC00C
#define TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA      0xC00D
#define TLS_ECDH_RSA_WITH_AES_128_CBC_SHA       0xC00E
#define TLS_ECDH_RSA_WITH_AES_256_CBC_SHA       0xC00F

#define TLS_ECDHE_RSA_WITH_NULL_SHA             0xC010
#define TLS_ECDHE_RSA_WITH_RC4_128_SHA          0xC011
#define TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA     0xC012
#define TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA      0xC013
#define TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA      0xC014

#define TLS_ECDH_anon_WITH_NULL_SHA             0xC015
#define TLS_ECDH_anon_WITH_RC4_128_SHA          0xC016
#define TLS_ECDH_anon_WITH_3DES_EDE_CBC_SHA     0xC017
#define TLS_ECDH_anon_WITH_AES_128_CBC_SHA      0xC018
#define TLS_ECDH_anon_WITH_AES_256_CBC_SHA      0xC019

/* Netscape "experimental" cipher suites. */
#define SSL_RSA_OLDFIPS_WITH_3DES_EDE_CBC_SHA	0xffe0
#define SSL_RSA_OLDFIPS_WITH_DES_CBC_SHA	0xffe1

/* New non-experimental openly spec'ed versions of those cipher suites. */
#define SSL_RSA_FIPS_WITH_3DES_EDE_CBC_SHA 	0xfeff
#define SSL_RSA_FIPS_WITH_DES_CBC_SHA      	0xfefe

#endif /* __sslproto_h_ */
