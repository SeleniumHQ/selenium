/* $XConsortium: xev.c,v 1.15 94/04/17 20:45:20 keith Exp $ */
/*

Copyright (c) 1988  X Consortium

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE X CONSORTIUM BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

Except as contained in this notice, the name of the X Consortium shall
not be used in advertising or otherwise to promote the sale, use or
other dealings in this Software without prior written authorization
from the X Consortium.

*/
/* $XFree86: xc/programs/xev/xev.c,v 1.13 2003/10/24 20:38:17 tsi Exp $ */

/*
 * Author:  Jim Fulton, MIT X Consortium
 */

#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <X11/Xlocale.h>
#include <X11/Xos.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/Xproto.h>

#define INNER_WINDOW_WIDTH 50
#define INNER_WINDOW_HEIGHT 50
#define INNER_WINDOW_BORDER 4
#define INNER_WINDOW_X 10
#define INNER_WINDOW_Y 10
#define OUTER_WINDOW_MIN_WIDTH (INNER_WINDOW_WIDTH + \
				2 * (INNER_WINDOW_BORDER + INNER_WINDOW_X))
#define OUTER_WINDOW_MIN_HEIGHT (INNER_WINDOW_HEIGHT + \
				2 * (INNER_WINDOW_BORDER + INNER_WINDOW_Y))
#define OUTER_WINDOW_DEF_WIDTH (OUTER_WINDOW_MIN_WIDTH + 100)
#define OUTER_WINDOW_DEF_HEIGHT (OUTER_WINDOW_MIN_HEIGHT + 100)
#define OUTER_WINDOW_DEF_X 100
#define OUTER_WINDOW_DEF_Y 100
				

typedef unsigned long Pixel;

const char *Yes = "YES";
const char *No = "NO";
const char *Unknown = "unknown";

XIC xic = NULL;

static void
prologue (FILE* out_f, XEvent *eventp, char *event_name)
{
    XAnyEvent *e = (XAnyEvent *) eventp;

    fprintf(out_f, "%s event, serial %ld, synthetic %s, window 0x%lx\n",
	    event_name, e->serial, e->send_event ? Yes : No, e->window);
}

static void
do_KeyPress (FILE* out_f, XEvent *eventp)
{
    XKeyEvent *e = (XKeyEvent *) eventp;

    fprintf(out_f,"    root 0x%lx, subw 0x%lx, time %lu, (%d,%d), root:(%d,%d),\n",
            e->root, e->subwindow, e->time, e->x, e->y, e->x_root, e->y_root);
    fprintf(out_f,"    state 0x%x, keycode %u, same_screen %s,\n",
            e->state, e->keycode, e->same_screen ? Yes : No);
}

static void
do_KeyRelease (FILE* out_f, XEvent *eventp)
{
    do_KeyPress (out_f, eventp); /* since it has the same info */
}

static void
do_ButtonPress (FILE* out_f, XEvent *eventp)
{
    XButtonEvent *e = (XButtonEvent *) eventp;

    fprintf(out_f,"    root 0x%lx, subw 0x%lx, time %lu, (%d,%d), root:(%d,%d),\n",
	    e->root, e->subwindow, e->time, e->x, e->y, e->x_root, e->y_root);
    fprintf(out_f,"    state 0x%x, button %u, same_screen %s\n",
	    e->state, e->button, e->same_screen ? Yes : No);
}

static void
do_ButtonRelease (FILE* out_f, XEvent *eventp)
{
    do_ButtonPress (out_f, eventp);		/* since it has the same info */
}

static void
do_MotionNotify (FILE* out_f, XEvent *eventp)
{
    XMotionEvent *e = (XMotionEvent *) eventp;

    fprintf(out_f,"    root 0x%lx, subw 0x%lx, time %lu, (%d,%d), root:(%d,%d),\n",
	    e->root, e->subwindow, e->time, e->x, e->y, e->x_root, e->y_root);
    fprintf(out_f,"    state 0x%x, is_hint %u, same_screen %s\n",
	    e->state, e->is_hint, e->same_screen ? Yes : No);
}

