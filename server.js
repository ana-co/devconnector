import express from 'express';
import connectDB from './db/db.js';
import 'path';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

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
import callRouter from './routes/api/call.js';

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/call', callRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

io.on('connection', (socket) => {
  const startCall = ({ userToCall, signalData, callerSocketId, roomId }) => {
    console.log(
      'start-call on server',
      userToCall,
      signalData == null || signalData == undefined,
      callerSocketId
    );
    socket.to(roomId).emit('start-call', { callerSocketId, signalData });
  };

  const joinCall = ({ signalData, socketId, roomId }) => {
    console.log(
      'join-call on server',
      signalData == null || signalData == undefined,
      socketId
    );
    socket.to(roomId).emit('call-accepted', {
      callerSocketId: socketId,
      signalData: signalData,
    });
  };

  const adjustCamera = (userCameraOn, roomId) => {
    console.log('adjust  camera  ');
    socket.to(roomId).emit('adjust-user-camera', userCameraOn);
  };

  socket.on('join-room', (roomId, myUserId) => {
    console.log(
      `user ${myUserId} with socketId ${socket.id} joined the room ${roomId}`
    );
    socket.join(roomId);

    socket.to(roomId).emit('user-connected', myUserId, socket.id);

    socket.on('call-user', startCall);
    socket.on('join-call', joinCall);

    socket.on('adjust-camera', adjustCamera);

    socket.once('leave-room', () => {
      console.log(`user ${myUserId} left room`);
      socket.off('call-user', startCall);
      socket.off('join-call', joinCall);
      socket.off('join-call', adjustCamera);
      socket.leave(roomId);
      io.to(roomId).emit('user-left', myUserId, socket.id);
    });

    socket.once('disconnect', () => {
      console.log(`user ${myUserId} disconnected`);

      io.to(roomId).emit('user-disconnected', myUserId, socket.id);
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

//t
