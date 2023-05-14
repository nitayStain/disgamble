import React from 'react';
import { RiCloseCircleLine } from 'react-icons/ri';
import { BsTelephonePlusFill, BsTelephoneXFill } from 'react-icons/bs';
import ToolTipIcon from '../ToolTip/ToolTipIcon';
import { useSelector } from 'react-redux';
import useAuth from '../../../customhooks/useAuth';
import './callstack.css';

const CallStack = ({ answer }) => {
  const callsArray = useSelector((state) => state.calls.callsArray);
  const userObject = useSelector((state) => state.user.userObject);
  const { friends, userId } = userObject;
  const { useApi, useSocket, socket } = useAuth();

  return (
    <>
      <div className="call-stack-container">
        {callsArray
          .filter((call) => call?.callerId !== userId && call?.isConnected === false)
          .map((call) => {
            return (
              <div className="call-noti">
                <RiCloseCircleLine className="call-noti-close"></RiCloseCircleLine>
                <div className="call-noti-user-info">
                  <img
                    className="call-noti-image"
                    src={friends?.find((friend) => friend?.userId === call?.callerId)?.userImage}
                    alt=""></img>
                  <p className="caller-name">{friends?.find((friend) => friend?.userId === call?.callerId)?.username}</p>
                </div>
                <div className="call-noti-buttons">
                  <ToolTipIcon
                    handler={() => useSocket('user:callDecline', call?.callId)}
                    tooltip={'Decline'}
                    direction="top"
                    icon={
                      <BsTelephoneXFill
                        size={'1.4em'}
                        color={'indianRed'}></BsTelephoneXFill>
                    }></ToolTipIcon>
                  <ToolTipIcon
                    handler={() => answer(call?.callId)}
                    tooltip={'Answer'}
                    direction="top"
                    icon={
                      <BsTelephonePlusFill
                        size={'1.4em'}
                        color={'green'}></BsTelephonePlusFill>
                    }></ToolTipIcon>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};
export default CallStack;