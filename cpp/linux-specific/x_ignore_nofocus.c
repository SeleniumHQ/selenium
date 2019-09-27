#include <stdio.h>
#include <X11/Xlib.h>
#include <X11/X.h>
#include <dlfcn.h>
#include <sys/utsname.h>
#include <string.h>
#include "print_events.h"
#include <time.h>
#include <sys/time.h>
#include <stdlib.h>
#include <assert.h>
#include <unistd.h>
#include <elf.h>

#ifndef TRUE
#define TRUE 1
#endif

#ifndef FALSE
#define FALSE 0
#endif

// Define this to prevent events from being faked.
//#undef NO_FAKING

//#define DEBUG_PRINTOUTS

#ifdef DEBUG_PRINTOUTS
FILE* g_out_stream = 0;
#define LOG(...) if (g_out_stream != NULL) { fprintf(g_out_stream, __VA_ARGS__); fflush(g_out_stream); }
#define OPEN_LOGGING_FILE { g_out_stream = fopen("/tmp/x_ignore_focus_log.txt", "a+"); }
#define CLOSE_LOGGING_FILE { fclose(g_out_stream); g_out_stream = NULL; }
#else
// This is to prevent compiler warning for unused variables.
void do_nothing(const char* fmt, ...) {}
#define LOG(...) do_nothing(__VA_ARGS__)
#define OPEN_LOGGING_FILE ;
#define CLOSE_LOGGING_FILE ;
#endif

int g_library_inited = FALSE;

struct _FocusKeepStatus {
  Window active_window;
  Window new_window;
  int start_switch_window;
  int start_close_window;
  int during_switch;
  int during_close;
  int should_steal_focus;
  int encountered_focus_in_event;
  int active_window_from_close;
};

typedef struct _FocusKeepStatus FocusKeepStatus;

void init_focus_keep_struct(FocusKeepStatus* stat)
{
  stat->active_window = 0;
  stat->new_window = 0;
  stat->start_switch_window = FALSE;
  stat->start_close_window = FALSE;
  stat->during_switch = FALSE;
  stat->during_close = FALSE;
  stat->should_steal_focus = FALSE;
  // This boolean is for remembering if we already had a FocusIn event and
  // never re-send that event as well, not to break clients which expect to get
  // FocusOut before FocusIn
  stat->encountered_focus_in_event = FALSE;
  // This remembers if the active was learnt due to a close
  stat->active_window_from_close = FALSE;
};

Window get_active_window(FocusKeepStatus* stat)
{
  return stat->active_window;
}

int is_focus_out(XEvent* ev)
{
  return (ev->type == FocusOut);
}

int is_focus_in(XEvent* ev)
{
  return (ev->type == FocusIn);
}

int is_reparent_notify(XEvent* ev)
{
  return (ev->type == ReparentNotify);
}

int is_destroy_notify(XEvent* ev)
{
  return (ev->type == DestroyNotify);
}

Window extract_window_id(XEvent* ev);

struct {
  Window window_id;
  Window* related_windows;
} g_cached_xquerytree;

void init_cached_xquerytree()
{
  g_cached_xquerytree.window_id = 0;
  g_cached_xquerytree.related_windows = 0;
}

