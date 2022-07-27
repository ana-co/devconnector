import express from 'express';
import connectDB from './db/db.js';
import 'path';

const app = express();

import dotenv from 'dotenv';
dotenv.config();

connectDB();

app.use(express.json());

// app.get('/', (req, res) => res.send('API running!'));

import authRouter from './routes/api/auth.js';
import usersRouter from './routes/api/users.js';
import postsRouter from './routes/api/posts.js';
import profileRouter from './routes/api/profile.js';

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profile', profileRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
