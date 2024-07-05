import React from "react";
import { View, Text } from "react-native";

interface StockQuoteProps {
  symbol: string;
}

class StockWS extends React.Component<StockQuoteProps> {
  state = {
    quote: { c: null },
    loading: true,
    error: null,
  };

  ws: WebSocket | null = null;
  componentDidMount() {
    this.ws = new WebSocket(
      "wss://ws.finnhub.io?token=cq2bhg9r01ql95nclsi0cq2bhg9r01ql95nclsig"
    );
    this.ws.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
      this.ws?.close();
    });

    this.ws.onopen = () => {
      if (this.ws !== null) {
        this.ws.send(
          JSON.stringify({ type: "subscribe", symbol: this.props.symbol })
        );
      }
    };

    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      const message = JSON.parse(e.data);
      if (message.type === "trade") {
        message.date.forEach((element: { price: any }) => {
          this.setState({ quote: element.price, loading: false });
        });
      }
    };

    this.ws.onerror = (e: Event) => {
      this.setState({ error: (e as MessageEvent).data, loading: false });
    };
  }

  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  }

  render() {
    const { quote, loading, error } = this.state;

    if (loading)
      return (
        <View>
          <Text>Cargando...</Text>
        </View>
      );
    if (error)
      return (
        <View>
          <Text>Error al cargar la información: {error.message}</Text>
        </View>
      );
    const precioActual = quote ? quote.c : "No disponible";

    return (
      <View>
        <Text>{this.props.symbol}</Text>
        <Text>Precio actual: {precioActual}</Text>
      </View>
    );
  }
}

export default StockWS;