// Performing XQueryTree after UnmapNotify for some of the
// windows will cause a crash. Cache to prevent it.
int cache_xquery_result(Display* dpy, Window for_win) {
  Window root_win = 0;
  Window parent_win = 0;
  Window* childs_list = NULL;
  unsigned int num_childs = 0;
  int k = 0;

  if ((g_cached_xquerytree.window_id == for_win) &&
      (g_cached_xquerytree.related_windows != NULL)) {
    return TRUE;
  }

  LOG("Invoking XQueryTree for window %#lx\n", for_win);
  int queryRes = XQueryTree(dpy, for_win, &root_win,
                            &parent_win, &childs_list, &num_childs);
  if (queryRes == 0) {
    LOG("XQueryTree failed, rc=%d\n", queryRes);
    return FALSE;
  }

  if (g_cached_xquerytree.related_windows != NULL) {
    free(g_cached_xquerytree.related_windows);
    g_cached_xquerytree.related_windows = NULL;
  }

  int numRelatedWindows = (1 /* parent_win */ +
                           1 /* actual win */ + num_childs + 1 /* NULL */);


  g_cached_xquerytree.related_windows = malloc(sizeof(Window) * numRelatedWindows);
  LOG("Allocated at address %p , numRelWindows: %d\n",
      g_cached_xquerytree.related_windows, numRelatedWindows);
  int relatedWinsIndex = 0;
  g_cached_xquerytree.related_windows[relatedWinsIndex++] = parent_win;
  g_cached_xquerytree.related_windows[relatedWinsIndex++] = for_win;

  if ((num_childs > 0) && (childs_list != NULL)) {
    for (k = 0; k < num_childs; k++) {
      g_cached_xquerytree.related_windows[relatedWinsIndex++] = childs_list[k];
    }
    XFree(childs_list);
    childs_list = NULL;
  }
  g_cached_xquerytree.related_windows[relatedWinsIndex] = 0;

  g_cached_xquerytree.window_id = for_win;

  return TRUE;
}

int lookup_in_xquery_cache(Window ev_win)
{
  int ret_val = FALSE;
  int k = 0;
  if (g_cached_xquerytree.related_windows == NULL) {
    LOG("related_windows is NULL, cache is inconsistent.\n");
    return FALSE;
  }
  while ((g_cached_xquerytree.related_windows[k] != 0) && (!ret_val)) {
    if (g_cached_xquerytree.related_windows[k] == ev_win) {
      ret_val = TRUE;
    }
    k++;
  }

  return ret_val;
}

int window_ids_difference(Window win_one, Window win_two)
{
  return (abs(win_one - win_two));
}

int event_on_active_or_adj_window(Display* dpy, XEvent* ev, Window active_win)
{
  Window ev_win;
  int ret_val = FALSE;

  ev_win = extract_window_id(ev);

  // This is probably also essential as on focus in events on new windows
  // XQueryTree should not be called yet.
  if (active_win == ev_win) {
    return TRUE;
  }

  // "Obviously" related windows - ID of active window
  // and event_window differ by 1. By performing this check first,
  // we avoid calling XQueryTree which causes a segfault
  // if the window queried is being closed.
  if (abs(active_win - ev_win) <= 1) {
    ret_val = TRUE;
  } else {
    if (cache_xquery_result(dpy, active_win)) {
      ret_val = lookup_in_xquery_cache(ev_win);
    }
  }

  return ret_val;
}

#define MAX_BUFFER_SIZE (256)

void identify_switch_situation(FocusKeepStatus* stat)
{
  if (stat->start_switch_window || stat->start_close_window) {
    // In the middle of a window switch.
    Window old_active = get_active_window(stat);
    stat->active_window = 0;
    stat->during_switch = TRUE;

    if (stat->start_close_window) {
      stat->during_close = TRUE;
    }

    LOG("Window switching detected, active was: %#lx close: %d\n",
        old_active, stat->during_close);

    // Reset the the flags.
    stat->start_switch_window = FALSE;
    stat->start_close_window = FALSE;
  }
}

void set_active_window(FocusKeepStatus* stat, XEvent* ev)
{
  stat->active_window = extract_window_id(ev);
  if (stat->during_close) {
    stat->active_window_from_close = TRUE;
  } else {
    stat->active_window_from_close = FALSE;
  }
  stat->encountered_focus_in_event = FALSE;
  stat->during_switch = FALSE;
  stat->start_switch_window = FALSE;
  stat->start_close_window = FALSE;
  LOG("Setting Active Window due to FocusIn: %#lx (from close: %d)\n",
      get_active_window(stat), stat->active_window_from_close);
}

void identify_new_window_situation(FocusKeepStatus* stat, XEvent* ev)
{
  Window new_win = extract_window_id(ev);
  assert(is_reparent_notify(ev));

  if (get_active_window(stat) != 0) {
    stat->new_window = new_win;
    LOG("New window being created: %#lx\n", stat->new_window);
  } else {
    LOG("Reparent notify for window: %#lx, but no active.\n", new_win);
  }
}

