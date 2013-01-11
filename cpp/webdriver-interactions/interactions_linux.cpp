/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#include <ctime>
#include <string>
#include <iostream>
#include <fstream>

#include "interactions.h"
#include "logging.h"

#include <gdk/gdk.h>
#include <gdk/gdkkeysyms.h>
#include <X11/Xlib.h>
#include <time.h>
#include <stdlib.h>
#include <assert.h>
#include <list>
#include <algorithm>
#include <functional>

#include "translate_keycode_linux.h"
#include "interactions_linux.h"

using namespace std;

// This class represents a single modifier key. A modifier key is Shift,
// Ctrl or Alt. A key has, besides a GDK symbol related to it, a Mask
// that must be appended to each keyboard event when this modifier is
// set.
class XModifierKey
{
 public:
  // Stores the key associated with this modifier and the bit-mask
  // to set when this key was toggled.
  XModifierKey(const guint& associated_gdk_key, const GdkModifierType& gdk_mod,
    const guint32& stored_state);
  // if a_key matches the associated gdk key, toggeles the modifier
  // key state.
  void ToggleIfKeyMatches(const guint a_key);
  // Returns true if the key given matches the key associated with
  // this modifier.
  bool KeyMatches(const guint a_key) const;
  // if the modifier key was pressed, return the mask to OR with.
  // If not, return 0.
  guint GetAppropriateMask() const;
  // Set the modifier to false.
  void ClearModifier();
  // Returns the associated key
  guint get_associated_key() const;
  // Returns true if the modifier is set, false otherwise.
  bool get_toggle() const;
  // Store the current state of the modifier key into the provided int.
  void StoreState(guint32* state_store) const;
 private:
  bool toggle_;
  guint associated_key_;
  GdkModifierType gdk_mod_mask_;
};

XModifierKey::XModifierKey(const guint& associated_gdk_key,
                           const GdkModifierType& gdk_mod,
                           const guint32& stored_state) :
  toggle_(stored_state & gdk_mod), associated_key_(associated_gdk_key), gdk_mod_mask_(gdk_mod)
{
  LOG(DEBUG) << "Restored state for " << gdk_mod_mask_ << " : " << toggle_;
}

bool XModifierKey::KeyMatches(const guint a_key) const
{
  return (a_key == associated_key_);
}

void XModifierKey::ToggleIfKeyMatches(const guint a_key)
{
  if (KeyMatches(a_key)) {
    toggle_ = !toggle_;
  }
}

guint XModifierKey::GetAppropriateMask() const
{
  if (toggle_) {
    return gdk_mod_mask_;
  }
  return 0;
}

guint XModifierKey::get_associated_key() const
{
  return associated_key_;
}

void XModifierKey::ClearModifier()
{
  toggle_ = false;
}

bool XModifierKey::get_toggle() const
{
  return toggle_;
}

void XModifierKey::StoreState(guint32* state_store) const
{
  guint32 non_mask_bits = ~gdk_mod_mask_;
  guint32 toggle_bit = (toggle_ ? gdk_mod_mask_ : 0);

  *state_store = (*state_store & non_mask_bits) | toggle_bit;
  LOG(DEBUG) << "Storing state for " << gdk_mod_mask_ << " toggled? " << toggle_ <<
    " state store: " << *state_store << " non-mask bits: " << std::hex << non_mask_bits;
}

// Definition of a key press, release events pair.
typedef std::pair<GdkEvent*, GdkEvent*> KeyEventsPair;
enum KeyEventType { kKeyPress, kKeyRelease };
// This class handles generation of key press / release events.
// Events will be generated according to the given key to emulate
// and state of modifier keys.
class KeypressEventsHandler
{
public:
  KeypressEventsHandler(GdkDrawable* win_handle, guint32 modifiers_state);
  virtual ~KeypressEventsHandler();

  // Create a series of key release events that were left on at the end of
  // a sendKeys call.
  list<GdkEvent*> CreateModifierReleaseEvents();

