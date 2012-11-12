#!/usr/bin/env python2.7

from __future__ import print_function
import sys, csv, re, datetime, ConfigParser
from boto.mturk.connection import MTurkConnection
from boto.exception import AWSConnectionError, EC2ResponseError


# read in config file, and parse to get list of field-->file mappings and file-->header mappings
# open files, write headers
# for each entry in results file,
#   for each non-empty field specified in config file
#     write to appropriate file

# deal with errors, extending hits, bonuses, and approval
#   use another script (a la bonus_grant.py) to deal with granting bonuses and extending hits...
  
# create an -assignments.csv file with:
#   subject (workerID)
#   assignmentID
#   hitID
#   hittypeID
#   date accepted/submitted
#   errors
#   extended status? (already extended or not)
#   status (reviewed in parseresults)
#   accept (yes or no)
#   bonus (just whether or not a bonus should be granted; it's assumed that if the hit's accepted the bonus will be paid

# If this file already exists, read it in as a dict keyed by assignmentID
# For each line in results,
#   check if this assignment already exists in assignments dict
#     if it does,
#       compare status in results file with assignments file
#         if results=approved and assignments=submitted, set to approved
#         if results=submitted and assignments=approved, something is weird.
#       if necessary, extend HIT
#         if there are errors, and hasn't already been extended (check in assignments file
#     if not, add it
   

