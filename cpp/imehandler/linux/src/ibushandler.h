/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
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

#ifndef IBUSHANDLER_H_
#define IBUSHANDLER_H_


#include <vector>
#include <string>

#include "imehandler.h"

// If ibus.h is not included, provide a forward definition
// for these classes.
#ifndef IBUS_MAJOR_VERSION
class IBusInputContext;
class IBusBus;
#endif

/*
 * Implementation of the IME handler for the linux ibus framework.
 */
class IBusHandler : public ImeHandler {
 public:
  IBusHandler();
  virtual ~IBusHandler();
  virtual std::vector<std::string> GetInstalledEngines() const;
  virtual std::vector<std::string> GetAvailableEngines() const;
  virtual std::string GetActiveEngine() const;
  virtual bool IsActivated() const;
  virtual void Deactivate();
  virtual int LoadEngines(const std::vector<std::string>&);
  virtual bool ActivateEngine(const std::string&);

 private:
  // Methods to factorize common tasks.
  IBusInputContext* GetCurrentInputContext() const;

  // The current connection to the ibus daemon.
  IBusBus* bus_;

  // Is iBus available at all?
  bool ibus_available_;

  DISALLOW_COPY_AND_ASSIGN(IBusHandler);
};


#endif  // IBUSHANDLER_H_
