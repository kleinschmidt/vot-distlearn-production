All scripts assume that your AWS credentials are in /etc/boto.cfg or ~/.boto files:

    [Credentials]
    aws_access_key_id = <your access key>
    aws_secret_access_key = <your secret key>

The shell scripts require that you have Amazon's [MTurk command line tools](http://mturk.s3.amazonaws.com/CLT_Tutorial/UserGuide.html) installed.  I hope soon to port these to use the Boto package like the python scripts do, but haven't gotten around to it.
