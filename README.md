## Differify

## Synopsis

Differify allow you to get the difference between two entities (objects, arrays, variables, functions, native types, etc) in a friendly JSON or Array format.

## Your contribution is appreciated (thanks!)
[![alt text](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif "thanks for contribute!")](https://paypal.me/netilon)

-------------

## Installation

npm install @netilon/differify --save

## Tests

npm run test

## Config

You can pass a config to the setConfig() method to customize the response.

key | values | description
--- | --- | ---
*deep* | int | is the quantity of nested objects that will be checked  by Differify when you call getDiff() method.
*scan.arrays* | boolean | if true, Differify will check for differences in each array element. If false, only will check the array length and will do a toString() comparission.
*returnType* | string | is the getDiff() method response format. Accepted options are the strings 'array' or 'json'.

Configuration example: 
    
    const differify = require('./node_modules/@netilon/differify/src/differify.min');
    
    //You can set the config once and use getDiff() method every time you want.
    //If you need to change some options, just call setConfig() method again after
    //the getDiff() method call.

    differify.setConfig({deep: 3,scan: {arrays: true}, returnType: 'json'});
    
    //Here we get the result of this comparission in JSON format.
    var diff = differify.getDiff(a, b);

if you dont specify any configuration, the default options are the following:

    {
        deep: 3,
        scan: {
                arrays: true
        },
        returnType: 'json'
    }

## Methods

**Method:**
setConfig(*object*);

**Description:** Set the configuration options that will be applied when getDiff() method is called.

**Params:**
Configuration Object (se above in Config section).

----------
**Method:**
getDiff(*object|array|int|float|string|function*, *object|array|int|float|string|function*);

**Description:** Return the difference between two entities (Objects, native data types, Array, etc).

**Params:**
Both parameters indicate the entities to be compared.

----------
**Method:**
arrayDiff(*array* ,  *array*,  *boolean* );

**Description:** Return the difference between two entities (Objects, native data types, etc).

**Params:**
The first two parameters are the arrays to compare. The last one, indicates if the method should check each element in the arrays or if only do a simple check of the length and a toString() comparission.

## Code Example
Check how Differify compare the entities in a simple way and in the format that you preffer.
        
        const differify = require('./node_modules/@netilon/differify/src/differify.min');
        
        var model = function () {
        return{
            name: '',
            age: 0,
            friends: [],
            extras: {
                hobbies: []
            },
            date: null
            };
        };

        var a = model();
        a.name = 'Fabian';
        a.age = 34;
        a.friends = ['pepe', 'rodolfo'];
        a.extras.hobbies = ['Futbol', 'Programming'];
        a.date = new Date('12/15/1983 12:00:00');

        var b = model();
        b.name = 'Judith';
        b.age = 31;
        b.friends = ['flor','cecilia'];
        b.extras.hobbies = ['Gym'];
        b.date = new Date('11/27/1986 12:00:00');
        
        console.log(JSON.stringify(differify.getDiff(a,b)));
    
        //OUTPUT (if returnType config property is set to 'json')
        {
            "name": {
                "path": "$root.name",
                "property": "name",
                "value": {
                    "original": "Fabian",
                    "diff": "Judith",
                    "status": "modified"
                }
            },
            "age": {
                "path": "$root.age",
                "property": "age",
                "value": {
                    "original": 34,
                    "diff": 31,
                    "status": "modified"
                }
            },
            "friends": {
                "path": "$root.friends",
                "property": "friends",
                "value": {
                    "original": ["pepe", "rodolfo"],
                    "diff": [{
                        "original": "pepe",
                        "diff": "flor",
                        "status": "modified"
                    }, {
                        "original": "rodolfo",
                        "diff": "cecilia",
                        "status": "modified"
                    }],
                    "status": "modified"
                }
            },
            "extras": {
                "hobbies": {
                    "path": "$root.extras.hobbies",
                    "property": "hobbies",
                    "value": {
                        "original": ["Futbol", "Programming"],
                        "diff": [{
                            "original": "Futbol",
                            "diff": "Gym",
                            "status": "modified"
                        }, {
                            "original": "Programming",
                            "diff": null,
                            "status": "deleted"
                        }],
                        "status": "modified"
                    }
                }
            },
            "date": {
                "path": "$root.date",
                "property": "date",
                "value": {
                    "original": "1983-12-15T15:00:00.000Z",
                    "diff": "1986-11-27T15:00:00.000Z",
                    "status": "modified"
                }
            }
        }
    
    //OUTPUT (if returnType config property is set to 'array')
    
    [{
	"path": "$root.name",
	"property": "name",
	"value": {
		"original": "Fabian",
		"diff": "Judith",
		"status": "modified"
	}
    }, {
            "path": "$root.age",
            "property": "age",
            "value": {
                    "original": 34,
                    "diff": 31,
                    "status": "modified"
            }
    }, {
	"path": "$root.friends",
	"property": "friends",
	"value": {
		"original": ["pepe", "rodolfo"],
		"diff": [{
			"original": "pepe",
			"diff": "flor",
			"status": "modified"
		}, {
			"original": "rodolfo",
			"diff": "cecilia",
			"status": "modified"
		}],
		"status": "modified"
	}
        }, {
                "path": "$root.extras.hobbies",
                "property": "hobbies",
                "value": {
                        "original": ["Futbol", "Programming"],
                        "diff": [{
                                "original": "Futbol",
                                "diff": "Gym",
                                "status": "modified"
                        }, {
                                "original": "Programming",
                                "diff": null,
                                "status": "deleted"
                        }],
                        "status": "modified"
                }
        }, {
                "path": "$root.date",
                "property": "date",
                "value": {
                        "original": "1983-12-15T15:00:00.000Z",
                        "diff": "1986-11-27T15:00:00.000Z",
                        "status": "modified"
                }
        }]

## License

Copyright 2018 Netilon (Fabian Orue)
http://netilon.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


***


