#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pymongo


# Connection to Mongo DB
try:
    conn=pymongo.MongoClient()
    print "Connected successfully!!!"
except pymongo.errors.ConnectionFailure, e:
   print "Could not connect to MongoDB: %s" % e
conn
db = conn.husmorapp


collection_users = db.users
query_all_users = collection_users.find()

collection_done_tasks = db.done_tasks
query_all_done_tasks = collection_done_tasks.find().sort(u'date', -1)

print "------------------------------------------------------------------------"
print "Listing all usernames: "
for k in query_all_users:
    print "Navn: " + k[u'name'] + "     " + "Email: " + k[u'email'] + "   " + "Points: " + str(k['points'])
print "-------------"
print "Last 5 task added: "
for s in query_all_done_tasks[0:5]:
    print s[u'date']
print "------------------------------------------------------------------------"
