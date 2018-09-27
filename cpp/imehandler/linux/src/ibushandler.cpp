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

#include <ibus.h>
#include <gtk/gtk.h>
#include <assert.h>

// Note: should be included after including ibus. because ibus
// typedefs IBusBus rather than declare it as a class, so
// forward declaration is tricky.
#include "ibushandler.h"

#include <string>
#include <vector>
#include <algorithm>



/*
 * Initialize ibus and assures it is connected.
 */
IBusHandler::IBusHandler() : bus_(NULL), ibus_available_(false) {
  const gchar* ibus_address = ibus_get_address();
  // The ibus_available_ field indicates whether ibus is available
  // or not. Attempt to determine this by getting the address of
  // the ibus engine. If it's null then no engine is running.
  if (ibus_address == NULL) {
    ibus_available_ = false;
  } else {
    ibus_init();
    bus_ = ibus_bus_new();
    assert(ibus_bus_is_connected(bus_));
    ibus_available_ = true;
  }
}

IBusHandler::~IBusHandler() {
}

/*
 * Returns the name of the global engine currently set.
 */
std::string IBusHandler::GetActiveEngine() const {
  std::string engine_name = "";

  if (! ibus_available_) {
    return engine_name;
  }

  // Get the descriptor of the current global engine.
  IBusEngineDesc* desc = ibus_bus_get_global_engine(bus_);
  if (desc) {
    // We copy the name of the global engine.
    engine_name = std::string(desc->name);
    g_object_unref(desc);
  }
  return engine_name;
}

/*
 * Get the current input context for the current bus connection.
 */
IBusInputContext* IBusHandler::GetCurrentInputContext() const {
  gchar* context_name = ibus_bus_current_input_context(bus_);
  if (context_name == NULL) {
    // This happens on systems where ibus-gtk integration is not properly
    // installed (most notably with 32-bit Firefox on a 64-bit machine).
    // return NULL context so the library can gracefully return false.
    return NULL;
  }

  IBusConnection* conn = ibus_bus_get_connection(bus_);
  assert(conn != NULL);
  IBusInputContext* context = ibus_input_context_get_input_context(
      context_name, conn);
  // We don't need the context name anymore, we have to release it.
  g_free(context_name);
  return context;
}

/*
 * returns true if IME input is active, false otherwise.
 */
bool IBusHandler::IsActivated() const {
  if (! ibus_available_) {
    return false;
  }

  IBusInputContext* context = GetCurrentInputContext();
  if(context == NULL) {
    return false;
  }

  return ibus_input_context_is_enabled(context);
};

/*
 * Deactivates the current input context, hence switching back to the previous
 * engine before activation.
 */
void IBusHandler::Deactivate() {
  if (! ibus_available_) {
    return;
  }

  IBusInputContext* context = GetCurrentInputContext();
  if(context == NULL) {
    return;
  }

  ibus_input_context_disable(context);
}

/*
 * Returns the names of all the available engines in the system.
 */
std::vector<std::string> IBusHandler::GetAvailableEngines() const {
  std::vector<std::string> loaded_engines;

  if (! ibus_available_) {
    return loaded_engines;
  }

  GList* engines = ibus_bus_list_engines(bus_);
  if (engines == NULL) {
    // No engines available.
    return loaded_engines;
  }

  for (GList* engine = g_list_first(engines); engine != NULL ;
       engine = g_list_next(engine)) {
    IBusEngineDesc* desc = IBUS_ENGINE_DESC (engine->data);
    loaded_engines.push_back(desc->name);
    g_object_unref(desc);
  }

  g_list_free(engines);
  return loaded_engines;
}

/*
 * Returns the names of all the preloaded engines.
 */
std::vector<std::string> IBusHandler::GetInstalledEngines() const {
  std::vector<std::string> installed_engines;

  if (! ibus_available_) {
    return installed_engines;
  }

  GList* engines = ibus_bus_list_active_engines(bus_);
  if (engines == NULL) {
    // No engines available.
    return installed_engines;
  }

  for (GList* engine = g_list_first(engines); engine != NULL ;
       engine = g_list_next(engine)) {
    IBusEngineDesc* desc = IBUS_ENGINE_DESC (engine->data);
    installed_engines.push_back(desc->name);
    g_object_unref(desc);
  }

  g_list_free(engines);
  return installed_engines;
}

/*
 * Sets the engines to be loaded by the ibus daemon, only those set via this
 * method can be then activated.
 * Note that there is a slight delay between the configuration values being set
 * and the actual propagation into the ibus daemon (accessed via bus_ member),
 * so direct call to GetInstalledEngines just after this method could return
 * past results for isntance. A 1 second pause (see tests) is generally enough.
 */
int IBusHandler::LoadEngines(const std::vector<std::string>& engine_names) {
  int nb_loaded_engines = 0;

  if (! ibus_available_) {
    return nb_loaded_engines;
  }

  // We want to avoid strange states where no engines are loaded, hence we
  // simply ignore the call if an empty vector is passed as parameter.
  if (!engine_names.empty()) {
    GValue gvalue = {0};
    g_value_init(&gvalue, G_TYPE_VALUE_ARRAY);
    // TODO: Where is the array freed?
    GValueArray* array = g_value_array_new(engine_names.size());
    std::vector<std::string> available_engines = GetAvailableEngines();
    for (std::vector<std::string>::const_iterator it = engine_names.begin() ;
         it != engine_names.end() ; ++it) {
      // We load the engines only if they are installed on the system.
      if (std::find(available_engines.begin(), available_engines.end(), *it) !=
          available_engines.end()) {
        GValue array_element = {0};
        g_value_init(&array_element, G_TYPE_STRING);
        g_value_set_string(&array_element, it->c_str());
        g_value_array_append(array, &array_element);
        ++nb_loaded_engines;
      }
    }
    // If we made at least one change, then we override the current
    // configuration.
    if (nb_loaded_engines > 0) {
      g_value_take_boxed(&gvalue, array);
      IBusConfig* conf = ibus_bus_get_config(bus_);
      ibus_config_set_value(conf, "general", "preload_engines", &gvalue);
    }
    g_value_unset(&gvalue);
  }
  return nb_loaded_engines;
}

/*
 * Sets the engine designed by its name to be the global engine
 */
bool IBusHandler::ActivateEngine(const std::string& engine_name) {
  if (! ibus_available_) {
    return false;
  }

  bool retval = false;

  std::vector<std::string> available_engines = GetInstalledEngines();
  // We activate only the engines that were preloaded or loaded by a call to
  // LoadEngines before to ensure a valid state of the ibus system.
  if (std::find(available_engines.begin(), available_engines.end(), engine_name)
      != available_engines.end()) {
      retval = ibus_bus_set_global_engine(bus_, engine_name.c_str());
  }

  IBusInputContext* context = GetCurrentInputContext();
  if ((retval) && (context != NULL)) {
    ibus_input_context_enable(context);
  }

  return retval;
}

/* To use the library with dlopen. */
extern "C" {
  ImeHandler* create() {
    return new IBusHandler;
  }

  void destroy(ImeHandler* h) {
    delete h;
  }
}
