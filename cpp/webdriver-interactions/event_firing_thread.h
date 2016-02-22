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

#ifndef event_firing_thread_h_
#define event_firing_thread_h_

/**
 * The purpose of background, persistent event firing is to make mouse hovering
 * on Windows work. IE, specifically, would consider the mouse to have moved
 * outside the window if WM_MOUSEMOVE messages are not constantly sent to
 * the window.
 *
 * This is achieved by starting a background thread that keeps firing those
 * messages every 10 ms. Event firing is paused when other mouse actions occur.
 * Additionally, the state of the input devices must be updated so that
 * WM_MOUSEMOVE events sent are consistent with previous actions. This
 * boils down to whether the Shift key is pressed and whether the left
 * mouse button is pressed (for drag-and-drop to work).
 **/
// Start or resume persistent "mouse over" event firing by a
// background thread.
extern void resumePersistentEventsFiring(
    HWND inputTo, long toX, long toY, WPARAM buttonValue);
// Resume without changing the target. Used after pausing evennt
// firing for mouse actions.
extern void resumePersistentEventsFiring();
// Pauses persistent event firing by the background thread.
extern void pausePersistentEventsFiring();
// When the state of the shift key changes, update the background thread
// so that subsequent mouse over events will have the right keyboard state.
extern void updateShiftKeyState(bool isShiftPressed);
// When the left mouse button is pressed, update the background thread.
// Otherwise IE gets confused.
extern void updateLeftMouseButtonState(bool isButtonPressed);
#endif  // event_firing_thread_h_
