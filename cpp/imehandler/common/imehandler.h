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


#ifndef IMEHANDLER_H_
#define IMEHANDLER_H_

#include <vector>
#include <string>

// A macro to disallow the copy constructor and operator= functions
// This should be used in the private: declarations of all subclasses.
#define DISALLOW_COPY_AND_ASSIGN(TypeName) \
TypeName(const TypeName&);                 \
void operator=(const TypeName&)


/*
 * Abstract class representing a IME handler
 * aka. the base class abstracting interactions for all IME on all systems.
 */
class ImeHandler {
 public:
  virtual ~ImeHandler() {}
  /*
   * Return the currently installed engines in a clear, human readable
   * representation.
   */
  virtual std::vector<std::string> GetInstalledEngines() const = 0;

  /*
   * Return a list of all the available engines on the system.
   */
  virtual std::vector<std::string> GetAvailableEngines() const = 0;

  /*
   * Return a human readable representation of the currently active engine.
   */
  virtual std::string GetActiveEngine() const = 0;

  /*
   * Returns true if a non standard (aka. complex, IME type) input method
   * is currently used.
   */
  virtual bool IsActivated() const = 0;

  /*
   * Switches back to a standard input method.
   */
  virtual void Deactivate() = 0;

  /*
   * Load engines in the system.
   * Returns the number of loaded engines.
   */
  virtual int LoadEngines(const std::vector<std::string>& engines) = 0;

  /*
   * Sets the specified engine to be the one active.
   * Returns true if set correctly, false otherwise.
   */
  virtual bool ActivateEngine(const std::string& engine) = 0;
};

/* To use the library with dlopen. */
typedef ImeHandler* create_h();
typedef void destroy_h(ImeHandler*);

#endif  // IMEHANDLER_H_
