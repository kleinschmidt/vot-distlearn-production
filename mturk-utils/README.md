These scripts provide a slightly more convenient way of managing experiments on Mechanical Turk than the vanilla Amazon API or command line tools.  If you wish to incorporate these scripts into your own project and keep them up to date, they are hosted in a [separate repository](https://bitbucket.org/dkleinschmidt/mturk-utils).

The shell scripts require that you have Amazon's [MTurk command line tools](http://mturk.s3.amazonaws.com/CLT_Tutorial/UserGuide.html) installed (which can be downloaded [here](http://aws.amazon.com/developertools/694)).  I hope soon to port these to use the Boto package like the python scripts do, but haven't gotten around to it.  The command tools require that your AWS credentials are stored in the $MTURK_CMD_HOME/bin/mturk.properties file.

All python scripts assume that your AWS credentials are in /etc/boto.cfg or ~/.boto files:

    [Credentials]
    aws_access_key_id = <your access key>
    aws_secret_access_key = <your secret key>
