import React from 'react';
import './home.css';
import { Server } from '../../components/Home/Server';
import { Friend } from '../../components/Home/Friend';
import { Header } from '../../components/Home/Header';
import { Divider } from '../../components/Home/Divider';

const Home = () => {
  return (
    <div className="home-container">
      <div className="left-side">
        <div className="ads">ADS</div>
        <div className="server-list">
          <Header
            fontSize={'32px'}
            label={'Servers'}
          />
          {[1, 2, 3, 4, 5].map((e) => {
            return <Server />;
          })}
        </div>
        <div className="nav">NAV</div>
      </div>
      <div className="friend-list">
        <Header
          fontSize={'32px'}
          label={'Friends'}
        />
        {[1, 2, 3, 4, 5].map((e) => {
          return <Friend />;
        })}
      </div>
    </div>
  );
};

export default Home;
