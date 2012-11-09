#!/bin/bash

if [ $# -lt 1 ]; then
    echo >&2 "usage: $0 prefix [-i inputSuffix -n -sandbox]"    
    exit 1
fi 

DIR="$( cd "$( dirname "$0" )" && pwd )"

#cd /Users/dkleinschmidt/code/aws-mturk-clt-1.3.0/bin
cd $MTURK_CMD_HOME/bin

# process command line flags
prefix=$1
shift

optsuffix=
sandbox=
additionalFlags=

question=$prefix.question

while [ $# -gt 0 ]
do
    case "$1" in
	-n) dryrun=echo;;           #dry run mode
        -i) optsuffix=.$2; shift;;  #optional suffix
        -sandbox) sandbox="-SANDBOX"; additionalFlags="$additionalFlags -sandbox";;
        --) shift; break;;          #end of flags
	-*) echo >&2 \
	    "usage: $0 prefix [-n] [-i inputSuffix]"
	    exit 1;;
	*)  break;;	# terminate while loop
    esac
    shift
done

timestamp=`date +%m-%d-%y-%a-%Hh%Mm%Ss`

# if properties file exists that is specific to optsuffix, use it,
# otherwise, use base properties file
if [ -f $DIR/$prefix$optsuffix.properties ]
then
    properties=$prefix$optsuffix.properties
else
    properties=$prefix.properties
fi

# use optsuffix input file if it exists
if [ -f $DIR/$prefix$optsuffix.input ]
then
    input=$prefix$optsuffix.input
else
    input=$prefix.input
fi

assignments=`cat $DIR/$properties | grep assignments`

echo "Loading HITs from $DIR"
echo "  question: $question"
echo "  properties: $properties (per-HIT $assignments)"
echo "  input: $input"

# print input file and ask for confirmation
echo ""
cat $DIR/$input
echo ""
echo "Really load these HITs?  Press Enter to continue..."
read $answer
echo ""

output=${DIR}/$prefix$optsuffix-$timestamp$sandbox

$dryrun ./loadHITs.sh -label $output -question ${DIR}/$question -properties ${DIR}/$properties -input ${DIR}/$input $additionalFlags $@ > $output.log

cat $output.log

# link the newly created output files to a stable symbolic link (prefix-LATEST.*)
ln -fs $output.success $DIR/$prefix$sandbox-LATEST.success
ln -fs $output.log $DIR/$prefix$sandbox-LATEST.log

# concatenate all output/input files together
if [ ! -f $DIR/$prefix$sandbox-ALL.success ]
then
    cat $output.success > $DIR/$prefix$sandbox-ALL.success
else
    tail -n+2 $output.success >> $DIR/$prefix$sandbox-ALL.success
fi

if [ ! -f $DIR/$prefix$sandbox-ALL.input ]
then
    cat $DIR/$input > $DIR/$prefix$sandbox-ALL.input
else
    tail -n+2 $DIR/$intput >> $DIR/$prefix$sandbox-ALL.input
fi

