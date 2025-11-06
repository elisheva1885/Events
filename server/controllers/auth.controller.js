// src/controllers/auth.controller.js
import { registerUser, login } from '../services/auth.service.js';
import asyncHandler from '../middlewares/asyncHandler';


const register = asyncHandler(async(req, res)=> {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'User registered', user });  
});

const login = asyncHandler(async(req, res) =>{
    const { email, password } = req.body;
    const { user, token } = await login(email, password);
    res.json({ user, token });
});

module.exports = { register, login };