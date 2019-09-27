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

#include "winapihandler.h"

/*
#ifdef _MSC_VER
#include "stdafx.h"
#endif
*/

#include <Objbase.h>
#include <Msctf.h>
#include <Windows.h>

#include <sstream>
#include <iostream>
#include <algorithm>
#include <iomanip>

// Windows registry constants.
#define MAX_KEY_LENGTH 255
#define MAX_VALUE_NAME 16383
#define MAX_LAYOUT_NAME_LENGTH 255

WinapiHandler::WinapiHandler() {
  // Open the registry and load the lookup table for available layouts.
  LoadAvailableLayouts();
}

std::string WinapiHandler::GetLayoutName(std::string hkl) const {
  std::string name = "";
  std::vector<keyboard_layout>::const_iterator it = keyboard_layouts.begin();
  // First we look for existing entries without change.
  while (it != keyboard_layouts.end() && (it->first != hkl)) { it++; }
  if (it != keyboard_layouts.end()) {
    name = it->second;
  } else {
    // If we didn't find it, then look if the name must be changed.
    // For instance 04090409 is loaded as 00000409 (US).
    if (hkl.find("0000") != 0) {
      hkl = "0000"+hkl.substr(4);
      it = keyboard_layouts.begin();
      while (it != keyboard_layouts.end() && (it->first != hkl)) { it++; }
      if (it != keyboard_layouts.end()) {
        name = it->second;
      }
    }
  }
  return name;
}

std::string WinapiHandler::GetLayoutHkl(const std::string& name) const {
  std::string hkl = "";
  std::vector<keyboard_layout>::const_iterator it = keyboard_layouts.begin();
  while (it != keyboard_layouts.end() && (it->second != name)) { it++; }
  if (it != keyboard_layouts.end()) {
    hkl = it->first;
  }
  return hkl;
}

void WinapiHandler::LoadAvailableLayouts() {
  HKEY key;
  if (RegOpenKeyEx(HKEY_LOCAL_MACHINE,
      TEXT("SYSTEM\\CurrentControlSet\\Control\\Keyboard Layouts"),
      0, KEY_ENUMERATE_SUB_KEYS|KEY_QUERY_VALUE, &key) == ERROR_SUCCESS) {
    TCHAR hkl_string[MAX_KEY_LENGTH];           // Buffer for subkey name.
    DWORD key_name_size;                        // Size of name string.
    DWORD nb_subkeys = 0;                       // Number of subkeys (layouts).
    TCHAR layout_name[MAX_LAYOUT_NAME_LENGTH];  // Buffer for layout name.

    DWORD ret_code;
    // Get the number of layouts.
    ret_code = RegQueryInfoKey(key,           // Key handle.
                              NULL,           // Buffer for class name.
                              NULL,           // Size of class string.
                              NULL,           // Reserved.
                              &nb_subkeys,    // Number of subkeys.
                              NULL,           // Longest subkey size.
                              NULL,           // Longest class string.
                              NULL,           // Number of values for this key.
                              NULL,           // Longest value name.
                              NULL,           // Longest value data.
                              NULL,           // Security descriptor.
                              NULL);          // Last write time.

    if (ret_code == ERROR_SUCCESS) {
      // Enumerate the subkeys, until RegEnumKeyEx fails.
      if (nb_subkeys > 0) {
        keyboard_layouts.clear();
        keyboard_layouts.reserve(nb_subkeys);

        for (unsigned int i = 0; i < nb_subkeys; i++) {
          key_name_size = MAX_KEY_LENGTH;
          ret_code = RegEnumKeyEx(key, i, hkl_string, &key_name_size,
                                  NULL, NULL, NULL, NULL);
          if (ret_code == ERROR_SUCCESS) {
            DWORD nb_bytes = sizeof(layout_name);
            if (RegGetValue(key, hkl_string, "Layout Text", RRF_RT_ANY, NULL,
                           &layout_name, &nb_bytes) == ERROR_SUCCESS) {
              keyboard_layout k = keyboard_layout(hkl_string, layout_name);
              keyboard_layouts.push_back(k);
            } else {
              std::cerr << "error getting key modifiers" << std::endl;
            }
          }
        }
      }
    RegCloseKey(key);
    } else {
      std::cerr << "could not access the registry" << std::endl;
    }
  }
}

/*
 * Returns the name of the engine currently active.
 */
std::string WinapiHandler::GetActiveEngine() const {
  char * keyboard_name = new char[KL_NAMELENGTH];
  GetKeyboardLayoutName(keyboard_name);
  std::string engine_name = GetLayoutName(keyboard_name);
  delete keyboard_name;
  return engine_name;
}

// http://msdn.microsoft.com/en-us/library/ms927178.aspx
std::string WinapiHandler::GetToggleKeys() const {
  return "";
}