void identify_active_destroyed(FocusKeepStatus* stat, XEvent* ev)
{
  assert(is_destroy_notify(ev));

  if (extract_window_id(ev) == get_active_window(stat)) {
    LOG("Active window: %#lx is destroyed!\n", get_active_window(stat));
    stat->active_window = 0;
  }
}

void steal_focus_back_if_needed(FocusKeepStatus* stat, Display* dpy)
{
  if ((stat->should_steal_focus) && (get_active_window(stat) != 0)) {
    stat->should_steal_focus = FALSE;

    if ((!stat->during_close) || (stat->active_window_from_close)) {
      LOG("Stealing focus back to %#lx\n", get_active_window(stat));
      stat->new_window = 0;

      XSetInputFocus(dpy, get_active_window(stat), RevertToParent, CurrentTime);
      // Allow a focus in event to flow again to the window considered
      // active.
      stat->encountered_focus_in_event = FALSE;
    } else {
      LOG("Not stealing focus back. During close: %d Active from close: %d.\n",
          stat->during_close, stat->active_window_from_close);
      // Set during_close to false here - This is the point where the state
      // transition is done - specifically, we consider the entire close
      // process to be completed.
      stat->during_close = FALSE;
    }
  }
}

int should_discard_focus_out_event(FocusKeepStatus* stat, Display* dpy,
                                   XEvent *ev)
{
  int ret_val = FALSE;
  if (is_focus_out(ev) == FALSE) {
    return FALSE;
  }

  const int detail = ev->xfocus.detail;

  if (stat->new_window != 0) {
    /*
    if (!(event_on_active_or_adj_window(dpy, ev, stat->new_window)
        || event_on_active_or_adj_window(dpy, ev, get_active_window(stat)))) {
      LOG( "ERROR - Event on window %#lx, which is neither new nor active.\n",
           extract_window_id(ev));
    } else */ {
      LOG("Event on new/active (%#lx) during new window creation, allowing.",
          extract_window_id(ev));
      LOG(" New: %#lx Active: %#lx\n", stat->new_window, stat->active_window);
    }
    return FALSE;
  }

  if (event_on_active_or_adj_window(dpy, ev, get_active_window(stat))) {
    // If moving ownership between sub-windows of the same Firefox window.
    if ((detail == NotifyAncestor) || (detail == NotifyInferior)) {
      // Allow this one.
      LOG("Focus will move to ancestor / inferior (%d). Allowing.\n", detail);
      stat->encountered_focus_in_event = FALSE;
    } else {
      // Disallow transfer of focus to outside windows.
      if (!stat->active_window_from_close) {
        ret_val = TRUE;
      } else {
        LOG("FocusOut event, but active window from close. Not discarding.\n");
      }
    }
  } else {
    LOG("Got Focus out event on window %#lx but active window is %#lx\n",
        extract_window_id(ev), get_active_window(stat));
  }

  return ret_val;
}

