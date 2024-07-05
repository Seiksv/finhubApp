import React from "react";
import { View, Dimensions, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

class StocksLineChart extends React.Component {
  componentDidUpdate(prevProps) {
    // Verifica si los datos han cambiado y realiza alguna acción si es necesario
    if (prevProps.data !== this.props.data) {
      // Aquí podrías hacer algo con los nuevos datos, como un procesamiento adicional
      // Pero si solo estás pasando los datos directamente al gráfico, esto podría no ser necesario
    }
  }

  render() {
    console.log(this.props.data);
    const { data } = this.props; // Usa los datos pasados como props

    // Asegúrate de que los datos no sean nulos o indefinidos
    if (
      !data ||
      data.labels.length === 0 ||
      data.datasets[0].data.length === 0
    ) {
      return (
        <View>
          <Text>No hay datos disponibles</Text>
        </View>
      );
    }

    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
          Only showing the current Stocks Selected.
        </Text>
        <Text
          style={{
            fontFamily: "Roboto", // Roboto es la fuente predilecta de Material Design. Asegúrate de tenerla disponible.
            fontSize: 16, // Un tamaño de fuente estándar para texto.
            fontWeight: "500", // Medium emphasis.
            color: "#878f98", // Un color de texto primario en Material Design.
            marginVertical: 4, // Espaciado vertical para separarlo de otros elementos.
            paddingHorizontal: 16, // Espaciado horizontal para alinearse con el margen de Material Design.
          }}
        >
          (For more stocks, please tap on the Watchlist below)
        </Text>
        <LineChart
          data={data}
          width={Dimensions.get("window").width - 20}
          height={Dimensions.get("window").height / 1.8}
          verticalLabelRotation={30}
          withDots={true}
          withShadow={true}
          fromZero={true}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          segments={6}
          yLabelsOffset={4}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            flex: 1,
          }}
        />
        <View
          style={{
            flexDirection: "row", // Alinea el ícono y el texto horizontalmente
            alignItems: "center", // Centra verticalmente el ícono y el texto
            backgroundColor: "#e0e0e0", // Color de fondo gris para el badge
            paddingHorizontal: 12, // Espaciado horizontal para el contenido del badge
            paddingVertical: 4, // Espaciado vertical para el contenido del badge
            borderRadius: 20, // Bordes redondeados para el badge
            marginVertical: 20, // Espaciado vertical para separarlo de otros elementos
            paddingHorizontal: 16, // Espaciado horizontal para alinearse con el margen
          }}
        >
          <MaterialIcons name="error-outline" size={20} color="#878f98" />
          <Text
            style={{
              fontFamily: "Roboto",
              fontSize: 16,
              fontWeight: "500",
              color: "#878f98", // Color de texto
              marginLeft: 8, // Espaciado entre el ícono y el texto
            }}
          >
            May some stocks takes time to load, please wait.
          </Text>
        </View>
      </View>
    );
  }
}

export default StocksLineChart;
