#!/bin/bash

PID=$(ps -ef | grep 'websocket-' | grep -v grep | awk '{print $2}')
if [[ ! -z $PID ]]; then
    echo 'Try to close old server id: '${PID}
fi
[[ ! -z $PID ]] && kill -9 ${PID}

FILE_JAR=$(ls | grep 'websocket-' | awk '{print $1}')
if [[ -z $FILE_JAR ]]; then
    echo 'Can not find websocket file!'
else
    echo 'Ready to start '${FILE_JAR}
    nohup java -jar ./${FILE_JAR} --spring.profiles.active=prod &
fi
