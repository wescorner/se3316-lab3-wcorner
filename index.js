const jsonTimetable = require('C:/Users/Wesley/Documents/GitHub/se3316-lab3-wcorner/Lab3-timetable-data.json');
const express = require('express');
const expAutoSan = require('express-autosanitizer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());       
app.use(express.urlencoded()); 

app.use(expAutoSan.all);

//mongodp connection
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://wescorner:golfme5665@cluster0.of0tx.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

async function connect(){
    try{    
        await client.connect();
        console.log('Connected to MongoDB...');
    } catch (e){
        console.error(e);
    }
}
connect().catch(console.error);

let alltimetables = jsonTimetable;

//root
app.get('/', (req, res) => {
    res.send('Hello World');
});

//for listing all timetable data
app.get('/api/courses', (req, res) => {
    console.log(`GET request for ${req.url}`);
    res.send(alltimetables);
});

//for retrieving all subject codes without duplication
app.get('/api/subjectcodes', (req, res) => {

    var subjects = [];

    alltimetables.forEach(addSubject);

    function addSubject(item){
        if(subjects.includes(item.subject)){      
        }
        else{
            subjects.push(item.subject)
        }
    }
    console.log(`GET request for ${req.url}`);
    res.send(subjects);
});

//for retrieving all descriptions without duplication
app.get('/api/descriptions', (req, res) => {

    var descriptions = [];

    alltimetables.forEach(addDescription);

    function addDescription(item){
        if(descriptions.includes(item.className)){       
        }
        else{
        descriptions.push(item.className)
        }
    }
    console.log(`GET request for ${req.url}`);
    res.send(descriptions);
});

//for retrieving all course codes for a given subject code
app.get('/api/coursecodes/:subjectcode_id', (req, res) => {
    const id = req.params.subjectcode_id;
    console.log(`GET request for ${req.url}`);

    var coursecodes = [];

    alltimetables.forEach(addCourseCode);

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

//for retrieving a timetable with a given subject and course code
app.get('/api/courses/:subjectcode_id/:coursecode_id/:coursecomponent_id?', (req, res) => {
    const subjectid = req.params.subjectcode_id;
    const courseid = req.params.coursecode_id;
    const coursecomponent = req.params.coursecomponent_id;
    
    console.log(`GET request for ${req.url}`);
    
    var timetable = [];

    if(typeof(coursecomponent) == "undefined"){
        alltimetables.forEach(addTimetable1);
    }
    else{
        alltimetables.forEach(addTimetable2);
    }

    //if a course component is not specified
    function addTimetable1(item){
        if (subjectid == item.subject && courseid == item.catalog_nbr){
            timetable.push(item);
        }
    }
    
    //if a course component is specified
    function addTimetable2(item){
        if (subjectid == item.subject && courseid == item.catalog_nbr && coursecomponent == item.course_info[0].ssr_component){
            timetable.push(item);
        }
     }
    
    let x = 0;
    let y = 0;
    let z = 0;

    //if no timetables were added 
    if(timetable.length == 0){
        for(let i = 0; i < alltimetables.length; i++){
            if(alltimetables[i].subject == subjectid){
                x++;
            }
            if(alltimetables[i].catalog_nbr == courseid){
                y++;
            }
            if(alltimetables[i].course_info[0].ssr_component == coursecomponent){
                z++;
            }
        }
        if(x == 0 && y > 0){
            res.status(404).send(`Error- ${subjectid} was not found!`);
        }
        else if(x > 0 && y == 0) {
            res.status(404).send(`Error- ${courseid} was not found!`)
        }
        else if (x > 0 && y > 0 && z == 0){
            res.status(404).send(`Error- ${coursecomponent} was not found!`)
        }
        else{
            res.status(404).send(`Error- ${subjectid} and ${courseid} were not found!`)
        }
    }
    else{
        res.send(timetable);
    }
   
});


//creating new empty schedule
app.post('/api/createschedule/:name', (req, res) => {
    const scheduleName = req.params.name;
    var newSchedule = req.params;  

    console.log(`POST request for ${req.url}`);

    async function scheduleExists(){
        result = await client.db("schedulesDatabase").collection("schedulesCollection").find({name: scheduleName}).count()>0;
        return result;
    }

    async function createSchedule(scheduleName){
        var exists = await scheduleExists();
        //if schedule exists
        if(exists == true){
            res.status(400).send(`Error- ${scheduleName} already exists!`);    
        }
        //if schedule does not exist
        else{
            await client.db("schedulesDatabase").collection("schedulesCollection").insertOne({name: scheduleName});
            res.send(`Made new schedule with name ${newSchedule.name}`);
        }
    }
    createSchedule(scheduleName);
});

//updating existing schedule
app.put('/api/updateschedule/:name/', (req, res) => {
    const scheduleName = req.params.name;
    const courses = req.body;

    console.log(`PUT request for ${req.url}`);
    
    //check if schedule exists
    async function scheduleExists(){
        result = await client.db("schedulesDatabase").collection("schedulesCollection").find({name: scheduleName}).count()>0;
        return result;
    }

    async function updateSchedule(){
        var exists = await scheduleExists();
        //if schedule exists
        if(exists == true){
            var myquery = {name: scheduleName};
            var newvalues = {$set: {courses}};
            client.db("schedulesDatabase").collection("schedulesCollection").updateOne(myquery, newvalues, (err, res) => {
                if(err) throw err;               
            });
            res.send(`Schedule ${scheduleName} updated`);
        }
        //if schedule does not exist
        else{
            res.status(404).send(`Error- ${scheduleName} does not exist!`);
        }
    }
    updateSchedule();
    
});

//getting list of pairs in a schedule
app.get('/api/getschedule/:name', (req, res) => {
    const scheduleName = req.params.name;

    console.log(`GET request for ${req.url}`);

    client.db("schedulesDatabase").collection("schedulesCollection").find({name: scheduleName}, {projection: {_id: 0, name: 0}}).toArray(function(err, result){
        if (err) throw err;
        res.send(result);
    });
});

//get list of schedule names and number of courses in each schedule
app.get('/api/getschedules', (req, res) => {
    console.log(`GET request for ${req.url}`);

    var schedules = [];
    coursesArray = [];
    function getSchedules(){
        client.db("schedulesDatabase").collection("schedulesCollection").find({}, {projection: {_id: 0}}).toArray(function(err, result){
            if (err) throw err;
            for(let i = 0; i < result.length; i++){
                schedules.push({name: result[i].name, courses: result[i].courses.length});
            } 
            res.send(schedules);  
        });

    }
    getSchedules();

});

//deleting a single schedule
app.delete('/api/deleteschedule/:name', (req, res) => {
    const scheduleName = req.params.name;
    console.log(`DELETE request for ${req.url}`);
    client.db("schedulesDatabase").collection("schedulesCollection").deleteOne({name: scheduleName}, (err, obj) => {
        if (err) throw err;
        res.send(`Schedule ${scheduleName} deleted.`);
    });
});

//deleting all schedules
app.delete('/api/deleteschedule', (req, res) => {
    console.log(`DELETE request for ${req.url}`);
    client.db("schedulesDatabase").collection("schedulesCollection").deleteMany({}, (err, collection) => {
        if (err) throw err;
        res.send(` ${collection.result.n} schedules deleted.`);
    }); 
});

//opening port
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});