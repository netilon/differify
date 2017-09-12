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

    var a = new model();
    a.name = 'Fabian';
    a.age = 33;
    a.friends = ['pepe', 'rodolfo'];
    a.extras.hobbies = [{color: 'Red'}, {color: 'Green'}];
    a.date = new Date();
    var b = new model();
    b.name = function(){ return 'hello';};
    b.age = new Date();
    b.friends = ['carlos','pepe'];
    b.extras.hobbies = ['Walk'];
    b.date = new Date('12/15/1983 12:00:00');
    var diff = differify.getDiff(a, b, {deep: 3,scan: {arrays: true}, returnType: 'json'});
    
    it('Date comparation', function(){
        
        var testDiff = differify.getDiff(a, b, {deep: 3,scan: {arrays: true}, returnType: 'json'});
        //at this point, the status of date property value must be different in a 
        //and b objects.
        expect((testDiff.date.value.status === 'modified')).toBeTruthy();
        var newDate = new Date();
        a.date = newDate;
        b.date = newDate;
        testDiff = differify.getDiff(a, b, {deep: 3,scan: {arrays: true}, returnType: 'json'});
        //Now, the date property in both objects are equal, therefore the date
        //Property would not exists.
        expect((testDiff['date'] === undefined)).toBeTruthy();
    });
    
    it('Native types comparation', function(){
        var testDiff = differify.getDiff(a, b, {deep: 3,scan: {arrays: true}, returnType: 'json'});
        //check diff string - function
        expect((testDiff.name.value.original===a.name && testDiff.name.value.diff === b.name.toString())).toBeTruthy();
        expect((testDiff.age.value.original===a.age && testDiff.age.value.diff === b.age)).toBeTruthy();
        expect((testDiff.extras.hobbies.value.original[0]===a.extras.hobbies[0] && testDiff.extras.hobbies.value.status === 'modified')).toBeTruthy();
        expect((Object.prototype.toString.call(testDiff.friends.value.original)=== '[object Array]' && Object.prototype.toString.call(diff.friends.value.diff) === '[object Array]')).toBeTruthy();
        
    });
    
    it('array conversion', function(){
        var testDiff = differify.getDiff(a, b, {deep: 2,scan: {dateObjects: false,arrays: true}, returnType: 'array'});
        //the result mas be an array.
        expect(Object.prototype.toString.call(testDiff)=== '[object Array]').toBeTruthy();
        //should be 4 differences.
        expect(testDiff.length === 4).toBeTruthy();
    });
    
    it('deep config', function(){
        var testDiff = differify.getDiff(a, b, {deep: 0,scan: {arrays: true}, returnType: 'json'});
 
        expect(testDiff['extras'] === undefined).toBeTruthy();
        
        testDiff = differify.getDiff(a, b, {deep: 2,scan: {arrays: true}, returnType: 'json'});

        expect(testDiff['extras'] !== undefined).toBeTruthy();
    });
})
