#Stage 1 - Build

FROM node:lts-slim as build

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git && \
    apt-get install -y make && \
    apt-get install -y pkg-config && \
    apt-get install -y gcc && \
    apt-get install -y build-essential && \
    apt-get install -y libopencv-dev && \
    apt-get install -y python3-pip

RUN pip3 install opencv-python

RUN git clone https://github.com/AlexeyAB/darknet.git

WORKDIR /darknet

RUN sed -i 's/OPENCV=0.*/OPENCV=1/' ./Makefile
RUN sed -i 's/OPENMP=0.*/OPENMP=1/' ./Makefile

RUN make


# Stage 2 - Runtime

FROM node:lts-slim as runtime

RUN apt-get update && \
    apt-get install -y libopencv-dev && \
    apt-get install -y python3-pip

RUN pip3 install opencv-python

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