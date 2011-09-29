var applyDiff = function(oldStr, diff) {
        if(diff.type==="insert") {
                return oldStr.substring(0,diff.point) + diff.content + oldStr.substring(diff.point, oldStr.length);
        } else if (diff.type==="delete") {
                return oldStr.substring(0,diff.point) + oldStr.substring(diff.point + diff.length , oldStr.length);
        }
}

var makeDiff = function(oldStr, newStr) {
        if (oldStr.length > newStr.length) return makeDel(oldStr,newStr);
        else return makeInsert(oldStr,newStr);
}

var makeDiffList = function(oldStr, newStr) {
        if (oldStr === newStr) return [];
        res = [];
        // i := the number of equal chars at the beginning of the strings
        for(var i = 0 ; i< oldStr.length && i< newStr.length && oldStr[i]===newStr[i] ; i++) {}
        // j := the number of equal chars at the end of the strings
        for(var j = 0 ; j< oldStr.length && j< newStr.length && oldStr[oldStr.length-j-1]===newStr[newStr.length-j-1] ; j++) {}
        if(i+j!==oldStr.length) {
                // Some stuff was deleted from oldStr
                res.push({type:"delete",point:i,length:(oldStr.length-i-j)});
        }
        if(i+j!==newStr.length) {
                // Some stuff was added to newStr
                res.push({type:"insert",point:i,content:newStr.substring(i,newStr.length-j)});
        }
        return res;
}

// Requires that oldStr be the same as newStr, but missing a single contiguous block.
// \exists s1,s2,s3 st oldStr === s1+s3 ^ newStr === s1+s2+s3
var makeInsert = function(oldStr, newStr) {
        var res = {type:"insert", content:""};
        for(var i = 0 ; oldStr[i]===newStr[i] && i<newStr.length ; i++) { }
        res.point = i;
        for( ; oldStr[res.point]!==newStr[i] && i<newStr.length ; i++) {
                res.content+=newStr[i];
        }
        // Assert: newStr.length - oldStr.length === i - res.point
        return res;
}

// Requires that oldStr be the same as newStr, but with one extra char.
// \exists s1,s2,s3 st oldStr === s1+s2+s3 ^ newStr === s1+s3 ^ len(s2)===1
var makeDel = function(oldStr, newStr) {
        var res = {type:"delete", length:1}
        for(var i = 0 ; oldStr[i]===newStr[i] && i<newStr.length ; i++) { }
        res.point = i;
        // Assert: newStr.length - oldStr.length === i - res.point
        return res;
}

// Tells you if two diffs clash footprints
var isClash = function(d1,d2) {
        var d1fp = {start:d1.point, end:d1.point};
        if(d1.type==="delete") d1fp.end+d1fp.length;
        var d2fp = {start:d2.point, end:d2.point};
        if(d2.type==="delete") d2fp.end+d2fp.length;
        if((d1fp.start>=d2fp.start && d1fp.start<= d2fp.end) || 
                        (d1fp.end>=d2fp.start && d1fp.end<= d2fp.end))
                return true;
        return false;
}

var updateAafterB = function(d1,d2) {
        if(d2.type==="delete" && d1.point > d2.point) d1.point-d2.length;
        else if(d2.type==="insert" && d1.point>d2.point) d1.point+=d2.content.length;
}

if(typeof(exports)!=='undefined') {
        exports.applyDiff = applyDiff;
        exports.makeDiff = makeDiff;
        exports.makeInsert = makeInsert;
        exports.makeDel = makeDel;
        exports.isClash = isClash;
        exports.updateAafterB = updateAafterB;
        exports.makeDiffList = makeDiffList;
}