if __name__ == '__main__':
    # if wrong number of arguments, print usage info
    if len(sys.argv) < 3:
        print('Usage: {0} <resultsfile> <configfile> [-extendErrors]'.format(__file__))
        sys.exit(1)

    # get file names from command line arguments
    #fnres = 'adapt-09-20-11-Tue-16h20m12s.results'
    fnres = sys.argv[1]
    fn = re.match(r"(.*)\.results", fnres).group(1)
    fncfg = sys.argv[2]

    # get the .input file for this batch of results
    # with open(fn+'.log', 'r') as logfile:
    #     # throw out first line of log file
    #     logfile.readline()
    #     # get local path to .input file
    #     inputfn = re.search(r"hits/(.*\.input)", logfile.read()).group(1)

    print('Opening/initializing files: ')

    ################################################################################
    # parse config file 
    cfg = ConfigParser.SafeConfigParser()
    cfg.read(fncfg)

    exptname = cfg.get('Experiment', 'name')

    # Check whether or not to add assignments on HITs where errors were reported
    # ...in the config file:
    try: 
        replaceErrors = cfg.get('Experiment', 'extendErrors')
    except ConfigParser.NoOptionError:
        replaceErrors = False
    # ...in the command line arguments:
    for args in sys.argv:
        if args == '-extendErrors':
            replaceErrors = True

    # open connection to mturk if hits are going to be extended
    if replaceErrors:
        try:
            print("  Opening MTurk connection...")
            conn = MTurkConnection(is_secure=True)
            print("    success!")
        except AWSConnectionError as reason:
            print("    Connection failed: {0}".format(reason))
            print("    Not extending any hits")
            replaceErrors


    print('  Parsing config file {0} for experiment {1}'.format(fncfg, exptname))

    # get list of field-->file mappings
    ansSects = [(s, cfg.get(s, 'file'), cfg.get(s, 'condition')) for s in cfg.sections() if s != 'FileHeaders' and s != 'Experiment']

    # get list of file-->header mappings
    fnSet = set([ans[1] for ans in ansSects])
    fnHeaders = [(f, cfg.get('FileHeaders', f)) for f in fnSet]

    globalHeader = 'subject,assignmentid,hitid,experiment,accepttime,submittime,condition,errors'

    print('    Files and headers: ')
    for (f, header) in fnHeaders:
        print('      {0}: {1}'.format(f, header))

    ################################################################################
    # parse assignment file, if it exists, and create a dict with assignment IDs as keys
    assignheader = ['workerid', 'assignmentid', 'hitid', 'hittypeid', 'accepttime', 'submittime', 
                    'errors', 'alreadyExtended', 'reviewed', 'accept', 'bonus']
    assignments = {}
    try:
        with open(fn + '-assignments.csv', 'r') as assignfile:
            assignCsv = csv.DictReader(assignfile, assignheader)
            for row in assignCsv:
                assignments[row['assignmentid']] = row
        print("  Assignments file {0} opened.".format(fn+'-assignments.csv'))
    except EnvironmentError:
        print("  Assignments file {0} doesn't exist!".format(fn+'-assignments.csv'))

    #print(assignments)

    ################################################################################
    # open output files and parse the results
    files = dict()
    writers = dict()
    for thisfn, header in fnHeaders:
        files[thisfn] = open('data/' + fn + '-' + thisfn, 'w')
        writers[thisfn] = csv.writer(files[thisfn])
        writers[thisfn].writerow("{0},{1}".format(globalHeader, header).split(','))

    with open(fn+'.results', 'r') as resultsfile, \
        open(fn+'-assignments.csv', 'w') as assignfile:

        print('  Data file opened: {0}'.format(fn+'.results'))

        results = csv.DictReader(resultsfile, delimiter='\t')
        resHeader = results.fieldnames
        # force read of whole results file
        results = list(results)


        #assignmentsw = csv.writer(assignfile)
        #assignmentsw.writerow(assignheader)

        assignmentsw = csv.DictWriter(assignfile, assignheader)
        assignmentsw.writeheader()

        print("Parsing results")

        numErrors = 0
        numExtended = 0

        for row in results:
            subject = row['workerid']
            assignid = row['assignmentid']
            accepttime = row['assignmentaccepttime']
            submittime = row['assignmentsubmittime']
            errors = row['Answer.errors']

            if len(assignid) > 0:
                print("Subject: {0} (accepted: {1}, submited: {2})".format(subject, accepttime, submittime))

                # merge previous assignment information with 
                try:
                    asgn = assignments[assignid]
                    asgn['reviewed'] = row['assignmentstatus']
                except KeyError:
                    asgn = dict(zip(assignheader,
                                    [subject, assignid, row['hitid'], row['hittypeid'],
                                     accepttime, submittime, errors, '',
                                     row['assignmentstatus'], 'yes', 'yes' if len(errors)==0 else '']))

                # parse errors, extending HIT if asked
                if (len(errors) > 0):
                    numErrors += 1
                    print("  Error: {0}".format(errors))
                    if replaceErrors and not asgn['alreadyExtended']:
                        # try to extend the hit
                        try:
                            print("  Extending hit...")
                            conn.extend_hit(row['hitid'], 1)
                            print("  Success")
                            numExtended += 1
                            asgn['alreadyExtended'] = 'yes'
                        except AWSConnectionError as reason:
                            print("  Failure: {0}".format(reason))

                # write assignemtn info back to assignments file
                assignmentsw.writerow(asgn)

                # parse answer sections
                for s, sfn, cond in ansSects:
                    # find sections in row matching section specification
                    sectkeys = [rowkey for rowkey in row.keys() if re.search(s, rowkey)]
                    #print(s, sectkeys)
                    for key in sectkeys:
                        try:
                            sect = row[key]
                            if sect is not None and len(sect) > 0:
                                sect = sect.split(';')
                                print( "  section {3}: writing {0} rows to {1} (condition: {2})".format(len(sect), sfn, cond, key))
                                for r in sect:
                                    if (len(r) > 0):
                                        writers[sfn].writerow('{0},{1},{2},{3},{4},{5},{6},{7},{8}'.format(subject,assignid,row['hitid'],exptname,accepttime,
                                                                                                           submittime,cond,errors,r).split(','))
                        except KeyError:
                            continue

    # Print some summary info
    print("DONE. Check {0}-assignments.csv and run bonus_grant2.py.  Found {1} errors, and extended {2} HITs.".format(fn, numErrors, numExtended))
         
    # cleanup: close output files
    [f.close() for f in files.values()]