static void
do_EnterNotify (FILE* out_f, XEvent *eventp)
{
    XCrossingEvent *e = (XCrossingEvent *) eventp;
    char *mode, *detail;
    char dmode[10], ddetail[10];

    switch (e->mode) {
      case NotifyNormal:  mode = "NotifyNormal"; break;
      case NotifyGrab:  mode = "NotifyGrab"; break;
      case NotifyUngrab:  mode = "NotifyUngrab"; break;
      case NotifyWhileGrabbed:  mode = "NotifyWhileGrabbed"; break;
      default:  mode = dmode, sprintf(dmode, "%u", e->mode); break;
    }

    switch (e->detail) {
      case NotifyAncestor:  detail = "NotifyAncestor"; break;
      case NotifyVirtual:  detail = "NotifyVirtual"; break;
      case NotifyInferior:  detail = "NotifyInferior"; break;
      case NotifyNonlinear:  detail = "NotifyNonlinear"; break;
      case NotifyNonlinearVirtual:  detail = "NotifyNonlinearVirtual"; break;
      case NotifyPointer:  detail = "NotifyPointer"; break;
      case NotifyPointerRoot:  detail = "NotifyPointerRoot"; break;
      case NotifyDetailNone:  detail = "NotifyDetailNone"; break;
      default:  detail = ddetail; sprintf(ddetail, "%u", e->detail); break;
    }

    fprintf(out_f,"    root 0x%lx, subw 0x%lx, time %lu, (%d,%d), root:(%d,%d),\n",
	    e->root, e->subwindow, e->time, e->x, e->y, e->x_root, e->y_root);
    fprintf(out_f,"    mode %s, detail %s, same_screen %s,\n",
	    mode, detail, e->same_screen ? Yes : No);
    fprintf(out_f,"    focus %s, state %u\n", e->focus ? Yes : No, e->state);
}

static void
do_LeaveNotify (FILE* out_f, XEvent *eventp)
{
    do_EnterNotify (out_f, eventp);		/* since it has same information */
}

static void
do_FocusIn (FILE* out_f, XEvent *eventp)
{
    XFocusChangeEvent *e = (XFocusChangeEvent *) eventp;
    char *mode, *detail;
    char dmode[10], ddetail[10];

    switch (e->mode) {
      case NotifyNormal:  mode = "NotifyNormal"; break;
      case NotifyGrab:  mode = "NotifyGrab"; break;
      case NotifyUngrab:  mode = "NotifyUngrab"; break;
      case NotifyWhileGrabbed:  mode = "NotifyWhileGrabbed"; break;
      default:  mode = dmode, sprintf(dmode, "%u", e->mode); break;
    }

    switch (e->detail) {
      case NotifyAncestor:  detail = "NotifyAncestor"; break;
      case NotifyVirtual:  detail = "NotifyVirtual"; break;
      case NotifyInferior:  detail = "NotifyInferior"; break;
      case NotifyNonlinear:  detail = "NotifyNonlinear"; break;
      case NotifyNonlinearVirtual:  detail = "NotifyNonlinearVirtual"; break;
      case NotifyPointer:  detail = "NotifyPointer"; break;
      case NotifyPointerRoot:  detail = "NotifyPointerRoot"; break;
      case NotifyDetailNone:  detail = "NotifyDetailNone"; break;
      default:  detail = ddetail; sprintf(ddetail, "%u", e->detail); break;
    }

    fprintf(out_f,"    mode %s, detail %s\n", mode, detail);
}

static void
do_FocusOut (FILE* out_f, XEvent *eventp)
{
    do_FocusIn (out_f, eventp);		/* since it has same information */
}

static void
do_KeymapNotify (FILE* out_f, XEvent *eventp)
{
    XKeymapEvent *e = (XKeymapEvent *) eventp;
    int i;

    fprintf(out_f,"    keys:  ");
    for (i = 0; i < 32; i++) {
	if (i == 16) fprintf(out_f,"\n           ");
	fprintf(out_f,"%-3u ", (unsigned int) e->key_vector[i]);
    }
    fprintf(out_f,"\n");
}

static void
do_Expose (FILE* out_f, XEvent *eventp)
{
    XExposeEvent *e = (XExposeEvent *) eventp;

    fprintf(out_f,"    (%d,%d), width %d, height %d, count %d\n",
	    e->x, e->y, e->width, e->height, e->count);
}

static void
do_GraphicsExpose (FILE* out_f, XEvent *eventp)
{
    XGraphicsExposeEvent *e = (XGraphicsExposeEvent *) eventp;
    char *m;
    char mdummy[10];

    switch (e->major_code) {
      case X_CopyArea:  m = "CopyArea";  break;
      case X_CopyPlane:  m = "CopyPlane";  break;
      default:  m = mdummy; sprintf(mdummy, "%d", e->major_code); break;
    }

    fprintf(out_f,"    (%d,%d), width %d, height %d, count %d,\n",
	    e->x, e->y, e->width, e->height, e->count);
    fprintf(out_f,"    major %s, minor %d\n", m, e->minor_code);
}