  // Creates a series of key events according to the key to emulate
  // Cases:
  // 1. Null key: Reset modifiers state and return no events.
  // 2. lowercase letter: Create KeyPress, KeyRelease events.
  // 3. Uppercase letter: Creates Shift Down, KeyPress, KeyRelease
  //    and Shift Up events.
  // 4. Modifier: KeyPress event only, unless it was down
  // already - in which case, a KeyRelease
  list<GdkEvent*> CreateEventsForKey(wchar_t key_to_emulate);
  // Returns the time of the latest event.
  guint32 get_last_event_time();
  // Returns the state of modifier keys, to be stored between calls.
  guint32 getModifierKeysState();


private:
  // Create a keyboard event for a character or a non-modifier key
  // (arrow or tab keys, for example).
  GdkEvent* CreateKeyEvent(wchar_t key_to_emulate, KeyEventType ev_type);
  // Create a keyboard event for a modifier key - for example, when
  // shift is pressed.
  GdkEvent* CreateModifierKeyEvent(wchar_t key_to_emulate);
  // Returns true if the given character represents any of the modifier keys
  // the instance of this class knows about.
  bool IsModifierKey(wchar_t key);
  // Generates key down / up pair for a regular character.
  KeyEventsPair CreateKeyDownUpEvents(wchar_t key_to_emulate);

  // Creates a generic key event - used by the public methods
  // that generate events. Not used for modifier keys.
  GdkEvent* CreateGenericKeyEvent(wchar_t key_to_emulate, KeyEventType ev_type);

  // Similar to CreateGenericKeyEvent, but for modifier keys.
  GdkEvent* CreateGenericModifierKeyEvent(guint gdk_key, KeyEventType ev_type);
  // Creates an empty event.
  GdkEvent* CreateEmptyKeyEvent(KeyEventType ev_type);

  // Modifiers related.
  // Clears all of the modifiers
  void ClearModifiers();
  // Creates XModifierKey instances for a list of known, hard-coded
  // modifier keys.
  void InitModifiers();
  // Stores the state of all modifier keys into the static field.
  void StoreModifiersState();
  // Given a mask, add bits representing all of the relevant set modifiers
  // to it.
  void AddModifiersToMask(guint& mask_to_modifiy);
  // Returns true if a modifier, representing this gdk key, is set.
  bool IsModifierSet(guint gdk_key);
  // Called during handling of a modifier key, this method stores
  // the change of the appropriate modifier key (toggles it).
  void StoreModifierKeyState(guint gdk_mod_key);
  // Returns true if the Shift modifier is set.
  bool IsShiftSet();

  // Members.
  // Known modifiers and their states.
  list<XModifierKey> modifiers_;
  // The window handle to be used.
  GdkDrawable* win_handle_;
  // Time of the most recent event created.
  guint32 last_event_time_;
  // State of modifier keys - initialized from a global
  guint32 modifiers_state_;
};

// Sets the is_modifier field of the GdkEvent according to the supplied
// boolean.
static void SetIsModifierEvent(GdkEvent* p_ev, bool is_modifier)
{
  assert(p_ev->type == GDK_KEY_RELEASE || p_ev->type == GDK_KEY_PRESS);
  p_ev->key.is_modifier = (int) is_modifier;
}

KeypressEventsHandler::KeypressEventsHandler(GdkDrawable* win_handle, guint32 modifiers_state) :
  modifiers_(), win_handle_(win_handle), last_event_time_(TimeSinceBootMsec()),
  modifiers_state_(modifiers_state)
{
  InitModifiers();
}

// Will be called for the "Null" key.
void KeypressEventsHandler::ClearModifiers()
{
  for_each(modifiers_.begin(), modifiers_.end(),
           mem_fun_ref(&XModifierKey::ClearModifier));
}

void KeypressEventsHandler::InitModifiers()
{
  if (modifiers_.empty() == false) {
    modifiers_.clear();
  }

  modifiers_.push_back(XModifierKey(GDK_Shift_L, GDK_SHIFT_MASK, modifiers_state_));
  modifiers_.push_back(XModifierKey(GDK_Control_L, GDK_CONTROL_MASK, modifiers_state_));
  modifiers_.push_back(XModifierKey(GDK_Alt_L, GDK_MOD1_MASK, modifiers_state_));
}

void KeypressEventsHandler::StoreModifiersState()
{
  for_each(modifiers_.begin(), modifiers_.end(),
           bind2nd(mem_fun_ref(&XModifierKey::StoreState), &modifiers_state_));
  LOG(DEBUG) << "Stored modifiers: " << modifiers_state_;
}

bool KeypressEventsHandler::IsModifierKey(wchar_t key)
{
  bool is_modifier = false;
  guint gdk_key_sym = translate_code_to_gdk_symbol(key);
  for (list<XModifierKey>::iterator it = modifiers_.begin();
       it != modifiers_.end(); ++it) {
    is_modifier |= it->KeyMatches(gdk_key_sym);
  }

  return is_modifier;
}

