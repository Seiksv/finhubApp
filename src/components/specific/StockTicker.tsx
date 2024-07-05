import React, { Component } from "react";
import { globalEventEmitter } from "../../screens/StockSelect";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Card, TouchableRipple } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExpoPushNotificationManager from "../specific/NotificationManager";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SOCKET_URL, API_KEY } from "../../utils/constans";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Button } from "react-native-paper";

type State = {
  currencies: { [symbol: string]: any };
  lastValue: { [symbol: string]: any };
  error?: string;
  loading: Boolean;
  selectedStocks: any[];
  priceAlerts: any[];
  token: string;
  countdown: number;
  countdownTimer: any;
};

class StockTicker extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      currencies: {},
      lastValue: {},
      loading: true,
      selectedStocks: [],
      priceAlerts: [],
      token: "",
      countdown: 0,
      countdownTimer: null,
    };
  }
  countdownTimer: any;

  useWebSocket: WebSocket | null = null;

  ws: WebSocket | null = null;

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;

    globalEventEmitter.addListener("stockUpdated", this.loadSelectedStock);
    this.loadToken();
    this.loadSelectedStock().then(() => {
      this.getUseWebSocket(this.state.selectedStocks);
    });
  }

  componentWillUnmount() {
    globalEventEmitter.removeAllListeners;

    if (this.ws) {
      this.ws.close();
    }

    if (this.useWebSocket) {
      this.useWebSocket.close();
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  startCountdown = () => {
    this.setState({ countdown: 30 });
    this.countdownTimer = setInterval(() => {
      this.setState(
        (prevState) => ({
          countdown: prevState.countdown - 1,
        }),
        () => {
          if (this.state.countdown <= 0) {
            clearInterval(this.countdownTimer);
          }
        }
      );
    }, 1000);
  };

  handleReload = () => {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    this.setState({ error: null, countdown: 0 });
    this.loadSelectedStock().then(() => {
      this.getUseWebSocket(this.state.selectedStocks);
    });
  };

  loadSelectedStock = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("selectedStocks");
      const selectedStocks = jsonValue != null ? JSON.parse(jsonValue) : [];
      this.setState({ selectedStocks });

      const jsonPriceAlerts = await AsyncStorage.getItem("priceAlerts");
      const priceAlerts =
        jsonPriceAlerts != null ? JSON.parse(jsonPriceAlerts) : [];
      this.setState({ priceAlerts });
    } catch (error) {
      console.log(error);
    }
  };

  loadToken = async () => {
    try {
      const token = (await AsyncStorage.getItem("token")) ?? "";
      this.setState({ token });
    } catch (error) {
      console.log(error);
    }
  };

  getUseWebSocket = (selectedStocks: string[] = []) => {
    this.state.loading = true;
    this.ws = new WebSocket(SOCKET_URL + API_KEY);

    this.ws.onopen = () => {
      if (this.ws !== null) {
        if (selectedStocks.length > 0) {
          selectedStocks.forEach((stock) => {
            this.ws?.send(
              JSON.stringify({
                type: "subscribe",
                symbol: stock,
              })
            );
          });
        } else {
          this.setState({ loading: false });
          this.setState({ error: "No stocks selected" });
        }
      }
    };

    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "trade" && data.data.length > 0) {
        const lastElement = data.data[data.data.length - 1];

        const { s, p } = lastElement;
        let v = lastElement.v || 0;

        const lastValue = this.state.lastValue[s] || {};
        if (lastValue.price !== p) {
          let direction = "";
          if (lastValue.price > p) {
            direction = "down";
          } else {
            direction = "up";

            console.log("Selected Stocks", this.state.selectedStocks);
            console.log(
              "Price Alerts",
              parseInt(
                this.state.priceAlerts[this.state.selectedStocks.indexOf(s)]
              )
            );
            console.log("Symbol", s);
            console.log("Price", p);
            if (
              p >
              parseInt(
                this.state.priceAlerts[this.state.selectedStocks.indexOf(s)]
              )
            ) {
              let notificationManager = new ExpoPushNotificationManager({
                title: s + " current price alert reached",
                body: `Current price: ${p}`,
              });

              console.log("Sending push notification");
              notificationManager.sendPushNotification(this.state.token);
            }
          }

          this.setState((prevState) => ({
            currencies: {
              ...prevState.currencies,
              [s]: { price: p, volume: v, direction },
            },
            lastValue: {
              ...prevState.lastValue,
              [s]: { price: p, volume: v, direction },
            },
            loading: false,
          }));
        }
      }
    };

    this.ws.onerror = (e: Event) => {
      this.startCountdown();
      this.setState({ error: e.message, loading: false });
    };
  };

  render() {
    const { currencies } = this.state;
    if (this.state.loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            height: Dimensions.get("window").height - 150,
          }}
        >
          <ActivityIndicator size="large" color="tomato" />
          <Text>Loading data from server...</Text>
        </View>
      );
    }
    if (this.state.error) {
      return (
        <View
          style={{
            width: Dimensions.get("window").width - 40,
            alignItems: "center",
            justifyContent: "space-around",
            backgroundColor: "#B00020",
            padding: 20,
            borderRadius: 8,
            margin: 10,
            flex: 1,
            marginTop: Dimensions.get("window").height / 2 - 200,
          }}
        >
          <MaterialIcons name="error-outline" size={48} color="white" />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#fff",
              marginBottom: 10,
              marginTop: 10,
            }}
          >
            Error message:
          </Text>
          <Text style={{ fontSize: 14, color: "#fff", marginBottom: 10 }}>
            {this.state.error}
          </Text>

          {this.state.countdown > 0 ? (
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <Text
                style={{ fontSize: 14, fontStyle: "italic", color: "#fff" }}
              >
                Try again later.
              </Text>
              <Button
                mode="contained"
                onPress={this.handleReload}
                color="#6200EE"
                labelStyle={{ color: "white", fontSize: 18 }}
                disabled
                style={{ marginTop: 10 }}
              >
                Retry at {this.state.countdown} seconds...
              </Button>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={this.handleReload}
              buttonColor="#fff"
              labelStyle={{ color: "#B00020", fontSize: 18 }}
              style={{ marginTop: 10 }}
            >
              Retry now
            </Button>
          )}
        </View>
      );
    }
    return (
      <View style={styles.container}>
        {Object.entries(currencies).map(([symbol, data]) => (
          <CurrencyTicker
            symbol={symbol}
            data={data}
            onPress={() => {
              console.log("Pressed", symbol);
            }}
            error={this.state.error}
          />
        ))}
      </View>
    );
  }
}

