require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")
const Note = require("./models/note")
const { requestLogger } = require("./utils/requestLogger")

app.use(cors())
app.use(express.static("dist"))

app.use(express.json())
app.use(requestLogger)


app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end() 
      }
    })
    .catch(error => next(error))
})


app.post("/api/notes", (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    })
  }

  const note = new Note({
    content: body.content,
    important: Boolean(body.important) || false,
  })

  note.save().then((savedNote) => {
    response.json(savedNote)
  })
})

app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(err => next(err))
  response.status(204).end()
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
