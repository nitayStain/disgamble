const { Calls } = require('../database');
const { onDisconnect, onCallEnd } = require('../utils');

function setupWebRTCEvents(io) {
  io.on('connection', (socket) => {
    socket.on('webrtc:icecandidate', (ices, userId) => {
      io.to(`${userId}`).emit('webrtc:icecandidate', ices);
    });

    socket.on('webrtc:offer', async (offer, userId) => {
      try {
        const callId = Math.random().toString(16).substring(2);
        const callObject = { callId: callId, callerId: socket.userId, callTo: userId, offer: offer, answer: '', isConnected: false };
        await Calls.create(callObject);
        io.to(`${socket.userId}`).emit('user:call', callObject);
        io.to(`${userId}`).emit('user:call', callObject);
        setTimeout(async () => {
          onCallEnd(io, { callId: callId, isConnected: false });
        }, 15000);
      } catch (e) {
        console.log(e);
      }
    });

    socket.on('user:answer', async (callId) => {
      try {
        const offer = await Calls.findOne({ callId: callId });
        if (offer && offer.callTo === socket.userId) io.to(`${socket.userId}`).emit('webrtc:offer', offer.offer, offer.callerId);
      } catch (e) {
        console.log(e);
      }
    });

    socket.on('webrtc:answer', async (answer, userId) => {
      try {
        const call = await Calls.findOneAndUpdate({ callerId: userId, callTo: socket.userId }, { answer: answer, isConnected: true }, { new: true });
        if (!call) return;
        io.to(`${call.callTo}`).emit('user:updateCall', call);
        io.to(`${call.callerId}`).emit('user:updateCall', call);
        io.to(`${userId}`).emit('webrtc:answer', answer, call.callTo);
        setTimeout(() => {
          io.to(`${call.callTo}`).emit('webrtc:exchange');
          io.to(`${call.callerId}`).emit('webrtc:exchange');
        }, 1000);
      } catch (e) {
        console.log(e);
      }
    });

    socket.on('user:callDisconnect', (callId) => {
      onCallEnd(io, { callId: callId });
    });

    socket.on('user:callDecline', (callId) => {
      onCallEnd(io, { callId: callId });
    });

    socket.on('user:disconnect', () => {
      onDisconnect(io, socket.userId);
    });
  });
}

exports.setupWebRTCEvents = setupWebRTCEvents;