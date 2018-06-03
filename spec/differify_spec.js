describe('Testing differify module: ', function(){
    
    var differify = require('../src/differify.min');
    
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
    a.age = 33;
    a.friends = ['pepe', 'rodolfo'];
    a.extras.hobbies = [{color: 'Red'}, {color: 'Green'}];
    a.date = new Date();
    
    var b = model();
    b.name = function(){ return 'hello';};
    b.age = 33;
    b.friends = ['carlos','pepe'];
    b.extras.hobbies = ['Walk'];
    b.date = new Date('12/15/1983 12:00:00');
    
    
    it('should get 4 differences', function(){
        differify.setConfig({deep: 3,scan: {arrays: true}, returnType: 'array'});
        var testDiff = differify.getDiff(a, b);
        expect(testDiff.length===4).toBeTruthy();
    });
    
    it('chechking Date diff', function(){
        differify.setConfig({deep: 3,scan: {arrays: true}, returnType: 'json'});
        var testDiff = differify.getDiff(a, b);
        //at this point, the status of date property value must be different in a 
        //and b objects.
        expect((testDiff.date.value.status === 'modified')).toBeTruthy();
        
        var newDate = new Date();
        a.date = newDate;
        b.date = newDate;
        testDiff = differify.getDiff(a, b);
        //Now, the date property in both objects are equal, therefore the date
        //Property would not exists.
        expect(testDiff['date']).toBeUndefined();
    });
    
    it('Object comparation', function(){
        differify.setConfig({deep: 3,scan: {arrays: true}, returnType: 'json'});
        var _a = {age: 1, name: function(){}, extra: 'hola'};
        var _b = {age: 1, name: function(){return;}, extra: 'holo'};
        
        for(i in testDiff){
            if(testDiff[i].property==='date'){
                dateTest = testDiff[i];
            }
        }
        var testDiff = differify.getDiff(_a, _b);
        //at this point, the status of date property value must be different in a 
        //and b objects.
        expect((testDiff.name.value.status === 'modified')).toBeTruthy();
        expect((testDiff.extra.value.status === 'modified')).toBeTruthy();
    });
    
    it('Native types comparation', function(){
        differify.setConfig({deep: 3,scan: {arrays: true}, returnType: 'json'});
        var testDiff = differify.getDiff(a, b);
        //check diff string - function
        expect((testDiff.name.value.original===a.name && testDiff.name.value.diff === b.name.toString())).toBeTruthy();
        expect(testDiff['age']).toBeUndefined();
        expect((testDiff.extras.hobbies.value.original[0]===a.extras.hobbies[0] && testDiff.extras.hobbies.value.status === 'modified')).toBeTruthy();
        expect((Object.prototype.toString.call(testDiff.friends.value.original)=== '[object Array]' && Object.prototype.toString.call(testDiff.friends.value.diff) === '[object Array]')).toBeTruthy();
        
    });
    
    it('array conversion', function(){
        differify.setConfig({deep: 3,scan: {arrays: true}, returnType: 'array'});
        var testDiff = differify.getDiff(a, b);
        //the result mas be an array.
        expect(Object.prototype.toString.call(testDiff) === '[object Array]').toBeTruthy();
        //should be 4 differences.
        expect(testDiff.length === 3).toBeTruthy();
        
        var _a = [1,2,3,7,9,10];
        var _b = [1,0,3,5,9];
        
        var diff = differify.arrayDiff(_a, _b, true);
        
        expect(diff.length==3).toBeTruthy();
        expect(diff[0].original === 2 && diff[0].diff === 0 && diff[0].status === 'modified').toBeTruthy();
        expect(diff[1].original === 7 && diff[1].diff === 5 && diff[1].status === 'modified').toBeTruthy();
        expect(diff[2].original === 10 && diff[2].diff === null && diff[2].status === 'deleted').toBeTruthy();
        
    });
    
    it('deep config', function(){
        differify.setConfig({deep: 1,scan: {arrays: true}, returnType: 'json'});
        var testDiff = differify.getDiff(a, b);
        expect(testDiff.extras['hobbies'] === undefined).toBeTruthy();
        
        differify.setConfig({deep: 2,scan: {arrays: true}, returnType: 'json'});
        testDiff = differify.getDiff(a, b);

        expect(testDiff.extras['hobbies'] !== undefined).toBeTruthy();
    });
    
    
})
