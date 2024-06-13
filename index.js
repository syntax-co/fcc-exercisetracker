const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const axios = require('axios')

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@fcc-mongoose.btvpglg.mongodb.net/?retryWrites=true&w=majority&appName=fcc-mongoose`

mongoose.connect(uri)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
})


const userSchema = mongoose.Schema({
  username: String,
  _id: String
})





const exerciseModel = new mongoose.model('Exercise',exerciseSchema)

const userModel = new mongoose.model('User',userSchema)

// ██╗      ███████╗██╗   ██╗███╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
// ██║      ██╔════╝██║   ██║████╗  ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
// ██║█████╗█████╗  ██║   ██║██╔██╗ ██║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
// ██║╚════╝██╔══╝  ██║   ██║██║╚██╗██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
// ██║      ██║     ╚██████╔╝██║ ╚████║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
// ╚═╝      ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
                                                                                   

function rand_id() {
  return Math.random().toString(16).slice(2)
}






// change to post
app.post('/api/users', async(req,res) => {

  

  // check if user exists
  const result = await userModel.find({
    user:req.body.username
  })

  
  // error return if user exists
  if (result.length>0) {
    res.json({error:'user exists'})
  }

  // makes sure id is unique
  var chosenid = rand_id()
  var unique = false
  
  while (!unique) {
    var foundIds = await userModel.find({
      _id:chosenid
    })


    if (foundIds.length==0) {
      unique=true
    } else {
      chosenid = rand_id()
    }
  }


  const finalData = {
    username:req.body.username,
    _id: chosenid
  }


  const newUser = new userModel(finalData)  
  await newUser.save()
  


  res.json(finalData)
})



app.get('/api/users', async(req,res) => {
  const result = await userModel.find({})
  res.json(result)
})


const checkDate = (date) => {
  if (!date) {
      return (new Date(Date.now())).toDateString();
  } else {
      const parts = date.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);

      const utcDate = new Date(Date.UTC(year, month, day));
      return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000).toDateString();
  }
}

app.post("/api/users/:_id/exercises", async(req, res) =>{
  try {
    const user = await userModel.findById(req.body[":_id"] || req.params._id)

    if (!user) return res.json({error:"user doesn't exist"})

    const newExercise = await exerciseModel.create({
      username:user.username,
      description:req.body.description,
      duration: req.body.duration, 
      date: checkDate(req.body.date)
    })


    const final = {
      _id:user._id,
      username:user.username,
      date: newExercise.date,
      duration: newExercise.duration,
      description:newExercise.description,

    }

    console.log(typeof final.duration)
    return res.json(final) 

  } catch (error) {
    console.error(error)
    return res.json({error:"Operation failed"})
  }
})


// app.post('/api/users/:_id/exercises', async(req,res) => {

  

  
//   // holder for easy testing
//   const testcase = req.body

//   // vvvvvvvvvvvvvvvvvvvvvvvv
//   // check for date
//   if (!testcase.date) {
//     testcase.date = new Date().toDateString()
//   }
//   else {
//     // have to parse to format to .toDateString
//    testcase.date = new Date(testcase.date).toDateString() 
//   }
//   // ^^^^^^^^^^^^^^^^^^^^^^^^
  

//   // vvvvvvvvvvvvvvvvvvvvvvvv
//   var user = await userModel.find({
//     _id:req.params._id
//   })
  
//   var {username,_id} = user[0]
  
//   // ^^^^^^^^^^^^^^^^^^^^^^^^


//   const exercise = new exerciseModel({
//     username:username,
//     description:testcase.description,
//     duration:parseInt(testcase.duration),
//     date:testcase.date
//   })
//   await exercise.save()


//   const newObject = {
//     username:username,
//     description: testcase.description,
//     duration:parseInt(testcase.duration),
//     date:testcase.date,
//     _id:_id
//   }


//   console.log('##################')
//   console.log(testcase)
//   console.log(newObject)
//   console.log('##################')
  

//   return res.json(newObject)

// })



app.get('/api/users/:_id/logs', async(req,res) => {

  
  const query = req.query
  const userId = req.params._id
  var exercises = []
  var _user;
  var _exercises;

  // converts limit to an int
  if (query.limit) {
    query.limit = parseInt(query.limit)
  }

  // finds if there is a user with the _id
  const userCheck = await userModel.find({
    _id:userId
  })

  // sets user if there is a user
  // found
  if (userCheck) {
    _user = userCheck[0]

    // if user exists, it gets
    // all of the exercises for that user
    await exerciseModel.find({
      username:_user.username
    }).then((data) => {
      if (data) {
        _exercises=data
      }
    })

  }

  

  // handles 'from', 'to', and limit
  if (query.limit || (query.from && query.to)) {

    var exHolder = []
    const _size = _exercises.length

    if (query.from && query.to) {
      const _from = new Date(query.from) 
      const _to = new Date(query.to)

      // goes through _exercises and 
      // check if its between the 'from' and 'to'

      for (var i=0; i<_size; i++) {
        const item = _exercises[i]
        const actual = new Date(item.date)

        if (actual>=_from && actual<=_to) {
          exHolder.push(item)
        }
      }
    } else {
      exHolder = _exercises
    }


    if (query.limit) {
      for (var i=0; i<query.limit; i++) {
        exercises.push(exHolder[i])
      }
    } else {
      exercises = exHolder
    }


  } else {
    exercises = _exercises
  }






  const details = {
    username:_user.username,
    count:exercises.length,
    log:exercises
  }

  
  
  

  res.json(details)
})




//  ██████╗██╗     ███████╗ █████╗ ██████╗ 
// ██╔════╝██║     ██╔════╝██╔══██╗██╔══██╗
// ██║     ██║     █████╗  ███████║██████╔╝
// ██║     ██║     ██╔══╝  ██╔══██║██╔══██╗
// ╚██████╗███████╗███████╗██║  ██║██║  ██║
//  ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
                                        
app.get('/api/clearDatabase',async(req,res) => {


  const userResult = await userModel.deleteMany({})
  const exerciseResult = await exerciseModel.deleteMany({})



  res.json({
    userResult:userResult,
    exerciseResult:exerciseResult
  })

})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
