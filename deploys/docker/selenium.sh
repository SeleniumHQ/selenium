#!/usr/bin/env bash

export PATH=$PATH:/opt/selenium/bin

mkdir -p ${HOME}/.vnc && x11vnc -storepasswd secret ${HOME}/.vnc/passwd


# Start the underlying X Server
echo "Starting xvfb"

export GEOMETRY="${SCREEN_WIDTH}""x""${SCREEN_HEIGHT}""x""${SCREEN_DEPTH}"

rm -f /tmp/.X*lock

/usr/bin/Xvfb ${DISPLAY} -screen 0 ${GEOMETRY} -dpi ${SCREEN_DPI} -ac +extension RANDR &

# Start the VNC server
X11VNC_OPTS=-usepw

for i in $(seq 1 10)
do
  sleep 1
  xdpyinfo -display ${DISPLAY} >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    break
  fi
  echo "Waiting for X server..."
done

echo "Starting window manager"
fluxbox -display ${DISPLAY} &

echo "Starting vnc server"

# -noxrecord fixes https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=859213 in x11vnc 0.9.13-2
x11vnc ${X11VNC_OPTS} -forever -shared -rfbport 5900 -display ${DISPLAY} -noxrecord &

# Now start the Node

echo /opt/selenium/bin/selenium $@
/opt/selenium/bin/selenium $@