int should_discard_focus_in_event(FocusKeepStatus* stat, Display* dpy,
                                  XEvent *ev)
{
  int ret_val = FALSE;
  if (is_focus_in(ev) == FALSE) {
    return FALSE;
  }

  // Event not on active window - It's either on a new window currently being
  // created or on a different firefox one. On the first case, it will
  // be allowed through, but blocked on the second case.
  if (!event_on_active_or_adj_window(dpy, ev, get_active_window(stat))) {
    LOG("Got Focus in event on window %#lx but active window is %#lx\n",
        extract_window_id(ev), get_active_window(stat));

    if (stat->new_window != 0) {
      // If we are in the process of a new window creation, do not ignore
      // this focus in event - allow it both for the new window
      // and for a child window of it. However, if this is a focus in
      // event for a child window (not the new window itself), then
      // steal focus back from it afterwards.
      ret_val = FALSE;
      Window curr_win = extract_window_id(ev);
      if (curr_win == stat->new_window) {
        LOG("FocusIn event on new window - allowing.\n");
      } else {
        //if (event_on_active_or_adj_window(dpy, ev, stat->new_window) == FALSE) {
        if (window_ids_difference(curr_win, stat->new_window) > 4) {
          LOG("ERROR - Event on window %#lx\n", extract_window_id(ev));
        } else {
          LOG("FocusIn event on child of new window - steal focus!\n");
        }
        stat->should_steal_focus = TRUE;
      }
    } else {
      // Second case: No new window creation process disallow focus in
      ret_val = TRUE;
    }
  } else {
    // Event actually on the active window or an inferior window
    // of it.
    if (stat->encountered_focus_in_event == FALSE) {
      // If a focus in event for this window was not yet encountered,
      // allow this focus in event and ignore in the future.
      stat->encountered_focus_in_event = TRUE;
      ret_val = FALSE;
    } else {
      ret_val = TRUE;
    }
  }

  return ret_val;
}

#ifndef NO_FAKING
// Real functions
void fake_keymap_notify_event(XEvent* outEvent, XEvent* sourceEvent)
{
  XEvent ev;
  ev.type = KeymapNotify;
  ev.xkeymap.serial = sourceEvent->xfocus.serial;
  ev.xkeymap.send_event = sourceEvent->xfocus.send_event;
  ev.xkeymap.display = sourceEvent->xfocus.display;
  ev.xkeymap.window = sourceEvent->xfocus.window;
  //bzero(ev.xkeymap.key_vector, 32);
  *outEvent = ev;
}

#else
// Dummy functions - faking will not happen.
void fake_keymap_notify_event(XEvent* outEvent, XEvent* sourceEvent)
{
  LOG("*** Not faking keymap notify event.\n");
  *outEvent = *sourceEvent;
}

static int XSetInputFocus(Display *display, Window focus, int revert_to,
                          Time time)
{
  LOG("*** Not stealing focus.\n");
  return 1;
}

#endif

int is_32bit_system()
{
    struct utsname sys_info;
    int uname_res = uname(&sys_info);
    // In case of error, arbitrarily decide it is.
    if (uname_res != 0) {
      return TRUE;
    }

    const char arch_64[] = "x86_64";
    if (strncmp(sys_info.machine, arch_64, strlen(arch_64)) == 0) {
      return FALSE;
    }

    return TRUE;
}

int is_emulated_32bit()
{
#ifdef __i386__
    return !is_32bit_system();
#else
    return FALSE;
#endif
}

#define MAX_LIBRARY_PATH (1024)

// Returns the window ID from every type of event
// that should be handled.
Window extract_window_id(XEvent* ev) {
  switch (ev->type) {
    case FocusIn:
      return ev->xfocus.window;
      break;
    case FocusOut:
      return ev->xfocus.window;
      break;
    case Expose:
      return ev->xexpose.window;
      break;
    case VisibilityNotify:
      return ev->xvisibility.window;
      break;
    case CreateNotify:
      return ev->xcreatewindow.window;
      break;
    case MapNotify:
      return ev->xmap.window;
      break;
    case PropertyNotify:
      return ev->xproperty.window;
      break;
    case DestroyNotify:
      return ev->xdestroywindow.window;
      break;
    case ConfigureNotify:
      return ev->xconfigure.window;
      break;
    case MotionNotify:
      return ev->xmotion.window;
      break;
    case UnmapNotify:
      return ev->xunmap.window;
      break;
    case EnterNotify:
    case LeaveNotify:
      return ev->xcrossing.window;
      break;
    case ReparentNotify:
      return ev->xreparent.window;
      break;
    case ClientMessage:
      return ev->xclient.window;
      break;
    case ButtonPress:
    case ButtonRelease:
      return ev->xbutton.window;
      break;
    case NoExpose:
      break;
    default:
      LOG("Unknown event type %d\n", ev->type);
  };
  return 0;
}