bool KeypressEventsHandler::IsModifierSet(guint gdk_key)
{
  list<XModifierKey>::iterator it =
      find_if(modifiers_.begin(), modifiers_.end(),
              bind2nd(mem_fun_ref(&XModifierKey::KeyMatches), gdk_key));

  if (it == modifiers_.end()) {
    return false;
  }

  return it->get_toggle();
}

void KeypressEventsHandler::StoreModifierKeyState(guint gdk_mod_key)
{
  for_each(modifiers_.begin(), modifiers_.end(),
           bind2nd(mem_fun_ref(&XModifierKey::ToggleIfKeyMatches),
                   gdk_mod_key));
  StoreModifiersState();
}

void KeypressEventsHandler::AddModifiersToMask(guint& mask_to_modifiy)
{
  for (list<XModifierKey>::iterator it = modifiers_.begin();
       it != modifiers_.end(); ++it) {
    mask_to_modifiy|= it->GetAppropriateMask();
  }
}

bool modifier_is_shift(const XModifierKey& k)
{
  return (k.get_associated_key() == GDK_Shift_L);
}

bool KeypressEventsHandler::IsShiftSet()
{
  list<XModifierKey>::iterator it =
      find_if(modifiers_.begin(), modifiers_.end(), modifier_is_shift);
  assert(it != modifiers_.end());
  return it->get_toggle();
}

guint32 KeypressEventsHandler::get_last_event_time()
{
  return last_event_time_;
}

guint32 KeypressEventsHandler::getModifierKeysState()
{
  return modifiers_state_;
}


GdkEvent* KeypressEventsHandler::CreateEmptyKeyEvent(KeyEventType ev_type)
{
  GdkEventType gdk_ev = GDK_KEY_PRESS;
  if (ev_type == kKeyRelease) {
    gdk_ev = GDK_KEY_RELEASE;
  }
  GdkEvent* p_ev = gdk_event_new(gdk_ev);
  p_ev->key.window = GDK_WINDOW(g_object_ref(win_handle_));
  p_ev->key.send_event = 0; // NOT a synthesized event.
  p_ev->key.time = TimeSinceBootMsec();
  // Also update the latest event time
  last_event_time_ = p_ev->key.time;
  // Deprecated.
  p_ev->key.length = 0;
  p_ev->key.string = NULL;
  // Put a default key code for space. This will be fixed later
  // by callers, that will translate the given character to
  // its appropriate keycode.
  const guint16 kSpaceKeycode = 65;
  p_ev->key.hardware_keycode = kSpaceKeycode;
  // This flag will be set to true later, if we indeed create
  // a modifier key event.
  SetIsModifierEvent(p_ev, false);

  // This applies to regular characters, keys and modifiers.
  // This must be done before the special handling for modifier
  // keys, as it will change the internal state of the modifiers.
  AddModifiersToMask(p_ev->key.state);

  return p_ev;
}

static guint16 get_keycode_for_key(guint for_key)
{
  guint16 ret_kc;
  const char* display_name = gdk_display_get_name(gdk_display_get_default());
  Display* xdisplay = XOpenDisplay(display_name);
  assert(xdisplay != NULL);

  KeyCode kc = XKeysymToKeycode(xdisplay, for_key);
  LOG(DEBUG) << "Got keycode: " << (int) kc;
  XCloseDisplay(xdisplay);
  ret_kc = (int) kc;

  return ret_kc;
}

GdkEvent* KeypressEventsHandler::CreateGenericKeyEvent(wchar_t key_to_emulate,
                                                       KeyEventType ev_type)
{
  GdkEvent* p_ev = CreateEmptyKeyEvent(ev_type);

  guint translated_key = translate_code_to_gdk_symbol(key_to_emulate);
  // Common case - key is not a modifier or a special key (arrow, tab, etc)
  if (translated_key == GDK_VoidSymbol) {
    // Ordinary character.
    p_ev->key.keyval = gdk_unicode_to_keyval(key_to_emulate);
  } else {
    // Special key
    p_ev->key.keyval = translated_key;
  }

  p_ev->key.hardware_keycode = get_keycode_for_key(p_ev->key.keyval);

  if (IsShiftSet()) {
    p_ev->key.keyval = gdk_keyval_to_upper(p_ev->key.keyval);
  }

  return p_ev;
}

GdkEvent* KeypressEventsHandler::CreateGenericModifierKeyEvent(
    guint gdk_key, KeyEventType ev_type)
{
  GdkEvent* p_ev = CreateEmptyKeyEvent(ev_type);

  p_ev->key.keyval = gdk_key;
  p_ev->key.hardware_keycode = get_keycode_for_key(p_ev->key.keyval);

  SetIsModifierEvent(p_ev, true);

  return p_ev;
}
GdkEvent* KeypressEventsHandler::CreateKeyEvent(wchar_t key_to_emulate,
                                                KeyEventType ev_type)
{
    // Should only be called with non-modifier keys.
    assert(IsModifierKey(key_to_emulate) == false);
    return CreateGenericKeyEvent(key_to_emulate, ev_type);
}

