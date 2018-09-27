

/* this ALWAYS GENERATED file contains the IIDs and CLSIDs */

/* link this file in with the server and any clients */


 /* File created by MIDL compiler version 7.00.0555 */
/* at Thu Sep 04 05:00:00 2014
 */
/* Compiler settings for IEWebDriver.idl:
    Oicf, W1, Zp8, env=Win32 (32b run), target_arch=X86 7.00.0555 
    protocol : dce , ms_ext, c_ext, robust
    error checks: allocation ref bounds_check enum stub_data 
    VC __declspec() decoration level: 
         __declspec(uuid()), __declspec(selectany), __declspec(novtable)
         DECLSPEC_UUID(), MIDL_INTERFACE()
*/
/* @@MIDL_FILE_HEADING(  ) */

#pragma warning( disable: 4049 )  /* more than 64k source lines */


#ifdef __cplusplus
extern "C"{
#endif 


#include <rpc.h>
#include <rpcndr.h>

#ifdef _MIDL_USE_GUIDDEF_

#ifndef INITGUID
#define INITGUID
#include <guiddef.h>
#undef INITGUID
#else
#include <guiddef.h>
#endif

#define MIDL_DEFINE_GUID(type,name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8) \
        DEFINE_GUID(name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8)

#else // !_MIDL_USE_GUIDDEF_

#ifndef __IID_DEFINED__
#define __IID_DEFINED__

typedef struct _IID
{
    unsigned long x;
    unsigned short s1;
    unsigned short s2;
    unsigned char  c[8];
} IID;

#endif // __IID_DEFINED__

#ifndef CLSID_DEFINED
#define CLSID_DEFINED
typedef IID CLSID;
#endif // CLSID_DEFINED

#define MIDL_DEFINE_GUID(type,name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8) \
        const type name = {l,w1,w2,{b1,b2,b3,b4,b5,b6,b7,b8}}

#endif !_MIDL_USE_GUIDDEF_

MIDL_DEFINE_GUID(IID, LIBID_IEWebDriverLib,0xB7BBFE94,0x693D,0x48EE,0xB2,0x36,0xA1,0x89,0xFB,0xB6,0x99,0x37);


MIDL_DEFINE_GUID(IID, IID_IIEWebDriverManager,0xBD1DC630,0x6590,0x4CA2,0xA2,0x93,0x6B,0xC7,0x2B,0x24,0x38,0xD8);


MIDL_DEFINE_GUID(IID, IID_IIEWebDriverSite,0xFFB84444,0x453D,0x4FBC,0x9F,0x9D,0x8D,0xB5,0xC4,0x71,0xEC,0x75);


MIDL_DEFINE_GUID(CLSID, CLSID_IEWebDriverManager,0x90314AF2,0x5250,0x47B3,0x89,0xD8,0x62,0x95,0xFC,0x23,0xBC,0x22);

#undef MIDL_DEFINE_GUID

#ifdef __cplusplus
}
#endif



