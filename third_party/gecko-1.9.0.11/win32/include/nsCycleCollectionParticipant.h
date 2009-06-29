/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * The Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#ifndef nsCycleCollectionParticipant_h__
#define nsCycleCollectionParticipant_h__

#include "nsISupports.h"

// NOTE: If you use header files to define DEBUG_CC, you must do so here
// *and* in nsCycleCollector.h
//#define DEBUG_CC

#ifdef DEBUG_CC
#define IF_DEBUG_CC_PARAM(_p) , _p
#define IF_DEBUG_CC_ONLY_PARAM(_p) _p
#else
#define IF_DEBUG_CC_PARAM(_p)
#define IF_DEBUG_CC_ONLY_PARAM(_p)
#endif

#define NS_CYCLECOLLECTIONPARTICIPANT_IID                                      \
{                                                                              \
    0x9674489b,                                                                \
    0x1f6f,                                                                    \
    0x4550,                                                                    \
    { 0xa7, 0x30, 0xcc, 0xae, 0xdd, 0x10, 0x4c, 0xf9 }                         \
}

/**
 * Special IID to get at the base nsISupports for a class. Usually this is the
 * canonical nsISupports pointer, but in the case of tearoffs for example it is
 * the base nsISupports pointer of the tearoff. This allow the cycle collector
 * to have separate nsCycleCollectionParticipant's for tearoffs or aggregated
 * classes.
 */
#define NS_CYCLECOLLECTIONISUPPORTS_IID                                        \
{                                                                              \
    0xc61eac14,                                                                \
    0x5f7a,                                                                    \
    0x4481,                                                                    \
    { 0x96, 0x5e, 0x7e, 0xaa, 0x6e, 0xff, 0xa8, 0x5f }                         \
}

/**
 * Just holds the IID so NS_GET_IID works.
 */
class nsCycleCollectionISupports
{
public:
    NS_DECLARE_STATIC_IID_ACCESSOR(NS_CYCLECOLLECTIONISUPPORTS_IID)
};

NS_DEFINE_STATIC_IID_ACCESSOR(nsCycleCollectionISupports, 
                              NS_CYCLECOLLECTIONISUPPORTS_IID)

class nsCycleCollectionParticipant;

enum CCNodeType { RefCounted, GCMarked, GCUnmarked };

class NS_NO_VTABLE nsCycleCollectionTraversalCallback
{
public:
    // If type is RefCounted you must call DescribeNode() with an accurate
    // refcount, otherwise cycle collection will fail, and probably crash.
    // If type is not refcounted then the refcount will be ignored.
#ifdef DEBUG_CC
    NS_IMETHOD_(void) DescribeNode(CCNodeType type,
                                   nsrefcnt refcount,
                                   size_t objsz,
                                   const char *objname) = 0;
#else
    NS_IMETHOD_(void) DescribeNode(CCNodeType type,
                                   nsrefcnt refcount) = 0;
#endif
    NS_IMETHOD_(void) NoteXPCOMRoot(nsISupports *root) = 0;
    NS_IMETHOD_(void) NoteRoot(PRUint32 langID, void *root,
                               nsCycleCollectionParticipant* helper) = 0;
    NS_IMETHOD_(void) NoteScriptChild(PRUint32 langID, void *child) = 0;
    NS_IMETHOD_(void) NoteXPCOMChild(nsISupports *child) = 0;
    NS_IMETHOD_(void) NoteNativeChild(void *child,
                                      nsCycleCollectionParticipant *helper) = 0;
#ifdef DEBUG_CC
    // Give a name to the edge associated with the next call to
    // NoteScriptChild, NoteXPCOMChild, or NoteNativeChild.
    NS_IMETHOD_(void) NoteNextEdgeName(const char* name) = 0;
#endif
};

class NS_NO_VTABLE nsCycleCollectionParticipant
{
public:
    NS_DECLARE_STATIC_IID_ACCESSOR(NS_CYCLECOLLECTIONPARTICIPANT_IID)

    NS_IMETHOD Traverse(void *p, nsCycleCollectionTraversalCallback &cb) = 0;

    NS_IMETHOD RootAndUnlinkJSObjects(void *p) = 0;
    NS_IMETHOD Unlink(void *p) = 0;
    NS_IMETHOD Unroot(void *p) = 0;
};

