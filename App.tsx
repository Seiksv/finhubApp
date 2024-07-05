import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabBarNavigation from './src/navigation/TabBarNavigation';

class App extends Component {
  render() {
    return (
        <TabBarNavigation />
    );
  }
}

export default App;