#ifndef WEBDRIVER_STUBS_H_
#define WEBDRIVER_STUBS_H_

namespace webdriver {

NPError StubNewStream(NPP instance,
                      NPMIMEType type,
                      NPStream *stream,
                      NPBool seekable,
                      uint16 *stype) {
  return NPERR_NO_ERROR;
}

NPError StubDestroyStream(NPP instance,
                          NPStream *stream,
                          NPReason reason) {
  return NPERR_NO_ERROR;
}

void StubStreamAsFile(NPP instance,
                      NPStream* stream,
                      const char *fname) {
}

int32 StubWriteReady(NPP instance, NPStream *stream) {
  return 0;
}

int32 StubWrite(NPP instance,
                NPStream* stream,
                int32 offset, 
                int32 len, 
                void *buf) {
  return -1;
}

void StubPrint(NPP instance, NPPrint *PrintInfo) {
}

int16 StubHandleEvent(NPP instance, void* event) {
  return false;
}

void StubURLNotify(NPP instance,
                   const char *url,
                   NPReason reason, 
                   void *notifyData) {
}

NPError StubSetValue(NPP instance, NPNVariable variable, void *ret_alue) {
  return NPERR_NO_ERROR;
}

}; //namespace webdriver

#endif //WEBDRIVER_STUBS_H
