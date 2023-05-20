# Our images must be for Linux x86_64
FROM --platform=linux/amd64 ubuntu:focal@sha256:3626dff0d616e8ee7065a9ac8c7117e904a4178725385910eeecd7f1872fc12d

ENV DEBIAN_FRONTEND=noninteractive

# Required for a base build of java targets
RUN apt-get -qqy update && \
    apt-get install -qy --no-install-recommends \
      build-essential \
      libcrypt-dev \
      libnet1 \
      libzip-dev \
      linux-libc-dev \
      python3.9 \
      python-is-python3 \
      zip \
      zlib1g && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

# Make sure we have all the runtime libraries needed by Firefox and Chrome (and so also Edge, one hopes)
RUN apt-get update -qqy && \
    apt-get install -y wget gnupg2 && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update -qqy && \
    apt-get -qy install firefox google-chrome-stable && \
    dpkg -r --force-depends firefox google-chrome-stable && \
    apt-get -qy remove wget gnupg2 && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

# Running X Server is a requirement, even if Firefox is running headless
RUN apt-get update -qqy && \
    apt-get install -qy \
      fluxbox \
      libfontconfig \
      libfreetype6 \
      fonts-liberation \
      fonts-ipafont-gothic \
      fonts-wqy-zenhei \
      fonts-tlwg-loma-otf \
      fonts-noto-color-emoji \
      pulseaudio \
      ttf-ubuntu-font-family \
      xfonts-cyrillic \
      xfonts-scalable \
      xvfb && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

COPY start-xvfb.sh /usr/bin/start-xvfb.sh
RUN chmod +x /usr/bin/start-xvfb.sh

RUN useradd -u 108 -ms /bin/bash dev
RUN chmod 777 /
USER dev
WORKDIR /home/dev

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV CC /usr/bin/gcc
ENV DISPLAY :99.0

ENTRYPOINT ["/usr/bin/start-xvfb.sh"]
