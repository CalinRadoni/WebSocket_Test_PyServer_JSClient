#!/bin/bash

declare -i venvActivated

# activate the python virtual environment if needed
venvActivated=$(python3 -c 'import sys; print("1" if sys.prefix != sys.base_prefix else "0")')
if [[ $venvActivated == 0 ]]; then
    source ./venv/bin/activate
    printf "Virtual environment activated\n"
fi

trap 'killall' INT

killall() {
    trap '' INT TERM  # ignore INT and TERM while shutting down
    kill -TERM 0      # send TERM signal
    wait
}

python3 -m http.server --bind 127.0.0.1 8000 &
python3 server.py &

cat # wait forever

# deactivate the virtual environment if it was activated by this script
if [[ $venvActivated == 0 ]]; then
    deactivate
    printf "\nVirtual environment deactivated\n"
fi