bool WinapiHandler::IsActivated() const {
  return true;
}

/*
 * Activates the first input among the loaded ones.
 */
void WinapiHandler::Deactivate() {
  std::vector<std::string> engines = GetLoadedEngines();
  if (engines.size() > 0) {
    ActivateEngine(engines[0]);
  } else {
    std::cerr << "No default engine could be activated" << std::endl;
  }
}

/*
 * Return the key combination as written in the list that enables
 * the selection of such keys on the control panel.
 */
std::string WinapiHandler::GetNextEngineKeys() const {
  std::string keys = "";
  HKEY key;
	if(RegOpenKeyEx(HKEY_CURRENT_USER, TEXT("Keyboard Layout"), 0,
        KEY_QUERY_VALUE, &key) == ERROR_SUCCESS) {
      char val[2];
      DWORD nb_bytes = sizeof(val);
      if(RegGetValue(key, "Toggle", "Hotkey", RRF_RT_REG_SZ, NULL, &val,
            &nb_bytes)  == ERROR_SUCCESS) {
        switch (atoi(val)) {
          case 1:
            keys = "LEFT ALT+SHIFT";
            break;
          case 2:
            keys = "CTRL+SHIFT";
            break;
          case 3:
            keys = "NOT ASSIGNED";
            break;
          case 4:
            keys = "GRAVE ACCENT";
            break;
        }
      }
      RegCloseKey(key);
    }
  return keys;
}

/*
 * Returns the HKL of loaded engines.
 * see http://msdn.microsoft.com/en-us/goglobal/bb688135.aspx
 * see http://blogs.msdn.com/b/michkap/archive/2004/12/16/318271.aspx
 */
std::vector<std::string> WinapiHandler::GetLoadedEngines() const {
  std::vector<std::string> loaded_engines;
  int nb_keyboards = GetKeyboardLayoutList(0, 0);
  HKL* keyboards = new HKL[nb_keyboards];
  GetKeyboardLayoutList(nb_keyboards, keyboards);
  std::stringstream ss;
  for (int i = 0 ; i < nb_keyboards ; i++) {
    ss << keyboards[i];
    std::string keyboard_name = ss.str();
    // On x64 machines 8 useless characters are included...
    // TODO(timothe): fix that at compile time instead of the "if" here.
    if ( keyboard_name.size() > 8 ) {
      keyboard_name = keyboard_name.substr(8);
    }
    loaded_engines.push_back(GetLayoutName(keyboard_name));
    // Reset the string stream.
    ss.str("");
  }
  delete keyboards;
  return loaded_engines;
}

std::vector<std::string> WinapiHandler::GetAvailableEngines() const {
  std::vector<std::string> available_engines;
  available_engines.reserve(keyboard_layouts.size());
  for(std::vector<keyboard_layout>::const_iterator it =
      keyboard_layouts.begin() ; it != keyboard_layouts.end() ; it++) {
    available_engines.push_back(it->second);
  }
  return available_engines;
}

int WinapiHandler::LoadEngines(const std::vector<std::string>& engine_names) {
  int nb_loaded_engines = 0;
  if (!engine_names.empty()) {
    // First we get the currently loaded engines, to unload the unused
    // ones afterwards.
    std::vector<std::string> loaded_engines = GetLoadedEngines();

    // Then we load the new ones, for now it is the same as activating them
    for (std::vector<std::string>::const_iterator it = engine_names.begin() ;
         it != engine_names.end() ; it++) {
      // std::cout <<"Loading keyboard " << it->c_str() << std::endl;
      // XXX: bug: this never returns NULL as the documentation says...
      if (LoadKeyboardLayout(GetLayoutHkl(*it).c_str(), 0) != NULL) {
        ++nb_loaded_engines;
      }
    }

    // Then we unload the new ones so that there was always at least one engine
    // active (windows does not accept unloading the engines first, then
    // activate the new ones)
    for (std::vector<std::string>::const_iterator it =
         loaded_engines.begin() ; it != loaded_engines.end() ; it++) {
      if (std::find(engine_names.begin(), engine_names.end(), *it) ==
          engine_names.end()) {
        // We need to activate it to get the HKL...
        ActivateEngine(*it);
        HKL hkl = GetKeyboardLayout(0);
        // And we activate another one to be able to unload it
        ActivateEngine(engine_names[0]);
        if (!UnloadKeyboardLayout(hkl)) {
            std::cerr << "could not unload keyboard layout " << *it;
            std::cerr << std::endl;
        }
      }
    }
  }
  return nb_loaded_engines;
}

