#Stage 1 - Build

FROM node:lts-slim as build

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git && \
    apt-get install -y make && \
    apt-get install gcc -y && \
    apt-get install build-essential -y

RUN git clone https://github.com/pjreddie/darknet.git

WORKDIR /darknet

RUN make


# Stage 2 - Runtime

FROM node:lts-slim as runtime

WORKDIR /app

RUN wget https://pjreddie.com/media/files/yolov3.weights
RUN wget https://pjreddie.com/media/files/yolov3-tiny.weights

COPY --from=build /darknet/darknet ./
COPY --from=build /darknet/cfg/yolov3.cfg ./cfg/
COPY --from=build /darknet/cfg/yolov3-tiny.cfg ./cfg/
COPY --from=build /darknet/cfg/coco.data ./cfg/
COPY --from=build /darknet/data/coco.names ./data/
COPY --from=build /darknet/data/labels ./data/labels/

COPY . /app

RUN npm install

EXPOSE 3002
VOLUME [ "/data" ]

CMD node index