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

  ws: WebSocket | null = null; // Inicializar la variable de WebSocket como null

  componentDidMount() {
    this.ws = new WebSocket(
      "wss://ws.finnhub.io?token=cq2bhg9r01ql95nclsi0cq2bhg9r01ql95nclsig"
    ); // Reemplaza 'wss://tu-url-de-websocket' con tu URL real

    this.ws.addEventListener("message", (event) => {
      // Enviar mensaje para suscribirse a las actualizaciones del último precio de las operaciones
      console.log("Message from server ", event.data);
      this.ws?.close();
    });

    this.ws.onopen = () => {
      // Enviar mensaje para suscribirse a las actualizaciones del último precio de las operaciones
      if (this.ws !== null) {
        this.ws.send(
          JSON.stringify({ type: "subscribe", symbol: this.props.symbol })
        );
      }
    };

    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      //console.log("Datos recibidos:", data);

      // Manejar mensajes entrantes
      const message = JSON.parse(e.data);
      if (message.type === "trade") {
        message.date.forEach((element: { price: any }) => {
          this.setState({ quote: element.price, loading: false });
        });
        // Asegúrate de que el mensaje es del tipo esperado
      }
    };

    this.ws.onerror = (e: Event) => {
      // Manejar errores
      this.setState({ error: (e as MessageEvent).data, loading: false });
    };
  }

  componentWillUnmount() {
    if (this.ws) {
      this.ws.close(); // Cerrar la conexión WebSocket
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

export default StockWS;