NS_DEFINE_STATIC_IID_ACCESSOR(nsCycleCollectionParticipant, 
                              NS_CYCLECOLLECTIONPARTICIPANT_IID)

#undef IMETHOD_VISIBILITY
#define IMETHOD_VISIBILITY NS_COM_GLUE

typedef void
(* PR_CALLBACK TraceCallback)(PRUint32 langID, void *p, void *closure);

class NS_NO_VTABLE nsScriptObjectTracer : public nsCycleCollectionParticipant
{
public:
    NS_IMETHOD_(void) Trace(void *p, TraceCallback cb, void *closure) = 0;
    void NS_COM_GLUE TraverseScriptObjects(void *p,
                                        nsCycleCollectionTraversalCallback &cb);
};

class NS_COM_GLUE nsXPCOMCycleCollectionParticipant
    : public nsScriptObjectTracer
{
public:
    NS_IMETHOD Traverse(void *p, nsCycleCollectionTraversalCallback &cb);

    NS_IMETHOD RootAndUnlinkJSObjects(void *p);
    NS_IMETHOD Unlink(void *p);
    NS_IMETHOD Unroot(void *p);

    NS_IMETHOD_(void) Trace(void *p, TraceCallback cb, void *closure);

    NS_IMETHOD_(void) UnmarkPurple(nsISupports *p);

    PRBool CheckForRightISupports(nsISupports *s);
};

#undef IMETHOD_VISIBILITY
#define IMETHOD_VISIBILITY NS_VISIBILITY_HIDDEN

///////////////////////////////////////////////////////////////////////////////
// Helpers for implementing a QI to nsXPCOMCycleCollectionParticipant
///////////////////////////////////////////////////////////////////////////////

#define NS_CYCLE_COLLECTION_INNERCLASS                                         \
        cycleCollection

#define NS_CYCLE_COLLECTION_CLASSNAME(_class)                                  \
        _class::NS_CYCLE_COLLECTION_INNERCLASS

#define NS_CYCLE_COLLECTION_INNERNAME                                          \
        _cycleCollectorGlobal

#define NS_CYCLE_COLLECTION_NAME(_class)                                       \
        _class::NS_CYCLE_COLLECTION_INNERNAME

#define NS_IMPL_QUERY_CYCLE_COLLECTION(_class)                                 \
  if ( aIID.Equals(NS_GET_IID(nsXPCOMCycleCollectionParticipant)) ) {          \
    *aInstancePtr = & NS_CYCLE_COLLECTION_NAME(_class);                        \
    return NS_OK;                                                              \
  } else

#define NS_IMPL_QUERY_CYCLE_COLLECTION_ISUPPORTS(_class)                       \
  if ( aIID.Equals(NS_GET_IID(nsCycleCollectionISupports)) )                   \
    foundInterface = NS_CYCLE_COLLECTION_CLASSNAME(_class)::Upcast(this);      \
  else

#define NS_INTERFACE_MAP_ENTRY_CYCLE_COLLECTION(_class)                        \
  NS_IMPL_QUERY_CYCLE_COLLECTION(_class)

#define NS_INTERFACE_MAP_ENTRY_CYCLE_COLLECTION_ISUPPORTS(_class)              \
  NS_IMPL_QUERY_CYCLE_COLLECTION_ISUPPORTS(_class)

#define NS_INTERFACE_MAP_ENTRIES_CYCLE_COLLECTION(_class)                      \
  NS_INTERFACE_MAP_ENTRY_CYCLE_COLLECTION(_class)                              \
  NS_INTERFACE_MAP_ENTRY_CYCLE_COLLECTION_ISUPPORTS(_class)

#define NS_INTERFACE_MAP_BEGIN_CYCLE_COLLECTION(_class)                        \
  NS_INTERFACE_MAP_BEGIN(_class)                                               \
    NS_INTERFACE_MAP_ENTRIES_CYCLE_COLLECTION(_class)

#define NS_INTERFACE_MAP_BEGIN_CYCLE_COLLECTION_INHERITED(_class)              \
  NS_INTERFACE_MAP_BEGIN(_class)                                               \
    NS_INTERFACE_MAP_ENTRY_CYCLE_COLLECTION(_class)

