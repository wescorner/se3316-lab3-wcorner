const jsonTimetable = require('C:/Users/Wesley/Documents/GitHub/se3316-lab3-wcorner/Lab3-timetable-data.json');
const express = require('express');
const app = express();
const port = 3000;

let timetable = JSON.parse(JSON.stringify(jsonTimetable));

var subjects = [];
var descriptions = [];

timetable.forEach(addSubject);
timetable.forEach(addDescription);

function addSubject(item){
    if(subjects.includes(item.subject)){      
    }
    else{
        subjects.push(item.subject)
    }
}

function addDescription(item){
    if(descriptions.includes(item.className)){       
    }
    else{
        descriptions.push(item.className)
    }
}

app.get('/', (rec, res) => {
    res.send('Hello World');
});

app.get('/api/courses', (rec, res) => {
    res.send(timetable);
});

app.get('/api/subjectcodes', (rec, res) => {
    res.send(subjects);
});

app.get('/api/descriptions', (rec, res) => {
    res.send(descriptions);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});