int is_library_for_architecture(const char* lib_path, uint16_t arch)
{
  Elf32_Ehdr elf32_header;
  int elf32_header_size = sizeof(elf32_header);

  FILE* lib = fopen(lib_path, "r");
  int bytes_read = fread(&elf32_header, 1, elf32_header_size, lib);
  fclose(lib);
  lib = NULL;

  if (bytes_read != elf32_header_size) {
    return FALSE;
  }

  if ((memcmp(elf32_header.e_ident, ELFMAG, sizeof(ELFMAG) - 1) == 0)
      && (elf32_header.e_type == ET_DYN) && (elf32_header.e_machine == arch))
  {
    return TRUE;
  }

  return FALSE;
}

int is_usable_library(const char *candidate_library, uint16_t desired_architecture)
{
  if (access(candidate_library, F_OK) == 0 &&
      is_library_for_architecture(candidate_library, desired_architecture) == TRUE) {
    void *ret_handle = dlopen(candidate_library, RTLD_LAZY);
    if (ret_handle == NULL) {
      return FALSE;
    }
    dlclose(ret_handle);

    return TRUE;
  }
  return FALSE;
}

int find_xlib_by_arch(const char* possible_locations[],
    int locations_length, uint16_t desired_architecture)
{
  int i;
  for (i = 0; i < locations_length; i++) {
    const char* possible_location = possible_locations[i];

    if (is_usable_library(possible_location, desired_architecture))
    {
      return i;
    }
  }

  return -1;
}


int find_xlib_by_env(char *library, uint16_t desired_architecture)
{
  char *ld_env = getenv("LD_LIBRARY_PATH");
  if (ld_env == 0) {
    return FALSE;
  }

  char *ld_to_parse = strdup(ld_env);

  int found_library = FALSE;
  char *t = strtok(ld_to_parse, ":");
  char potential_library[MAX_LIBRARY_PATH + 1];

  while ((t != NULL) && (!found_library)) {
    snprintf(potential_library, MAX_LIBRARY_PATH, "%s/libX11.so.6", t);
    if (is_usable_library(potential_library, desired_architecture)) {
      strcpy(library, potential_library);
      found_library = TRUE;
    }
    t = strtok(NULL, ":");
  }

  free(ld_to_parse);
  return found_library;
}

void* get_xlib_handle()
{
  void* ret_handle = NULL;
  char library[MAX_LIBRARY_PATH + 1];

  const char * possible_locations[] = {
  		"/usr/lib/libX11.so.6",                   //default_x11_location
  		"/usr/lib/x86_64-linux-gnu/libX11.so.6",  //debian_x11_location
  		"/usr/lib/i386-linux-gnu/libX11.so.6",    //ubuntu_32bit_x11_location
  		"/usr/lib64/libX11.so.6",                 //opensuse_x11_location
		"/usr/lib32/libX11.so.6"
  };
  int locations_len = sizeof(possible_locations) / sizeof(char*);

  uint16_t required_lib_arch;
  if (is_32bit_system() || is_emulated_32bit()) {
    required_lib_arch = EM_386;
  } else {
    required_lib_arch = EM_X86_64;
  }
  int suitable_xlib_index = find_xlib_by_arch(possible_locations, locations_len, required_lib_arch);
  int found_library = FALSE;
  if (suitable_xlib_index >= 0) {
    snprintf(library, MAX_LIBRARY_PATH, "%s", possible_locations[suitable_xlib_index]);
    found_library = TRUE;
  } else {
    found_library = find_xlib_by_env(library, required_lib_arch);
  }
  if (found_library == FALSE) {
    const char* desired_arch = (required_lib_arch == EM_386 ? "32-bit" : "64-bit");
    fprintf(stderr, "None of the following is a %s version of Xlib:", desired_arch);
    int i;
    for (i = 0; i < locations_len; i++) {
      fprintf(stderr, " %s\n", possible_locations[i]);
    }
    return NULL;
  }

  ret_handle = dlopen(library, RTLD_LAZY);
  if (ret_handle == NULL) {
    fprintf(stderr, "Failed to dlopen %s\n", library);
    fprintf(stderr, "dlerror says: %s\n", dlerror());
  }

  return ret_handle;
}

