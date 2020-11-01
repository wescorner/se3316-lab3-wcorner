const express = require('express');
const app = express();
const port = 3000;

app.get('/', (rec, res) => {
    res.send('Hello World');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});