/*
 * Author: Dave F. Kleinschmidt
 *
 *    Copyright 2012 Dave Kleinschmidt and
 *        the University of Rochester BCS Department
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License version 2.1 as
 *    published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public License
 *    along with this program.
 *    If not, see <http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>.
 *
 */

var $ = require('jquery')
  ;

module.exports = {

    installPB: function(elemID) {
        if ($("#" + elemID + " .pbInner").length == 0) {
            $('#' + elemID).append('<div class="pbInner" style="height: 100%; background-color: #339933; width: 0%"></div>');
            $('#' + elemID + ' .pbInner').attr('prop', '0');
        }
    },

    setPB: function(elemID, proportion) {
        proportion = proportion > 1 ? 1 :
                     proportion < 0 ? 0 :
                     proportion;
        $('#' + elemID + ' .pbInner').attr('prop', proportion);
        this.refreshPB(elemID);
    },

    plusPB: function(elemID, proportion) {
        var eInner = $('#' + elemID + ' .pbInner');
        var eOuter = $('#' + elemID);

        this.setPB(elemID, proportion + parseFloat(eInner.attr('prop')));
        this.refreshPB(elemID);
        
        // var newW = eInner.width() + eOuter.width() * proportion;
        // if (newW < eOuter.width()) {
        //     eInner.width(newW);
        // } else if (newW < 0) {
        //     eInner.width(0);
        // } else {
        //     eInner.width(eOuter.width());
        // }
    },

    minusPB: function(elemID, proportion) {
        this.plusPB(elemID, -proportion);
    },

    resetPB: function(elemID) {
        this.setPB(elemID, 0);
    },

    refreshPB: function(elemID) {
        var prop = parseFloat($('#' + elemID + ' .pbInner').attr('prop'));
        $('#' + elemID + ' .pbInner').width(prop * $('#' + elemID).width());
    },

    getProgressPB: function(elemID) {
        var eInner = $('#' + elemID + ' .pbInner');
        var eOuter = $('#' + elemID);
        //return (eInner.width() / eOuter.width());
        return (eInner.attr('prop'));
    }
};

