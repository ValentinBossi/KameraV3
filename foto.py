#!/usr/bin/env python
#importing the necessary modules
from datetime import datetime
from picamera import PiCamera
import sys

camera = PiCamera()

camera.resolution = (1640,1232)
camera.start_preview()
try:
    while True:
        c = sys.stdin.read(1).lower()
        date = datetime.now().strftime('%Y_%m_%d__%H_%M_%S')
        if c == 'q':
            break
        elif c == 'c':
            camera.capture("bild"+date+".jpg")
            sys.stdout.write("bild"+date+".jpg")
            sys.stdout.flush()

#we detect Ctrl-C then quit the program
except KeyboardInterrupt:
    camera.stop_preview()