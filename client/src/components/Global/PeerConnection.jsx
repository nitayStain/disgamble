import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';
import useAuth from '../../customhooks/useAuth';

const configuration = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

const PeerConnection = forwardRef((props, ref) => {
  const userSounds = useSelector((state) => state.sounds.soundObject);
  const { isMuted, isDeafened } = userSounds;
  const remoteAudioRef = useRef(null);
  const peerConnection = useRef(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerUserId = useRef(null);
  const icesRef = useRef([]);
  const { useApi, useSocket, socket } = useAuth();

  console.log('rerender');
  const init = async () => {
    try {
      if (peerConnection.current) peerConnection.current.close();
      if (stream)
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      peerUserId.current = null;
      setStream(null);
      setRemoteStream(null);
      const newpeerConnection = new RTCPeerConnection(configuration);
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      newStream.getAudioTracks().forEach((track) => {
        newpeerConnection.addTrack(track, newStream);
      });
      setStream(newStream);
      peerConnection.current = newpeerConnection;
    } catch (e) {
      console.log(e);
    }
  };

  useImperativeHandle(ref, () => ({
    sendOffer: async (userId) => {
      if (peerConnection.current && !peerConnection.current.localDescription) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(new RTCSessionDescription(offer));
        useSocket('webrtc:offer', offer, userId);
      }
    },
    acceptOffer: async (callId) => {
      if (peerConnection.current) {
        useSocket('user:answer', callId);
      }
    },
  }));

  useEffect(() => {
    init();
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!stream) return;
    setStream((stream) => {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !isMuted;
      const newStream = new MediaStream();
      newStream.addTrack(audioTrack);
      return newStream;
    });
  }, [isMuted]);

  useEffect(() => {
    if (!peerConnection.current) return;

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Ice ', icesRef.current);
        icesRef.current = [...icesRef.current, event.candidate];
      }
    };

    socket.on('webrtc:answer', async (answer, userId) => {
      peerUserId.current = userId;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('webrtc:offer', async (offer, userId) => {
      peerUserId.current = userId;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(new RTCSessionDescription(answer));
      useSocket('webrtc:answer', answer, userId);
    });

    socket.on('webrtc:icecandidate', (ices) => {
      console.log('Ice Received');
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        ices.forEach((ice) => {
          peerConnection.current.addIceCandidate(new RTCIceCandidate(ice));
        });
      }
    });

    socket.on('webrtc:disconnect', () => {
      console.log('disconnected');
      init();
    });

    socket.on('webrtc:exchange', () => {
      useSocket('webrtc:icecandidate', icesRef.current, peerUserId.current);
    });

    return () => {
      socket.off('webrtc:answer');
      socket.off('webrtc:offer');
      socket.off('webrtc:icecandidate');
      socket.off('webrtc:disconnect');
      socket.off('webrtc:exchange');
    };
  }, [peerConnection.current, socket]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    console.log(peerConnection.current?.signalingState);
  }, [peerConnection.current]);

  return (
    <audio
      ref={remoteAudioRef}
      muted={isDeafened}
      autoPlay
    />
  );
});

export default PeerConnection;
