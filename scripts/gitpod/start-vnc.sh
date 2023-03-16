#!/usr/bin/env bash
#

for i in $(seq 1 10)
do
  sleep 1
  xdpyinfo -display ${DISPLAY} >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    break
  fi
  echo "Waiting for Xvfb..."
done

x11vnc -forever -shared -rfbport ${VNC_PORT} -rfbportv6 ${VNC_PORT} -display ${DISPLAY}
