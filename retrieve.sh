#!/bin/bash

if [ $# -lt 1 ]; then
    echo 'Usage: retrieve.sh fnbase'
    echo '  Retrieve results from HITs in fnbase.success to fnbase.results'
    exit 1
fi

DIR="$( cd "$( dirname "$0" )" && pwd )"

#cd /Users/dkleinschmidt/code/aws-mturk-clt-1.3.0/bin
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
./getResults.sh -successfile ${DIR}/$prefix.success -outputfile ${DIR}/$prefix.results $@ #>> $DIR/$prefix.log
# append contents of temp file to the base file, and cleanup temp file
#cat $DIR/$prefix.results.temp >> $DIR/$prefix.results
#rm $DIR/${1}.results.temp