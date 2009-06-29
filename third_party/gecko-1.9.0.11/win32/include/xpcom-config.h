/* xpcom/xpcom-config.h.  Generated automatically by configure.  */
/* Global defines needed by xpcom clients */

#ifndef _XPCOM_CONFIG_H_
#define _XPCOM_CONFIG_H_

/* Define this to throw() if the compiler complains about 
 * constructors returning NULL
 */
#define CPP_THROW_NEW throw()

/* Define if the c++ compiler supports a 2-byte wchar_t */
/* #undef HAVE_CPP_2BYTE_WCHAR_T */

/* Define if the c++ compiler supports changing access with |using| */
/* #undef HAVE_CPP_ACCESS_CHANGING_USING */

/* Define if the c++ compiler can resolve ambiguity with |using| */
/* #undef HAVE_CPP_AMBIGUITY_RESOLVING_USING */

/* Define if the c++ compiler has builtin Bool type */
/* #undef HAVE_CPP_BOOL */

/* Define if a dyanmic_cast to void* gives the most derived object */
/* #undef HAVE_CPP_DYNAMIC_CAST_TO_VOID_PTR */

/* Define if the c++ compiler supports the |explicit| keyword */
/* #undef HAVE_CPP_EXPLICIT */

/* Define if the c++ compiler supports the modern template 
 * specialization syntax 
 */
/* #undef HAVE_CPP_MODERN_SPECIALIZE_TEMPLATE_SYNTAX */

/* Define if the c++ compiler supports the |std| namespace */
/* #undef HAVE_CPP_NAMESPACE_STD */

/* Define if the c++ compiler supports reinterpret_cast */
/* #undef HAVE_CPP_NEW_CASTS */

/* Define if the c++ compiler supports partial template specialization */
/* #undef HAVE_CPP_PARTIAL_SPECIALIZATION */

/* Define if the c++ compiler has trouble comparing a constant
 * reference to a templatized class to zero
 */
/* #undef HAVE_CPP_TROUBLE_COMPARING_TO_ZERO */

/* Define if the c++ compiler supports the |typename| keyword */
/* #undef HAVE_CPP_TYPENAME */

/* Define if the stanard template operator!=() is ambiguous */
/* #undef HAVE_CPP_UNAMBIGUOUS_STD_NOTEQUAL */

/* Define if statvfs() is available */
/* #undef HAVE_STATVFS */

/* Define if the c++ compiler requires implementations of 
 * unused virtual methods
 */
/* #undef NEED_CPP_UNUSED_IMPLEMENTATIONS */

/* Define to either <new> or <new.h> */
#define NEW_H <new>

/* Define if binary compatibility with Mozilla 1.x string code is desired */
/* #undef MOZ_V1_STRING_ABI */

#endif /* _XPCOM_CONFIG_H_ */
