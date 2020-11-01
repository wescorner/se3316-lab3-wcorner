const jsonTimetable = require('C:/Users/Wesley/Documents/GitHub/se3316-lab3-wcorner/Lab3-timetable-data.json');
const express = require('express');
const app = express();
const port = 3000;

let timetable = JSON.parse(JSON.stringify(jsonTimetable));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/courses', (req, res) => {
    res.send(timetable);
});

//for retrieving all subject codes without duplication
app.get('/api/subjectcodes', (req, res) => {

    var subjects = [];

    timetable.forEach(addSubject);

    function addSubject(item){
        if(subjects.includes(item.subject)){      
        }
        else{
            subjects.push(item.subject)
        }
    }

    res.send(subjects);
});

//for retrieving all descriptions without duplication
app.get('/api/descriptions', (req, res) => {

    var descriptions = [];

    timetable.forEach(addDescription);

    function addDescription(item){
        if(descriptions.includes(item.className)){       
        }
        else{
        descriptions.push(item.className)
        }
    }
    res.send(descriptions);
});

//for retrieving all course codes for a given subject code
app.get('/api/courses/:subjectcode_id', (req, res) => {
    const id = req.params.subjectcode_id;
    
    var coursecodes = [];

    timetable.forEach(addCourseCode);

    function addCourseCode(item){
        if(id == item.subject){
            coursecodes.push(item.catalog_nbr);
        }
    }

    if(coursecodes.length == 0){
        res.status(404).send(`Error- subject code ${id} was not found!`);
    }
    else{
        res.send(coursecodes);
    }
    
});

//opening port
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});