#!/bin/sh
cp ${SRCROOT}/project/HTTPResponse.h ${SRCROOT}/project/HTTPConnection.m ${PATCHED_CODE}/
patch -N -d ${PATCHED_CODE} -p1 <${PROJECT_DIR}/extensions/redirect_and_error.patch || true
