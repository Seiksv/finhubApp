import React, { Component } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import StocksLineChart from "../components/specific/LineChart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalEventEmitter } from "./StockSelect";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
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
};

class GraphValues extends Component {
  intervalID: NodeJS.Timeout | null = null;
  constructor(props: State) {
    super(props);
    this.state = {
      graphData: {
        legend: ["Rainy Days"],
        labels: ["Junio"],
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
    };
  }

  ws: WebSocket | null = null;

  componentDidMount() {
    this.remountWebSocket();

    globalEventEmitter.addListener("stockUpdated", this.remountWebSocket);
  }

  componentWillUnmount() {
    globalEventEmitter.removeListener("stockUpdated", this.loadSelectedStock);
    this.ws?.close();
  }

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
    this.intervalID && clearInterval(this.intervalID);
    this.intervalID = null;
    this.loadSelectedStock().then(() => {
      this.ws?.close();

      this.ws = null;
      this.getUseWebSocket(this.state.selectedStocks);
    });
  };

  render() {
    const { loading, fadeAnim, error } = this.state;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {loading ? (
          <View>
            <ActivityIndicator size="large" color="tomato" />
            <Text>Loading data from server...</Text>
          </View>
        ) : error != null ? (
          <View
            style={{
              width: Dimensions.get("window").width - 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#B00020",
              padding: 20,
              borderRadius: 8,
              margin: 10,
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
              {error}
            </Text>
            <Text style={{ fontSize: 14, fontStyle: "italic", color: "#fff" }}>
              Try again later.
            </Text>
          </View>
        ) : (
          <Animated.View
            style={{
              opacity: fadeAnim,
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <StocksLineChart data={this.state.graphData} />
          </Animated.View>
        )}
      </View>
    );
  }
}

export default GraphValues;
