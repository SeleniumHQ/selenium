#!/usr/bin/env bash

/home/gitpod/selenium/noVNC/utils/novnc_proxy --listen ${NO_VNC_PORT} --vnc localhost:${VNC_PORT}
