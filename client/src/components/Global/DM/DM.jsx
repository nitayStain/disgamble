import React, { useEffect, useRef, useState } from 'react';
import { BiSend } from 'react-icons/bi';
import SearchInput from '../SearchInput/SearchInput';
import { useSelector } from 'react-redux';
import useAuth from '../../../customhooks/useAuth';
import Options from '../Options/Options';
import { CgPhone } from 'react-icons/cg';
import ToolTipIcon from '../ToolTip/ToolTipIcon';
import CallWindow from './CallWindow';
import './dm.css';

const DM = ({ friend, call, answer }) => {
  const [searchValue, setSearchValue] = useState('');
  const callsArray = useSelector((state) => state.calls.callsArray);
  const userObject = useSelector((state) => state.user.userObject);
  const { userId } = userObject;

  return (
    <div className="dm-container">
      <div className="dm-header">
        <img
          className="dm-image"
          src={friend?.userImage}
          alt=""></img>
        <p className="dm-name">{friend?.username}</p>
        <div style={{ marginLeft: 'auto', marginRight: '0.5em' }}>
          <ToolTipIcon
            handler={() => call(friend?.userId)}
            tooltip={'Call'}
            direction="bottom"
            icon={
              <CgPhone
                size={'2em'}
                color={'white'}></CgPhone>
            }></ToolTipIcon>
        </div>
        <SearchInput
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          width={'25%'}
          placeholder={'Search'}></SearchInput>
      </div>
      {callsArray.some((call) => (call?.callerId === friend?.userId && call?.callTo === userId) || call?.callerId === userId) && (
        <CallWindow
          answer={() => answer(callsArray.find((call) => call?.callerId === friend?.userId && call?.callTo === userId)?.callId)}
          friendImage={friend?.userImage}
          callObject={callsArray.find((call) => call?.callerId === friend?.userId || call?.callerId === userId)}></CallWindow>
      )}
      <Messages
        friend={friend}
        searchValue={searchValue}></Messages>
      <MessageInput
        width={'100%'}
        placeholder={`Message @${friend?.username}`}
        userId={friend?.userId}></MessageInput>
    </div>
  );
};

export default DM;

const Messages = ({ friend, searchValue }) => {
  const { useApi, useSocket, socket } = useAuth();
  const editedMessageRef = useRef(null);
  const [editing, setEditing] = useState('');
  const messagesArray = useSelector((state) => state.messages.messagesArray);
  const [filteredDmHistory, setFilteredDmHistory] = useState([]);

  const copyMessage = (message) => {
    navigator.clipboard.writeText(message.message);
  };

  const deleteMessage = (message) => {
    useSocket('dm:delete', message.messageId);
  };

  const editMessage = (message) => {
    setEditing(message.messageId);
  };

  const handleEdit = () => {
    useSocket('dm:edit', editedMessageRef.current.id, editedMessageRef.current.textContent);
    setEditing('');
  };
  const handleCancel = () => {
    setEditing('');
  };

  const buttonsArray = [
    { name: 'COPY', color: 'white', handler: copyMessage },
    { name: 'EDIT', color: 'white', handler: editMessage },
    { name: 'DELETE', color: 'red', handler: deleteMessage },
  ];

  useEffect(() => {
    setFilteredDmHistory(messagesArray.filter((message) => message.recipients.includes(friend?.userId)));
  }, [friend, messagesArray]);

  return (
    <div className="dm-messages">
      {filteredDmHistory
        .filter((message) => message?.message?.toLowerCase().includes(searchValue.toLowerCase()))
        .map((message, index) => {
          return (
            <div
              className="msg-container"
              key={index}>
              <Options
                currentValue={friend?.userId}
                buttons={buttonsArray}
                object={message}
              />
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div className="msg-container-img">
                  <img
                    src={message?.authorImage}
                    alt=""></img>
                </div>
                <div style={{ width: 'calc(100% - 5em)' }}>
                  <div className="msg-container-user-time">
                    <p className="msg-container-username">{message?.authorName}</p>
                    <p className="msg-container-time">
                      {new Date(message?.sentAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {editing !== message.messageId ? (
                    <p className="msg-container-msg">{message?.message}</p>
                  ) : (
                    <>
                      <div className="edit-container">
                        <p
                          ref={editedMessageRef}
                          className="msg-container-msg"
                          contentEditable={true}
                          dangerouslySetInnerHTML={{ __html: message?.message }}
                          id={message?.messageId}
                        />
                        <div className="edit-buttons">
                          <button onClick={handleEdit}>Save</button>
                          <button onClick={handleCancel}>Cancel</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {message?.edited && <p className="isedited">Edited</p>}
            </div>
          );
        })}
    </div>
  );
};

const MessageInput = ({ width, placeholder, userId }) => {
  const [msgValue, setMsgValue] = useState('');
  const { useApi, useSocket, socket } = useAuth();

  return (
    <div
      className="msg-input-container"
      style={{ width: width }}>
      <input
        className="msg-input"
        placeholder={placeholder}
        type="text"
        value={msgValue}
        onChange={(e) => setMsgValue(e.target.value)}></input>
      <div
        className="msg-send-button"
        onClick={() => useSocket('dm:message', msgValue, userId)}>
        <BiSend
          size={'3em'}
          color={'inherit'}></BiSend>
      </div>
    </div>
  );
};