KeyEventsPair KeypressEventsHandler::CreateKeyDownUpEvents(
    wchar_t key_to_emulate)
{
  GdkEvent* down = CreateKeyEvent(key_to_emulate, kKeyPress);
  GdkEvent* up = CreateKeyEvent(key_to_emulate, kKeyRelease);
  return std::make_pair(down, up);
}

GdkEvent* KeypressEventsHandler::CreateModifierKeyEvent(
    wchar_t key_to_emulate)
{
    guint translated_key = translate_code_to_gdk_symbol(key_to_emulate);
    assert(translated_key != GDK_VoidSymbol);
    // If the modifier is set - this is a release event, otherwise - 
    // a key press.
    KeyEventType ev_type = kKeyPress;
    if (IsModifierSet(translated_key)) {
      ev_type = kKeyRelease;
    }
    GdkEvent* ret_event =
        CreateGenericModifierKeyEvent(translated_key, ev_type);

    StoreModifierKeyState(translated_key);
    return ret_event;
}

list<GdkEvent*> KeypressEventsHandler::CreateModifierReleaseEvents()
{
  list<GdkEvent*> ret_list;
  for (list<XModifierKey>::iterator it = modifiers_.begin();
       it != modifiers_.end(); ++it) {
    if (it->get_toggle()) {
      GdkEvent* rel_event =
          CreateGenericModifierKeyEvent(it->get_associated_key(), kKeyRelease);
      ret_list.push_back(rel_event);
      it->ClearModifier();
    }
  }

  StoreModifiersState();

  return ret_list;
}

bool is_lowercase_symbol(wchar_t key_to_emulate)
{
  // Note that it is *only* allowed for keys that cannot be translated
  // this bears the assumption that keys defined in Keys.java do not
  // have a different "capitalized" representation.
  // This makes sense as the keys in Keys.java are non-alphanumeric
  // keys (arrows, tab, etc);
  //
  assert(translate_code_to_gdk_symbol(key_to_emulate) == GDK_VoidSymbol);

  string chars_req_shift = "!$^*()+{}:?|~@#%&_\"<>";

  bool shift_needed = (chars_req_shift.find(toascii(key_to_emulate)) !=
                       string::npos);
  // If the representation is different than the lowercase 
  // representation, this is not a lowercase character.
  if (shift_needed || (key_to_emulate != towlower(key_to_emulate))) {
    return false;
  }
  return true;
}

list<GdkEvent*> KeypressEventsHandler::CreateEventsForKey(
    wchar_t key_to_emulate)
{
 list<GdkEvent*> ret_list;
  // First case - is it the NULL symbol? If so, reset modifiers and exit.
  if (key_to_emulate == gNullKey) {
    LOG(DEBUG) << "Null key - clearing modifiers.";
    return CreateModifierReleaseEvents();
  }

  // Now: The key is either a modifier key or character key.
  // Common case - not a modifier key. Need two events - Key press and
  // key release.
  if (IsModifierKey(key_to_emulate) == false) {
    LOG(DEBUG) << "Key: " << key_to_emulate  << " is not a modifier.";

    guint translated_key = translate_code_to_gdk_symbol(key_to_emulate);
    // First - check to see if this is an lowercase letter or is a
    // non-alphanumeric key (which cannot be capitalized)
    if ((translated_key != GDK_VoidSymbol) ||
        (is_lowercase_symbol(key_to_emulate))) {
      LOG(DEBUG) << "Lowercase letter or non void gdk symbol.";
      // More common case - lowercase letter.
      // Create only two events.
      // Note that if the Shift modifier is set, this character will
      // be converted to uppercase by CreateKeyEvent method.
      KeyEventsPair ev = CreateKeyDownUpEvents(key_to_emulate);
      ret_list.push_back(ev.first);
      ret_list.push_back(ev.second);
    } else {
      // Uppercase letter/symbol: Fire up shift down event, this key and 
      // shift up event (unless the Shift modifier is already set)
      bool shift_was_set = IsShiftSet();
      LOG(DEBUG) << "Uppercase letter. Was shift set? " << shift_was_set;
      if (shift_was_set == false) {
        // push shift down event
        ret_list.push_front(
            CreateGenericModifierKeyEvent(GDK_Shift_L, kKeyPress));
        StoreModifierKeyState(GDK_Shift_L);
      }
      KeyEventsPair ev = CreateKeyDownUpEvents(key_to_emulate);
      // Push the events themselves.
      ret_list.push_back(ev.first);
      ret_list.push_back(ev.second);

      if (shift_was_set == false) {
        // push shift up event
        ret_list.push_back(
            CreateGenericModifierKeyEvent(GDK_Shift_L, kKeyRelease));
        // Turn OFF the shift modifier!
        StoreModifierKeyState(GDK_Shift_L);
      }
    }
  } else { // Modifier key.
    // When a modifier key is pressed, the state does not yet change to reflect
    // it (on the KeyPress event for the modifier key). When the modifier key is
    // released, the state indeed reflects that it was pressed.
    LOG(DEBUG) << "Key: " << key_to_emulate << " IS a modifier.";
    // generate only one keypress event, either press or release.
    GdkEvent* p_ev = CreateModifierKeyEvent(key_to_emulate);
    ret_list.push_back(p_ev);
  }

  return ret_list;
}

