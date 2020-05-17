
## Differify V3 **x2** Faster than V2

![](https://github.com/netilon/differify/blob/v3/assets/logo.svg)

## Synopsis

  

Differify allows you to get the difference between two entities (objects, arrays, dates, functions, numbers, etc) very easy, quickly and in a friendly way.



## Your contribution is appreciated (thanks!)

  

[![alt text](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif 'thanks for contribute!')](https://paypal.me/netilon)

  

---

  

## Installation

  

npm install @netilon/differify

  

## How to use it

  

Compare things with differify is **very simple**!


### **> Compare objects**

![](https://github.com/netilon/differify/blob/v3/assets/how-to-use-differify-object-example.png)

### **> object diff output**

![](https://github.com/netilon/differify/blob/v3/assets/differify-object-output.png)

### **> Compare arrays**

![](https://github.com/netilon/differify/blob/v3/assets/how-to-use-differify-array-example.png)

### **> array diff output**

![](https://github.com/netilon/differify/blob/v3/assets/differify-array-output.png)


### **Simple Structure**
As you can see, there are two different kinds of structures that you can get from compare method call.

1) For objects and arrays **only**, you will get this structure:

	![](https://github.com/netilon/differify/blob/v3/assets/basic-structure-for-objects-arrays.png)
  
	- the `_` property contains the detailed diff information (it's an underscore to improve the readability in complex nested objects property accesses)
	- the `status` property contains the global status of the comparission ('EQUAL', 'MODIFIED', 'DELETED', 'ADDED')
	- the `changes` property is the total changes found when the comparission was performed.
  
2) For anything that `Object.prototype.toString.call()` does NOT return `[object Array]` or `[object Object]` (functions, dates, numbers, etc), you will get this structure:
   
	 ![](https://github.com/netilon/differify/blob/v3/assets/basic-structure-for-values.png)

	 - the `original` property has the **original** value (left parameter in `compare` method).
	 - the `current` property has the **current** value (right parameter in `compare` method).
	 - the `status` property contains the current status of the comparission ('EQUAL', 'MODIFIED', 'DELETED', 'ADDED')
	 - the `changes` property will be 1 or 0 depending if there was a change or not.

# Documentation

## Methods

  

**Method:**

*setConfig(_object_);*

  

**Description:** Set the configuration options that will be applied when compare() method is called.

  

**Params:**

Configuration Object (see the Config section).

  

---

  

**Method:**

*compare(_any_, _any_);*

  

**Description:** Return the difference between two entities.

  

**Params:**

Both parameters indicate the entities to be compared.

  

---

  

## Configuration

  

You can pass a config to the setConfig() method to change the behavior and adjust it to your needs. If you want, you can set it once and use everywhere or change it when you need.


| key | value | default | description
|--|--|--|--|
| _mode.array_  | string | REFERENCE | **DIFF**: it will iterate over each element in the array A, and will compare each element against the element in the same index in the array B.<br><br>**REFERENCE**: just compare the references of each array.<br><br>**STRING**: only will check the array length and will do a toString comparission if necessary. |
| _mode.object_  | string | REFERENCE | **DIFF**: it will iterate over each property in the object A and will compare each value with the same property value in the object B.<br><br>**REFERENCE**:  just compare the references of each object.<br><br>**STRING**: only do a toString comparission. |
| _mode.function_  | string | REFERENCE | **REFERENCE**:  just compare the references of each function.<br><br>**STRING**: only do a toString comparission (useful to compare the function bodies). |

**Configuration example:**

    const Differify = require('@netilon/differify');
    
    differify = new Differify({ mode: { object: 'DIFF', array: 'DIFF' } });
    
    const diff = differify.compare(a, b);

  

if you dont specify any configuration, the default options are the following:

  

    {
	    mode: {
	    array: 'REFERENCE',
	    object: 'REFERENCE',
	    function: 'REFERENCE',
    }


  

## Examples

You have to know that the configuration you provide will change the behavior of the comparators and it will result in different outputs. 

Just play around it and use the configuration that feet your needs.

The following image, **just represents the idea** of what each option does, but **is not** the real implementation:

  

![](https://github.com/netilon/differify/blob/v3/assets/comparators.png)

  

*Eg:*

  

#with the option ***DIFF***:

    const testA = [1,2];
    const testB = [1,3];

  

you will get this output (note that there is a detail for each element in the array A and B):

  

	{
		"_": [{
			"original": 1,
			"current": 1,
			"status": "EQUAL",
			"changes": 0
		}, {
			"original": 2,
			"current": 3,
			"status": "MODIFIED",
			"changes": 1
		}],
		"status": "MODIFIED",
		"changes": 1
	}

  

#with the option ***STRING***:

  

    const testA = [1,2];
    const testB = [1,3];

  

you will get this output (just an string comparission):

  

	{
		// no diff info 
		// (because it's just string comparission)
		"_": null, 
		"status": "MODIFIED",
		// always will be 1 or 0 because there is no
		// deep checking (just DIFF option do that)
		"changes": 1 
	}

  


## Your contribution is appreciated (thanks!)

  

[![alt text](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif 'thanks for contribute!')](https://paypal.me/netilon)

  

