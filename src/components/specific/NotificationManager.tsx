import React, { Component } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

interface NotificationProps {
  title: string;
  body: string;
  data?: object;
}

interface NotificationState {
  expoPushToken: string;
}

class ExpoPushNotificationManager extends Component<
  NotificationProps,
  NotificationState
> {
  state: NotificationState = {
    expoPushToken: "",
  };

  async componentDidMount() {
    this.registerForPushNotificationsAsync();
  }

  registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    let token;

    if (Device.isDevice) {
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "ea4a3973-ae54-4083-9b79-5832a2ad3670",
        })
      ).data;
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  };

  sendPushNotification = async (expoPushToken: string) => {
    const { title, body, data } = this.props;
    const message = {
      to: expoPushToken,
      sound: "default",
      title: title,
      body: body,
      data: data,
      _displayInForeground: true,
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();
    console.log(responseData);
  };

  render() {
    return null;
  }
}

export default ExpoPushNotificationManager;
