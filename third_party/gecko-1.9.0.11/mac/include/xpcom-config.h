/* xpcom/xpcom-config.h.  Generated automatically by configure.  */
/* Global defines needed by xpcom clients */

#ifndef _XPCOM_CONFIG_H_
#define _XPCOM_CONFIG_H_

/* Define this to throw() if the compiler complains about 
 * constructors returning NULL
 */
#define CPP_THROW_NEW throw()

/* Define if the c++ compiler supports a 2-byte wchar_t */
#define HAVE_CPP_2BYTE_WCHAR_T 1

/* Define if the c++ compiler supports changing access with |using| */
#define HAVE_CPP_ACCESS_CHANGING_USING 1

/* Define if the c++ compiler can resolve ambiguity with |using| */
#define HAVE_CPP_AMBIGUITY_RESOLVING_USING 1

/* Define if the c++ compiler has builtin Bool type */
/* #undef HAVE_CPP_BOOL */

/* Define if a dyanmic_cast to void* gives the most derived object */
#define HAVE_CPP_DYNAMIC_CAST_TO_VOID_PTR 1

/* Define if the c++ compiler supports the |explicit| keyword */
#define HAVE_CPP_EXPLICIT 1

/* Define if the c++ compiler supports the modern template 
 * specialization syntax 
 */
#define HAVE_CPP_MODERN_SPECIALIZE_TEMPLATE_SYNTAX 1

/* Define if the c++ compiler supports the |std| namespace */
#define HAVE_CPP_NAMESPACE_STD 1

/* Define if the c++ compiler supports reinterpret_cast */
#define HAVE_CPP_NEW_CASTS 1

/* Define if the c++ compiler supports partial template specialization */
#define HAVE_CPP_PARTIAL_SPECIALIZATION 1

/* Define if the c++ compiler has trouble comparing a constant
 * reference to a templatized class to zero
 */
/* #undef HAVE_CPP_TROUBLE_COMPARING_TO_ZERO */

/* Define if the c++ compiler supports the |typename| keyword */
#define HAVE_CPP_TYPENAME 1

/* Define if the stanard template operator!=() is ambiguous */
#define HAVE_CPP_UNAMBIGUOUS_STD_NOTEQUAL 1

/* Define if statvfs() is available */
#define HAVE_STATVFS 1

/* Define if the c++ compiler requires implementations of 
 * unused virtual methods
 */
#define NEED_CPP_UNUSED_IMPLEMENTATIONS 1

/* Define to either <new> or <new.h> */
#define NEW_H <new>

/* Define if binary compatibility with Mozilla 1.x string code is desired */
/* #undef MOZ_V1_STRING_ABI */

#endif /* _XPCOM_CONFIG_H_ */