KeypressEventsHandler::~KeypressEventsHandler()
{
  modifiers_.clear();
}

static void submit_and_free_event(GdkEvent* p_key_event, int sleep_time_ms)
{
  gdk_event_put(p_key_event);
  gdk_event_free(p_key_event);
  sleep_for_ms(sleep_time_ms);
}

static void submit_and_free_events_list(list<GdkEvent*>& events_list,
                                        int sleep_time_ms)
{
    for_each(events_list.begin(), events_list.end(), print_key_event);

    for_each(events_list.begin(), events_list.end(),
             bind2nd(ptr_fun(submit_and_free_event), sleep_time_ms));

    events_list.clear();
}

// global variable declared here so it is not used beforehand.
guint32 gModifiersState = 0;

int getTimePerKey(int proposedTimePerKey)
{
  const int minTimePerKey = 10 /* ms */;
  if (proposedTimePerKey < minTimePerKey) {
    return minTimePerKey;
  }

  return proposedTimePerKey;
}

void updateLastEventTime(const guint32 lastEventTime) {
  if (gLatestEventTime < lastEventTime) {
    gLatestEventTime = lastEventTime;
  }
}

extern "C"
{
void sendKeys(WINDOW_HANDLE windowHandle, const wchar_t* value, int requestedTimePerKey)
{
  init_logging();
  int timePerKey = getTimePerKey(requestedTimePerKey);

  LOG(DEBUG) << "---------- starting sendKeys: " << windowHandle << " tpk: " <<
     timePerKey << "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  // The keyp_handler will remember the state of modifier keys and
  // will be used to generate the events themselves.
  KeypressEventsHandler keyp_handler(hwnd, gModifiersState);

  struct timespec sleep_time;
  sleep_time.tv_sec = timePerKey / 1000;
  sleep_time.tv_nsec = (timePerKey % 1000) * 1000000;
  LOG(DEBUG) << "Sleep time is " << sleep_time.tv_sec << " seconds and " <<
            sleep_time.tv_nsec << " nanoseconds.";

  int i = 0;
  while (value[i] != '\0') {
    list<GdkEvent*> events_for_key =
        keyp_handler.CreateEventsForKey(value[i]);

    submit_and_free_events_list(events_for_key, timePerKey);

    i++;
  }

  updateLastEventTime(keyp_handler.get_last_event_time());
  gModifiersState = keyp_handler.getModifierKeysState();

  LOG(DEBUG) << "---------- Ending sendKeys. Total keys: " << i
            << "  ----------";
}

void releaseModifierKeys(WINDOW_HANDLE windowHandle, int requestedTimePerKey)
{
  init_logging();
  int timePerKey = getTimePerKey(requestedTimePerKey);

  LOG(DEBUG) << "---------- starting releaseModifierKeys: " << windowHandle << " tpk: " <<
     timePerKey << "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  // The state of the modifier keys is stored - just calling release will work.
  KeypressEventsHandler keyp_handler(hwnd, gModifiersState);

  // Free the remaining modifiers that are still set.
  list<GdkEvent*> modifier_release_events =
      keyp_handler.CreateModifierReleaseEvents();
  int num_released = modifier_release_events.size();

  submit_and_free_events_list(modifier_release_events, timePerKey);

  updateLastEventTime(keyp_handler.get_last_event_time());
  gModifiersState = keyp_handler.getModifierKeysState();

  LOG(DEBUG) << "---------- Ending releaseModifierKeys. Released: " << num_released
    << "  ----------";
}

}
