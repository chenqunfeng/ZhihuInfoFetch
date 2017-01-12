
var Common = new Object();

Common = {

    /*
     判断是否为空
     @param {object|array|string} s
     */
    isEmpty: function(s) {
        var type = typeof s;
        switch(type) {
            case 'string':
                return '' === s;
            case 'object':
                if (s instanceof Array) {
                    return 0 === s.length;
                } else {
                    if (null === s)
                        return true;
                    else {
                        var i,
                            f = true
                            ;

                        for (i in s) {
                            f = false;
                            break;
                        }

                        return f;
                    }
                }
        }
    },

    /*
     是否为字符串
     @param {string} str
     */
    isString: function(str) {
        return 'string' === typeof str;
    },

    /*
     是否为对象
     @param {object} str
     */
    isObject: function(obj) {
        return 'object' === typeof obj;
    },


    /*
     是否为数组
     @param {array} arr
     */
    isArray: function(arr) {
        return arr instanceof Array;
    }

}

module.exports = Common