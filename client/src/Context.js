import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import axios from 'axios';

const SocketContext = createContext();

const socket = io();

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState();
  // const [userStream, setUserStream] = useState();
  const [cameraOn, setCameraOn] = useState(true);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [userIdToCall, setUserIdToCall] = useState('');
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  const joinRoom = (roomId, myUserId) => {
    getMediaStream(cameraOn);
    setCurrentRoomId(roomId);

    socket.on('user-connected', (userId, socketId) => {
      console.log(`User ${userId} entered the room`);
      // if (userId === myUserId) {
      //   return;
      // }

      callUser(socketId, roomId);
    });
    socket.on('user-left', (userId, socketId) => {
      console.log(` User ${userId} left the room`);
      userVideo.current.srcObject = null;
    });

    socket.on('user-disconnected', (userId, socketId) => {
      window.location.reload();
    });

    socket.on('start-call', ({ callerSocketId, signalData }) => {
      if (callerSocketId === socket.id) {
        return;
      }

      receiveCall({ callerSocketId, signalData, roomId });
    });

    socket.on('adjust-user-camera', (userCameraOn) => {
      adjustUserCamera(userCameraOn);
    });

    socket.emit('join-room', roomId, myUserId);
  };

  const callUser = (socketId, roomId) => {
    const callerPeer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    callerPeer.on('signal', (signalData) => {
      socket.emit('call-user', {
        userToCall: socketId,
        signalData: signalData,
        callerSocketId: socket.id,
        roomId: roomId,
      });
    });

    callerPeer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
      // setUserStream(currentStream);
    });

    callerPeer.on('close', () => {
      // callerPeer.removeAllListeners('close');
      socket.off('call-accepted');
    });

    socket.on('call-accepted', ({ callerSocketId, signalData }) => {
      if (callerSocketId === socket.id) {
        return;
      }

      console.log(
        `Call accepted. callerSocketId: ${callerSocketId}, signalData: ${signalData}`
      );
      callerPeer.signal(signalData);
    });
    connectionRef.current = callerPeer;
  };

  const receiveCall = ({ callerSocketId, signalData, roomId }) => {
    console.log(
      `received Call from  ${callerSocketId}, signalData: ${signalData}, my socketId: ${socket.id}`
    );
    const joinedPeer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    joinedPeer.on('signal', (data) => {
      socket.emit('join-call', {
        signalData: data,
        socketId: socket.id,
        roomId: roomId,
      });
    });

    joinedPeer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;

      // setUserStream(currentStream);
    });

    // joinedPeer.on('close', () => {
    // joinedPeer.destroy()
    // });

    joinedPeer.signal(signalData);

    connectionRef.current = joinedPeer;
  };

  const leaveRoom = () => {
    setCurrentRoomId(null);
    console.log('leaving the room ');
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    stopStreamedVideo(myVideo.current);
    stopStreamedVideo(userVideo.current);
    socket.emit('leave-room');
    socket.off('user-connected');
    socket.off('user-disconnected');
    socket.off('user-left');
    socket.off('start-call');
    socket.off('adjust-user-camera');
  };

  const adjustUserCamera = (userCameraOn) => {
    console.log(`user camera turned on: ${userCameraOn}`);
    userVideo.current.srcObject
      .getVideoTracks()
      .forEach((track) => (track.enabled = userCameraOn));
  };

  const getMediaStream = (getCamera) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        currentStream
          .getVideoTracks()
          .forEach((track) => (track.enabled = getCamera));
        setStream(currentStream);

        myVideo.current.srcObject = currentStream;
      });
  };

  const toggleCamera = () => {
    stream.getVideoTracks().forEach((track) => (track.enabled = !cameraOn));
    if (currentRoomId) {
      socket.emit('adjust-camera', !cameraOn, currentRoomId);
    }
    setCameraOn(!cameraOn);
  };

  const stopStreamedVideo = (videoCurrent) => {
    if (!videoCurrent) {
      return;
    }
    const tracks = videoCurrent.srcObject.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });

    videoCurrent.srcObject = null;
  };

  const sendRoomInvitation = async (newRoomId, navigate) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const formData = { recipientId: userIdToCall, roomId: newRoomId };
      await axios.post(`/api/call`, formData, config);
    } catch (error) {
      navigate(`/${userIdToCall}/call`);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        myVideo,
        userVideo,
        stream,
        leaveRoom,
        setStream,
        cameraOn,
        setCameraOn,
        userIdToCall,
        setUserIdToCall,
        joinRoom,
        sendRoomInvitation,
        getMediaStream,
        toggleCamera,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
