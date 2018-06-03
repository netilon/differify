var differify = require('./src/differify2.0');
    
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