void print_event_to_log(Display* dpy, XEvent* ev)
{
#ifdef DEBUG_PRINTOUTS
  if ((ev->type != PropertyNotify) && (ev->type != ConfigureNotify)) {
    print_event(g_out_stream, ev, dpy);
  }
#endif
}

// This global variable is intentionally declared here - as I wish the rest
// of the functions will act on it as a parameter.
FocusKeepStatus g_focus_status;

void initFocusStatusAndXQueryTree() {
  if (g_library_inited == FALSE) {
    LOG("Library initialized.\n");
    g_library_inited = TRUE;
    init_cached_xquerytree();
    init_focus_keep_struct(&g_focus_status);
  }
}

int XNextEvent(Display *display, XEvent *outEvent) {
  // Code to pull the real function handle from X11 library.
  void *handle = NULL;

  //This will turn the function proto into a function pointer declaration
  int (*real_func)(Display *display, XEvent *outEvent) = NULL;
  handle = get_xlib_handle();

  if (handle == NULL) {
    return -1;
  }

  // The real event from XNextEvent
  XEvent realEvent;

  // Find the real function.
  real_func = dlsym(handle, "XNextEvent");
  // Invoke the real function.
  int rf_ret = real_func(display, &realEvent);

  OPEN_LOGGING_FILE;

  initFocusStatusAndXQueryTree();

  // This display object will be used to inquire X server
  // about inferior and parent windows.
  Display* dpy = display;
  //assert(dpy != NULL);

  print_event_to_log(dpy, &realEvent);

  // Is the event on a window other than the active one?
  // If so, update gActiveWindow on two cases:
  // 1. It's the first window known to the module.
  // 2. It's the second window known to the module. The second
  // window is the actual browser window (the first one is just a
  // set-up one).
  //
  if ((get_active_window(&g_focus_status) == 0) && (is_focus_in(&realEvent))) {
    set_active_window(&g_focus_status, &realEvent);
  } else {
    identify_switch_situation(&g_focus_status);
  }

  if (is_reparent_notify(&realEvent)) {
    identify_new_window_situation(&g_focus_status, &realEvent);
  }

  if (is_destroy_notify(&realEvent)) {
    identify_active_destroyed(&g_focus_status, &realEvent);
  }

  if ((g_focus_status.during_switch == TRUE) ||
      (get_active_window(&g_focus_status) == 0)) {
      LOG("During switch: %d Active win: %#lx during close: %d\n",
          g_focus_status.during_switch, get_active_window(&g_focus_status),
          g_focus_status.during_close);
    *outEvent = realEvent;
  } else if (should_discard_focus_out_event(&g_focus_status, dpy, &realEvent)) {
    // Fake an event!
    fake_keymap_notify_event(outEvent, &realEvent);
    LOG("Fake event for focus out.\n");
  }  else if (should_discard_focus_in_event(&g_focus_status, dpy, &realEvent)) {
    fake_keymap_notify_event(outEvent, &realEvent);
    LOG("Fake event for focus in.\n");
  } else {
    *outEvent = realEvent;
  }

  steal_focus_back_if_needed(&g_focus_status, dpy);

  dlclose(handle);
  CLOSE_LOGGING_FILE;
  return rf_ret;
}

void notify_of_switch_to_window(long window_id) {
  initFocusStatusAndXQueryTree();
  g_focus_status.start_switch_window = TRUE;
  OPEN_LOGGING_FILE;
  LOG("Notify of switch-to-window with id %d\n", window_id);
  CLOSE_LOGGING_FILE;
}

void notify_of_close_window(long window_id) {
  initFocusStatusAndXQueryTree();
  g_focus_status.start_close_window = TRUE;
  OPEN_LOGGING_FILE;
  if (0 == window_id) {
    LOG("Notify of close-all-windows.\n");
  } else {
    LOG("Notify of close-window with id %n", window_id);
  }
  CLOSE_LOGGING_FILE;
}
