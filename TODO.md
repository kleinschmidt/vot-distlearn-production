
# For production

* [done] Little app that balances lists
* [done] or browserify middleware on app
* [done] actually use conditions returned by /condition route
* [done] split out lists into a config file
* [done] check for preview in client and don't serve VWB/check for condition
* factor out existing worker checks into separate middleware?
* status dependent
    * [done] add column in db
    * [done] check for status when existing record located
    * [done] add routes for updating status in server
    * send status updates in client
        * [done] started trials
        * [done] abandoned (closed browser/reloaded)
        * [done] submitted
* final tweaks: 
    * check status on preview, too (get condition but don't make block)
        * (just check status based on WORKER id?? prevent repeat takers right there)
    * check status error codes on client side and display informative message
    * [done] set up experiment config file (with lists, and experiment + batch ID)
* actually test the damn thing.
    * [done] debug ending 
    * [done] visworld block (etc.) needs to create a form field for data
    * get running on slate
    * test in sandbox
* deploy
    * add migrations and knexfile info
    * store experiment ID in database
    * clean up db schema?
* improvements:
    * store trials data in database?
        * and notifiation in client to send back json
        * set up trials table
    * use bookshelf instead of direct knex calls
        * autogenerate `created_at` and `updated_at` fields

# Browerifying `js-adapt`

* [done] jquery, modernizer, underscore
* Split out labeling block sub classes
    * ...and check on formerly global variables like resp key mapping
* [done] make sure blocks are creating the form fields for data return.

# Running batches of hits

* batch runner module: 
    * Parse yaml files with hit information
    * Module to post HITs to mturk
        * get creds from boto file?
    * On submit, grant qualification that prevents re-takes (get from yaml)z
        * either get submit from server, or from SQS
    * Once batch is complete, post new batch.


IN THE MEAN TIME: can totally just run some HITs using Andrew's python code!!
