#!/bin/bash

if [ $# -lt 1 ]; then
    echo 'Usage: retrieve.sh fnbase'
    echo '  Retrieve results from HITs in fnbase.success to fnbase.results'
    exit 1
fi

DIR="$( cd "$( dirname "$0" )" && pwd )"

# you must specify the environment variable MTURK_CMD_HOME to point to the
# directory where the AWS MTurk command lines tools have been installd.
# see http://mturk.s3.amazonaws.com/CLT_Tutorial/UserGuide.html
cd $MTURK_CMD_HOME/bin

prefix=$1
shift

while [ $# -gt 0 ]
do
    case "$1" in
        --) shift; break;;          #end of flags
	-*) echo >&2 \
	    echo "usage: $0 prefix [-n] [-i inputSuffix]"
	    exit 1;;
	*)  break;;	# terminate while loop
    esac
    shift
done


# retrieve results to temp file
./getResults.sh -successfile ${DIR}/$prefix.success -outputfile ${DIR}/$prefix.results $@