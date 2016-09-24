#!/usr/bin/env python
#importing the necessary modules
from datetime import datetime
from picamera import PiCamera
import sys
import os

camera = PiCamera()

camera.resolution = (1640,1232)
camera.framerate = 30
camera.start_preview(resolution=(1640, 1232))
try:
    while True:
        c = sys.stdin.read(1).lower()
        date = datetime.now().strftime('%Y_%m_%d__%H_%M_%S')
        if c == 'q':
            break;
        elif c == 'r':
            if camera.recording:
                camera.stop_recording()
                os.system("MP4Box -fps 24 -add video.h264 "+"video"+date+".mp4")
                sys.stdout.write("video"+date+".mp4")
                sys.stdout.flush()
            else:
                camera.start_recording('video.h264')

#we detect Ctrl-C then quit the program
except KeyboardInterrupt:
    camera.stop_preview()