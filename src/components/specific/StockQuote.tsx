import React, { Component } from "react";
import { View, Text } from "react-native";
import finnhubService from "../../services/finnHubService";

interface StockQuoteProps {
  symbol: string;
}

class StockQuote extends Component<StockQuoteProps> {
  state = {
    quote: { c: null },
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetchQuote(this.props.symbol);
  }

  fetchQuote = (symbol: string) => {
    finnhubService
      .getQuote(symbol)
      .then((response) => {
        this.setState({ quote: response.data, loading: false });
      })
      .catch((error) => {
        this.setState({ error: error, loading: false });
      });
  };

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
          <Text>Error al cargar la información {error.message}</Text>
        </View>
      );

    // Asumiendo que 'c' es el precio actual y deseas mostrarlo
    const precioActual = quote ? quote.c : "No disponible";

    return (
      <View>
        <Text>{this.props.symbol}</Text>
        <Text>Precio actual: {precioActual}</Text>
        {/* Si deseas mostrar más información, asegúrate de convertirla a cadena */}
      </View>
    );
  }
}

export default StockQuote;
