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

"""
Calculate the min, max, mean, and median time workers took to do a particular
HIT and what the corresponding hourly rates are
"""

from __future__ import print_function, division
from csv import DictReader
import argparse
from dateutil.parser import parse
import numpy as np

HOUR = 3600

def filter_outliers(arr):
    """
    Given an array, return the array minus outliers, where outliers are those
    values greater than two standard deviations from the mean
    """
    nparr = arr if isinstance(arr, np.ndarray) else np.array(arr)
    twosigup = nparr.mean() + nparr.std() *2
    twosigdown = nparr.mean() - nparr.std() *2

    return [x for x in nparr if (x < twosigup) and (x > twosigdown)]

parser = argparse.ArgumentParser(description='Calculate the min, max, mean, and'
                                              'median time workers took to do a'
                                              'particular HIT and what the'
                                              'corresponding hourly rates are')
parser.add_argument('-resultsfile', required=True, help='(required) Results file to use')
parser.add_argument('-pay', type=float, required=True, help='Pay per HIT')
parser.add_argument('-removeoutliers', required=False, action="store_true",
                    default=False, help='Remove outlier values?')
args = parser.parse_args()

results = []
with open(args.resultsfile, 'r') as resfile:
    results = list(DictReader(resfile, delimiter='\t'))

deltas = []
for row in results:
    delta = parse(row['assignmentsubmittime']) - parse(row['assignmentaccepttime'])
    deltas.append(delta.total_seconds())

if args.removeoutliers:
    deltas = filter_outliers(deltas)

minsubmit = np.min(deltas)
print("\nFastest time: {} seconds".format(minsubmit))
meansubmit = np.mean(deltas)
print("Mean time: {} seconds".format(meansubmit))
medsubmit = np.median(deltas)
print("Median time: {} seconds".format(medsubmit))
maxsubmit = np.max(deltas)
print("Slowest time: {} seconds".format(maxsubmit))

minpay = (HOUR / maxsubmit) * args.pay
print("\nMinimum hourly pay: ${:.2f}".format(minpay))
meanpay = (HOUR / meansubmit) * args.pay
print("Mean hourly pay: ${:.2f}".format(meanpay))
medpay = (HOUR / medsubmit) * args.pay
print("Median hourly pay: ${:.2f}".format(medpay))
maxpay = (HOUR / minsubmit) * args.pay
print("Maximum hourly pay: ${:.2f}".format(maxpay))
