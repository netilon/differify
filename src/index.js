/*!
 * Differify v1.0.0
 * http://netilon.com/
 *
 * Copyright 2017 Netilon (Fabian Orue)
 * Released under the MIT license
 *
 * Date: 2017-09-06 16:20 GMT-0300 (ART)
 */

    
    //returnTypes
    var returnTypes = {
        ARRAY: 'array',
        JSON_OBJECT: 'json'
    };
    
    //models
    var valueStatus = {
        'ADDED': 'added',
        'DELETED': 'deleted',
        'MODIFIED': 'modified'
    };
    
    
    var valueData = function(valueA, valueB, status){
        return {
            original: valueA,
            diff: valueB,
            status: status
        };
    }
    
    var propertyData = function (path, property, valueA, valueB, status) {
        return {
            path: (path !== '' && property !== null) ? path + '.' + property : path,
            property: property,
            value: new valueData(valueA, valueB, status)
        }
    }
    
    //type checkers
    function isArray(value) {
        if (Object.prototype.toString.call(value) === '[object Array]') {
            return true;
        }
        return false;
    }

    function isObject(value) {
        if (!isArray(value) && typeof value == 'object') {
            return true;
        }
        return false;
    }

    function isString(value) {
        if (typeof value == 'string') {
            return true;
        }
        return false;
    }

    function isFunction(value) {
        if (typeof value == 'function') {
            return true;
        }
        return false;
    }

    function isDate(value) {
        if (Object.prototype.toString.call(value) == '[object Date]') {
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
    
    function ifNotDefinedGetDefault(object, property, defaultValue){
        return ((isDefined(object[property])) ? object[property] : defaultValue);
    }

    //helper
    function getTypes(){
        return {
            UNDEFINED: 0,
            OBJECT: 1,
            ARRAY: 2,
            STRING: 3,
            NUMBER: 4,
            FUNCTION: 5,
            DATE: 6
        };
    }

    function getTypeOf(value){
        var types = getTypes();
        if(!isDefined(value)){
            return types.UNDEFINED;
        }else if(isString(value)){
            return types.STRING;
        }else if(isArray(value)){
            return types.ARRAY;
        }else if(isDate(value)){
            return types.DATE;
        }else if(isObject(value)){
            return types.OBJECT;
        }else if(isFunction(value)){
            return types.FUNCTION;
        }
        
        return types.NUMBER;
    }

    function clone(obj) {
        if (null == obj || "object" != typeof obj){
            return obj;
        }
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = obj[attr];
        }
        return copy;
    }

    function arrayDiff(arrayA, arrayB, compareEachElement) {
        compareEachElement = compareEachElement || false;
        var map = {};
        var key;
        var ret = [];

        if(!compareEachElement){
            
            if(arrayA.length !== arrayB.length){
                ret.push(valueData(arrayA, arrayB, valueStatus.MODIFIED));
            }else{
                var a = arrayA.toString();
                var b = arrayB.toString();
                if(a!==b){
                    ret.push(valueData(arrayA, arrayB, valueStatus.MODIFIED));
                }
            }
            
            return ret;
        }

        function convertToKey(value) {
            return (isObject(value) ? JSON.stringify(value) : ((isArray(value)) ? value.toString() : value + ''));
        }

        for (var index in arrayA) {
            //inicialmente, pone los elementos del array A como borrados, para luego
            //evaluar su existencia contra los elementos del array B.
            ret[index] = new valueData(arrayA[index], null, valueStatus.DELETED);
            key = convertToKey(arrayA[index]);
            if (map[key] === undefined) {
                //si la clave no esta en el mapa, la agrega indicando el indice
                //donde se encuentra el valor evaluado en el arrayA y cuantas
                //veces fue encontrado.
                map[key] = {index: index, count: 0};
            } else {
                //si la clave se repite, aumenta el contador.
                ++map[key].count;
            }
        }

        index = 0;
        var mappedValue;
        for (index in arrayB) {
            key = convertToKey(arrayB[index]);
            mappedValue = map[key];
            //si el valor no se encuentra en el array A, lo agrega como Nuevo elemento
            //en el array B.
            if (mappedValue === undefined) {
                ret.push(new valueData(null, arrayB[index], valueStatus.ADDED));
            } else if (mappedValue.count === 0) {
                //lo saco del resultado ya que no hay diferencias.
                if (ret[mappedValue.index] !== undefined) {
                    ret.splice(mappedValue.index, 1);
                    delete map[key];
                }

            } else if (mappedValue.count > 0) {
                //si el valor del elemento actual del array B aparece mas de una vez
                //quiere decir que fue agregado, por lo tanto cuenta como diferencia.
                ret.push(new valueData(null, arrayB[index], valueStatus.ADDED));
                --mappedValue.count;
            }
        }

        return ret;
    };

    // @TODO sacar afuera la config, el aggregator y hacerlo en un metodo anterior,
    // y llamar a este con todo ya seteado y normalizado, para evitar que cuando la
    // función se llame recursivamente, se hagan esos chequeos haciendo que baje la
    // performance.
    
    function getDiff (objectA, objectB, config, parent, diffResponse) {
        
        //if it reach the maximun deep, return the result.
        if(config.deep === 0){
            return diffResponse.data;
        }
        var types = getTypes();
        var typeA = getTypeOf(objectA);
        var typeB = getTypeOf(objectB);
        
        //Check if both values are of the same type.
        if(typeA!==typeB){
            diffResponse.aggregator(new propertyData(parent, null, (typeA === types.FUNCTION) ? objectA.toString() : objectA, (typeB === types.FUNCTION) ? objectB.toString() : objectB, valueStatus.MODIFIED));
            return diffResponse.data;
        }else if(typeA === types.OBJECT && typeB === types.OBJECT){
            //esto se usa para chequear que propiedades tiene el objeto B en 
            //comparación con A evitando hacer un loop completo de B.
            var objectBCopy = clone(objectB);

            //si ambos son objetos, recorre sus propiedades.
            for (var property in objectA) {
                if (objectA.hasOwnProperty(property)) {
                    //si la propiedad del objeto A existe en B..
                    if (objectB.hasOwnProperty(property) && objectB[property] !== undefined) {

                        //si está en A entonces elimino la propiedad para que solo queden 
                        //aquellas que A no posee.
                        delete objectBCopy[property];
                        
                        typeA = getTypeOf(objectA[property]);
                        typeB = getTypeOf(objectB[property]);
                        
                        if(typeA !== typeB){
                            diffResponse.aggregator(new propertyData(parent, property, (typeA === types.FUNCTION) ? objectA[property].toString() : objectA[property], (typeB === types.FUNCTION) ? objectB[property].toString() : objectB[property], valueStatus.MODIFIED));
                        }else if (typeA === types.UNDEFINED && typeB === types.UNDEFINED) {
                            if (objectA[property] !== objectB[property]) {
                                diffResponse.aggregator(new propertyData(parent, property, JSON.stringify(objectA[property]), objectB[property], valueStatus.MODIFIED));
                            }
                            continue;
                        } else if (typeA === types.DATE && typeB === types.DATE) {
                            if((objectA[property].getTime() !== objectB[property].getTime())){
                                diffResponse.aggregator(new propertyData(parent, property, objectA[property], objectB[property], valueStatus.MODIFIED));
                            }
                            continue;

                        } else if (typeA === types.ARRAY && typeB === types.ARRAY) {

                            //si ambas son un array
                            var arrayCompareResult = diffResponse.caller.arrayDiff(objectA[property], objectB[property], config.scan.arrays);
                            if(arrayCompareResult.length>0){
                                diffResponse.aggregator(new propertyData(parent, property, objectA[property], arrayCompareResult, valueStatus.MODIFIED));
                            }
                            continue;
                        } else if (typeA === types.OBJECT && typeB === types.OBJECT) {
                            --config.deep;
                            var diff = diffResponse.caller.getDiff(objectA[property], objectB[property],config, parent + '.' + property, diffResponse);
                            if(config.returnType && config.returnType === returnTypes.JSON_OBJECT){
                                diffResponse.data[property] = diff;
                            }else{
                                diffResponse.data = diffResponse.data.concat(diff);
                            }
                            continue;
                        } 
                    } else {
                        //propiedades que existen en A pero no en B.
                        diffResponse.aggregator(new propertyData(parent, property, objectA[property], null, valueStatus.DELETED));
                    }
                }
            }
            property = null;
            for (property in objectBCopy) {
                if (objectB.hasOwnProperty(property)){
                    //todas las propiedades que quedan, son agregadas por el objeto B.
                    diffResponse.aggregator(new propertyData(parent, property, null, objectBCopy[property], valueStatus.ADDED));
                }   
            }
        }else if (typeA === types.DATE && typeB === types.DATE) {
            if((objectA.getTime() !== objectB.getTime())){
                diffResponse.aggregator(new propertyData(parent, property, objectA, objectB, valueStatus.MODIFIED));
            }
        }else if (typeA === types.ARRAY && typeB === types.ARRAY){
            var arrayCompareResult = diffResponse.caller.arrayDiff(objectA, objectB, config.scan.arrays);
            if(arrayCompareResult.length>0){
                diffResponse.aggregator(new propertyData(parent, null, objectA, arrayCompareResult, valueStatus.MODIFIED));
            }
            
        }else{
            //finalmente, si son tipos nativos, los evalua.
            if ((objectA = objectA.toString()) !== (objectB = objectB.toString())) {
                diffResponse.aggregator(new propertyData(parent, null, objectA, objectB, valueStatus.MODIFIED));
            }
        }

        return diffResponse.data;

    }


module.exports = {
    arrayDiff: arrayDiff,
    getDiff: function(objectA, objectB, config){
        if(config){
            config = {
                deep: ifNotDefinedGetDefault(config, 'deep', 3),
                scan: ifNotDefinedGetDefault(config, 'scan', {arrays: true}),
                returnType: ifNotDefinedGetDefault(config, 'returnType', returnTypes.JSON_OBJECT)
            };
        }else{
            //usa la config por default.
            config = {
                deep: 3,
                scan:{
                    arrays: true
                },
                returnType: returnTypes.JSON_OBJECT
            };
        }
        parent = '$root';
        
        var diffResponse = {
            data: null,
            aggregator: null,
            caller: this
        };
        
        if(config.returnType === returnTypes.JSON_OBJECT){
            diffResponse.data = {};
            diffResponse.aggregator = function(data){
                if(data.property!==null){
                    this.data[data.property] = data;
                }else{
                    this.data = data;
                }
            }
        }else{
            diffResponse.data = [];
            diffResponse.aggregator = function(data){
                this.data.push(data);
            }
        }
        
        return getDiff(objectA, objectB, config, parent, diffResponse);
    }
};
