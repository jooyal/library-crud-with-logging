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
    // we are checking if name already exist in saved data
    if(authors.find((obj)=>{
            if (obj.name === authorName){
                return true;
            }
    })) {
            res.status(400).json({error:'Author with entered name already exist!'});
            return null;
        }
    // we are checking if name has only whitespace
    if((authorName.trim()).length === 0){
        res.status(400).json({error:"Name of the author can't be empty!"});
        return null;
    }
    const authorData = {
        id: uniqueId(),
        name: authorName
    }
    authors.push(authorData);
    res.json({message:'Successfully inserted author.', data: authorData});

})

// endpoint to create new book
app.post('/book', (req,res)=>{
    const authorId = req.body.authorId;
    const bookName = req.body.bookName;
    const isbn = req.body.ISBN;

    // we are checking if all required datas exist in body
    if(!authorId || !bookName || !isbn){
        res.status(400).json({error:'All datafields are required!'});
        return null;
    }
    // we are checking if author exist in saved data
    const author = authors.find((obj)=>{
        return obj.id == authorId
    })

    if(!author) {
            res.status(400).json({error:'Author with ID does not exist!'});
            return null;
        }
    // we are checking if book with same ISBN number exist in saved data
    if(books.find((obj)=>{
        if(obj.isbn == isbn) true;
    })) {
            res.status(400).json({error:'ISBN number already exist in database!'});
            return null;
        }
    const bookData = {
        id: uniqueId(),
        ISBN: isbn,
        authorId: authorId,
        bookName: bookName
    }
    books.push(bookData);
    res.json({message:'Successfully inserted book data.', data: bookData});

})

// endpoint to get all saved authors
app.get('/author', (req,res)=>{
    if(authors.length === 0){
        res.status(404).json({error:'No authors found'})
        return null;
    }
    res.send(authors)
})

// endpoint to get all saved books
app.get('/book', (req,res)=>{
    if(books.length === 0){
        res.status(404).json({error:'No books found'})
        return null;
    }
    res.send(books)
})

// endpoint to get all books by an author
app.get('/author/:id', (req,res)=>{
    const authorId = req.params.id
    // check if author exist in saved data
    const author = authors.find((obj)=>{
        if(obj.id == authorId ) obj;
    })
    if(!author) {
        res.status(404).json({error:'Author does not exist in database.'})
        return null
    }
    const authBooks = books.filter((obj)=>{
        return obj.authorId == authorId
    })
    if(!authBooks){
        res.status(404).json({error:'No books found linked to the author.'})
        return null
    }
    // if every error case is false, return all books by author
    res.status(200).json({author:author, books: authBooks})
})

// endpoint to get a single book and the author-data
app.get('/book/:id', (rq,res)=>{
    const bookId = req.params.id
    // we are checking if book actualy exist in saved data
    const book = books.find((obj)=>{
        return obj.id == bookId
    })
    if(!book){
        res.status(404).json({error:'Book with specified ID not found in database.'})
        return null;
    }
    // if book exst, we are fetching data of the author of the book
    const author = authors.find((obj)=>{
        return obj.id == book.authorId
    })
    res.status(200).json({author:author, book: book})
})



app.listen(3500, ()=>{
    console.log('Server started at port 3500');
})