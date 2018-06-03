/*!
 * Differify v2.0.0
 * http://netilon.com/
 *
 * Copyright 2018 Netilon (Fabian Orue)
 * Released under the MIT license
 *
 * Date: 2018-06-03 02:49 GMT-0300 (ART)
 */

'use strict';

function isArray(value) {
    if (Object.prototype.toString.call(value) === '[object Array]') {
        return true;
    }
    return false;
}

function isObject(value) {
    if (!isArray(value) && (typeof value) === 'object') {
        return true;
    }
    return false;
}

function isString(value) {
    if (typeof value === 'string') {
        return true;
    }
    return false;
}

function isFunction(value) {
    if (typeof value === 'function') {
        return true;
    }
    return false;
}

function isDate(value) {
    if (Object.prototype.toString.call(value) === '[object Date]') {
        return true;
    }

    return false;
}

function isDefined(value) {
    if (value !== undefined && value !== null) {
        return true;
    }

    return false;
}

function ifNotDefinedGetDefault(object, property, defaultValue) {
    return object !== undefined && isDefined(object[property]) ? object[property] : defaultValue;
}


function clone(obj) {
    if (null == obj || "object" != (typeof obj)) {
        return obj;
    }
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr))
            copy[attr] = obj[attr];
    }
    return copy;
}

var returnTypes = {
    ARRAY: 'array',
    JSON_OBJECT: 'json'
};

function Configuration(_config) {
    this.deep = ifNotDefinedGetDefault(_config, 'deep', 3);
    this.scan = ifNotDefinedGetDefault(_config, 'scan', {arrays: true});
    this.returnType = ifNotDefinedGetDefault(_config, 'returnType', returnTypes.JSON_OBJECT);
}

