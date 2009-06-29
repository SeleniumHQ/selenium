/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM /builds/tinderbox/Xr-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/xpcom/base/nsIMemory.idl
 */

#ifndef __gen_nsIMemory_h__
#define __gen_nsIMemory_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIMemory */
#define NS_IMEMORY_IID_STR "59e7e77a-38e4-11d4-8cf5-0060b0fc14a3"

#define NS_IMEMORY_IID \
  {0x59e7e77a, 0x38e4, 0x11d4, \
    { 0x8c, 0xf5, 0x00, 0x60, 0xb0, 0xfc, 0x14, 0xa3 }}

/**
 *
 * nsIMemory: interface to allocate and deallocate memory. Also provides
 * for notifications in low-memory situations.
 *
 * The frozen exported symbols NS_Alloc, NS_Realloc, and NS_Free
 * provide a more efficient way to access XPCOM memory allocation. Using
 * those symbols is preferred to using the methods on this interface.
 *
 * A client that wishes to be notified of low memory situations (for
 * example, because the client maintains a large memory cache that
 * could be released when memory is tight) should register with the
 * observer service (see nsIObserverService) using the topic 
 * "memory-pressure". There are three specific types of notications 
 * that can occur.  These types will be passed as the |aData| 
 * parameter of the of the "memory-pressure" notification: 
 * 
 * "low-memory"
 * This will be passed as the extra data when the pressure 
 * observer is being asked to flush for low-memory conditions.
 *
 * "heap-minimize"
 * This will be passed as the extra data when the pressure 
 * observer is being asked to flush because of a heap minimize 
 * call.
 *
 * "alloc-failure"
 * This will be passed as the extra data when the pressure 
 * observer has been asked to flush because a malloc() or 
 * realloc() has failed.
 *
 * @status FROZEN
 */
class NS_NO_VTABLE NS_SCRIPTABLE nsIMemory : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IMEMORY_IID)

  /**
     * Allocates a block of memory of a particular size. If the memory 
     * cannot be allocated (because of an out-of-memory condition), null
     * is returned.
     *
     * @param size - the size of the block to allocate
     * @result the block of memory
     */
  /* [noscript, notxpcom] voidPtr alloc (in size_t size); */
  NS_IMETHOD_(void *) Alloc(size_t size) = 0;

  /**
     * Reallocates a block of memory to a new size.
     *
     * @param ptr - the block of memory to reallocate
     * @param size - the new size
     * @result the reallocated block of memory
     *
     * If ptr is null, this function behaves like malloc.
     * If s is the size of the block to which ptr points, the first
     * min(s, size) bytes of ptr's block are copied to the new block.
     * If the allocation succeeds, ptr is freed and a pointer to the 
     * new block returned.  If the allocation fails, ptr is not freed
     * and null is returned. The returned value may be the same as ptr.
     */
  /* [noscript, notxpcom] voidPtr realloc (in voidPtr ptr, in size_t newSize); */
  NS_IMETHOD_(void *) Realloc(void * ptr, size_t newSize) = 0;

  /**
     * Frees a block of memory. Null is a permissible value, in which case
     * nothing happens. 
     *
     * @param ptr - the block of memory to free
     */
  /* [noscript, notxpcom] void free (in voidPtr ptr); */
  NS_IMETHOD_(void) Free(void * ptr) = 0;

  /**
     * Attempts to shrink the heap.
     * @param immediate - if true, heap minimization will occur
     *   immediately if the call was made on the main thread. If
     *   false, the flush will be scheduled to happen when the app is
     *   idle.
     * @return NS_ERROR_FAILURE if 'immediate' is set an the call
     *   was not on the application's main thread.
     */
  /* void heapMinimize (in boolean immediate); */
  NS_SCRIPTABLE NS_IMETHOD HeapMinimize(PRBool immediate) = 0;

  /**
     * This predicate can be used to determine if we're in a low-memory
     * situation (what constitutes low-memory is platform dependent). This
     * can be used to trigger the memory pressure observers.
     */
  /* boolean isLowMemory (); */
  NS_SCRIPTABLE NS_IMETHOD IsLowMemory(PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIMemory, NS_IMEMORY_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIMEMORY \
  NS_IMETHOD_(void *) Alloc(size_t size); \
  NS_IMETHOD_(void *) Realloc(void * ptr, size_t newSize); \
  NS_IMETHOD_(void) Free(void * ptr); \
  NS_SCRIPTABLE NS_IMETHOD HeapMinimize(PRBool immediate); \
  NS_SCRIPTABLE NS_IMETHOD IsLowMemory(PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIMEMORY(_to) \
  NS_IMETHOD_(void *) Alloc(size_t size) { return _to Alloc(size); } \
  NS_IMETHOD_(void *) Realloc(void * ptr, size_t newSize) { return _to Realloc(ptr, newSize); } \
  NS_IMETHOD_(void) Free(void * ptr) { return _to Free(ptr); } \
  NS_SCRIPTABLE NS_IMETHOD HeapMinimize(PRBool immediate) { return _to HeapMinimize(immediate); } \
  NS_SCRIPTABLE NS_IMETHOD IsLowMemory(PRBool *_retval) { return _to IsLowMemory(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIMEMORY(_to) \
  NS_IMETHOD_(void *) Alloc(size_t size) { return !_to ? NS_ERROR_NULL_POINTER : _to->Alloc(size); } \
  NS_IMETHOD_(void *) Realloc(void * ptr, size_t newSize) { return !_to ? NS_ERROR_NULL_POINTER : _to->Realloc(ptr, newSize); } \
  NS_IMETHOD_(void) Free(void * ptr) { return !_to ? NS_ERROR_NULL_POINTER : _to->Free(ptr); } \
  NS_SCRIPTABLE NS_IMETHOD HeapMinimize(PRBool immediate) { return !_to ? NS_ERROR_NULL_POINTER : _to->HeapMinimize(immediate); } \
  NS_SCRIPTABLE NS_IMETHOD IsLowMemory(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsLowMemory(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsMemory : public nsIMemory
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIMEMORY

  nsMemory();

private:
  ~nsMemory();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsMemory, nsIMemory)

nsMemory::nsMemory()
{
  /* member initializers and constructor code */
}

nsMemory::~nsMemory()
{
  /* destructor code */
}

/* [noscript, notxpcom] voidPtr alloc (in size_t size); */
NS_IMETHODIMP_(void *) nsMemory::Alloc(size_t size)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript, notxpcom] voidPtr realloc (in voidPtr ptr, in size_t newSize); */
NS_IMETHODIMP_(void *) nsMemory::Realloc(void * ptr, size_t newSize)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* [noscript, notxpcom] void free (in voidPtr ptr); */
NS_IMETHODIMP_(void) nsMemory::Free(void * ptr)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void heapMinimize (in boolean immediate); */
NS_IMETHODIMP nsMemory::HeapMinimize(PRBool immediate)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean isLowMemory (); */
NS_IMETHODIMP nsMemory::IsLowMemory(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIMemory_h__ */