static void
do_NoExpose (FILE* out_f, XEvent *eventp)
{
    XNoExposeEvent *e = (XNoExposeEvent *) eventp;
    char *m;
    char mdummy[10];

    switch (e->major_code) {
      case X_CopyArea:  m = "CopyArea";  break;
      case X_CopyPlane:  m = "CopyPlane";  break;
      default:  m = mdummy; sprintf(mdummy, "%d", e->major_code); break;
    }

    fprintf(out_f,"    major %s, minor %d\n", m, e->minor_code);
    return;
}

static void
do_VisibilityNotify (FILE* out_f, XEvent *eventp)
{
    XVisibilityEvent *e = (XVisibilityEvent *) eventp;
    char *v;
    char vdummy[10];

    switch (e->state) {
      case VisibilityUnobscured:  v = "VisibilityUnobscured"; break;
      case VisibilityPartiallyObscured:  v = "VisibilityPartiallyObscured"; break;
      case VisibilityFullyObscured:  v = "VisibilityFullyObscured"; break;
      default:  v = vdummy; sprintf(vdummy, "%d", e->state); break;
    }

    fprintf(out_f,"    state %s\n", v);
}

static void
do_CreateNotify (FILE* out_f, XEvent *eventp)
{
    XCreateWindowEvent *e = (XCreateWindowEvent *) eventp;

    fprintf(out_f,"    parent 0x%lx, window 0x%lx, (%d,%d), width %d, height %d\n",
	    e->parent, e->window, e->x, e->y, e->width, e->height);
    fprintf(out_f,"border_width %d, override %s\n",
	    e->border_width, e->override_redirect ? Yes : No);
}

static void
do_DestroyNotify (FILE* out_f, XEvent *eventp)
{
    XDestroyWindowEvent *e = (XDestroyWindowEvent *) eventp;

    fprintf(out_f,"    event 0x%lx, window 0x%lx\n", e->event, e->window);
}

static void
do_UnmapNotify (FILE* out_f, XEvent *eventp)
{
    XUnmapEvent *e = (XUnmapEvent *) eventp;

    fprintf(out_f,"    event 0x%lx, window 0x%lx, from_configure %s\n",
	    e->event, e->window, e->from_configure ? Yes : No);
}

static void
do_MapNotify (FILE* out_f, XEvent *eventp)
{
    XMapEvent *e = (XMapEvent *) eventp;

    fprintf(out_f,"    event 0x%lx, window 0x%lx, override %s\n",
	    e->event, e->window, e->override_redirect ? Yes : No);
}

static void
do_MapRequest (FILE* out_f, XEvent *eventp)
{
    XMapRequestEvent *e = (XMapRequestEvent *) eventp;

    fprintf(out_f,"    parent 0x%lx, window 0x%lx\n", e->parent, e->window);
}

static void
do_ReparentNotify (FILE* out_f, XEvent *eventp)
{
    XReparentEvent *e = (XReparentEvent *) eventp;

    fprintf(out_f,"    event 0x%lx, window 0x%lx, parent 0x%lx,\n",
	    e->event, e->window, e->parent);
    fprintf(out_f,"    (%d,%d), override %s\n", e->x, e->y, 
	    e->override_redirect ? Yes : No);
}

static void
do_ConfigureNotify (FILE* out_f, XEvent *eventp)
{
    XConfigureEvent *e = (XConfigureEvent *) eventp;

    fprintf(out_f,"    event 0x%lx, window 0x%lx, (%d,%d), width %d, height %d,\n",
	    e->event, e->window, e->x, e->y, e->width, e->height);
    fprintf(out_f,"    border_width %d, above 0x%lx, override %s\n",
	    e->border_width, e->above, e->override_redirect ? Yes : No);
}

