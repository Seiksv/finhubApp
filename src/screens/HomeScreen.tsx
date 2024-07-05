import React, { Component } from "react";
import { View, Text } from "react-native";
import GridCurrencyTicker from "../components/specific/GridCurrencyTicker";
import "react-native-gesture-handler";
import ExpoPushNotificationManager from "../components/specific/NotificationManager";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class HomeScreen extends Component {
  notificationManager = new ExpoPushNotificationManager({
    title: "Hello",
    body: "World",
  });
  state = {
    token: "",
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;

    this.notificationManager
      .registerForPushNotificationsAsync()
      .then((token) => {
        if (token !== void 0 && this._isMounted) {
          this.notificationManager.sendPushNotification(token);
          this.saveTokenAsyncStorage(token);
        }
      });
  }

  saveTokenAsyncStorage = async (token: string) => {
    try {
      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.log(error);
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Roboto",
            fontSize: 26,
            fontWeight: "900",
            color: "#000",
            marginLeft: 8,
            letterSpacing: 0.15,
            alignSelf: "center",
            alignContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          Current Stocks
        </Text>
        <Text
          style={{
            fontFamily: "Roboto",
            fontSize: 16,
            fontWeight: "500",
            color: "#878f98",
            marginVertical: 4,
            paddingHorizontal: 16,
          }}
        >
          If you want to see more stocks, please tap on the Watchlist below.
        </Text>

        <GridCurrencyTicker />
      </View>
    );
  }
}

export default HomeScreen;
