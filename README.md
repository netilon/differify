#Differify

## Synopsis

Return the difference between two entities (objects, arrays, variables, etc) in json or array format.

## Installation

npm install @netilon/differify --save


## Tests

npm test

##Config

You can pass a config to the getDiff method to customize the response.

key | values | description
--- | --- | ---
*deep* | int | indicates quantity of nested objects that should be checked.
*scan.array* | boolean | if true, it will check for differences in each array elements. If false, only check the array length and will do a toString() comparation.
*returnType* | string | indicates the response format. Accepted values are the strings 'array' or 'json'.

Configuration example: 

    var diff = differify.getDiff(a, b, {deep: 3,scan: {arrays: true}, returnType: 'json'});

if you not specify any configuration, the default is:

    {
	    deep: 3,
	    scan: {
		    arrays: true
		},
		returnType: 'json'
	}

##Methods

**Method:**
getDiff(*object|array|int|float|string|function*, *object|array|int|float|string|function*,  *object* );

**Description:** Return the difference between two entities (Objects, native data types, etc).

**Params:**
The first two, indicates the entities to compare. The last one, is the configuration (see *Config* section).

----------
**Method:**
arrayDiff(*array* ,  *array*,  *boolean* );

**Description:** Return the difference between two entities (Objects, native data types, etc).

**Params:**
The first two, are the arrays to compare. The last one, indicates if the method should check each element in the arrays or if only do a simple check of the length and a toString() comparation.

## Code Example

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
    
        //given two objects or values
    
        //Object A
        var a = new model();
        a.name = 'Fabian';
        a.age = 33;
        a.friends = ['pepe', 'rodolfo'];
        a.extras.hobbies = [{color: 'Red'}, {color: 'Green'}];
        a.date = new Date();
    
        //Object B
        var b = new model();
        b.name = function(){ return 'hello';};
        b.age = new Date();
        b.friends = ['carlos','pepe'];
        b.extras.hobbies = ['Walk'];
        b.date = new Date('12/15/1983 12:00:00');
    
        //we can get de difference simply doing that.
        var diff = differify.getDiff(a, b);
    
    
        //OUTPUT (if returnType config prop is 'json')
        {
    	"name": {
    		"path": "$root.name",
    		"property": "name",
    		"value": {
    			"original": "Fabian",
    			"diff": "function (){ return 'hello';}",
    			"status": "modified"
    		}
    	},
    	"age": {
    		"path": "$root.age",
    		"property": "age",
    		"value": {
    			"original": 33,
    			"diff": "2017-08-29T19:26:27.245Z",
    			"status": "modified"
    		}
    	},
    	"friends": {
    		"path": "$root.friends",
    		"property": "friends",
    		"value": {
    			"original": ["pepe", "rodolfo"],
    			"diff": [{
    				"original": "rodolfo",
    				"diff": null,
    				"status": "deleted"
    			}, {
    				"original": null,
    				"diff": "carlos",
    				"status": "added"
    			}],
    			"status": "modified"
    		}
    	},
    	"extras": {
    		"hobbies": {
    			"path": "$root.hobbies",
    			"property": "hobbies",
    			"value": {
    				"original": [{
    					"color": "Red"
    				}, {
    					"color": "Green"
    				}],
    				"diff": [{
    					"original": {
    						"color": "Red"
    					},
    					"diff": null,
    					"status": "deleted"
    				}, {
    					"original": {
    						"color": "Green"
    					},
    					"diff": null,
    					"status": "deleted"
    				}, {
    					"original": null,
    					"diff": "Walk",
    					"status": "added"
    				}],
    				"status": "modified"
    			}
    		}
    	},
    	"date": {
    		"path": "$root.date",
    		"property": "date",
    		"value": {
    			"original": "2017-08-29T19:26:27.245Z",
    			"diff": "1983-12-15T15:00:00.000Z",
    			"status": "modified"
    		}
    	}
    }
    
    //OUTPUT (if returnType config prop is 'array')
    
    [{
    	"path": "$root.name",
    	"property": "name",
    	"value": {
    		"original": "Fabian",
    		"diff": "function (){ return 'hello';}",
    		"status": "modified"
    	}
    }, {
    	"path": "$root.age",
    	"property": "age",
    	"value": {
    		"original": 33,
    		"diff": "2017-08-29T19:31:04.414Z",
    		"status": "modified"
    	}
    }, {
    	"path": "$root.friends",
    	"property": "friends",
    	"value": {
    		"original": ["pepe", "rodolfo"],
    		"diff": [{
    			"original": "rodolfo",
    			"diff": null,
    			"status": "deleted"
    		}, {
    			"original": null,
    			"diff": "carlos",
    			"status": "added"
    		}],
    		"status": "modified"
    	}
    }, {
    	"path": "$root.hobbies",
    	"property": "hobbies",
    	"value": {
    		"original": [{
    			"color": "Red"
    		}, {
    			"color": "Green"
    		}],
    		"diff": [{
    			"original": {
    				"color": "Red"
    			},
    			"diff": null,
    			"status": "deleted"
    		}, {
    			"original": {
    				"color": "Green"
    			},
    			"diff": null,
    			"status": "deleted"
    		}, {
    			"original": null,
    			"diff": "Walk",
    			"status": "added"
    		}],
    		"status": "modified"
    	}
    }, {
    	"path": "$root.date",
    	"property": "date",
    	"value": {
    		"original": "2017-08-29T19:31:04.414Z",
    		"diff": "1983-12-15T15:00:00.000Z",
    		"status": "modified"
    	}
    }]

## License

Copyright 2017 Netilon (Fabian Orue)
https://netilon.com

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