bool WinapiHandler::ActivateEngine(const std::string& engine) {
  std::string hkl = GetLayoutHkl(engine);
  if (hkl != "") {
    return LoadKeyboardLayout(hkl.c_str(),
                              KLF_ACTIVATE|KLF_REPLACELANG|KLF_SETFORPROCESS)
         != NULL;
    }
  return false;
}

std::string WinapiHandler::GetModifiers(DWORD value) {
  std::stringstream poss;
  std::stringstream modss;
  //if ((value & MOD_LEFT) != 0 ) {
    //poss << "LEFT";
  //}
  //if ((value & MOD_RIGHT) != 0) {
    //if (!poss.str().empty()) poss << "/";
    //poss << "RIGHT";
  //}

  if ((value & MOD_ALT) != 0) {
    if (!modss.str().empty()) modss << "+";
    modss << "ALT";
  }
  if ((value & MOD_CONTROL) != 0) {
    if(!modss.str().empty()) modss << "+";
    modss << "CTRL";
  }
  if ((value & MOD_SHIFT) != 0) {
    if (!modss.str().empty()) modss << "+";
    modss << "SHIFT";
  }

  if ((value & MOD_ON_KEYUP) != 0) {
    modss << "(ON_KEY_UP)";
  }

  if ((value & MOD_IGNORE_ALL_MODIFIER) != 0) {
    modss << "(MOD_IGNORE_ALL_MODIFIER)";
  }

  std::string pos = poss.str();
  std::string mods = modss.str();
  return pos+mods;
}
 
std::string WinapiHandler::GetSwitchingKeysForEngine(std::string engine) {
  std::string keys = "";
  HKEY key;
  if (RegOpenKeyEx(HKEY_CURRENT_USER,
                   TEXT("Control Panel\\Input Method\\Hot Keys"),
                   0,
                   KEY_ENUMERATE_SUB_KEYS|KEY_QUERY_VALUE, &key)
        ==ERROR_SUCCESS) {
    TCHAR subkey_buffer[MAX_KEY_LENGTH];
    DWORD subname_size = 0;
    DWORD nb_subkeys = 0;
 
    // Get the class name and the value count. 
    if (RegQueryInfoKey(key,           // key handle 
                        NULL,           // buffer for class name 
                        NULL,           // size of class string 
                        NULL,           // reserved 
                        &nb_subkeys,      // number of subkeys 
                        NULL,           // longest subkey size 
                        NULL,           // longest class string 
                        NULL,           // number of values for this key 
                        NULL,           // longest value name 
                        NULL,			// longest value data 
                        NULL,			// security descriptor 
                        NULL) // last write time 
        == ERROR_SUCCESS) {			
      // Enumerate the subkeys, until RegEnumKeyEx fails.
      if (nb_subkeys > 0) {
        for (unsigned int i = 0; i < nb_subkeys; i++) { 
          subname_size = MAX_KEY_LENGTH;
          if (RegEnumKeyEx(key, i, subkey_buffer, &subname_size,
                                  NULL, NULL, NULL, NULL) == ERROR_SUCCESS) { 
            DWORD modifiers = 0;
            DWORD target_IME = 0;
            DWORD virtual_key = 0;
            DWORD nb_bytes = sizeof(modifiers);
            if (RegGetValue(key, subkey_buffer, "Target IME", RRF_RT_ANY,
                  NULL, &target_IME, &nb_bytes) == ERROR_SUCCESS 
                && (target_IME != 0)) {
              std::stringstream hkl;
              hkl << std::hex << std::setw(8) << std::setfill('0') <<
                target_IME;
              std::string layout_hkl = GetLayoutHkl(engine);
              if (layout_hkl.find("0000") == 0) {
                layout_hkl = layout_hkl.substr(4)+ layout_hkl.substr(4);
              }
              if (hkl.str() == layout_hkl) {
                RegGetValue(key, subkey_buffer, "Key Modifiers", RRF_RT_ANY,
                    NULL, &modifiers, &nb_bytes); 
                RegGetValue(key, subkey_buffer, "Virtual Key", RRF_RT_ANY,
                    NULL, &virtual_key, &nb_bytes); 
                // Reset the string stream to build the resulting string.
                hkl.str("");
                hkl << GetModifiers(modifiers) << "+" <<
                  static_cast<char>(virtual_key);
                keys = hkl.str();
              }
            }
          }
        }
      }
    }
    RegCloseKey(key);
  }
  return keys;
}

/*
  Also look at:
  HWND hWnd = GetForegroundWindow();
  DWORD threadId = GetWindowThreadProcessId(hWnd, NULL);

  unsigned int hkl = 0;
  std::stringstream ss;
  ss << std::hex << jp2;
  ss >> hkl;
  PostMessage(hWnd, WM_INPUTLANGCHANGEREQUEST, 0, hkl);

  But this indices a latency in activating the engines that make the tests
  flacky and fails...
*/ 
