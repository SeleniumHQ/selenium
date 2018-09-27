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

Author: timothe@google.com
*/

#ifndef WINAPIHANDLER_H_
#define WINAPIHANDLER_H_

#include <vector>
#include <string>
#include <utility>

#include <windows.h>

#include "imehandler.h"



// a pair representing an entry as written in the windows registry:
// HKL <-> Keyboard layout name
typedef std::pair<std::string, std::string> keyboard_layout;

class WinapiHandler : public ImeHandler {
 public:
  WinapiHandler();
  virtual ~WinapiHandler() {}
  virtual std::string GetToggleKeys() const;
  virtual std::vector<std::string> GetLoadedEngines() const;
  virtual std::vector<std::string> GetAvailableEngines() const;
  virtual std::string GetNextEngineKeys() const;
  virtual std::string GetActiveEngine() const;
  virtual bool IsActivated() const;
  virtual void Deactivate();
  virtual int LoadEngines(const std::vector<std::string>& engines);
  virtual bool ActivateEngine(const std::string& engine);

  // The following is specific to this handler's implementation.
  std::string GetSwitchingKeysForEngine(std::string engine);

 protected:
  std::vector<keyboard_layout> keyboard_layouts;

  /* 
   * Converts from HKL hexadecimal strings to human readable
   * names and vice versa.
   */
  std::string GetLayoutName(std::string hkl) const;
  std::string GetLayoutHkl(const std::string& name) const;
  unsigned int GetHKLFromString(const std::string &) const;
  /* 
   * Reads the registry and loads all the available layouts
   * and engines.
   */
  void LoadAvailableLayouts();
  /*
   * Return the key modifiersÅ@for the DWORD value usually
   * taken as written in the registry.
   */
  std::string GetModifiers(DWORD value);
};

#endif  // WINAPIHANDLER_H_
