const express = require('express')
const router = express.Router()
const Book = require('../models/book.model')

//middleware
const getBook = async (req, res, next) => {
    let book;
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({
            message: 'El ID del libro no es válido'
        });
    }

    try {
        book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                message: 'El libro no fue encontrado'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }

    res.book = book;
    next();
}

//obtener todos los libros [GET all]
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        console.log('GET ALL', books);
        if (books.length === 0) {
            return res.status(200).json([]);  // O res.status(204).json([]) si prefieres indicar que no hay contenido.
        }
        res.status(200).json(books); // Aquí la corrección del error
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//crear un nuevo libro [POST]
router.post('/', async (req, res) => {
    const { title, author, genre, publication_date } = req.body;
    if (!title || !author || !genre || !publication_date) {
        return res.status(400).json({
            message: 'Los campos título, autor, género y fecha de publicación son obligatorios'
        });
    }

    const book = new Book({
        title,
        author,
        genre,
        publication_date
    });

    try {
        const newBook = await book.save();
        console.log(newBook);
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});


router.get('/:id', getBook, async(req, res) =>{
    res.json(res.book);
})

router.put('/:id', getBook, async(req, res) =>{
    try{
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;
    
        const updateBook = await book.save()
        res.json(updateBook)

    }catch (error){
        res.status(400).json({
            message: error.message
        })
    }
})

router.patch('/:id', getBook, async(req, res) =>{
    
    if(!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date){
        res.status(400).json({
            message: 'al menos uno de estos campos debe ser enviado: Titulo, Autor, Genero o fecha'
        })
    }
    
    try{
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;
    
        const updateBook = await book.save()
        res.json(updateBook)

    }catch (error){
        res.status(400).json({
            message: error.message
        })
    }
})

router.delete('/:id', getBook, async (req, res) => {
    try {
        const book = res.book;
        await book.deleteOne({
            _id: book._id
        });
        res.json({
            message: `El libro ${book.title} fue eliminado`
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});



module.exports = router;
