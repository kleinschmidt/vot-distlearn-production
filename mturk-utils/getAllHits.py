#!/usr/bin/env python

#Author: Andrew Watts
#
#    Copyright 2012 Andrew Watts and
#        the University of Rochester BCS Department
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License version 2.1 as
#    published by the Free Software Foundation.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Lesser General Public License for more details.
#
#    You should have received a copy of the GNU Lesser General Public License
#    along with this program.
#    If not, see <http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>.
#

from __future__ import print_function, division
from boto.mturk.connection import MTurkConnection

#TODO: make a sandbox option

mtc = MTurkConnection(is_secure=True)

all_hits = mtc.get_all_hits()

for h in all_hits:
    print("ID: {}, Title: {}, Available: {}, Completed: {}, Pending: {}".format(h.HITId, h.Title, h.NumberOfAssignmentsAvailable, h.NumberOfAssignmentsCompleted, h.NumberOfAssignmentsPending))