static void
do_ConfigureRequest (FILE* out_f, XEvent *eventp)
{
    XConfigureRequestEvent *e = (XConfigureRequestEvent *) eventp;
    char *detail;
    char ddummy[10];

    switch (e->detail) {
      case Above:  detail = "Above";  break;
      case Below:  detail = "Below";  break;
      case TopIf:  detail = "TopIf";  break;
      case BottomIf:  detail = "BottomIf"; break;
      case Opposite:  detail = "Opposite"; break;
      default:  detail = ddummy; sprintf(ddummy, "%d", e->detail); break;
    }

    fprintf(out_f,"    parent 0x%lx, window 0x%lx, (%d,%d), width %d, height %d,\n",
	    e->parent, e->window, e->x, e->y, e->width, e->height);
    fprintf(out_f,"    border_width %d, above 0x%lx, detail %s, value 0x%lx\n",
	    e->border_width, e->above, detail, e->value_mask);
}

static void
do_GravityNotify (FILE* out_f, XEvent *eventp)
{
    XGravityEvent *e = (XGravityEvent *) eventp;

    fprintf(out_f,"    event 0x%lx, window 0x%lx, (%d,%d)\n",
	    e->event, e->window, e->x, e->y);
}

static void
do_ResizeRequest (FILE* out_f, XEvent *eventp)
{
    XResizeRequestEvent *e = (XResizeRequestEvent *) eventp;

    fprintf(out_f,"    width %d, height %d\n", e->width, e->height);
}

static void
do_CirculateNotify (FILE* out_f, XEvent *eventp)
{
    XCirculateEvent *e = (XCirculateEvent *) eventp;
    char *p;
    char pdummy[10];

    switch (e->place) {
      case PlaceOnTop:  p = "PlaceOnTop"; break;
      case PlaceOnBottom:  p = "PlaceOnBottom"; break;
      default:  p = pdummy; sprintf(pdummy, "%d", e->place); break;
    }

    fprintf(out_f,"    event 0x%lx, window 0x%lx, place %s\n",
	    e->event, e->window, p);
}

static void
do_CirculateRequest (FILE* out_f, XEvent *eventp)
{
    XCirculateRequestEvent *e = (XCirculateRequestEvent *) eventp;
    char *p;
    char pdummy[10];

    switch (e->place) {
      case PlaceOnTop:  p = "PlaceOnTop"; break;
      case PlaceOnBottom:  p = "PlaceOnBottom"; break;
      default:  p = pdummy; sprintf(pdummy, "%d", e->place); break;
    }

    fprintf(out_f,"    parent 0x%lx, window 0x%lx, place %s\n",
	    e->parent, e->window, p);
}

static void
do_PropertyNotify (FILE* out_f, XEvent *eventp,Display* dpy)
{
    XPropertyEvent *e = (XPropertyEvent *) eventp;
    char *aname = NULL;
    char *s;
    char sdummy[10];

    if (dpy != NULL) {
      aname = XGetAtomName (dpy, e->atom);
    }
    switch (e->state) {
      case PropertyNewValue:  s = "PropertyNewValue"; break;
      case PropertyDelete:  s = "PropertyDelete"; break;
      default:  s = sdummy; sprintf(sdummy, "%d", e->state); break;
    }

    fprintf(out_f,"    atom 0x%lx (%s), time %lu, state %s\n",
	   e->atom, aname ? aname : Unknown, e->time,  s);

    if (aname) XFree (aname);
}

static void
do_SelectionClear (FILE* out_f, XEvent *eventp, Display* dpy)
{
    XSelectionClearEvent *e = (XSelectionClearEvent *) eventp;
    char *sname = NULL;

    if (dpy != NULL) {
      sname = XGetAtomName (dpy, e->selection);
    }

    fprintf(out_f,"    selection 0x%lx (%s), time %lu\n",
	    e->selection, sname ? sname : Unknown, e->time);

    if (sname) XFree (sname);
}

static void
do_SelectionRequest (FILE* out_f, XEvent *eventp, Display* dpy)
{
    XSelectionRequestEvent *e = (XSelectionRequestEvent *) eventp;
    /*
    char *sname = XGetAtomName (dpy, e->selection);
    char *tname = XGetAtomName (dpy, e->target);
    char *pname = XGetAtomName (dpy, e->property);
    */
    char *sname = NULL;
    char *tname = NULL;
    char *pname = NULL;

    if (dpy != NULL) {
      sname = XGetAtomName (dpy, e->selection);
      tname = XGetAtomName (dpy, e->target);
      pname = XGetAtomName (dpy, e->property);
    }

    fprintf(out_f,"    owner 0x%lx, requestor 0x%lx, selection 0x%lx (%s),\n",
	    e->owner, e->requestor, e->selection, sname ? sname : Unknown);
    fprintf(out_f,"    target 0x%lx (%s), property 0x%lx (%s), time %lu\n",
	    e->target, tname ? tname : Unknown, e->property,
	    pname ? pname : Unknown, e->time);

    if (sname) XFree (sname);
    if (tname) XFree (tname);
    if (pname) XFree (pname);
}

