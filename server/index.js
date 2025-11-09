import express from 'express';
import cors from 'cors';
import router from './routes/index.router.js'; 
const app = express()
const PORT = process.env.PORT || 7000
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.static("public"))
app.get("/", (req, res)=>{res.send("This is home page")})
app.use(errorHandler);
app.listen(PORT, ()=>{console.log(`Server run on${PORT}`)})




