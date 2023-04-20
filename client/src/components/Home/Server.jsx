import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './Server.css';
import { ServerModal } from '../Modal/ServerModal';

export const ServerList = () => {
  const userObject = useSelector((state) => state.user.userObject);
  const { serverList } = userObject;

  const [currentServer, setCurrentServer] = useState('');
  const [showServerModal, setShowServerModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleServerClick = (id) => {
    setCurrentServer(id);
    setShowServerModal(true);
  };

  return (
    <>
      {showServerModal && (
        <ServerModal
          showServerModal={showServerModal}
          setShowServerModal={setShowServerModal}
          serverId={currentServer}
        />
      )}
      <div className="server-list">
        <div className="server-button-container">
          <button className="server-button">Create Server</button>
          <button className="server-button">Add</button>
          <button className="server-button">Remove</button>
          <button className="server-button"> Connect</button>
        </div>
        <div className="server-search-container">
          <input
            className="server-search"
            placeholder="Search for a community!"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}></input>
        </div>
        {serverList
          .filter((item) => item?.servername?.toLowerCase().includes(searchValue.toLowerCase()))
          .map((server, index) => {
            return (
              <div
                key={index}
                className="server-container"
                onClick={() => handleServerClick(server?.serverId)}>
                <div className="server">
                  <img
                    src={server?.serverImage}
                    className="server-image"
                    alt=""
                  />
                  <p className="server-name">{server?.servername}</p>
                  <p className="server-clients">{server?.usersOnline?.length}</p>
                </div>
                <div className="breakline"></div>
              </div>
            );
          })}
      </div>
    </>
  );
};