static void
do_SelectionNotify (FILE* out_f, XEvent *eventp, Display* dpy)
{
    XSelectionEvent *e = (XSelectionEvent *) eventp;
    char *sname = NULL;
    char *tname = NULL;
    char *pname = NULL;

    if (dpy != NULL) {
      sname = XGetAtomName (dpy, e->selection);
      tname = XGetAtomName (dpy, e->target);
      pname = XGetAtomName (dpy, e->property);
    }

    fprintf(out_f,"    selection 0x%lx (%s), target 0x%lx (%s),\n",
	    e->selection, sname ? sname : Unknown, e->target,
	    tname ? tname : Unknown);
    fprintf(out_f,"    property 0x%lx (%s), time %lu\n",
	    e->property, pname ? pname : Unknown, e->time);

    if (sname) XFree (sname);
    if (tname) XFree (tname);
    if (pname) XFree (pname);
}

static void
do_ColormapNotify (FILE* out_f, XEvent *eventp)
{
    XColormapEvent *e = (XColormapEvent *) eventp;
    char *s;
    char sdummy[10];

    switch (e->state) {
      case ColormapInstalled:  s = "ColormapInstalled"; break;
      case ColormapUninstalled:  s = "ColormapUninstalled"; break;
      default:  s = sdummy; sprintf(sdummy, "%d", e->state); break;
    }

    fprintf(out_f,"    colormap 0x%lx, new %s, state %s\n",
	    e->colormap, e->new ? Yes : No, s);
}

static void
do_ClientMessage (FILE* out_f, XEvent *eventp, Display* dpy)
{
    XClientMessageEvent *e = (XClientMessageEvent *) eventp;
    char *mname = NULL;

    if (dpy != NULL) {
      mname = XGetAtomName (dpy, e->message_type);
    }

    fprintf(out_f,"    message_type 0x%lx (%s), format %d\n",
            e->message_type, mname ? mname : Unknown, e->format);

    if (mname) XFree (mname);
}

static void
do_MappingNotify (FILE* out_f, XEvent *eventp)
{
    XMappingEvent *e = (XMappingEvent *) eventp;
    char *r;
    char rdummy[10];

    switch (e->request) {
      case MappingModifier:  r = "MappingModifier"; break;
      case MappingKeyboard:  r = "MappingKeyboard"; break;
      case MappingPointer:  r = "MappingPointer"; break;
      default:  r = rdummy; sprintf(rdummy, "%d", e->request); break;
    }

    fprintf(out_f,"    request %s, first_keycode %d, count %d\n",
	    r, e->first_keycode, e->count);
    XRefreshKeyboardMapping(e);
}



