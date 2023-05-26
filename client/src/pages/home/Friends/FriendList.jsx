import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Options from '../../../components/Global/Options/Options';
import DropDown from '../../../components/Global/DropDown/DropDown';
import ToolTipIcon from '../../../components/Global/ToolTip/ToolTipIcon';
import ProfileModal from './ProfileModal';
import { AuthContext } from '../../../App';
import './friendlist.css';

const FriendsList = ({ setFriend, setCurrent, selectedFriend }) => {
  const userObject = useSelector((state) => state.user.userObject);
  const { userInfo, userAuth, voiceSettings, friends } = userObject;
  const { useApi, useSocket, socket } = useContext(AuthContext);
  const [filteredFriends, setFilteredFriends] = useState(friends.friends);
  const [friendOption, setFriendOption] = useState('All (0)');
  const [options, setOptions] = useState(['All (0)', 'Online (0)', 'Offline (0)', 'Pending (0)']);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);

  const online = friends.friends.filter((friend) => friend?.userInfo?.status === 'Online' || friend?.userInfo?.status === 'DND');
  const offline = friends.friends.filter((friend) => friend?.userInfo?.status === 'Offline');
  const pending = friends.requests;

  const handleFriendClick = (friend) => {
    setCurrent(false);
    setFriend(friend);
  };

  const handleProfileClick = (friend) => {
    setShowUserProfile(true);
    setCurrentProfile(friend);
  };

  const handleRemoveClick = (friend) => {
    console.log(friend.userInfo.userId);
  };

  const buttonsArray = [
    { name: 'PROFILE', color: 'white', handler: handleProfileClick },
    { name: 'REMOVE', color: 'red', handler: handleRemoveClick },
  ];

  useEffect(() => {
    setOptions([`All (${friends.friends.length})`, `Online (${online.length})`, `Offline (${offline.length})`, `Pending (${pending.length})`]);

    setFriendOption((current) => {
      const currentOption = current.split(' ')[0];
      if (currentOption === 'All') return `All (${friends.friends.length})`;
      if (currentOption === 'Online') return `Online (${online.length})`;
      if (currentOption === 'Offline') return `Offline (${offline.length})`;
      if (currentOption === 'Pending') return `Pending (${pending.length})`;
    });

    const option = friendOption.split(' ')[0];
    if (option === 'All') return setFilteredFriends(friends.friends);
    if (option === 'Online') return setFilteredFriends(online);
    if (option === 'Offline') return setFilteredFriends(offline);
    if (option === 'Pending') return setFilteredFriends(pending);
  }, [friendOption, friends]);

  return (
    <>
      <ProfileModal
        showUserProfile={showUserProfile}
        setShowUserProfile={setShowUserProfile}
        user={currentProfile}
        handler={handleFriendClick}></ProfileModal>
      <div className="friend-list">
        <AddFriend></AddFriend>
        <span style={{ marginBottom: '0.5em' }}></span>
        <DropDown
          value={friendOption}
          setValue={setFriendOption}
          options={options}
        />
        {filteredFriends.map((friend, index) => {
          return friendOption.split(' ')[0] !== 'Pending' ? (
            <div
              key={index}
              className="friends-container"
              style={{ backgroundColor: selectedFriend?.userInfo?.userId === friend?.userInfo?.userId && 'var(--bg-primary-9)' }}
              onClick={() => handleFriendClick(friend)}>
              <div className="image-container">
                <img
                  src={friend?.userInfo?.image}
                  className="user-image"
                  alt=""
                />
                <div
                  className="status"
                  style={{ backgroundColor: friend?.userInfo?.status === 'Online' ? 'green' : friend?.userInfo?.status === 'DND' ? 'red' : 'gray' }}></div>
              </div>
              <p className="friend-name">{friend?.userInfo?.username}</p>
              <Options
                currentValue={friend?.userInfo?.userId}
                buttons={buttonsArray}
                object={friend}
              />
            </div>
          ) : (
            <div
              key={index}
              className="friends-container">
              <div className="image-container">
                <img
                  src={friend?.userInfo?.image}
                  className="user-image"
                  alt=""
                />
              </div>
              <p className="friend-name-pending">{friend?.userInfo?.username}</p>
              <div className="pending-buttons">
                <ToolTipIcon
                  handler={() => useSocket('user:accept', friend?.userInfo?.userId)}
                  tooltip={'Accept'}
                  direction="left"
                  icon={
                    <FaCheck
                      size={'1.8em'}
                      color={'green'}></FaCheck>
                  }></ToolTipIcon>
                <ToolTipIcon
                  handler={() => useSocket('user:decline', friend?.userInfo?.userId)}
                  tooltip={'Decline'}
                  direction="left"
                  icon={
                    <FaTimes
                      size={'1.8em'}
                      color={'red'}></FaTimes>
                  }></ToolTipIcon>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FriendsList;

const AddFriend = () => {
  const [username, setUsername] = useState('');
  const { useApi, useSocket, socket } = useContext(AuthContext);

  return (
    <div
      className="add-friend"
      style={{ marginBottom: '0.5em' }}>
      <input
        type="text"
        placeholder="Add a Friend"
        value={username}
        onChange={(e) => setUsername(e.target.value)}></input>
      <button
        className="friend-button"
        onClick={() => useSocket('user:addfriend', username)}>
        Send Friend Request
      </button>
    </div>
  );
};