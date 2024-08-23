const express = require('express')
const app = express()
const body_parser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()
const URI = process.env.URI
const DEFAULTPORT = 3001
const PORT = process.env.PORT | DEFAULTPORT
app.use(body_parser.json())


const bookSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    pages: Number,
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'authors'
    }
})

const authorSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    birthDate: Date,
    nationality: {
        type: String,
        enum: ["American", "Japanse"]
    }
})

mongoose.connect(URI).then(() => {
    console.log("connected to db:library")
}).catch(() => {
    console.log("Something went wrong")
})

const Book = mongoose.model("books", bookSchema)
const Author = mongoose.model("authors", authorSchema)

app.post('/book', async (req, res) => {
    const { author } = req.body
    author._id = new mongoose.Types.ObjectId()

    const a = new Author(author)
    const savedAuthor = await a.save()

    const book = {
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        pages: req.body.pages,
        author_id: savedAuthor._id
    }

    const b = new Book(book)
    b.save()
    res.status(200).json({ message: "book added successfully" })
})

app.get('/book', async (req, res) => {
    const { q } = req.query
    const query = q.split("-").join(" ")
    let book = await Book.find({ title: query }).populate()
    res.status(200).json({ book })
})



app.listen(PORT, () => {
    console.log('server is listening http://localhost:' + PORT)
})