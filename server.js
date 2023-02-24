const express = require('express');
const app = express();
const logger = require('morgan')
const fs = require('fs')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('combined', {
    stream: fs.createWriteStream('./access.log', {flags: 'a'})
}));
app.use(logger('dev'));

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
        return obj.id == authorId
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
app.get('/book/:id', (req,res)=>{
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

// endpoint to update author name
app.patch('/author/:id', (req, res) => {
    const authName = req.body.name;
    const authId = req.params.id
    // we check if author with id passed exist in saved data
    const authorIndex = authors.findIndex((obj)=>{
        return obj.id == authId
    })
    if(authorIndex === -1){
        res.status(404).json({error:'Author with passed ID does not exist in database'})
        return null
    }
    // checking if author name exist in saved data
    const authCheck = authors.find((auth)=>{
        return auth.name === authName && auth.id !== authId
    })
    if(authCheck){
        res.status(400).json({error:'Another author with this name already exists'});
        return null
    }
    authors[authorIndex].name = authName

    res.json({message:'Author name updated successfully', updatedAuthorData: authors[authorIndex]});
  });

// endpoint to update book data
app.patch('/book/:id', (req,res)=>{
    const bookId = req.params.id
    const authorId = req.body.authorId
    const bookName = req.body.bookName
    const isbn = req.body.ISBN

    // we are checking if book with id passed exist in saved data
    const bookIndex = books.findIndex((obj)=>{
        return obj.id == bookId
    })
    if(bookIndex === -1){
        res.status(404).json({error:'Book with passed ID does not exist in database'})
        return null
    }
    // we will check if ISBN exist in saved data
    const bookISBNCheck = books.find((book)=>{
        return book.ISBN == isbn && book.id != bookId
    })
    if(bookISBNCheck){
        res.status(400).json({error:'Another book with same ISBN already exists'});
        return null
    }
    const authorCheck = authors.find((auth)=>{
        return auth.id == authorId
    })
    console.log(authorCheck);
    if(authorCheck === undefined){
        res.status(400).json({error:'Author does not exist in database'});
        return null
    }

    books[bookIndex].ISBN = isbn;
    books[bookIndex].authorId = authorId;
    books[bookIndex].bookName = bookName;

    res.status(200).json({message:'Book details updated successfully.', updatedBookData:books[bookIndex]})
})

// endpoint to delete an author
app.delete('/author/:id', (req,res)=>{
    const authorId = req.params.id

    // finding the index of the author in the authors array
    const authIndex = authors.findIndex((auth)=>{
        return auth.id == authorId
    })
    if(authIndex === -1){
        res.status(404).json({error:`Author with the ID: ${authorId} not found`})
        return null
    }
    const deletedAuth = authors.splice(authIndex, 1)

    // deleting all books by the deleted author
    books = books.filter((book)=>{
        return book.authorId != deletedAuth.id
    })

    res.status(200).json({message: `Author with the ID: ${authorId} and their books have been deleted.`});

})

// endpoint to delete a book
app.delete('/book/:id', (req,res)=>{
    const bookId = req.params.id

    // finding the index of the book in the books array
    const bookIndex = books.findIndex((book)=>{
        return book.id == bookId
    })
    if(bookIndex === -1){
        res.status(404).json({error:`Book with the ID: ${bookId} not found.`})
        return null
    }
    
    books.splice(bookIndex, 1)

    res.status(200).json({message:`Book with ID: ${bookId} have been deleted.`})
})


app.listen(3500, ()=>{
    console.log('Server started at port 3500');
})