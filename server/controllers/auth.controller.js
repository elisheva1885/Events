// src/controllers/auth.controller.js
import * as serv from '../services/auth.service.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';

export const register = asyncHandler(async (req, res) => {
  console.log("userController ", req.body);
  const user = await serv.register(req.body);
  res.status(201).json({ message: 'User registered', user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
console.log("credentials controller: ", email, password);
  const { user, token } = await serv.login(email, password);
  res.json({ user, token });
});
