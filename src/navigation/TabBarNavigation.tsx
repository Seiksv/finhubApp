import React, { Component } from "react";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/Settings";
import StockSelect from "../screens/StockSelect";
import GraphValues from "../screens/GraphValues";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

class TabBarNavigation extends Component {
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "WatchList") {
                iconName = focused ? "list-alt" : "list-alt";
              } else if (route.name === "LiveStocks") {
                iconName = focused ? "show-chart" : "show-chart";
              } else if (route.name === "GraphValues") {
                iconName = focused ? "bar-chart" : "bar-chart";
              } else if (route.name === "Profile") {
                iconName = focused ? "account-circle" : "account-circle";
              }

              return (
                <MaterialIcons name={iconName} size={size} color={color} />
              );
            },
            tabBarActiveTintColor: "tomato",
            tabBarInactiveTintColor: "gray",
            tabBarStyle: [
              {
                display: "flex",
                paddingBottom: 5,
              },
              null,
            ],
          })}
        >
          <Tab.Screen name="WatchList" component={StockSelect} />
          <Tab.Screen
            name="LiveStocks"
            component={HomeScreen}
            options={{ unmountOnBlur: true }}
          />
          <Tab.Screen
            name="GraphValues"
            component={GraphValues}
            options={{ unmountOnBlur: true }}
          />
          <Tab.Screen name="Profile" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

export default TabBarNavigation;
