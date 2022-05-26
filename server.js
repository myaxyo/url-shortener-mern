const express = require('express')
const createHttpErrors = require('http-errors')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3010


app.use('/api/auth', require('./routes/auth.routes'))

async function start() {
	try{
		await mongoose.connect("mongodb://localhost:27017/base").then(() => console.log('Database connected'))
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
	} catch (e) {
		console.log("Server Error", e.message)
		process.exit(1)

	}
}

start()
