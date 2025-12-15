#!/usr/bin/env bash

gcc -fPIE -g -c -o program.o program.s
gcc -o program program.o 

./program