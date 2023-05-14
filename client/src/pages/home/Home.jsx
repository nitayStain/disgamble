import React, { useEffect, useRef, useState } from 'react';
import ServerList from './ServerList';
import FriendsList from './FriendList';
import Header from '../../components/Global/Header/Header';
import Ads from '../../components/Global/Dds/Dds';
import User from './User';
import DM from '../../components/Global/DM/DM';
import { useSelector } from 'react-redux';
import { HiHome } from 'react-icons/hi';
import PeerConnection from '../../components/Global/PeerConnection';
import './home.css';

const Home = () => {
  const serverObject = useSelector((state) => state.server.serverObject);
  const { servername, serverId, serverImage, serverAddress, usersOnline, description, dateCreated, channels } = serverObject;
  const [current, setCurrent] = useState(true);
  const [friend, setFriend] = useState({});
  const peerRef = useRef(null);

  return (
    <>
      <PeerConnection ref={peerRef}></PeerConnection>
      <div className="home-container">
        <div className="right-side">
          <div className="change-container">
            <HiHome
              style={{ transform: current ? 'rotate3d(1, 0, 1, 360deg)' : 'rotate3d(1, 0, 1, 0deg)' }}
              onClick={() => setCurrent((current) => !current)}
              className="change"
              size={'5em'}
              color={'inherit'}></HiHome>
          </div>
          <FriendsList
            setFriend={setFriend}
            setCurrent={setCurrent}
            selectedFriend={friend}
          />
          <User />
        </div>
        <div className="left-side">
          {current ? (
            <>
              <Ads />
              <div className="serverlist-container">
                <Header
                  fontSize={'32px'}
                  label={'Servers'}
                />
                <ServerList />
              </div>
            </>
          ) : (
            <DM
              friend={friend}
              call={(userId) => peerRef.current.sendOffer(userId)}
              answer={(callId) => peerRef.current.acceptOffer(callId)}
              disconnect={() => peerRef.current.disconnect()}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
