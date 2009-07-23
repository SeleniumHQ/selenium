#!/bin/sh

gcc mongoose/src/mongoose.c -I"mongoose/src/include" -ldl --shared -o mongoose.so -Wl,-soname,libmongoose -fpic
gcc npwebdriver/src/*.cc -I"npwebdriver/src/include" -I"mongoose/src/include" -I"npwebdriver/src/include/third_party/npapi/" -shared -o npwebdriver.so -Wl,-soname,npwebdriver -fpic -DUNIX