const CurrencyTicker = ({
  symbol,
  data,
}: {
  symbol: string;
  data: any;
  onPress: () => void;
  error: string | undefined;
}) => {
  const { price, volume, direction } = data;
  const cardStyle = direction === "up" ? styles.cardUp : styles.cardDown;
  const isUp = direction === "up";

  return (
    <View>
      <TouchableRipple onPress={() => console.log("Pressed")}>
        <Card style={[styles.card, isUp ? styles.cardUp : styles.cardDown]}>
          <Card.Content>
            <View style={styles.container}>
              <MaterialCommunityIcons
                name={isUp ? "arrow-up" : "arrow-down"}
                size={24}
                color={isUp ? "green" : "red"}
              />
              <Text style={styles.symbol}>{symbol}</Text>
              <Text style={styles.price}>{price.toFixed(2)}</Text>
              <Text style={[styles.volume, { color: isUp ? "green" : "red" }]}>
                {volume.toFixed(2)} ({direction})
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableRipple>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    margin: 8,
    borderRadius: 4,
    elevation: 4,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: Dimensions.get("window").width - 16,
    height: 100,
  },
  cardUp: {},
  cardDown: {},
  symbol: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  price: {
    fontSize: 14,
    marginLeft: 8,
  },
  volume: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default StockTicker;
