#ifndef WEBDRIVER_WINDOW_LISTENER_DATA_H_
#define WEBDRIVER_WINDOW_LISTENER_DATA_H_

#include "webkit/glue/plugins/nphostapi.h"

namespace webdriver {

struct WindowListenerData {
 public:
  WindowListenerData() {}
  WindowListenerData(NPP instance, size_t session_id) : instance_(instance),
                                                        session_id_(session_id) {}
  NPP instance_;
  size_t session_id_;
}; //struct WindowListenerData

} //namespace webdriver 

#endif //WEBDRIVER_WINDOW_LISTENER_DATA_H_
