import React, { Component } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import StocksLineChart from "../components/specific/LineChart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalEventEmitter } from "./StockSelect";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Button } from "react-native-paper";
import { SOCKET_URL, API_KEY } from "../utils/constans";
class GraphDataModel {
  labels: string[];
  legend: ["Rainy Days"];
  datasets: {
    data: number[];
    strokeWidth: number;
  }[];

  constructor() {
    this.legend = ["Rainy Days"];
    this.labels = [];
    this.datasets = [];
  }
}

type State = {
  currencies: { [symbol: string]: any };
  lastValue: { [symbol: string]: any };
  error?: string;
  loading: Boolean;
  selectedStocks: any[];
  priceAlerts: any[];
  token: string;
  graphData: GraphDataModel;
  countdown: number;
  countdownTimer: any;
};

class GraphValues extends Component {
  intervalID: NodeJS.Timeout | null = null;
  constructor(props: State) {
    super(props);
    this.state = {
      graphData: {
        legend: [""],
        labels: [""],
        datasets: [
          {
            data: [0],
            strokeWidth: 2,
          },
        ],
      },
      selectedStocks: [],
      priceAlerts: [],
      currencies: {},
      lastValue: {},
      loading: true,
      error: null,
      token: "",
      fadeAnim: new Animated.Value(0),
      countdown: 0,
      countdownTimer: null,
    };
  }

  countdownTimer: any;

  ws: WebSocket | null = null;

  componentDidMount() {
    this.loadSelectedStock().then(() => {
      this.getUseWebSocket(this.state.selectedStocks);
    });
    globalEventEmitter.addListener("stockUpdated", this.remountWebSocket);
  }

  componentWillUnmount() {
    globalEventEmitter.removeListener("stockUpdated", this.loadSelectedStock);
    this.ws?.close();
    this.ws = null;
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
    this.remountWebSocket();
  };

  generateNewData = (selectedStocks: string[], priceAlerts: any[]) => {
    const newData = {
      legend: ["Watched Stocks"],
      labels: selectedStocks,
      datasets: [
        {
          data: priceAlerts,
          strokeWidth: 2,
        },
      ],
    };

    this.setState({ graphData: newData });
  };

  loadSelectedStock = async () => {
    try {
      const selectedStocks = await AsyncStorage.getItem("selectedStocks");
      const priceAlerts = await AsyncStorage.getItem("priceAlerts");
      if (selectedStocks !== null && priceAlerts !== null) {
        this.setState({
          selectedStocks: JSON.parse(selectedStocks),
          priceAlerts: JSON.parse(priceAlerts),
        });
      }
    } catch (error) {
      console.log("error" + error);
    }
  };

  getUseWebSocket = (selectedStocks: string[] = []) => {
    this.state.loading = true;

    this.ws = new WebSocket(SOCKET_URL + API_KEY);

    if (selectedStocks.length === 0) {
      this.setState({ loading: false });
      this.setState({ error: "No stocks selected" });
      return;
    }

    this.ws.onopen = () => {
      if (this.ws !== null) {
        if (selectedStocks.length > 0) {
          selectedStocks.forEach((stock) => {
            console.log("Subscribing to", stock);
            this.ws?.send(
              JSON.stringify({
                type: "subscribe",
                symbol: stock,
              })
            );
          });
        }
      }
    };

    this.ws.onmessage = (e) => {
      console.log("Message", e.data);
      const data = JSON.parse(e.data);
      if (data.type === "trade" && data.data.length > 0) {
        const lastElement = data.data[data.data.length - 1];

        const { s, p } = lastElement;
        this.setState((prevState) => {
          const index = prevState.selectedStocks.findIndex(
            (stock) => stock === s
          );

          if (index === -1) return {};

          this.state.priceAlerts[index] = p;
          this.state.loading = false;

          setTimeout(() => {
            this.setState({ loading: false }, () => {
              Animated.timing(this.state.fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }).start();

              this.setState({ error: null });
            });
          }, 1500);

          if (this.state.selectedStock !== "") {
            if (!this.intervalID) {
              this.intervalID = setInterval(() => {
                this.generateNewData(
                  this.state.selectedStocks,
                  this.state.priceAlerts
                );
              }, 1000);
            }
          }
        });
      }
    };

    this.ws.onerror = (e: Event) => {
      this.startCountdown();
      console.log("Error", e.message);
      this.setState({
        error: e.message,
      });
      this.setState({
        loading: false,
      });
    };
  };

  remountWebSocket = () => {
    this.setState({ loading: true });
    this.intervalID && clearInterval(this.intervalID);
    this.intervalID = null;
    this.loadSelectedStock().then(() => {
      this.ws?.close();
      this.ws = null;
      this.getUseWebSocket(this.state.selectedStocks);
    });
  };

  render() {
    const { fadeAnim } = this.state;

    if (this.state.error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="white" />
          <Text style={styles.titleError}>Error message:</Text>
          <Text style={styles.descriptionError}>{this.state.error}</Text>

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
    if (this.state.loading) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="tomato" />
          <Text>Loading data from server...</Text>
        </View>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <StocksLineChart data={this.state.graphData} />
        </Animated.View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  errorContainer: {
    width: Dimensions.get("window").width - 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B00020",
    padding: 20,
    borderRadius: 8,
    margin: 10,
    marginTop: Dimensions.get("window").height / 2 - 200,
  },
  titleError: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    marginTop: 10,
  },
  descriptionError: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
  },
  tryAgainText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#fff",
  },
  ctaButton: {
    backgroundColor: "#ff7300",
    padding: 10,
    borderRadius: 8,
  },
});

export default GraphValues;
