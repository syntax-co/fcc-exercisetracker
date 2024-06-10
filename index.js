const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



const exerciseSchema = {
  username: String,
  description: String,
  duration: Number,
  date: String,
  _id: String
}


const userSchema = {
  username: String,
  _id: String
}


const logSchema = {
  username: String,
  count: Number,
  _id: String,
  log: [String]
}
// ^^^^^^
// log:{
//   description: "test",
//   duration: 60,
//   date: "Mon Jan 01 1990",
// }






















const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