void print_event(FILE* out_f, XEvent* ev, Display *dpy)
{
	switch (ev->type) {
	  case KeyPress:
	    prologue (out_f, ev, "KeyPress");
	    do_KeyPress (out_f, ev);
	    break;
	  case KeyRelease:
	    prologue (out_f, ev, "KeyRelease");
	    do_KeyRelease (out_f, ev);
	    break;
	  case ButtonPress:
	    prologue (out_f, ev, "ButtonPress");
	    do_ButtonPress (out_f, ev);
	    break;
	  case ButtonRelease:
	    prologue (out_f, ev, "ButtonRelease");
	    do_ButtonRelease (out_f, ev);
	    break;
	  case MotionNotify:
	    prologue (out_f, ev, "MotionNotify");
	    do_MotionNotify (out_f, ev);
	    break;
	  case EnterNotify:
	    prologue (out_f, ev, "EnterNotify");
	    do_EnterNotify (out_f, ev);
	    break;
	  case LeaveNotify:
	    prologue (out_f, ev, "LeaveNotify");
	    do_LeaveNotify (out_f, ev);
	    break;
	  case FocusIn:
	    prologue (out_f, ev, "FocusIn");
	    do_FocusIn (out_f, ev);
	    break;
	  case FocusOut:
	    prologue (out_f, ev, "FocusOut");
	    do_FocusOut (out_f, ev);
	    break;
	  case KeymapNotify:
	    prologue (out_f, ev, "KeymapNotify");
	    do_KeymapNotify (out_f, ev);
	    break;
	  case Expose:
	    prologue (out_f, ev, "Expose");
	    do_Expose (out_f, ev);
	    break;
	  case GraphicsExpose:
	    prologue (out_f, ev, "GraphicsExpose");
	    do_GraphicsExpose (out_f, ev);
	    break;
	  case NoExpose:
	    prologue (out_f, ev, "NoExpose");
	    do_NoExpose (out_f, ev);
	    break;
	  case VisibilityNotify:
	    prologue (out_f, ev, "VisibilityNotify");
	    do_VisibilityNotify (out_f, ev);
	    break;
	  case CreateNotify:
	    prologue (out_f, ev, "CreateNotify");
	    do_CreateNotify (out_f, ev);
	    break;
	  case DestroyNotify:
	    prologue (out_f, ev, "DestroyNotify");
	    do_DestroyNotify (out_f, ev);
	    break;
	  case UnmapNotify:
	    prologue (out_f, ev, "UnmapNotify");
	    do_UnmapNotify (out_f, ev);
	    break;
	  case MapNotify:
	    prologue (out_f, ev, "MapNotify");
	    do_MapNotify (out_f, ev);
	    break;
	  case MapRequest:
	    prologue (out_f, ev, "MapRequest");
	    do_MapRequest (out_f, ev);
	    break;
	  case ReparentNotify:
	    prologue (out_f, ev, "ReparentNotify");
	    do_ReparentNotify (out_f, ev);
	    break;
	  case ConfigureNotify:
	    prologue (out_f, ev, "ConfigureNotify");
	    do_ConfigureNotify (out_f, ev);
	    break;
	  case ConfigureRequest:
	    prologue (out_f, ev, "ConfigureRequest");
	    do_ConfigureRequest (out_f, ev);
	    break;
	  case GravityNotify:
	    prologue (out_f, ev, "GravityNotify");
	    do_GravityNotify (out_f, ev);
	    break;
	  case ResizeRequest:
	    prologue (out_f, ev, "ResizeRequest");
	    do_ResizeRequest (out_f, ev);
	    break;
	  case CirculateNotify:
	    prologue (out_f, ev, "CirculateNotify");
	    do_CirculateNotify (out_f, ev);
	    break;
	  case CirculateRequest:
	    prologue (out_f, ev, "CirculateRequest");
	    do_CirculateRequest (out_f, ev);
	    break;
	  case PropertyNotify:
	    prologue (out_f, ev, "PropertyNotify");
	    do_PropertyNotify (out_f, ev, dpy);
	    break;
	  case SelectionClear:
	    prologue (out_f, ev, "SelectionClear");
	    do_SelectionClear (out_f, ev, dpy);
	    break;
	  case SelectionRequest:
	    prologue (out_f, ev, "SelectionRequest");
	    do_SelectionRequest (out_f, ev, dpy);
	    break;
	  case SelectionNotify:
	    prologue (out_f, ev, "SelectionNotify");
	    do_SelectionNotify (out_f, ev, dpy);
	    break;
	  case ColormapNotify:
	    prologue (out_f, ev, "ColormapNotify");
	    do_ColormapNotify (out_f, ev);
	    break;
	  case ClientMessage:
	    prologue (out_f, ev, "ClientMessage");
	    do_ClientMessage (out_f, ev, dpy);
	    break;
	  case MappingNotify:
	    prologue (out_f, ev, "MappingNotify");
	    do_MappingNotify (out_f, ev);
	    break;
	  default:
	    fprintf(out_f,"Unknown event type %d\n", ev->type);
	    break;
	} // end switch.

}


void print_xquerytree(FILE* out_file, Window win_handle, Display* dpy)
{
  if (win_handle == 0) {
    return;
  }

  Window root_win = 0;
  Window parent_win = 0;
  Window* childs_list = NULL;
  unsigned int num_childs = 0;
  int k = 0;

  int queryRes = XQueryTree(dpy, win_handle, &root_win,
                            &parent_win, &childs_list, &num_childs);
  if (queryRes != 0) {
    fprintf(out_file, "Active window: %#lx, root %#lx, parent %#lx ",
            win_handle, root_win, parent_win);

    if ((num_childs > 0) && (childs_list != NULL)) {
      fprintf(out_file, "Children: ");
      for (k = 0; k < num_childs; k++) {
        fprintf(out_file, "%#lx ", childs_list[k]);
      }
      fprintf(out_file, "\n");
      XFree(childs_list);
      childs_list = NULL;
    }
  } 
}
