#!/bin/bash

# print usage information
if [ $# -lt 1 ]; then
    echo >&2 "usage: $0 prefix [-i inputSuffix -n -sandbox]"    
    exit 1
fi 

# use the directory that the script was called from, to be robust to changes in directory
# structure of the mturk-utils and hits directories
DIR="${PWD}"

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

echo ""
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
echo "Writing output files with prefix"
echo "  $output"

# run the CLT command.
loadCommand="./loadHITs.sh -label $DIR/$output -question $DIR/$question -properties $DIR/$properties -input $DIR/$input $additionalFlags $@ > $DIR/$output.log"
$dryrun $loadCommand

cd $DIR

# show the output log.
$dryrun cat $output.log

# link the newly created output files to a stable symbolic link (prefix-LATEST.*)
echo ""
echo "Linking -LATEST success and log files..."
$dryrun ln -fs $output.success $prefix$sandbox-LATEST.success
$dryrun ln -fs $output.log $prefix$sandbox-LATEST.log

# concatenate all success/input files together, stripping off header if the -ALL file already exists.

echo ""
if [ ! -f $prefix$sandbox-ALL.success ]
then
    echo "Appending to existing .success file $prefix$sandbox-ALL.success..."
    successCatCommand="cat $output.success > $prefix$sandbox-ALL.success"
else
    echo "Creating new -ALL.success file for this prefix: $prefix$sandbox-ALL.success..."
    successCatCommand="tail -n+2 $output.success >> $prefix$sandbox-ALL.success"
fi
$dryrun $successCatCommand

echo ""
if [ ! -f $prefix$sandbox-ALL.input ]
then
    echo "Appending to existing .input file $prefix$sandbox-ALL.input..."
    inputCatCommand="cat $input > $prefix$sandbox-ALL.input"
else
    echo "Creating new -ALL.input file for this prefix: $prefix$sandbox-ALL.input..."
    inputCatCommand="tail -n+2 $intput >> $prefix$sandbox-ALL.input"
fi
$dryrun $inputCatCommand

echo ""