var Differify = function () {
    var config = new Configuration();
    var deepDataCounter = 0;

    var valueStatus = {
        'ADDED': 'added',
        'DELETED': 'deleted',
        'MODIFIED': 'modified'
    };

    var dataTypes = {
        UNDEFINED: 0,
        OBJECT: 1,
        ARRAY: 2,
        STRING: 3,
        NUMBER: 4,
        FUNCTION: 5,
        DATE: 6
    };

    this.setConfig = function (_config) {
        config = new Configuration(_config);
    };


    this.objectDiff = function(a, b, path) {
        var ret = new Response(config.returnType);
        
        if (deepDataCounter <= 0) {
            return ret.getData();
        }
        
        path = getParentPath(path);

        var bCopy = clone(b);
        var typeA = null;
        var typeB = null;

        for (var property in a) {
            if (a.hasOwnProperty(property)) {
                if (b.hasOwnProperty(property) && b[property] !== undefined) {

                    delete bCopy[property];

                    typeA = getTypeOf(a[property]);
                    typeB = getTypeOf(b[property]);

                    if (typeA !== typeB) {
                        //if data types are different.
                        ret.push(propertyData(path, property, typeA === dataTypes.FUNCTION ? a[property].toString() : a[property], typeB === dataTypes.FUNCTION ? b[property].toString() : b[property], valueStatus.MODIFIED), property);
                        
                    } else if (typeA === dataTypes.UNDEFINED && typeB === dataTypes.UNDEFINED) {
                        continue;
                        
                    } else if (typeA === dataTypes.DATE && typeB === dataTypes.DATE) {
                        
                        if (areDateObjectsDifferent(a[property], b[property])) {
                            ret.push(propertyData(path, property, a[property], b[property], valueStatus.MODIFIED), property);
                        }
                        continue;
                        
                    } else if (typeA === dataTypes.ARRAY && typeB === dataTypes.ARRAY) {

                        var arrayCompareResult = this.arrayDiff(a[property], b[property], config.scan.arrays);
                        if (arrayCompareResult.length > 0) {
                            ret.push(propertyData(path, property, a[property], arrayCompareResult, valueStatus.MODIFIED), property);
                        }
                        continue;
                        
                    } else if (typeA === dataTypes.OBJECT && typeB === dataTypes.OBJECT) {
                        
                        --deepDataCounter;
                        ret.concat(this.objectDiff(a[property], b[property], path + '.' + property), property);
                        continue;
                        
                    } else if (typeA === dataTypes.FUNCTION && typeB === dataTypes.FUNCTION) {
                        
                        if (areFunctionsDifferent(a[property], b[property])) {
                            ret.push(propertyData(path, property, a[property].toString(), b[property].toString(), valueStatus.MODIFIED), property);
                        }
                    } else if (a[property] !== b[property]) {
                        //native type evaluation.
                        ret.push(propertyData(path, property, a[property], b[property], valueStatus.MODIFIED), property);
                    }
                } else {
                    ret.push(propertyData(path, property, a[property], null, valueStatus.DELETED), property);
                }
            }
        }
        property = null;
        for (property in bCopy) {
            if (b.hasOwnProperty(property)) {
                ret.push(propertyData(path, property, null, bCopy[property], valueStatus.ADDED), property);
            }
        }

        return ret.getData();
    }

    this.arrayDiff = function (arrayA, arrayB, compareEachElement) {
        compareEachElement = compareEachElement || false;
        var ret = [];

        if (!compareEachElement) {

            if (arrayA.length !== arrayB.length) {
                ret.push(valueData(arrayA, arrayB, valueStatus.MODIFIED));
            } else {
                var a = arrayA.toString();
                var b = arrayB.toString();
                if (a !== b) {
                    ret.push(valueData(arrayA, arrayB, valueStatus.MODIFIED));
                }
            }

            return ret;
        }

        var AisMajorThanB = arrayA.length - arrayB.length;
        var loop = AisMajorThanB < 0 ? arrayA.length : arrayB.length;

        for (var i = 0; i < loop; ++i) {

            if (isObject(arrayA[i]) && isObject(arrayB[i])) {
                var _a = JSON.stringify(arrayA[i]);
                var _b = JSON.stringify(arrayB[i]);
                if (_a !== _b) {
                    ret.push(valueData(_a, _b, valueStatus.MODIFIED));
                }
            } else if (arrayA[i] !== arrayB[i]) {
                ret.push(valueData(arrayA[i], arrayB[i], valueStatus.MODIFIED));
            }
        }

        if (AisMajorThanB > 0) {
            for (i = i; i < arrayA.length; ++i) {
                ret.push(valueData(arrayA[i], null, valueStatus.DELETED));
            }
        } else if (AisMajorThanB < 0) {
            for (i = i; i < arrayB.length; ++i) {
                ret.push(valueData(null, arrayB[i], valueStatus.ADDED));
            }
        }
        return ret;
    }

    function areDateObjectsDifferent(a, b) {
        if (a.getTime() !== b.getTime()) {
            return true;
        }
        return false;
    }

    function areFunctionsDifferent(a, b) {
        a = a.toString();
        b = b.toString();
        if (a !== b) {
            return true;
        }
        return false;
    }
    

    this.getDiff = function (a, b) {
        
        var ret = new Response(config.returnType);
        deepDataCounter = config.deep;
        

        var typeA = getTypeOf(a);
        var typeB = getTypeOf(b);

        var path = '$root';
        
        if (typeA !== typeB) {
            ret.push(propertyData(path, null, typeA === types.FUNCTION ? a.toString() : a, typeB === types.FUNCTION ? b.toString() : b, valueStatus.MODIFIED), path);
            return ret;
        } else if (typeA === dataTypes.OBJECT && typeB === dataTypes.OBJECT) {
            ret.concat(this.objectDiff(a,b,path));
        } else if (typeA === dataTypes.DATE && typeB === dataTypes.DATE) {
            if (areDateObjectsDifferent(a, b)) {
                ret.push(propertyData(path, property, a, b, valueStatus.MODIFIED), path);
            }
        } else if (typeA === dataTypes.ARRAY && typeB === dataTypes.ARRAY) {
            var arrayCompareResult = this.arrayDiff(a, b, config.scan.arrays);
            if (arrayCompareResult.length > 0) {
                ret.push(propertyData(path, null, a, arrayCompareResult, valueStatus.MODIFIED), path);
            }
        } else {
            if ((a = a.toString()) !== (b = b.toString())) {
                ret.push(propertyData(path, null, a, b, valueStatus.MODIFIED), path);
            }
        }
        
        return ret.getData();
    }


    //Helpers

    function getParentPath(parent) {
        return ((typeof parent === 'string' && parent.trim() !== '') ? parent : '$root');
    }

    function getTypeOf(value) {

        if (!isDefined(value)) {
            return dataTypes.UNDEFINED;
        } else if (isString(value)) {
            return dataTypes.STRING;
        } else if (isArray(value)) {
            return dataTypes.ARRAY;
        } else if (isDate(value)) {
            return dataTypes.DATE;
        } else if (isObject(value)) {
            return dataTypes.OBJECT;
        } else if (isFunction(value)) {
            return dataTypes.FUNCTION;
        }

        return dataTypes.NUMBER;
    }
    
    function Response(format){
        var data = null;
        this.push = null;
        this.clear = null;
        this.concat = null;
        
        if(format === returnTypes.JSON_OBJECT){
            data = {};
            this.push = function push(_data, propertyName){
                data[propertyName] = _data;
            };
            this.clear = function clear(){
                data = {};
            };
            
            this.concat = function concat(response, property){
                if(property===undefined){
                    data = Object.assign(data, response);
                }else{
                    data[property] = response;
                }
            };
        }else{
            
            data = [];
            this.push = function push(_data, propertyName){
                data.push(_data);
            };
            this.clear = function clear(){
                data = [];
            };
            
            this.concat = function concat(response, property){
                data = data.concat(response);
            };
        }
        
        this.clear();
        
        this.getData = function(){
            return data;
        }
    }

    function valueData(valueA, valueB, status) {
        return {
            original: valueA,
            diff: valueB,
            status: status
        };
    };

    function propertyData(path, property, valueA, valueB, status) {
        return {
            path: path !== '' && property !== null ? path + '.' + property : path,
            property: property,
            value: valueData(valueA, valueB, status)
        };
    };
}



module.exports = new Differify();