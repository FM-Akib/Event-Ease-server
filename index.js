const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvgg1my.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri,{
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
  const hallsCollection = await client.db("EventEaseDB").collection("halls"); 
  const usersCollection = await client.db("EventEaseDB").collection("users"); 








  
  //  register a user
  app.post('/users', async(req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const exist = await usersCollection.findOne(query);
    if(exist){
      return res.send({message:'user already exists',insertId: null})
    }
    const result = await usersCollection.insertOne(user);
    res.send(result);
  })
   

    //  getting a user data
    app.get('/users/:email',async(req, res)=>{
      const {email} = req.params;
      const query = {email}
      const result = await usersCollection.findOne(query);
      res.send(result);
    })


    app.patch('/users/bookings/:email', async(req, res) => {
      const {email} = req.params;
      const filter = {email}
      const booking = req.body;
      const result = await usersCollection.updateOne(filter, { $set: booking });
      res.send(result);
    })
   
    
   // ==========================================================================================
                              
    
    //inserting a hall
    app.post('/halls',async(req, res)=>{
      const hall = req.body;
      const query = {email: hall.email}
      const exist = await hallsCollection.findOne(query);
      if(exist){
        return res.send({message:'halls already exists',insertId: null})
      }
      const result = await hallsCollection.insertOne(hall);
      res.send(result);
    })


    //getting all halls 
    app.get('/halls', async(req, res) => {
      const result = await hallsCollection.find().toArray();
      res.send(result)
    })

    //getting specific hall
    app.get('/halls/:id', async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }
    const query = { _id: new ObjectId(id) };
    try {
      const result = await hallsCollection.findOne(query);
      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ error: 'Hall not found' });
      }
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while retrieving the hall' });
    }
  }); 


    //  getting a hall by mail
    app.get('/halls/profile/:email',async(req, res)=>{
      const {email} = req.params;
      const query = {email}
      const result = await hallsCollection.findOne(query);
      res.send(result);
    })

    app.patch('/halls/:email', async (req, res) => {
      const {email} = req.params;
      const filter = {email}
      const hall = req.body;
      const result = await hallsCollection.updateOne(filter, { $set: hall });
      res.send(result);
    });




 //Bookform======================================================================================================================

   app.patch('/updateBookinghall/:id',async (req, res) => {
      const hallId = req.params.id;
      const {  booking } = req.body;
      const filter = {_id: new ObjectId(hallId) }
     
      try {
       
        const update = { $push: { ["bookings"]: booking } };
        const result = await hallsCollection.updateOne(filter, update);
       
        if (result.matchedCount === 0  ) {
            return res.status(404).send({ message: 'halls not found' });
        }
        res.send({ message: 'Insert successfully', result });
    } catch (err) {
        res.status(500).send({ message: 'Internal server error', error: err });
    }
   })

   app.patch('/updateBookingDate/:id',async (req, res) => {
      const hallId = req.params.id;
      const { bookedDate } = req.body;

      const filter = {_id: new ObjectId(hallId) }
      try {   
        const updateDate = { $push: { ["bookedDates"]: bookedDate } };
        const result = await hallsCollection.updateOne(filter, updateDate);
    
        if (result.matchedCount === 0  ) {
            return res.status(404).send({ message: 'halls not found' });
        }
    
        res.send({ message: 'Insert successfully', result});
    } catch (err) {
        res.status(500).send({ message: 'Internal server error', error: err });
    }
   })


   app.patch('/updateBookingUser/:email',async (req, res) => {
    const email = req.params.email;
    const { booking } = req.body;

    const userFilter = {email}
    try {
     const updateUser = { $push: { ["mybookings"]: booking } };
     const result = await usersCollection.updateOne(userFilter, updateUser);

      if (result.matchedCount === 0  ) {
          return res.status(404).send({ message: 'halls not found' });
      }
      
      res.send({ message: 'Insert successfully', result });
  } catch (err) {
      res.status(500).send({ message: 'Internal server error', error: err });
  }
 })




   
    
    
    




    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Event Ease Running!')
})

app.listen(port, () => {
  console.log(`Event Ease listening on port ${port}`)
})