#define NS_INTERFACE_TABLE_TO_MAP_SEGUE_CYCLE_COLLECTION(_class)  \
  if (rv == NS_OK) return rv; \
  nsISupports* foundInterface; \
  NS_INTERFACE_MAP_ENTRIES_CYCLE_COLLECTION(_class)

#define NS_INTERFACE_TABLE_HEAD_CYCLE_COLLECTION_INHERITED(_class)            \
  NS_IMETHODIMP _class::QueryInterface(REFNSIID aIID, void** aInstancePtr)    \
  {                                                                           \
    NS_PRECONDITION(aInstancePtr, "null out param");                          \
                                                                              \
    if ( aIID.Equals(NS_GET_IID(nsXPCOMCycleCollectionParticipant)) ) {       \
      *aInstancePtr = &NS_CYCLE_COLLECTION_NAME(_class);                      \
      return NS_OK;                                                           \
    }                                                                         \
    nsresult rv;

#define NS_CYCLE_COLLECTION_UPCAST(obj, clazz)                                 \
  NS_CYCLE_COLLECTION_CLASSNAME(clazz)::Upcast(obj)

///////////////////////////////////////////////////////////////////////////////
// Helpers for implementing nsCycleCollectionParticipant::RootAndUnlinkJSObjects
///////////////////////////////////////////////////////////////////////////////

#define NS_IMPL_CYCLE_COLLECTION_ROOT_BEGIN(_class)                            \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::RootAndUnlinkJSObjects(void *p)       \
  {                                                                            \
    nsISupports *s = static_cast<nsISupports*>(p);                             \
    NS_ASSERTION(CheckForRightISupports(s),                                    \
                 "not the nsISupports pointer we expect");                     \
    nsXPCOMCycleCollectionParticipant::RootAndUnlinkJSObjects(s);              \
    _class *tmp = Downcast(s);

#define NS_IMPL_CYCLE_COLLECTION_ROOT_BEGIN_NATIVE(_class, _root_function)     \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::RootAndUnlinkJSObjects(void *p)       \
  {                                                                            \
    _class *tmp = static_cast<_class*>(p);                                     \
    tmp->_root_function();

#define NS_IMPL_CYCLE_COLLECTION_ROOT_END                                      \
    return NS_OK;                                                              \
  }

///////////////////////////////////////////////////////////////////////////////
// Helpers for implementing nsCycleCollectionParticipant::Unlink
///////////////////////////////////////////////////////////////////////////////

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN(_class)                          \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Unlink(void *p)                       \
  {                                                                            \
    nsISupports *s = static_cast<nsISupports*>(p);                             \
    NS_ASSERTION(CheckForRightISupports(s),                                    \
                 "not the nsISupports pointer we expect");                     \
    _class *tmp = Downcast(s);

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN_INHERITED(_class, _base_class)   \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Unlink(void *p)                       \
  {                                                                            \
    nsISupports *s = static_cast<nsISupports*>(p);                             \
    NS_ASSERTION(CheckForRightISupports(s),                                    \
                 "not the nsISupports pointer we expect");                     \
    _class *tmp = static_cast<_class*>(Downcast(s));                           \
    NS_CYCLE_COLLECTION_CLASSNAME(_base_class)::Unlink(s);

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN_NATIVE(_class)                   \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Unlink(void *p)                       \
  {                                                                            \
    _class *tmp = static_cast<_class*>(p);

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_NSCOMPTR(_field)                       \
    tmp->_field = NULL;    

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_NSCOMARRAY(_field)                     \
    tmp->_field.Clear();

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_NSTARRAY(_field)                       \
    tmp->_field.Clear();

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_END                                    \
    return NS_OK;                                                              \
  }

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_0(_class)                              \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Unlink(void *p)                       \
  {                                                                            \
    NS_ASSERTION(CheckForRightISupports(static_cast<nsISupports*>(p)),         \
                 "not the nsISupports pointer we expect");                     \
    return NS_OK;                                                              \
  }

#define NS_IMPL_CYCLE_COLLECTION_UNLINK_NATIVE_0(_class)                       \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Unlink(void *p)                       \
  {                                                                            \
    return NS_OK;                                                              \
  }


///////////////////////////////////////////////////////////////////////////////
// Helpers for implementing nsCycleCollectionParticipant::Traverse
///////////////////////////////////////////////////////////////////////////////

#ifdef DEBUG_CC
#define NS_IMPL_CYCLE_COLLECTION_DESCRIBE(_class)                              \
    cb.DescribeNode(RefCounted, tmp->mRefCnt.get(), sizeof(_class), #_class);
#else
#define NS_IMPL_CYCLE_COLLECTION_DESCRIBE(_class)                              \
    cb.DescribeNode(RefCounted, tmp->mRefCnt.get());
#endif

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN(_class)                        \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Traverse                              \
                         (void *p,                                             \
                          nsCycleCollectionTraversalCallback &cb)              \
  {                                                                            \
    nsISupports *s = static_cast<nsISupports*>(p);                             \
    NS_ASSERTION(CheckForRightISupports(s),                                    \
                 "not the nsISupports pointer we expect");                     \
    _class *tmp = Downcast(s);                                                 \
    NS_IMPL_CYCLE_COLLECTION_DESCRIBE(_class)

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN_INHERITED(_class, _base_class) \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Traverse                              \
                         (void *p,                                             \
                          nsCycleCollectionTraversalCallback &cb)              \
  {                                                                            \
    nsISupports *s = static_cast<nsISupports*>(p);                             \
    NS_ASSERTION(CheckForRightISupports(s),                                    \
                 "not the nsISupports pointer we expect");                     \
    _class *tmp = static_cast<_class*>(Downcast(s));                           \
    NS_CYCLE_COLLECTION_CLASSNAME(_base_class)::Traverse(s, cb);

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NATIVE_BEGIN(_class)                 \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Traverse                              \
                         (void *p,                                             \
                          nsCycleCollectionTraversalCallback &cb)              \
  {                                                                            \
    _class *tmp = static_cast<_class*>(p);                                     \
    NS_IMPL_CYCLE_COLLECTION_DESCRIBE(_class)

#ifdef DEBUG_CC
  #define NS_CYCLE_COLLECTION_NOTE_EDGE_NAME(_cb, _name)                       \
    PR_BEGIN_MACRO (_cb).NoteNextEdgeName(_name); PR_END_MACRO
#else
  #define NS_CYCLE_COLLECTION_NOTE_EDGE_NAME(_cb, _name)                       \
    PR_BEGIN_MACRO PR_END_MACRO
#endif

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_RAWPTR(_field)                       \
  PR_BEGIN_MACRO                                                               \
    NS_CYCLE_COLLECTION_NOTE_EDGE_NAME(cb, #_field);                           \
    cb.NoteXPCOMChild(tmp->_field);                                            \
  PR_END_MACRO;

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMPTR(_field)                     \
  PR_BEGIN_MACRO                                                               \
    NS_CYCLE_COLLECTION_NOTE_EDGE_NAME(cb, #_field);                           \
    cb.NoteXPCOMChild(tmp->_field.get());                                      \
  PR_END_MACRO;

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMPTR_AMBIGUOUS(_field, _base)    \
  PR_BEGIN_MACRO                                                               \
    NS_CYCLE_COLLECTION_NOTE_EDGE_NAME(cb, #_field);                           \
    cb.NoteXPCOMChild(NS_ISUPPORTS_CAST(_base*, tmp->_field));                 \
  PR_END_MACRO;

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMARRAY(_field)                   \
    {                                                                          \
      PRInt32 i;                                                               \
      for (i = 0; i < tmp->_field.Count(); ++i) {                              \
        NS_CYCLE_COLLECTION_NOTE_EDGE_NAME(cb, #_field "[i]");                 \
        cb.NoteXPCOMChild(tmp->_field[i]);                                     \
      }                                                                        \
    }

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NATIVE_PTR(_ptr, _ptr_class, _name)  \
  PR_BEGIN_MACRO                                                               \
    NS_CYCLE_COLLECTION_NOTE_EDGE_NAME(cb, _name);                             \
    cb.NoteNativeChild(_ptr, &NS_CYCLE_COLLECTION_NAME(_ptr_class));           \
  PR_END_MACRO;

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NATIVE_MEMBER(_field, _field_class)  \
  NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NATIVE_PTR(tmp->_field, _field_class,      \
                                               #_field)

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSTARRAY(_array, _element_class,     \
                                                   _name)                      \
    {                                                                          \
      PRUint32 i, length = (_array).Length();                                  \
      for (i = 0; i < length; ++i)                                             \
        NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NATIVE_PTR((_array)[i],              \
                                                     _element_class,           \
                                                     _name "[i]");             \
    }

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSTARRAY_MEMBER(_field,              \
                                                          _element_class)      \
    NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSTARRAY(tmp->_field, _element_class,    \
                                               #_field)

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_SCRIPT_OBJECTS                       \
    TraverseScriptObjects(tmp, cb);

#define NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END                                  \
    return NS_OK;                                                              \
  }

///////////////////////////////////////////////////////////////////////////////
// Helpers for implementing nsScriptObjectTracer::Trace
///////////////////////////////////////////////////////////////////////////////

#define NS_IMPL_CYCLE_COLLECTION_TRACE_BEGIN(_class)                           \
  void                                                                         \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Trace(void *p,                        \
                                               TraceCallback aCallback,        \
                                               void *aClosure)                 \
  {                                                                            \
    nsISupports *s = static_cast<nsISupports*>(p);                             \
    NS_ASSERTION(CheckForRightISupports(s),                                    \
                 "not the nsISupports pointer we expect");                     \
    _class *tmp = Downcast(s);

#define NS_IMPL_CYCLE_COLLECTION_TRACE_NATIVE_BEGIN(_class)                    \
  void                                                                         \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Trace(void *p,                        \
                                               TraceCallback aCallback,        \
                                               void *aClosure)                 \
  {                                                                            \
    _class *tmp = static_cast<_class*>(p);

#define NS_IMPL_CYCLE_COLLECTION_TRACE_CALLBACK(_langID, _object)              \
  if (_object)                                                                 \
    aCallback(_langID, _object, aClosure);

#define NS_IMPL_CYCLE_COLLECTION_TRACE_MEMBER_CALLBACK(_langID, _field)        \
  NS_IMPL_CYCLE_COLLECTION_TRACE_CALLBACK(_langID, tmp->_field)

#define NS_IMPL_CYCLE_COLLECTION_TRACE_JS_CALLBACK(_object)                    \
  NS_IMPL_CYCLE_COLLECTION_TRACE_CALLBACK(nsIProgrammingLanguage::JAVASCRIPT,  \
                                          _object)

#define NS_IMPL_CYCLE_COLLECTION_TRACE_JS_MEMBER_CALLBACK(_field)              \
  NS_IMPL_CYCLE_COLLECTION_TRACE_JS_CALLBACK(tmp->_field)

#define NS_IMPL_CYCLE_COLLECTION_TRACE_END                                     \
  }

///////////////////////////////////////////////////////////////////////////////
// Helpers for implementing a concrete nsCycleCollectionParticipant 
///////////////////////////////////////////////////////////////////////////////

#define NS_CYCLE_COLLECTION_PARTICIPANT_INSTANCE                               \
  static NS_CYCLE_COLLECTION_INNERCLASS NS_CYCLE_COLLECTION_INNERNAME;

#define NS_DECL_CYCLE_COLLECTION_CLASS_BODY_NO_UNLINK(_class, _base)           \
public:                                                                        \
  NS_IMETHOD Traverse(void *p,                                                 \
                      nsCycleCollectionTraversalCallback &cb);                 \
  NS_IMETHOD_(void) UnmarkPurple(nsISupports *s)                               \
  {                                                                            \
    Downcast(s)->UnmarkPurple();                                               \
  }                                                                            \
  static _class* Downcast(nsISupports* s)                                      \
  {                                                                            \
    return static_cast<_class*>(static_cast<_base*>(s));                       \
  }                                                                            \
  static nsISupports* Upcast(_class *p)                                        \
  {                                                                            \
    return NS_ISUPPORTS_CAST(_base*, p);                                       \
  }

#define NS_DECL_CYCLE_COLLECTION_CLASS_BODY(_class, _base)                     \
  NS_DECL_CYCLE_COLLECTION_CLASS_BODY_NO_UNLINK(_class, _base)                 \
  NS_IMETHOD Unlink(void *p);

#define NS_DECL_CYCLE_COLLECTION_CLASS_AMBIGUOUS(_class, _base)                \
class NS_CYCLE_COLLECTION_INNERCLASS                                           \
 : public nsXPCOMCycleCollectionParticipant                                    \
{                                                                              \
  NS_DECL_CYCLE_COLLECTION_CLASS_BODY(_class, _base)                           \
};                                                                             \
NS_CYCLE_COLLECTION_PARTICIPANT_INSTANCE

#define NS_DECL_CYCLE_COLLECTION_CLASS(_class)                                 \
  NS_DECL_CYCLE_COLLECTION_CLASS_AMBIGUOUS(_class, _class)

// Cycle collector helper for classes that don't want to unlink anything.
// Note: if this is used a lot it might make sense to have a base class that
//       doesn't do anything in RootAndUnlinkJSObjects/Unlink/Unroot.
#define NS_DECL_CYCLE_COLLECTION_CLASS_NO_UNLINK(_class)                       \
class NS_CYCLE_COLLECTION_INNERCLASS                                           \
 : public nsXPCOMCycleCollectionParticipant                                    \
{                                                                              \
  NS_DECL_CYCLE_COLLECTION_CLASS_BODY_NO_UNLINK(_class, _class)                \
  NS_IMETHOD RootAndUnlinkJSObjects(void *p)                                   \
  {                                                                            \
    return NS_OK;                                                              \
  }                                                                            \
  NS_IMETHOD Unlink(void *p)                                                   \
  {                                                                            \
    return NS_OK;                                                              \
  }                                                                            \
  NS_IMETHOD Unroot(void *p)                                                   \
  {                                                                            \
    return NS_OK;                                                              \
  }                                                                            \
};                                                                             \
NS_CYCLE_COLLECTION_PARTICIPANT_INSTANCE

#define NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_CLASS_AMBIGUOUS(_class, _base)  \
class NS_CYCLE_COLLECTION_INNERCLASS                                           \
 : public nsXPCOMCycleCollectionParticipant                                    \
{                                                                              \
  NS_IMETHOD RootAndUnlinkJSObjects(void *p);                                  \
  NS_DECL_CYCLE_COLLECTION_CLASS_BODY(_class, _base)                           \
  NS_IMETHOD_(void) Trace(void *p, TraceCallback cb, void *closure);           \
};                                                                             \
NS_CYCLE_COLLECTION_PARTICIPANT_INSTANCE

#define NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_CLASS(_class)  \
  NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_CLASS_AMBIGUOUS(_class, _class)

#define NS_DECL_CYCLE_COLLECTION_CLASS_INHERITED(_class, _base_class)          \
class NS_CYCLE_COLLECTION_INNERCLASS                                           \
 : public NS_CYCLE_COLLECTION_CLASSNAME(_base_class)                           \
{                                                                              \
public:                                                                        \
  NS_IMETHOD Unlink(void *p);                                                  \
  NS_IMETHOD Traverse(void *p,                                                 \
                      nsCycleCollectionTraversalCallback &cb);                 \
  static _class* Downcast(nsISupports* s)                                      \
  {                                                                            \
    return static_cast<_class*>(static_cast<_base_class*>(                     \
      NS_CYCLE_COLLECTION_CLASSNAME(_base_class)::Downcast(s)));               \
  }                                                                            \
};                                                                             \
NS_CYCLE_COLLECTION_PARTICIPANT_INSTANCE

#define NS_DECL_CYCLE_COLLECTION_CLASS_INHERITED_NO_UNLINK(_class,             \
                                                           _base_class)        \
class NS_CYCLE_COLLECTION_INNERCLASS                                           \
 : public NS_CYCLE_COLLECTION_CLASSNAME(_base_class)                           \
{                                                                              \
public:                                                                        \
  NS_IMETHOD Traverse(void *p,                                                 \
                      nsCycleCollectionTraversalCallback &cb);                 \
  static _class* Downcast(nsISupports* s)                                      \
  {                                                                            \
    return static_cast<_class*>(static_cast<_base_class*>(                     \
      NS_CYCLE_COLLECTION_CLASSNAME(_base_class)::Downcast(s)));               \
  }                                                                            \
};                                                                             \
NS_CYCLE_COLLECTION_PARTICIPANT_INSTANCE

/**
 * This implements a stub UnmarkPurple function for classes that want to be
 * traversed but whose AddRef/Release functions don't add/remove them to/from
 * the purple buffer. If you're just using NS_DECL_CYCLE_COLLECTING_ISUPPORTS
 * then you don't need this.
 */
#define NS_DECL_CYCLE_COLLECTION_UNMARK_PURPLE_STUB(_class)                    \
  NS_IMETHODIMP_(void) UnmarkPurple()                                          \
  {                                                                            \
  }                                                                            \

#define NS_IMPL_CYCLE_COLLECTION_CLASS(_class)                                 \
  NS_CYCLE_COLLECTION_CLASSNAME(_class) NS_CYCLE_COLLECTION_NAME(_class);

#define NS_DECL_CYCLE_COLLECTION_NATIVE_CLASS_BODY                             \
  public:                                                                      \
    NS_IMETHOD RootAndUnlinkJSObjects(void *n);                                \
    NS_IMETHOD Unlink(void *n);                                                \
    NS_IMETHOD Unroot(void *n);                                                \
    NS_IMETHOD Traverse(void *n,                                               \
                      nsCycleCollectionTraversalCallback &cb);

#define NS_DECL_CYCLE_COLLECTION_NATIVE_CLASS(_class)                          \
  class NS_CYCLE_COLLECTION_INNERCLASS                                         \
   : public nsCycleCollectionParticipant                                       \
  {                                                                            \
     NS_DECL_CYCLE_COLLECTION_NATIVE_CLASS_BODY                                \
  };                                                                           \
  NS_CYCLE_COLLECTION_PARTICIPANT_INSTANCE

#define NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_NATIVE_CLASS(_class)            \
  class NS_CYCLE_COLLECTION_INNERCLASS                                         \
   : public nsScriptObjectTracer                                               \
  {                                                                            \
    NS_DECL_CYCLE_COLLECTION_NATIVE_CLASS_BODY                                 \
    NS_IMETHOD_(void) Trace(void *p, TraceCallback cb, void *closure);         \
  };                                                                           \
  NS_CYCLE_COLLECTION_PARTICIPANT_INSTANCE

#define NS_IMPL_CYCLE_COLLECTION_ROOT_NATIVE(_class, _root_function)           \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::RootAndUnlinkJSObjects(void *p)       \
  {                                                                            \
    _class *tmp = static_cast<_class*>(p);                                     \
    tmp->_root_function();                                                     \
    return NS_OK;                                                              \
  }

#define NS_IMPL_CYCLE_COLLECTION_UNROOT_NATIVE(_class, _unroot_function)       \
  NS_IMETHODIMP                                                                \
  NS_CYCLE_COLLECTION_CLASSNAME(_class)::Unroot(void *p)                       \
  {                                                                            \
    _class *tmp = static_cast<_class*>(p);                                     \
    tmp->_unroot_function();                                                   \
    return NS_OK;                                                              \
  }

#define NS_IMPL_CYCLE_COLLECTION_0(_class)                                     \
 NS_IMPL_CYCLE_COLLECTION_CLASS(_class)                                        \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_0(_class)                                     \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN(_class)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END

#define NS_IMPL_CYCLE_COLLECTION_1(_class, _f)                                 \
 NS_IMPL_CYCLE_COLLECTION_CLASS(_class)                                        \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN(_class)                                 \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_NSCOMPTR(_f)                                  \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_END                                           \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN(_class)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMPTR(_f)                                \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END

#define NS_IMPL_CYCLE_COLLECTION_2(_class, _f1, _f2)                           \
 NS_IMPL_CYCLE_COLLECTION_CLASS(_class)                                        \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN(_class)                                 \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_NSCOMPTR(_f1)                                 \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_NSCOMPTR(_f2)                                 \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_END                                           \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN(_class)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMPTR(_f1)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMPTR(_f2)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END

#define NS_IMPL_CYCLE_COLLECTION_3(_class, _f1, _f2, _f3)                      \
 NS_IMPL_CYCLE_COLLECTION_CLASS(_class)                                        \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_BEGIN(_class)                                 \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_NSCOMPTR(_f1)                                 \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_NSCOMPTR(_f2)                                 \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_NSCOMPTR(_f3)                                 \
 NS_IMPL_CYCLE_COLLECTION_UNLINK_END                                           \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_BEGIN(_class)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMPTR(_f1)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMPTR(_f2)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_NSCOMPTR(_f3)                               \
 NS_IMPL_CYCLE_COLLECTION_TRAVERSE_END

#endif // nsCycleCollectionParticipant_h__
