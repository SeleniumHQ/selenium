#!/usr/bin/env bash

SCREEN_WIDTH=1920
SCREEN_HEIGHT=1080
SCREEN_DEPTH=24
SCREEN_DPI=300

export GEOMETRY="${SCREEN_WIDTH}""x""${SCREEN_HEIGHT}""x""${SCREEN_DEPTH}"
export DISPLAY=:99.0

rm -f /tmp/.X*lock

xvfb-run --server-num=99 \
  --listen-tcp \
  --server-args="-screen 0 ${GEOMETRY} -fbdir /var/tmp -dpi ${SCREEN_DPI} -listen tcp -noreset -ac +extension RANDR" \
  fluxbox -display :99.0 2&1>/dev/null &

exec $@
