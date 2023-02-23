const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Node.Js Variables
let books = [];
let authors = [];

// function for generating unique id's
let uniqueId = ()=>{
    return (new Date().getTime());
}

// endpoint to create new author
app.post('/author', (req,res)=>{
    const authorName = req.body.name;

    // we are checking if name exist in body
    if(!authorName){
        res.status(400).json({error:'Name is empty'});
        return null;
    }
    // we are checking if name already exist in database
    else if(authors.find((obj)=>{
        obj.name === authorName
        return true;
    })) {
            res.status(400).json({error:'Author with entered name already exist!'});
            return null;
        }
    // we are checking if name has only whitespace
    else if((authorName.trim()).length === 0){
        res.status(400).json({error:"Name of the author can't be empty!"});
        return null;
    }
    const authorData = {
        id: uniqueId(),
        name: authorName
    }
    authors.push(authorData);
    res.json({message:'Successfully inserted data.', data: authorData});

})



app.listen(3500, ()=>{
    console.log('Server started at port 3500');
})