FROM python:3.9

RUN \
  set -x \
  && apt-get update \
  && apt-get install -y net-tools build-essential valgrind

RUN mkdir -p /app
WORKDIR /app

COPY Cargo.toml ./
COPY ./rust ./rust
COPY ./worker ./worker

RUN make -C worker
RUN make clean-pip -C worker
RUN make clean-subprojects -C worker

ENV MEDIASOUP_VERSION 3.9.2

ENTRYPOINT [ "/app/worker/out/Release/mediasoup-worker" ]
