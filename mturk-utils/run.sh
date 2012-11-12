#!/bin/bash

# print usage information
if [ $# -lt 1 ]; then
    echo >&2 "usage: $0 prefix [-i inputSuffix -n -sandbox]"    
    exit 1
fi 

# store current directory to convert local to absolute paths and switch back to at end
DIR="$( cd "$( dirname "$0" )" && pwd )"

# you must specify the environment variable MTURK_CMD_HOME to point to the
# directory where the AWS MTurk command lines tools have been installd.
# see http://mturk.s3.amazonaws.com/CLT_Tutorial/UserGuide.html
cd $MTURK_CMD_HOME/bin

# process command line flags
prefix=$1
shift

# optional suffix for sub-experiments (pilots/other conditions/more subject etc.)
optsuffix=
# sandbox flag for filenames
sandbox=
# all flags to pass to mturk script.
additionalFlags=

question=$prefix.question

# parse command line arguments
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

# timestamp each run to ensure uniqueness
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

# get line from properties files specifying number of assignments to print later
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

# concatenate prefix/timestamp/sandbox label into output filename base
output=$prefix$optsuffix-$timestamp$sandbox

# run the CLT command.
$dryrun ./loadHITs.sh -label $DIR$output -question $DIR/$question -properties $DIR/$properties -input $DIR/$input $additionalFlags $@ > $DIR/$output.log

cd $DIR

# show the output log.
cat $output.log

# link the newly created output files to a stable symbolic link (prefix-LATEST.*)
ln -fs $output.success $prefix$sandbox-LATEST.success
ln -fs $output.log $prefix$sandbox-LATEST.log

# concatenate all output/input files together
if [ ! -f $prefix$sandbox-ALL.success ]
then
    cat $output.success > $prefix$sandbox-ALL.success
else
    tail -n+2 $output.success >> $prefix$sandbox-ALL.success
fi

if [ ! -f $prefix$sandbox-ALL.input ]
then
    cat $input > $prefix$sandbox-ALL.input
else
    tail -n+2 $intput >> $prefix$sandbox-ALL.input
fi

