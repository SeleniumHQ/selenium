/*
Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements. See the NOTICE file
distributed with this work for additional information
regarding copyright ownership. The SFC licenses this file
to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#include "stdafx.h"
#include "event_firing_thread.h"

// Defaults to false, unless the driver explicitly turns this on.
static bool gEnablePersistentEventFiring = false;
// Thread for firing event
HANDLE hConstantEventsThread = NULL;
class EventFiringData
{
 public:
  EventFiringData(HWND directInputTo, long onX, long onY, WPARAM buttonValue) :
    m_shouldFire(true), m_keepRunning(true),
    m_to(directInputTo), m_x(onX), m_y(onY), m_buttonState(buttonValue) { }
  // Used to control temporary firing of events.
  void pauseFiring() { m_shouldFire = false; }
  void resumeFiring() { m_shouldFire = true; }
  bool shouldFire() { return m_shouldFire; }
  // Used to control the existance of the background thread:
  // when shouldRun returns false the thread will exit.
  void stopRunning() { m_keepRunning = false; }
  bool shouldRun() { return m_keepRunning; }

  // Information on where to send the event to.
  HWND getTarget() { return m_to; }
  long getXLocation() { return m_x; }
  long getYLocation() { return m_y; }
  WPARAM getInputDevicesState() { return m_buttonState; }

  // Update the keyboard state.
  void setInputDevicesState(WPARAM buttonValue) { m_buttonState = buttonValue; }

  // Fire events to a new window / coordinates.
  void setNewTarget(HWND directInputTo, long onX, long onY, WPARAM buttonValue)
  {
    m_to = directInputTo;
    m_x = onX;
    m_y = onY;
    m_buttonState = buttonValue;
  }

 private:
  bool m_shouldFire;
  bool m_keepRunning;
  HWND m_to;
  long m_x, m_y;
  WPARAM m_buttonState;
};

// Function passed to the thread.
DWORD WINAPI MouseEventFiringFunction(LPVOID lpParam)
{
  EventFiringData* firingData;

  firingData = (EventFiringData*) lpParam;
  // busy-wait loop, waiting for 10 milliseconds between
  // dispatching events. Since the thread is usually
  // paused for short periods of time (tens of milliseconds),
  // a more modern signalling method was not used.
  while (firingData->shouldRun()) {
    if (firingData->shouldFire()) {
      HWND target = firingData->getTarget();
      if (IsWindow(target)) {
        SendMessage(firingData->getTarget(),
                    WM_MOUSEMOVE, firingData->getInputDevicesState(),
                    MAKELPARAM(firingData->getXLocation(),
                               firingData->getYLocation()));
      }
    }
    Sleep(10 /* ms */);
  }

  return 0;
}

EventFiringData* EVENT_FIRING_DATA;

void pausePersistentEventsFiring()
{
  if (!gEnablePersistentEventFiring) {
    // Persistent event firing is disabled.
    return;
  }
  if ((hConstantEventsThread != NULL) && (EVENT_FIRING_DATA != NULL)) {
    EVENT_FIRING_DATA->pauseFiring();
    Sleep(10 /* ms */);
  }
}

// Helper method to update the state of a given flag according to a toggle.
static void setStateByFlag(bool shouldSetFlag, UINT flagValue)
{
  if (!gEnablePersistentEventFiring) {
    // Persistent event firing is disabled.
    return;
  }
  if ((hConstantEventsThread == NULL) || (EVENT_FIRING_DATA == NULL)) {
    return;
  }

  WPARAM currentInputState = EVENT_FIRING_DATA->getInputDevicesState();
  if (shouldSetFlag) {
    currentInputState |= flagValue;
  } else {
    currentInputState = currentInputState & (~flagValue);
  }
  EVENT_FIRING_DATA->setInputDevicesState(currentInputState);
}

void updateShiftKeyState(bool isShiftPressed)
{
  setStateByFlag(isShiftPressed, MK_SHIFT);
}

void updateLeftMouseButtonState(bool isButtonPressed)
{
  setStateByFlag(isButtonPressed, MK_LBUTTON);
}

// Creates a new thread if there isn't one up and running.
void resumePersistentEventsFiring(
    HWND inputTo, long toX, long toY, WPARAM buttonValue)
{
  if (!gEnablePersistentEventFiring) {
    // Persistent event firing is disabled.
    return;
  }

  if (hConstantEventsThread == NULL) {
    EVENT_FIRING_DATA = new EventFiringData(inputTo, toX, toY, buttonValue);
    hConstantEventsThread = CreateThread(
        NULL, // Security permissions.
        0, // default stack size.
        MouseEventFiringFunction,
        EVENT_FIRING_DATA,
        0, // default creation flags
        NULL);
  } else {
    EVENT_FIRING_DATA->setNewTarget(inputTo, toX, toY, buttonValue);
    EVENT_FIRING_DATA->resumeFiring();
  }
}

void resumePersistentEventsFiring()
{
  if (!gEnablePersistentEventFiring) {
    // Persistent event firing is disabled.
    return;
  }
  if ((hConstantEventsThread == NULL) || (EVENT_FIRING_DATA == NULL)) {
    return;
  }
  EVENT_FIRING_DATA->resumeFiring();
}

extern "C" {
// Terminates the background thread.
void stopPersistentEventFiring()
{
  if ((hConstantEventsThread != NULL) && (EVENT_FIRING_DATA != NULL)) {
    EVENT_FIRING_DATA->stopRunning();
    WaitForSingleObject(hConstantEventsThread, 2500 /* ms */);
    CloseHandle(hConstantEventsThread);
    hConstantEventsThread = NULL;
    delete EVENT_FIRING_DATA;
    EVENT_FIRING_DATA = NULL;
  }
}

void setEnablePersistentHover(bool enablePersistentHover)
{
  gEnablePersistentEventFiring = enablePersistentHover;
}
}