""" 
    header = None
    results = []
    errors = []
    with open(fn+'.results', 'r') as resultsfile, \
        open(inputfn, 'r') as inputfile, \
        open(fn+'.success', 'r') as successfile:
        print('Opening/initializing files: ')
        print('  Data file opened: {0}'.format(fn+'.results'))
        print('  Log file opened: {0}'.format(fn+'.log'))

        inputs = csv.DictReader(inputfile, delimiter='\t')
        results = csv.DictReader(resultsfile, delimiter='\t')
        success = csv.DictReader(successfile, delimiter='\t')
        header = results.fieldnames
        results = list(results)

        hitidmap = dict([suc['hitid'], inp] for inp,suc in zip(inputs, success))

        with open('data/' + fn + '.test', 'w') as test_file, \
                 open('data/' + fn + '.calibration', 'w') as calib_file, \
                 open('data/' + fn + '.catch', 'w') as catch_file, \
                 open(fn + '.bonus', 'w') as bonus_file:
            print('  Output file for test data opened: data/{0}.test...'.format(fn))
            test_header = ['subject','creationtime','accepttime','submittime','block','ambiguous','vid','vidfn',
                           'exposures','blockTrial','stim','stimfn',
                           'respcharcode','resp','tstart','tend','rt']
            testw = csv.writer(test_file)
            testw.writerow(test_header)

            print('  Output file for calibratinon data opened: data/{0}.calibration...'.format(fn))
            calib_header = ['subject','err','condition','trial','stim','stimfn',
                            'respcharcode','resp','tstart','tend','rt']
            calw = csv.writer(calib_file)
            calw.writerow(calib_header)

            print('  Output file for catch trial data opened: data/{0}.catch...'.format(fn))
            catch_header = ['subject','block','ambiguous','vid','vidfn',
                            'trials','catchfn','resp']
            catw = csv.writer(catch_file)
            catw.writerow(catch_header)

            bonus_header = ['workerid', 'assignmentid', 'bonus', 'accept', 'reviewed']
            bonw = csv.writer(bonus_file)
            bonw.writerow(bonus_header)

            print('Processing HITs from .results file')
            for row in results:
                subject = row['workerid']

                # get input from hitid-->input mapping generated earlier
                inp = hitidmap[row['hitid']]
                
                # skip HITs that have yet to be completed
                if len(subject)==0:
                    continue
                
                print('  processing subject with workerID={0}, input: {1}//{2}, HIT submitted at {3}' \
                      .format(subject,inp['blockOrder'],inp['respKeys'],row['assignmentsubmittime']))

                # parse calibration data
                calib = row['Answer.calibrationResp'].split(';')[:-1]
                for c in calib:
                    calw.writerow("{0},{1},{2}".format(subject,row['Answer.errors'],c).split(','))

                if len(row['Answer.errors']) > 0:
                    # deal with people who flunked out for some reason
                    print('error!!')
                    errors += [(row,inp)]
                    bonw.writerow([row['workerid'],row['assignmentid'],'','yes',row['assignmentstatus']])
                else:
                    # parse test data
                    test = row['Answer.testResp'].split(';')[:-1]
                    for t in test:
                        testw.writerow("{0},{1},{2},{3},{4}".format(subject,row['creationtime'],
                                                                    row['assignmentaccepttime'],
                                                                    row['assignmentsubmittime'],t).split(','))
                    # parse catch trial data
                    catch = row['Answer.expResp'].split(';')[:-1]
                    for c in catch:
                        catw.writerow("{0},{1}".format(subject,c).split(','))
                    # write subject info to bonus file
                    bonw.writerow([row['workerid'],row['assignmentid'],'yes','yes',row['assignmentstatus']])

            if len(errors) > 0:
                # open existing error file, and read previously parsed/dealt with errors
                try:
                    err_file = open(fn+'.errors', 'r')
                    errread = csv.DictReader(err_file, delimiter='\t')
                    prev_errs = dict([(e['hitid'], e['workerid']), e] for e in errread)
                    err_file.close()
                except IOError:
                    prev_errs = dict()

                # open file for errors, and write information needed for re-do
                # (needs to be formatted like .input files, tab-separated)
                print('Processing errors:')
                print('  Opening file for errors: {0}.errors'.format(fn))
                with open(fn+'.errors', 'w') as err_file:
                    errw = csv.writer(err_file, delimiter='\t')
                    errw.writerow(['blockOrder','respKeys','workerid','hitid','hittypeid','err','status'])
                    for row,inp in errors:
                        try:
                            # old error with status field, copy status
                            prevstatus = prev_errs[(row['hitid'], row['workerid'])]['status']
                        except KeyError:
                            # new error or old error w/ no status field
                            prevstatus = 'new'
                        errw.writerow([inp['blockOrder'],inp['respKeys'],row['workerid'],
                                       row['hitid'],row['hittypeid'],row['Answer.errors'],prevstatus])
                        
    print("All done. NOW GO CHECK DATA AND EDIT {0}.bonus AND RUN bonus_grant.py\n".format(fn))
"""
