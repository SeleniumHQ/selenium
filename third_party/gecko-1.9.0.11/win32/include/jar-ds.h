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
 * The Original Code is the Netscape security libraries.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1994-2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

#ifndef __JAR_DS_h_
#define __JAR_DS_h_

/* Typedefs */
typedef struct ZZLinkStr ZZLink;
typedef struct ZZListStr ZZList;

/*
** Circular linked list. Each link contains a pointer to the object that
** is actually in the list.
*/ 
struct ZZLinkStr 
{
    ZZLink *next;
    ZZLink *prev;
    JAR_Item *thing;
};

struct ZZListStr 
{
    ZZLink link;
};

#define ZZ_InitList(lst)	     \
{				     \
    (lst)->link.next = &(lst)->link; \
    (lst)->link.prev = &(lst)->link; \
    (lst)->link.thing = 0;	     \
}

#define ZZ_ListEmpty(lst) \
    ((lst)->link.next == &(lst)->link)

#define ZZ_ListHead(lst) \
    ((lst)->link.next)

#define ZZ_ListTail(lst) \
    ((lst)->link.prev)

#define ZZ_ListIterDone(lst,lnk) \
    ((lnk) == &(lst)->link)

#define ZZ_AppendLink(lst,lnk)	    \
{				    \
    (lnk)->next = &(lst)->link;	    \
    (lnk)->prev = (lst)->link.prev; \
    (lst)->link.prev->next = (lnk); \
    (lst)->link.prev = (lnk);	    \
}

#define ZZ_InsertLink(lst,lnk)	    \
{				    \
    (lnk)->next = (lst)->link.next; \
    (lnk)->prev = &(lst)->link;	    \
    (lst)->link.next->prev = (lnk); \
    (lst)->link.next = (lnk);	    \
}

#define ZZ_RemoveLink(lnk)	     \
{				     \
    (lnk)->next->prev = (lnk)->prev; \
    (lnk)->prev->next = (lnk)->next; \
    (lnk)->next = 0;		     \
    (lnk)->prev = 0;		     \
}

extern ZZLink *ZZ_NewLink (JAR_Item *thing);
extern void ZZ_DestroyLink (ZZLink *link);
extern ZZList *ZZ_NewList (void);
extern void ZZ_DestroyList (ZZList *list);


#endif /* __JAR_DS_h_ */
